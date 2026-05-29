import abc
from typing import List, Dict, Any, Optional
import config
import json
from core.logger import get_logger

logger = get_logger(__name__)

class VectorStoreInterface(abc.ABC):
    """Interface for Vector Storage Backends"""
    
    @abc.abstractmethod
    def add_chunks(self, doc_id: str, chunks: List[Dict]) -> int:
        pass
        
    @abc.abstractmethod
    def search(self, query_embedding: Any, runtime: Dict, top_k: int, 
               source_type: Optional[str] = None, visibility: Optional[str] = None) -> List[Dict]:
        pass
        
    @abc.abstractmethod
    def delete_document(self, doc_id: str) -> bool:
        pass
        
    @abc.abstractmethod
    def clear(self):
        pass

class FaissVectorStore(VectorStoreInterface):
    """FAISS Implementation (Legacy/Fallback)"""
    def __init__(self, knowledge_base_instance):
        self.kb = knowledge_base_instance
        
    def add_chunks(self, doc_id: str, chunks: List[Dict]) -> int:
        # This will be called from KB.add_documents
        return 0 # Implementation logic resides in knowledge_base.py for now
        
    def search(self, query_embedding: Any, runtime: Dict, top_k: int, 
               source_type: Optional[str] = None, visibility: Optional[str] = None) -> List[Dict]:
        # Legacy search already implements post-filtering in knowledge_base.py
        return [] 
        
    def delete_document(self, doc_id: str) -> bool:
        return self.kb.delete_document(doc_id)
        
    def clear(self):
        self.kb.clear()

class PgVectorStore(VectorStoreInterface):
    """PostgreSQL pgvector Implementation with Native Metadata Filtering"""
    
    def __init__(self):
        self.db_url = getattr(config, "PGVECTOR_DATABASE_URL", getattr(config, "AI_STORAGE_DATABASE_URL", ""))
        self.table_name = getattr(config, "PGVECTOR_TABLE", "ai_vector_chunks")
        
    def add_chunks(self, doc_id: str, chunks: List[Dict]) -> int:
        import psycopg2  # type: ignore
        from psycopg2.extras import execute_values  # type: ignore
        
        if not self.db_url:
            logger.error("PGVECTOR_DATABASE_URL not configured")
            return 0
            
        conn = psycopg2.connect(self.db_url)
        cur = conn.cursor()
        
        data = []
        for chunk in chunks:
            data.append((
                chunk['id'], doc_id, chunk['tenant_id'], chunk['site_id'], chunk['bot_id'],
                chunk['source_type'], chunk.get('source_id'), chunk['visibility'],
                chunk['content'], chunk['embedding'], 
                json.dumps(chunk.get('metadata', {}))
            ))
            
        query = f"""
            INSERT INTO ai_storage.{self.table_name} 
            (id, document_id, tenant_id, site_id, bot_id, source_type, source_id, visibility, chunk_text, embedding, metadata)
            VALUES %s
        """
        execute_values(cur, query, data)
        conn.commit()
        cur.close()
        conn.close()
        return len(chunks)

    def search(self, query_embedding: Any, runtime: Dict, top_k: int, 
               source_type: Optional[str] = None, visibility: Optional[str] = None) -> List[Dict]:
        import psycopg2  # type: ignore
        from psycopg2.extras import RealDictCursor  # type: ignore
        
        tenant_id = runtime.get("tenant_id")
        site_id = runtime.get("site_id")
        bot_id = runtime.get("bot_id")
        
        if not all([tenant_id, site_id, bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for native vector search")
            
        conn = psycopg2.connect(self.db_url)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Native SQL search with pgvector distance operator <=> (cosine distance)
        # Filters are applied BEFORE distance sorting in PostgreSQL
        query = f"""
            SELECT document_id, chunk_text as content, metadata, 
            (1 - (embedding <=> %s::vector)) as score
            FROM ai_storage.{self.table_name}
            WHERE tenant_id = %s AND site_id = %s AND bot_id = %s
        """
        params = [query_embedding.tolist(), tenant_id, site_id, bot_id]
        
        if source_type:
            query += " AND source_type = %s"
            params.append(source_type)
            
        if visibility:
            query += " AND visibility = %s"
            params.append(visibility)
            
        query += " ORDER BY embedding <=> %s::vector LIMIT %s"
        params.extend([query_embedding.tolist(), top_k])
        
        cur.execute(query, params)
        results = cur.fetchall()
        cur.close()
        conn.close()
        
        return [dict(r) for r in results]

    def delete_document(self, doc_id: str) -> bool:
        # Implementation for deleting from Postgres
        return True
        
    def clear(self):
        # Implementation for clearing Postgres table
        pass

def get_vector_backend(kb_instance=None):
    backend_type = getattr(config, "RAG_VECTOR_BACKEND", "chroma").lower()
    if backend_type == "pgvector":
        return PgVectorStore()
    else:
        return FaissVectorStore(kb_instance)
