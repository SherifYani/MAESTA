"""
Knowledge Base Service - Manages vector embeddings and semantic search
Uses sentence-transformers for embeddings and FAISS for vector search
"""
import os
import json
import pickle
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any
import numpy as np
import config
from core.logger import get_logger
from core.exceptions import EmbeddingError, IndexingError, SearchError

logger = get_logger(__name__)


class KnowledgeBase:
    """Vector-based knowledge base for semantic search with BM25 hybrid support"""
    
    def __init__(self):
        self.embedding_model = None
        self.index = None
        self.bm25 = None  # BM25 index
        self.documents = []  # List of (doc_id, chunk_id, content, metadata)
        self.index_path = config.VECTOR_STORE_PATH / "faiss_index.bin"
        self.docs_path = config.VECTOR_STORE_PATH / "documents.pkl"

        # Initialize vector backend (abstraction layer)
        from services.agent.rag.vector_backend import get_vector_backend
        self.vector_store = get_vector_backend(self)

        # Reindex state (thread-safe)
        self._reindex_lock = __import__('threading').Lock()
        self._reindex_status: dict = {"running": False, "progress": 0, "total": 0, "done": False}

        self._load_or_create()
        self._preload_embedding_model()
    
    # Models that must run locally via sentence-transformers (not via llama.cpp HTTP API)
    _SENTENCE_TRANSFORMER_MODELS = {
        "all-minilm-l6-v2",
        "all-minilm-l12-v2",
        "all-mpnet-base-v2",
        "paraphrase-multilingual-mpnet-base-v2",
        "paraphrase-multilingual-minilm-l12-v2",
    }

    def _is_sentence_transformer_model(self) -> bool:
        """Return True if the configured embedding model must run locally via sentence-transformers."""
        return config.EMBEDDING_MODEL.lower() in self._SENTENCE_TRANSFORMER_MODELS

    def _preload_embedding_model(self) -> None:
        """
        Load the embedding model in a background thread at startup.
        Uses a threading.Event so that _get_embeddings can wait for the
        model to be ready before attempting inference.

        In Flask debug mode, two processes run (reloader parent + child).
        We skip loading in the reloader parent process to prevent the model
        from being loaded twice. WERKZEUG_RUN_MAIN='true' identifies the
        child process that actually serves requests.
        """
        import os
        import threading

        self._model_ready = threading.Event()

        if not (self._is_sentence_transformer_model() or not config.USE_OLLAMA_EMBEDDING):
            # Ollama/llama.cpp model — no local pre-loading needed
            self._model_ready.set()
            return

        # Detect Flask reloader parent process and skip it
        flask_debug_mode = os.environ.get('FLASK_DEBUG') == '1' or os.environ.get('WERKZEUG_RUN_MAIN') is not None
        is_reloader_parent = flask_debug_mode and os.environ.get('WERKZEUG_RUN_MAIN') != 'true'

        if is_reloader_parent:
            logger.debug("[KnowledgeBase] Reloader parent process — skipping model preload.")
            self._model_ready.set()
            return

        def _load():
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"[KnowledgeBase] Pre-loading embedding model: {config.EMBEDDING_MODEL} ...")
                self.embedding_model = SentenceTransformer(config.EMBEDDING_MODEL)
                logger.info(f"[KnowledgeBase] ✅ Embedding model ready: {config.EMBEDDING_MODEL}")
            except Exception as exc:
                logger.error(
                    f"[KnowledgeBase] Failed to pre-load embedding model '{config.EMBEDDING_MODEL}': {exc}. "
                    "Falling back to lazy loading on first use."
                )
            finally:
                self._model_ready.set()  # Unblock any waiting callers

        thread = threading.Thread(target=_load, name="EmbeddingModel-Loader", daemon=True)
        thread.start()
        logger.info("[KnowledgeBase] 🔄 Embedding model loading in background ...")

    def _get_embeddings(self, texts: List[str], task_type: str = 'document') -> np.ndarray:
        """
        Compute embeddings for a list of texts.

        Routing:
          - sentence-transformers models (e.g. all-MiniLM-L6-v2) → run locally, no HTTP.
          - Nomic / Ollama models with USE_OLLAMA_EMBEDDING=True → llama.cpp /embedding endpoint.
          - Everything else → sentence-transformers SentenceTransformer fallback.

        Args:
            texts:     List of strings to embed.
            task_type: 'query' or 'document' (used for Nomic prefix only).
        """
        processed_texts = texts

        # Nomic model requirement: prefix with task type for better semantic matching
        if "nomic" in config.EMBEDDING_MODEL.lower():
            prefix = "search_query: " if task_type == 'query' else "search_document: "
            processed_texts = [f"{prefix}{t}" for t in texts]
            logger.debug(f"Applied Nomic search prefix: {prefix!r}")

        # ── Path 1: sentence-transformers model running locally ─────────────
        if self._is_sentence_transformer_model() or not config.USE_OLLAMA_EMBEDDING:
            # Wait for background loader to finish (if still loading)
            if hasattr(self, '_model_ready'):
                self._model_ready.wait()

            if self.embedding_model is None:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading sentence-transformers model: {config.EMBEDDING_MODEL}")
                self.embedding_model = SentenceTransformer(config.EMBEDDING_MODEL)

            embeddings = self.embedding_model.encode(
                processed_texts,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            return embeddings.astype('float32')

        # ── Path 2: llama.cpp / Ollama embedding endpoint ───────────────────
        from services.agent.ollama_service import ollama_service

        batch_size = 20
        all_embeddings: List = []

        for i in range(0, len(processed_texts), batch_size):
            batch = processed_texts[i:i + batch_size]
            batch_num = i // batch_size + 1
            total_batches = (len(processed_texts) - 1) // batch_size + 1
            logger.debug(f"Fetching embedding batch {batch_num}/{total_batches}")

            batch_embeddings = ollama_service.embed(batch)
            all_embeddings.extend(batch_embeddings)

        arr = np.array(all_embeddings).astype('float32')
        # Normalize embeddings to unit vectors
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        norms[norms == 0] = 1e-12
        return arr / norms
        
    def _rebuild_bm25(self):
        """Rebuild BM25 index from current documents"""
        try:
            from rank_bm25 import BM25Okapi
            import re
            
            if not self.documents:
                self.bm25 = None
                return

            # Simple tokenization: lowercase + split by non-alphanumeric
            tokenized_corpus = [
                [t for t in re.findall(r'[\w\u0600-\u06FF]+', doc['content'].lower()) if len(t) > 1]
                for doc in self.documents
            ]
            self.bm25 = BM25Okapi(tokenized_corpus)
            logger.info(f"Built BM25 index for {len(self.documents)} documents")
        except ImportError:
            logger.warning("rank_bm25 not installed. Hybrid search disabled.")
            self.bm25 = None
        except Exception as e:
            logger.error(f"Failed to build BM25 index: {e}")
            self.bm25 = None

    def _load_or_create(self):
        """Load existing index or create new one"""
        config.init_directories()
        
        try:
            import faiss
            
            if self.index_path.exists() and self.docs_path.exists():
                # Load existing index
                self.index = faiss.read_index(str(self.index_path))
                
                # Verify dimension matching
                if self.index.d != config.EMBEDDING_DIM:
                    logger.warning(f"Index dimension mismatch: found {self.index.d}, expected {config.EMBEDDING_DIM}. Forcing re-index.")
                    self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
                    self.documents = []
                else:
                    with open(self.docs_path, 'rb') as f:
                        self.documents = pickle.load(f)
                    logger.info(f"Loaded existing index with {len(self.documents)} documents")
            else:
                # Create new index
                # Using L2 distance with configured dimensions
                self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
                self.documents = []
                logger.info(f"Created new FAISS index (Dimension: {config.EMBEDDING_DIM})")
            
            # Rebuild BM25 index on load
            self._rebuild_bm25()
                
        except Exception as e:
            logger.error(f"Error loading/creating index: {e}")
            import faiss
            self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
            self.documents = []
            self.bm25 = None
    
    def reindex_from_database(self):
        """Rebuild the vector index from documents stored in the database"""
        from models import database
        
        # Get all chunks from database
        all_chunks = database.get_all_chunks()
        
        if not all_chunks:
            logger.warning("No documents in database to reindex")
            return 0
        
        BATCH_SIZE = 500
        total_chunks = len(all_chunks)
        
        logger.info(f"Starting re-indexing of {total_chunks} chunks in batches of {BATCH_SIZE}...")
        
        for i in range(0, total_chunks, BATCH_SIZE):
            batch_chunks = all_chunks[i:i + BATCH_SIZE]
            texts = [chunk['content'] for chunk in batch_chunks]
            
            logger.debug(f"Processing batch {i//BATCH_SIZE + 1}/{(total_chunks-1)//BATCH_SIZE + 1}")
            embeddings = self._get_embeddings(texts, task_type='document')
            
            # Add to FAISS index
            if self.index is None:
                import faiss
                self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
                
            idx_any: Any = self.index
            idx_any.add(np.ascontiguousarray(embeddings.astype('float32')))
            
            # Store document metadata
            for chunk in batch_chunks:
                self.documents.append({
                    'doc_id': chunk['document_id'],
                    'chunk_index': chunk['chunk_index'],
                    'content': chunk['content'],
                    'metadata': chunk.get('metadata') or f"From {chunk.get('source_name', 'document')}"
                })
        
        # Save index
        self._save()
        
        # Rebuild BM25
        self._rebuild_bm25()
        
        # Update successful reindexing status in database
        unique_doc_ids = set(chunk['document_id'] for chunk in all_chunks)
        logger.info(f"Updating index status for {len(unique_doc_ids)} documents...")
        
        for doc_id in unique_doc_ids:
            # Count chunks for this doc
            doc_chunk_count = len([c for c in all_chunks if c['document_id'] == doc_id])
            database.update_document_indexed(doc_id, doc_chunk_count)
            
        logger.info(f"Reindexed {len(self.documents)} chunks successfully!")
        return len(self.documents)
    
    def ensure_indexed(self) -> None:
        """
        Ensure documents are indexed.
        If the vector store is empty but the database has documents,
        reindexing is launched in a background daemon thread so the
        application can start serving requests immediately.
        """
        if len(self.documents) != 0:
            return  # Already indexed — nothing to do

        from models import database
        docs = database.get_all_documents()

        if not docs:
            # Nothing to index yet
            if self.bm25 is None and self.documents:
                self._rebuild_bm25()
            return

        logger.warning(
            f"Vector store empty but database has {len(docs)} documents. "
            "Launching background reindex — app will start immediately."
        )
        self._launch_background_reindex()

    def _launch_background_reindex(self) -> None:
        """Spawn a daemon thread to reindex without blocking startup."""
        import threading

        if self._reindex_lock.locked():
            logger.info("Reindex already running — skipping duplicate launch.")
            return

        def _run():
            with self._reindex_lock:
                try:
                    self._reindex_status.update({"running": True, "done": False, "progress": 0})
                    self.reindex_from_database()
                    self._reindex_status.update({"running": False, "done": True})
                    logger.info("✅ Background reindex complete.")
                except Exception as exc:
                    self._reindex_status.update({"running": False, "done": False, "error": str(exc)})
                    logger.error(f"Background reindex failed: {exc}")

        thread = threading.Thread(target=_run, name="KnowledgeBase-Reindex", daemon=True)
        thread.start()
        logger.info("🔄 Background reindex thread started.")

    @property
    def reindex_status(self) -> dict:
        """Return current reindex status (useful for admin status endpoints)."""
        return dict(self._reindex_status)
    
    def add_documents(self, doc_id: str, chunks: List[Dict], runtime: dict | None = None) -> int:
        """Add document chunks to the knowledge base"""
        if not chunks:
            return 0
        
        texts = [chunk['content'] for chunk in chunks]
        embeddings = self._get_embeddings(texts, task_type='document')
        
        # Add to FAISS index
        if self.index is None:
            import faiss
            self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
            
        idx_any: Any = self.index
        idx_any.add(np.ascontiguousarray(embeddings.astype("float32")))
        
        # Store document metadata with tenant info
        tenant_id = runtime.get("tenant_id", "default_tenant") if runtime else "default_tenant"
        site_id = runtime.get("site_id", "default_site") if runtime else "default_site"
        bot_id = runtime.get("bot_id", "default_bot") if runtime else "default_bot"
        
        for i, chunk in enumerate(chunks):
            # Build metadata dict with tenant info
            meta = {
                'doc_id': doc_id,
                'chunk_index': chunk['index'],
                'tenant_id': tenant_id,
                'site_id': site_id,
                'bot_id': bot_id,
                'source': chunk.get('metadata', ''),
            }
            self.documents.append({
                'doc_id': doc_id,
                'chunk_index': chunk['index'],
                'content': chunk['content'],
                'metadata': meta
            })
        
        # Save index
        self._save()
        
        # Update BM25
        self._rebuild_bm25()
        
        return len(chunks)
    
    def search(self, query: str, top_k: int | None = None, doc_id: str | None = None, runtime: dict | None = None) -> List[Dict]:
        """Hybrid search combining Vector (FAISS) and Keyword (BM25) results"""
        top_k = top_k or config.TOP_K_RESULTS
        
        if runtime is None:
            raise ValueError("runtime context is required for search")
            
        if not all([runtime.get("tenant_id"), runtime.get("site_id"), runtime.get("bot_id")]):
            raise ValueError("tenant_id, site_id, and bot_id are required in runtime for search")
                
        if len(self.documents) == 0:
            logger.warning("No documents in knowledge base!")
            return []
        
        # Determine filtering requirement
        filtered_indices = None
        if doc_id:
            filtered_indices = [i for i, doc in enumerate(self.documents) if doc['doc_id'] == doc_id]
            if not filtered_indices:
                logger.warning(f"No chunks found for doc_id: {doc_id}")
                return []

        # 1. Vector Search
        backend_type = getattr(config, "RAG_VECTOR_BACKEND", "chroma").lower()
        vector_results = {}
        vector_distances = {}
        
        # Determine how many results to fetch for initial ranking
        fetch_k = min(top_k * 5 if doc_id else top_k * 2, len(self.documents))

        if backend_type == "pgvector":
            query_embeddings = self._get_embeddings([query], task_type='query')
            query_embedding = query_embeddings[0]
            # Use native filtering from pgvector
            native_results = self.vector_store.search(
                query_embedding=query_embedding,
                runtime=runtime,
                top_k=top_k,
                source_type=None, 
                visibility=None
            )
            # Map native results to vector_results/vector_distances
            for i, res in enumerate(native_results):
                vector_results[i] = res['score']
                vector_distances[i] = 1.0 / res['score'] - 1.0 if res['score'] > 0 else 1.0
        else:
            # Fallback to FAISS
            if self.index is None:
                logger.warning("Search failed: Index is not initialized")
                return []
                
            query_embedding = self._get_embeddings([query], task_type='query')
            distances, indices = self.index.search(
                np.ascontiguousarray(query_embedding.astype('float32')), 
                fetch_k
            )
            
            for i, idx in enumerate(indices[0]):
                if idx < len(self.documents) and idx >= 0:
                    if filtered_indices is not None and idx not in filtered_indices:
                        continue
                    distance = distances[0][i]
                    if float(distance) < 4.0:
                        cos_sim = 1.0 - (float(distance) / 2.0)
                        similarity = max(0.0, min(1.0, cos_sim))
                    else:
                        similarity = 1.0 / (1.0 + (float(distance) / 100.0))
                    vector_results[idx] = similarity
                    vector_distances[idx] = distance

        # 2. BM25 Search
        bm25_results = {}
        if self.bm25:
            try:
                import re
                tokenized_query = [t for t in re.findall(r'[\w\u0600-\u06FF]+', query.lower()) if len(t) > 1]
                if tokenized_query:
                    scores = self.bm25.get_scores(tokenized_query)
                    
                    # Normalize BM25 scores (0-1)
                    max_bm25 = max(scores) if len(scores) > 0 else 1.0
                    
                    # If filtering by doc_id, only look at chunks from that doc
                    search_indices = filtered_indices if filtered_indices is not None else range(len(scores))
                    
                    # Get scores for relevant indices
                    relevant_scores = [(idx, scores[idx]) for idx in search_indices if scores[idx] > 0]
                    relevant_scores.sort(key=lambda x: x[1], reverse=True)
                    
                    for idx, score in relevant_scores[:fetch_k]:
                        bm25_results[idx] = score / max_bm25
            except Exception as e:
                logger.warning(f"BM25 search failed: {e}")

        # 3. Hybrid Fusion (Weighted Sum)
        # Weighting: 70% Vector, 30% Keyword (configurable)
        alpha = 0.7  
        
        all_indices = set(vector_results.keys()) | set(bm25_results.keys())
        final_results = []
        
        for idx in all_indices:
            vec_score = vector_results.get(idx, 0.0)
            bm25_score = bm25_results.get(idx, 0.0)
            # Default distance to -1 or valid derivative if missing (pure BM25 match)
            distance = vector_distances.get(idx, (1/vec_score - 1) if vec_score > 0 else -1.0)
            
            # Weighted hybrid score
            hybrid_score = (vec_score * alpha) + (bm25_score * (1 - alpha))
            
            doc = self.documents[idx]
            final_results.append({
                'doc_id': doc['doc_id'],
                'chunk_index': doc['chunk_index'],
                'content': doc['content'],
                'metadata': doc['metadata'],
                'score': float(hybrid_score),
                'vector_score': float(vec_score),
                'bm25_score': float(bm25_score),
                'distance': float(distance)
            })
        
        # Sort by hybrid score
        final_results.sort(key=lambda x: x['score'], reverse=True)
        
        # 4. Content Deduplication (Prevent identical chunks from crowding context)
        unique_results = []
        seen_contents = set()
        for res in final_results:
            # Hash content to detect near-duplicates (stripping whitespace)
            content_hash = hash(res['content'].strip())
            if content_hash not in seen_contents:
                unique_results.append(res)
                seen_contents.add(content_hash)
        
        # 5. Multi-Tenant Post-Filter (Fail-Closed)
        # TODO: replace post-filter with native vector metadata filter.
        tenant_id = runtime.get("tenant_id")
        site_id = runtime.get("site_id")
        bot_id = runtime.get("bot_id")
        
        secure_results = []
        for res in unique_results:
            metadata = res.get('metadata', {})
            if isinstance(metadata, str):
                try:
                    import json
                    metadata = json.loads(metadata)
                except Exception:
                    metadata = {}
            
            res_tenant = metadata.get('tenant_id')
            res_site = metadata.get('site_id')
            res_bot = metadata.get('bot_id')
            
            # Fall back to default tenant if metadata is missing/incomplete
            if not res_tenant or not res_site or not res_bot:
                logger.debug(f"Chunk {res.get('chunk_index')} missing tenant metadata, defaulting to default_tenant/default_site/default_bot")
                res_tenant = res_tenant or 'default_tenant'
                res_site = res_site or 'default_site'
                res_bot = res_bot or 'default_bot'
                
            if res_tenant != tenant_id or res_site != site_id or res_bot != bot_id:
                logger.warning(f"Rejecting chunk {res.get('chunk_index')} due to metadata mismatch (expected {tenant_id}/{site_id}/{bot_id}, got {res_tenant}/{res_site}/{res_bot})")
                continue
                
            secure_results.append(res)
            
        logger.info(f"[RAG:search] tenant_id={tenant_id} site_id={site_id} bot_id={bot_id}")
        logger.info(f"Hybrid search: {len(secure_results)} secure results (from {len(final_results)} total)")
        return secure_results[:top_k]
    
    def delete_document(self, doc_id: str) -> bool:
        """Remove all chunks for a document from the index"""
        # (code remains similar mostly, simplified for brevity)
        indices_to_keep = []
        docs_to_keep = []
        
        for i, doc in enumerate(self.documents):
            if doc['doc_id'] != doc_id:
                indices_to_keep.append(i)
                docs_to_keep.append(doc)
        
        if len(docs_to_keep) == len(self.documents):
            return False  # Document not found
        
        # Rebuild index without the deleted document
        if docs_to_keep:
            texts = [doc['content'] for doc in docs_to_keep]
            embeddings = self._get_embeddings(texts)
            
            import faiss
            self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
            idx_any: Any = self.index
            idx_any.add(np.ascontiguousarray(embeddings.astype('float32')))
        else:
            import faiss
            self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
        
        self.documents = docs_to_keep
        self._save()
        self._rebuild_bm25()
        
        return True
    
    def clear(self):
        """Clear the entire knowledge base"""
        import faiss
        self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
        self.documents = []
        self.bm25 = None
        self._save()
    
    def _save(self):
        """Save index to disk"""
        import faiss
        config.init_directories()
        faiss.write_index(self.index, str(self.index_path))
        with open(self.docs_path, 'wb') as f:
            pickle.dump(self.documents, f)
    
    def get_stats(self) -> Dict:
        """Get knowledge base statistics"""
        return {
            'total_chunks': len(self.documents),
            'unique_documents': len(set(doc['doc_id'] for doc in self.documents)),
            'index_size': self.index.ntotal if self.index else 0,
            'hybrid_enabled': self.bm25 is not None
        }


# Singleton instance
knowledge_base = KnowledgeBase()
