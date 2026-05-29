"""
ATS Service - Applicant Tracking System
Handles CV indexing, embedding, and ranking using existing FAISS infrastructure
"""
import os
import json
import re
import uuid
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any
import config
import numpy as np
import faiss
from core.logger import get_logger

logger = get_logger(__name__)

# Separate paths for ATS index (isolated from knowledge base)
ATS_INDEX_PATH = config.VECTOR_STORE_PATH / "ats_faiss_index.bin"
ATS_DOCS_PATH  = config.VECTOR_STORE_PATH / "ats_documents.json"


class ATSService:
    """
    Applicant Tracking System Service
    - Indexes CVs (PDF) into a dedicated FAISS vector store
    - Searches by Job Description to get Top-10 candidates
    - Re-ranks via Ollama LLM to select best 3-5 with reasoning
    """

    def __init__(self):
        self.embedding_model = None
        self.index: Any = None
        self.cv_documents: List[Dict] = []   # [{id, filename, text, filepath, ...}]
        self.chunk_metadata: List[Dict] = [] # [{doc_id, text}] - maps to FAISS index
        self._nlp = None # Lazy load spaCy
        self._load_or_create_index()

    # ------------------------------------------------------------------ #
    #  Private helpers                                                     #
    # ------------------------------------------------------------------ #

    def _get_embeddings(self, texts: List[str], task_type: str = 'document') -> np.ndarray:
        """
        Get embeddings using Ollama (if configured) or local SentenceTransformer.
        Respects the USE_OLLAMA_EMBEDDING config setting.
        """
        processed_texts = texts
        if "nomic" in config.EMBEDDING_MODEL.lower():
            prefix = "search_query: " if task_type == 'query' else "search_document: "
            processed_texts = [f"{prefix}{t}" for t in texts]

        # Models that are faster to run locally than via HTTP
        local_models = {"all-minilm-l6-v2", "all-minilm-l12-v2", "all-mpnet-base-v2"}
        is_local_model = config.EMBEDDING_MODEL.lower() in local_models

        if config.USE_OLLAMA_EMBEDDING and not is_local_model:
            from services.agent.ollama_service import ollama_service
            batch_size = 20
            all_embeddings = []
            for i in range(0, len(processed_texts), batch_size):
                batch = processed_texts[i:i + batch_size]
                embeddings = ollama_service.embed(batch)
                all_embeddings.extend(embeddings)
            arr = np.array(all_embeddings).astype('float32')
            # Normalize embeddings to unit vectors
            norms = np.linalg.norm(arr, axis=1, keepdims=True)
            norms[norms == 0] = 1e-12
            return arr / norms
        else:
            if self.embedding_model is None:
                from sentence_transformers import SentenceTransformer
                logger.info(f"ATS: Loading local embedding model: {config.EMBEDDING_MODEL}")
                self.embedding_model = SentenceTransformer(config.EMBEDDING_MODEL)
            
            embeddings = self.embedding_model.encode(
                processed_texts,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            return embeddings.astype('float32')

    def _load_or_create_index(self):
        config.init_directories()
        try:
            import faiss
            if ATS_INDEX_PATH.exists() and ATS_DOCS_PATH.exists():
                self.index = faiss.read_index(str(ATS_INDEX_PATH))
                with open(ATS_DOCS_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self.cv_documents = data.get("docs", [])
                        self.chunk_metadata = data.get("chunks", [])
                    else:
                        # Auto-migration for existing users (old format was just list)
                        self.cv_documents = data
                        self.chunk_metadata = []
                logger.info(f"ATS: Loaded index with {len(self.cv_documents)} CVs and {len(self.chunk_metadata)} chunks")
            else:
                # Check for old pickle file and migrate
                old_pkl = config.VECTOR_STORE_PATH / "ats_documents.pkl"
                if ATS_INDEX_PATH.exists() and old_pkl.exists():
                    logger.info("ATS: Migrating from pickle to JSON format...")
                    self.index = faiss.read_index(str(ATS_INDEX_PATH))
                    import pickle
                    with open(old_pkl, "rb") as f:
                        data = pickle.load(f)
                    self.cv_documents = data.get("docs", []) if isinstance(data, dict) else data
                    self.chunk_metadata = data.get("chunks", []) if isinstance(data, dict) else []
                    self._save_index()
                    old_pkl.rename(old_pkl.with_suffix('.pkl.bak'))
                    logger.info("ATS: Migration complete.")
                else:
                    self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
                    self.cv_documents = []
                    self.chunk_metadata = []
                    logger.info("ATS: Created new FAISS index")
        except Exception as e:
            logger.error(f"ATS index init error: {e}")
            import faiss
            self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
            self.cv_documents = []
            self.chunk_metadata = []

    def _save_index(self):
        """
        Save both the FAISS index and the CV/chunk metadata to disk.
        Metadata is stored as JSON (safe) — the binary FAISS index is
        written separately via faiss.write_index.
        NOTE: Only ONE definition of _save_index should exist to prevent data loss.
        """
        import faiss
        config.init_directories()
        faiss.write_index(self.index, str(ATS_INDEX_PATH))
        with open(ATS_DOCS_PATH, "w", encoding="utf-8") as f:
            json.dump({"docs": self.cv_documents, "chunks": self.chunk_metadata}, f, ensure_ascii=False)
        logger.debug(f"ATS: Saved index ({len(self.cv_documents)} CVs, {len(self.chunk_metadata)} chunks)")

    @staticmethod
    def _chunk_text(text: str, size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks for superior search quality."""
        if not text: return []
        chunks = []
        for i in range(0, len(text), size - overlap):
            chunk = text[i:i + size].strip()
            if len(chunk) > 100:
                chunks.append(chunk)
        return chunks

    @staticmethod
    def _extract_text_from_pdf(path: str) -> Optional[str]:
        """Try multiple extractors; return best result."""
        # Method 1: pdfminer (most accurate, best for Arabic text)
        try:
            from pdfminer.high_level import extract_text as pdfminer_extract
            text = pdfminer_extract(path) or ""
            if text.strip() and len(text.strip()) > 50:
                return text.strip()
        except Exception as exc:
            logger.warning(f"ATS: pdfminer text extraction failed for {os.path.basename(path)}: {exc}")

        # Method 2: PyPDF2 (fast fallback)
        try:
            import PyPDF2
            with open(path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                text = " ".join(
                    (page.extract_text() or "") for page in reader.pages
                )
            if text.strip():
                return text.strip()
        except Exception as exc:
            logger.warning(f"ATS: PyPDF2 text extraction failed for {os.path.basename(path)}: {exc}")

        return None

    @staticmethod
    def _extract_json_from_text(text: str) -> Optional[Dict]:
        """
        Robustly extract a JSON object from a string.
        """
        if not text:
            return None

        # 1. Strip markdown code fences
        cleaned = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip()
        cleaned = cleaned.replace("```", "")

        # 2. Find the outermost braces
        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start == -1 or end == -1 or end <= start:
            return None

        candidate = cleaned[start:end+1]

        # Try direct parse first
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

        # Fix trailing commas (most common model error)
        try:
            fixed = re.sub(r",\s*([\]}])", r"\1", candidate)
            return json.loads(fixed)
        except json.JSONDecodeError:
            pass

        logger.warning(f"ATS: JSON extraction failed. Raw (200 chars): {candidate[:200]!r}")
        return None

    def _extract_entities_with_spacy(self, text: str) -> Dict:
        """
        Use spaCy to extract structured data from CV text.
        Identifies Name, Companies (ORG), and Locations (GPE).
        """
        import spacy
        if self._nlp is None:
            try:
                self._nlp = spacy.load("en_core_web_sm")
            except Exception as e:
                logger.error(f"ATS: Failed to load spaCy model: {e}")
                return {}

        try:
            # Only process first 10k chars for speed
            doc = self._nlp(text[:10000])
            entities: Dict[str, Any] = {
                "persons": list(set([ent.text for ent in doc.ents if ent.label_ == "PERSON"])),
                "organizations": list(set([ent.text for ent in doc.ents if ent.label_ == "ORG"])),
                "locations": list(set([ent.text for ent in doc.ents if ent.label_ == "GPE"])),
            }
            # Heuristic for name: Usually the first PERSON entity found in a CV
            entities["candidate_name"] = entities["persons"][0] if entities["persons"] else "Unknown"
            
            # Simple Email extraction via regex as backup to spaCy
            emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
            entities["emails"] = list(set(emails))
            
            return entities
        except Exception as e:
            logger.error(f"ATS: spaCy extraction error: {e}")
            return {}
            
    def _scale_similarity(self, raw_sim: float) -> float:
        """
        Scale raw similarity score to naturally distributed percentage for human consumption.
        Addresses embedding anisotropy where raw similarity values are clustered in [0.58, 0.82].
        """
        min_val = 0.58
        max_val = 0.82
        if raw_sim <= min_val:
            return (raw_sim / min_val) * 0.10
        elif raw_sim >= max_val:
            return 0.95 + ((raw_sim - max_val) / (1.0 - max_val)) * 0.05
        else:
            return 0.10 + ((raw_sim - min_val) / (max_val - min_val)) * 0.85

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def get_stats(self) -> Dict:
        return {
            "total_cvs": len(self.cv_documents),
            "index_size": self.index.ntotal if self.index else 0,
        }

    def get_cv_by_id(self, doc_id: str) -> Optional[Dict]:
        """Find a CV document by its unique ID."""
        for doc in self.cv_documents:
            if doc['id'] == doc_id:
                return doc
        return None

    def reset_index(self):
        """Clear all indexed CVs and chunks."""
        import faiss
        self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
        self.cv_documents = []
        self.chunk_metadata = []
        self._save_index()
        logger.info("ATS: Index reset (all docs and chunks cleared)")

    def index_cv_files(self, file_paths: List[str]) -> Dict:
        """
        Extract text, apply chunking, and index each chunk.
        Respects USE_OLLAMA_EMBEDDING config setting for consistency.
        """
        success = 0
        failed = []

        all_new_chunks = []
        all_chunk_payloads = []

        for path in file_paths:
            filename = os.path.basename(path)

            # Skip duplicate filenames
            if any(d["filename"] == filename for d in self.cv_documents):
                logger.warning(f"ATS: Skipping duplicate CV '{filename}' — already indexed")
                failed.append(f"{filename} (duplicate)")
                continue

            text = self._extract_text_from_pdf(path)
            if not text:
                logger.warning(f"ATS: Could not extract text from {filename}")
                failed.append(filename)
                continue

            doc_id = str(uuid.uuid4())
            
            # Use spaCy to extract entities for richer metadata
            parsed_info = self._extract_entities_with_spacy(text)
            
            self.cv_documents.append({
                "id": doc_id,
                "filename": filename,
                "filepath": path,
                "full_text": text[:20000],  # Limit for LLM context window
                "parsed_info": parsed_info
            })

            # Create Chunks
            chunks = self._chunk_text(text)
            for chunk in chunks:
                all_new_chunks.append(chunk)
                all_chunk_payloads.append({"doc_id": doc_id, "text": chunk})

            success += 1
            logger.info(f"ATS: Extracted {len(chunks)} chunks from {filename}")

        if all_new_chunks:
            if self.index is None:
                logger.warning("ATS: Index was None, initializing now")
                import faiss
                self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
                
            embeddings = self._get_embeddings(all_new_chunks, task_type='document')
            # Ensure C-contiguous for FAISS and bypass strict type check
            idx_any: Any = self.index
            idx_any.add(np.ascontiguousarray(embeddings.astype("float32")))
            self.chunk_metadata.extend(all_chunk_payloads)
            self._save_index()
            logger.info(f"ATS: Indexed {success} CVs into {len(all_new_chunks)} chunks")

        return {"success": success, "failed": failed, "total": len(self.cv_documents)}

    def search_top_candidates(self, jd_text: str, top_k: int = 10) -> List[Dict]:
        """
        Hybrid Semantic Search: Search chunks, group by CV, then sort.
        """
        if not self.chunk_metadata:
            logger.warning("ATS: chunk_metadata is empty - index may need rebuilding")
            return []

        jd_embedding = self._get_embeddings([jd_text], task_type='query')

        # Retrieve more chunks than needed to get better CV representation
        fetch_chunks = min(top_k * 4, len(self.chunk_metadata))
        distances, indices = self.index.search(jd_embedding.astype("float32"), fetch_chunks)

        # Step 1: Accumulate scores by doc_id
        doc_analysis: Dict[str, Dict] = {}
        for idx, dist in zip(indices[0], distances[0]):
            if idx < 0 or idx >= len(self.chunk_metadata): continue

            meta = self.chunk_metadata[idx]
            doc_id = meta["doc_id"]
            if float(dist) < 4.0:
                # Normalized vectors: L2^2 = 2 - 2*cos_sim => cos_sim = 1 - L2^2 / 2
                cos_sim = 1.0 - (float(dist) / 2.0)
                sim = max(0.0, min(1.0, cos_sim))
            else:
                # Unnormalized fallback: scale to a reasonable score
                sim = 1.0 / (1.0 + (float(dist) / 100.0))

            if doc_id not in doc_analysis:
                doc_analysis[doc_id] = {"scores": []}
            doc_analysis[doc_id]["scores"].append(sim)

        # Step 2: Select Top CVs based on best match + overall relevance
        candidates = []
        for doc_id, data in doc_analysis.items():
            best_part = max(data["scores"])
            avg_rel = sum(data["scores"]) / len(data["scores"])
            # Formula: 70% best section match + 30% average relevance
            final_sim = (best_part * 0.7) + (avg_rel * 0.3)

            doc = next((d for d in self.cv_documents if d["id"] == doc_id), None)
            if not doc: continue

            # Grouping by filename to avoid duplicates if same file uploaded multiple times
            existing = next((c for c in candidates if c["filename"] == doc["filename"]), None)
            scaled_score = round(self._scale_similarity(final_sim) * 100, 1)
            if existing:
                if scaled_score > existing["similarity_score"]:
                    existing["similarity_score"] = scaled_score
                continue

            candidates.append({
                "id": doc_id,
                "filename": doc["filename"],
                "similarity_score": scaled_score,
                "full_text": doc.get("full_text", ""),
                "parsed_info": doc.get("parsed_info", {}),
            })

        candidates.sort(key=lambda x: x["similarity_score"], reverse=True)
        results = candidates[:top_k]

        for i, res in enumerate(results, 1):
            res["rank"] = i

        return results

    def rank_with_llm(
        self,
        jd_text: str,
        candidates: List[Dict],
        top_n: int = 3,
    ) -> Dict:
        """
        Re-rank top candidates using LLM reasoning.
        Falls back gracefully if LLM is unavailable or times out.
        """
        if not candidates:
            return {"top_candidates": [], "selection_summary": "No candidates to rank."}

        top_candidates = candidates[:min(10, len(candidates))]

        try:
            from services.agent.ollama_service import ollama_service
            from models import database

            settings = database.get_model_settings()
            model_name = settings.get("active_model", config.DEFAULT_MODEL)

            candidates_text = ""
            for i, c in enumerate(top_candidates, 1):
                info = c.get("parsed_info", {})
                name = info.get("candidate_name", c["filename"])
                skills = ", ".join(info.get("organizations", [])[:5]) or "N/A"
                score = c["similarity_score"]
                candidates_text += (
                    f"\n[{i}] {name} | Score: {score}% | Skills: {skills}\n"
                    f"    CV Summary: {c.get('full_text', '')[:400]}\n"
                )

            prompt = f"""Rank the top {top_n} candidates for this job. Return ONLY JSON.

JOB: {jd_text[:600]}

CANDIDATES:
{candidates_text}

Return this exact format:
{{"candidates": [{{
  "rank": 1,
  "filename": "from input",
  "score": 85,
  "strengths": ["s1", "s2"],
  "weaknesses": ["w1"],
  "reason": "in Arabic"
}}], "summary": "in Arabic"}}

Select exactly {top_n}."""

            # Use fast model for ATS ranking (1.7b is better for JSON than company-assistant)
            from config import UTILITY_MODEL_NAME
            ats_model = UTILITY_MODEL_NAME or model_name

            raw = ollama_service.generate(
                prompt=prompt,
                model=ats_model,
                system_prompt=(
                    "/no_think\n"
                    "You are a JSON-only assistant. Output ONLY a JSON object. "
                    "No markdown, no code fences, no explanation, no text outside the JSON. "
                    "Start with { and end with }."
                ),
                temperature=0.1,
                timeout=500,
                max_tokens=500,
                json_mode=False,
            )

            logger.debug(f"ATS: LLM raw response (first 300 chars): {raw[:300]!r}")
            result = self._extract_json_from_text(raw)
            if result and "candidates" in result and len(result["candidates"]) > 0:
                for item in result["candidates"]:
                    match = next((
                        c for c in top_candidates
                        if c["filename"].strip().lower() == item.get("filename", "").strip().lower()
                    ), None)
                    if match:
                        item["id"] = match["id"]
                        item["parsed_info"] = match.get("parsed_info", {})
                        if "score" not in item or not item["score"]:
                            item["score"] = int(match["similarity_score"])
                    else:
                        item["score"] = item.get("score", 0)
                # Normalize field names for downstream
                for item in result["candidates"]:
                    item["overall_score"] = item.pop("score", 0)
                    item["why_selected"] = item.pop("reason", "")
                output = {
                    "top_candidates": result["candidates"],
                    "selection_summary": result.get("summary", "تم الترتيب بناءً على تحليل الذكاء الاصطناعي."),
                }
                logger.info(f"ATS: LLM ranked {len(output['top_candidates'])} candidates successfully")
                return output

            logger.warning(f"ATS: LLM returned invalid/unusable JSON. Raw (500 chars): {raw[:500]!r}")
            # Try simpler format before expensive individual reasoning
            simple = self._try_simple_list_ranking(jd_text, top_candidates[:top_n], model_name)
            if simple:
                return simple
            return self._fallback_ranking(candidates, top_n)

        except Exception as exc:
            logger.warning(f"ATS: LLM ranking failed ({exc}), using similarity fallback")
            return self._fallback_ranking(candidates, top_n)

    def _try_simple_list_ranking(self, jd_text: str, top_candidates: List[Dict], model_name: str) -> Optional[Dict]:
        """
        Intermediate fallback: ask LLM for a simple ranked list (easier than full JSON).
        Returns None if this also fails.
        """
        from services.agent.ollama_service import ollama_service

        filenames = [c["filename"] for c in top_candidates]
        filenames_str = ", ".join(f"{i+1}. {fn}" for i, fn in enumerate(filenames))

        prompt = f"""Rank these candidates by best fit for the job. Return ONLY a numbered list.

JOB: {jd_text[:400]}

CANDIDATES: {filenames_str}

Return ONLY this format (no JSON, no explanation):
1. filename - reason in Arabic
2. filename - reason in Arabic
3. filename - reason in Arabic"""

        try:
            from config import UTILITY_MODEL_NAME
            ats_model = UTILITY_MODEL_NAME or model_name

            raw = ollama_service.generate(
                prompt=prompt,
                model=ats_model,
                system_prompt="/no_think\nReturn ONLY a numbered list. No other text.",
                temperature=0.1,
                timeout=90,
                max_tokens=500,
                json_mode=False,
            )
            logger.debug(f"ATS: Simple ranking response: {raw[:300]!r}")
            return self._parse_simple_list(raw, top_candidates)
        except Exception as exc:
            logger.debug(f"ATS: Simple list ranking failed: {exc}")
            return None

    def _parse_simple_list(self, raw: str, top_candidates: List[Dict]) -> Optional[Dict]:
        """
        Parse a numbered list like '1. file.pdf - reason' into a ranking result.
        """
        lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
        results = []

        for line in lines:
            # Match patterns: "1. filename.pdf - reason" or "1. filename.pdf: reason" or "1) filename.pdf - reason"
            match = re.match(r"^\d+[\.\)]\s*(.+?)(?:\s*[-:]\s*(.+))?$", line)
            if not match:
                continue

            filename_part = match.group(1).strip()
            reason = (match.group(2) or "").strip()

            # Fuzzy match against known candidates
            matched_candidate = next((
                c for c in top_candidates
                if filename_part.lower().strip() in c["filename"].lower()
                or c["filename"].lower().strip() in filename_part.lower()
                or c["filename"].strip().lower() == filename_part.strip().lower()
            ), None)

            if matched_candidate:
                results.append({
                    "rank": len(results) + 1,
                    "id": matched_candidate["id"],
                    "filename": matched_candidate["filename"],
                    "overall_score": int(matched_candidate["similarity_score"]),
                    "parsed_info": matched_candidate.get("parsed_info", {}),
                    "strengths": [],
                    "weaknesses": [],
                    "why_selected": reason or f"تم الترتيب بناءً على التحليل بنسبة {matched_candidate['similarity_score']}%.",
                })

        if len(results) < 1:
            return None

        logger.info(f"ATS: Parsed {len(results)} candidates from simple list ranking")
        return {
            "top_candidates": results,
            "selection_summary": "تم الترتيب بناءً على تحليل مبسط للذكاء الاصطناعي.",
        }

    def _rank_with_individual_reasoning(self, jd_text: str, top_candidates: List[Dict], model_name: str) -> Dict:
        """
        Stage 2 Fallback: If the model can't handle the full JSON ranking,
        ask it for strengths/weaknesses of each candidate one-by-one with simple prompts.
        """
        from services.agent.ollama_service import ollama_service
        
        results = []
        for i, cand in enumerate(top_candidates):
            logger.debug(f"ATS: Getting individual reasoning for {cand['filename']}")
            
            prompt = f"""Analyze this candidate for the following Job.
JOB: {jd_text[:500]}
CV TEXT: {cand['full_text'][:1500]}

Explain in ARABIC (عربي):
1. Strengths (نقاط القوة)
2. Weaknesses (نقاط الضعف)
3. Why selected (لماذا تم اختياره)

Return ONLY a JSON object:
{{"strengths": ["...", "..."], "weaknesses": ["..."], "why_selected": "..."}}"""

            try:
                raw = ollama_service.generate(
                    prompt=prompt,
                    model=model_name,
                    system_prompt="Return ONLY valid JSON in Arabic.",
                    temperature=0.1,
                    timeout=90,
                    json_mode=True
                )
                reasoning = self._extract_json_from_text(raw)
                if reasoning:
                    results.append({
                        "rank": i + 1,
                        "id": cand["id"],
                        "filename": cand["filename"],
                        "overall_score": int(cand["similarity_score"]),
                        "parsed_info": cand.get("parsed_info", {}),
                        "strengths": reasoning.get("strengths", []),
                        "weaknesses": reasoning.get("weaknesses", []),
                        "why_selected": reasoning.get("why_selected", f"تم اختياره بناءً على قوة المطابقة ({cand['similarity_score']}%).")
                    })
                    continue
            except Exception as exc:
                logger.warning(f"ATS: Individual reasoning failed for {cand['filename']}: {exc}")
            
            # Sub-fallback for this specific candidate
            results.append({
                "rank": i + 1,
                "id": cand["id"],
                "filename": cand["filename"],
                "overall_score": int(cand["similarity_score"]),
                "strengths": ["مطابقة دلالية قوية"],
                "weaknesses": [],
                "why_selected": f"تم اختياره بناءً على البحث الدلالي بنسبة {cand['similarity_score']}%."
            })

        return {
            "top_candidates": results,
            "selection_summary": "تم التحليل والترتيب بشكل فردي لكل مترشح لضمان دقة النتائج."
        }

    def _fallback_ranking(self, candidates: List[Dict], top_n: int) -> Dict:
        """Stage 3 Fallback: use similarity scores if even individual reasoning fails."""
        top = candidates[:top_n]
        return {
            "top_candidates": [
                {
                    "rank": i + 1,
                    "id": c["id"],
                    "filename": c["filename"],
                    "overall_score": int(c["similarity_score"]),
                    "strengths": ["درجة مطابقة عالية"],
                    "weaknesses": [],
                    "why_selected": f"تم الترتيب بناءً على البحث الدلالي بنسبة {c['similarity_score']}%.",
                }
                for i, c in enumerate(top)
            ],
            "selection_summary": "تم الترتيب بناءً على خوارزمية البحث الدلالي.",
        }


# Singleton
ats_service = ATSService()

ats_pipeline = ats_service
