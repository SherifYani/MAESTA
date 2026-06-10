"""
ATS Service - Applicant Tracking System
Handles CV indexing, embedding, and ranking using smart skill-based scoring
CV data is stored in SQLite (ats_cvs + ats_chunks), vectors in FAISS binary.
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
from models import database

logger = get_logger(__name__)

# FAISS binary index path (only the vector index is on disk)
ATS_INDEX_PATH = config.VECTOR_STORE_PATH / "ats_faiss_index.bin"

# ── Skill Definitions for Smart Ranking ────────────────────────────────

REQUIRED_SKILLS = {
    "C#": [r'c#[\s,;.\]\)(:]', r'c[\s]*sharp', r'\.net[\s,;.\]\)(:]', r'\.net\s*(?:core|\d)'],
    "ASP.NET Core": [r'asp\.?net[\s,;.\]\)(:]', r'asp\.?net\s*(?:core|\d+)', r'\.net\s*(?:core|\d+)'],
    "SQL Server": [r'sql\s*server', r'mssql', r'microsoft\s*sql'],
    "Entity Framework Core": [r'entity\s*framework', r'\bef\s*core', r'\bef\s'],
    "REST APIs": [r'rest\s*api', r'restful', r'web\s*api', r'api\s*endpoint'],
    "Git/GitHub": [r'\bgit\b', r'github', r'gitlab', r'bitbucket'],
}

PREFERRED_SKILLS = {
    "Docker": [r'docker', r'container(?:ization)?'],
    "Azure": [r'azure', r'microsoft\s*azure'],
    "Unit Testing": [r'unit\s*test', r'test\s*frame', r'xunit', r'nunit', r'mstest', r'\bmock\b', r'test\s*driven'],
    "JWT": [r'\bjwt\b', r'json\s*web\s*token', r'bearer\s*token'],
    "Clean Architecture": [r'clean\s*arch', r'domain\s*driven', r'\bddd\b', r'\bsolid\b', r'dependency\s*injection', r'repository\s*pattern', r'cqrs', r'mediator'],
}

# Skills that indicate candidate is NOT a .NET developer (triggers penalty)
NON_DOTNET_SKILLS = {
    "Java": [r'\bjava[\s,;.\]\)]', r'\bspring[\s,;.\]\)]', r'\bmaven[\s,;.]'],
    "Python": [r'\bpython[\s,;.\]\)]', r'\bdjango[\s,;.]', r'\bflask[\s,;.]', r'\bfastapi[\s,;.]'],
    "PHP": [r'\bphp[\s,;.\]\)]', r'\blaravel[\s,;.]', r'\bwordpress'],
    "React": [r'\breact[\s,;.\]\)]', r'react\.js', r'next\.js'],
    "Flutter/Dart": [r'flutter', r'\bdart[\s,;.]'],
    "Data Science": [r'data\s*(?:anal|sci)', r'machine\s*learn', r'deep\s*learn', r'pandas', r'numpy', r'tensorflow', r'pytorch'],
    "UI/UX": [r'ui\s*ux', r'figma', r'adobe\s*xd', r'\bsketch\b'],
}

EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*(?:years?|سنوات|سنين|سن)\s*(?:of\s*)?(?:experience|خبرة|عمل)',
    r'(?:experience|خبرة|عمل)\s*(?:of|:)?\s*(\d+)\+?\s*(?:years?|سنوات|سنين)',
    r'(\d+)\+?\s*yr',
]

EDUCATION_KEYWORDS = {
    "cs": [r'computer\s*science', r'software\s*engineering', r'علوم\s*حاسب', r'هندسة\s*برمجيات', r'information\s*technology', r'information\s*systems', r'نظم\s*معلومات'],
    "engineering": [r'engineering', r'هندسة', r'computer\s*engineering', r'electrical\s*engineering'],
    "degree": [r'bachelor', r'master', r'phd\b', r'doctorate', r'بكالوريوس', r'ماجستير', r'دكتوراه', r'b\.s\.', r'm\.s\.', r'b\.a\.'],
}

PROJECT_INDICATORS = [
    r'project', r'mشروع', r'system', r'نظام', r'application', r'تطبيق',
    r'platform', r'منصة', r'website', r'موقع', r'api\b', r'service',
]


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
        self.cv_documents: List[Dict] = []   # in-memory cache of [{id, filename, full_text, filepath, parsed_info}]
        self.chunk_metadata: List[Dict] = [] # in-memory cache of [{cv_id, content}] — maps to FAISS index positions
        self._nlp = None
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
            if ATS_INDEX_PATH.exists():
                self.index = faiss.read_index(str(ATS_INDEX_PATH))
            else:
                self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
                logger.info("ATS: Created new FAISS index")

            # Load CV data from SQLite
            self.cv_documents = database.get_all_ats_cvs()
            chunks = database.get_all_ats_chunks()
            self.chunk_metadata = [{"cv_id": c["cv_id"], "content": c["content"]} for c in chunks]

            # Auto-migrate from old JSON if exists
            old_json = config.VECTOR_STORE_PATH / "ats_documents.json"
            if old_json.exists() and len(self.cv_documents) == 0:
                self._migrate_from_json(old_json)

            logger.info(f"ATS: Loaded {len(self.cv_documents)} CVs and {len(self.chunk_metadata)} chunks from DB")
        except Exception as e:
            logger.error(f"ATS index init error: {e}")
            self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
            self.cv_documents = []
            self.chunk_metadata = []

    def _migrate_from_json(self, json_path: Path):
        """One-time migration from old JSON storage to SQLite."""
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            docs = data.get("docs", []) if isinstance(data, dict) else data
            chunks_data = data.get("chunks", []) if isinstance(data, dict) else []
            logger.info(f"ATS: Migrating {len(docs)} CVs and {len(chunks_data)} chunks from JSON to SQLite...")

            for doc in docs:
                parsed = doc.get("parsed_info", {}) or {}
                cv_id = database.create_ats_cv(
                    filename=doc.get("filename", ""),
                    filepath=doc.get("filepath", ""),
                    full_text=doc.get("full_text", ""),
                    candidate_name=parsed.get("candidate_name", ""),
                    organizations=json.dumps(parsed.get("organizations", []), ensure_ascii=False),
                    locations=json.dumps(parsed.get("locations", []), ensure_ascii=False),
                    emails=json.dumps(parsed.get("emails", []), ensure_ascii=False),
                )
                # Find and save chunks for this doc
                doc_chunks = [c["content"] for c in chunks_data if c.get("doc_id") == doc.get("id")]
                if doc_chunks:
                    database.create_ats_chunks(cv_id, doc_chunks)
                    database.update_ats_cv_chunk_count(cv_id, len(doc_chunks))

            # Reload from DB
            self.cv_documents = database.get_all_ats_cvs()
            chunks = database.get_all_ats_chunks()
            self.chunk_metadata = [{"cv_id": c["cv_id"], "content": c["content"]} for c in chunks]
            logger.info("ATS: Migration to SQLite complete.")
        except Exception as e:
            logger.error(f"ATS: Migration from JSON failed: {e}")

    def _save_index(self):
        """
        Save the FAISS index to disk.
        CV metadata is already persisted to SQLite via index_cv_files().
        """
        faiss.write_index(self.index, str(ATS_INDEX_PATH))
        logger.debug(f"ATS: FAISS index saved ({self.index.ntotal} vectors)")

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
        Scale raw similarity to a natural 0-100% range.
        Uses a logarithmic-inspired scale so that even moderate
        cosine similarities (0.4–0.6) produce meaningful scores.
        """
        if raw_sim <= 0.1:
            return 0.0
        elif raw_sim <= 0.4:
            return raw_sim * 0.25
        elif raw_sim <= 0.6:
            return 0.10 + ((raw_sim - 0.4) / 0.2) * 0.30
        elif raw_sim <= 0.8:
            return 0.40 + ((raw_sim - 0.6) / 0.2) * 0.45
        else:
            return 0.85 + ((raw_sim - 0.8) / 0.2) * 0.15

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    def get_stats(self) -> Dict:
        return {
            "total_cvs": database.count_ats_cvs(),
            "index_size": self.index.ntotal if self.index else 0,
        }

    def get_cv_by_id(self, doc_id: str) -> Optional[Dict]:
        """Find a CV document by its unique ID from SQLite."""
        cv = database.get_ats_cv(doc_id)
        if cv:
            parsed = {
                "candidate_name": cv.get("candidate_name", ""),
                "organizations": json.loads(cv.get("organizations", "[]")),
                "locations": json.loads(cv.get("locations", "[]")),
                "emails": json.loads(cv.get("emails", "[]")),
            }
            return {
                "id": cv["id"],
                "filename": cv["filename"],
                "filepath": cv["filepath"],
                "full_text": cv.get("full_text", ""),
                "parsed_info": parsed,
            }
        return None

    def reset_index(self):
        """Clear all indexed CVs, chunks, and FAISS index."""
        database.delete_all_ats_cvs()
        self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)
        self.cv_documents = []
        self.chunk_metadata = []
        self._save_index()
        logger.info("ATS: Index reset (all docs and chunks cleared)")

    def index_cv_files(self, file_paths: List[str]) -> Dict:
        """
        Extract text, apply chunking, and index each chunk.
        CVs stored in SQLite; vectors in FAISS.
        """
        success = 0
        failed = []
        existing_filenames = {d["filename"] for d in self.cv_documents}

        all_new_chunks = []
        all_chunk_payloads = []

        for path in file_paths:
            filename = os.path.basename(path)

            # Skip duplicate filenames
            if filename in existing_filenames:
                logger.warning(f"ATS: Skipping duplicate CV '{filename}' — already indexed")
                failed.append(f"{filename} (duplicate)")
                continue

            text = self._extract_text_from_pdf(path)
            if not text:
                logger.warning(f"ATS: Could not extract text from {filename}")
                failed.append(filename)
                continue

            parsed_info = self._extract_entities_with_spacy(text)
            truncated = text[:20000]

            # Store in SQLite
            cv_id = database.create_ats_cv(
                filename=filename,
                filepath=path,
                full_text=truncated,
                candidate_name=parsed_info.get("candidate_name", ""),
                organizations=json.dumps(parsed_info.get("organizations", []), ensure_ascii=False),
                locations=json.dumps(parsed_info.get("locations", []), ensure_ascii=False),
                emails=json.dumps(parsed_info.get("emails", []), ensure_ascii=False),
            )

            # Create chunks
            chunks = self._chunk_text(text)
            database.create_ats_chunks(cv_id, chunks)
            database.update_ats_cv_chunk_count(cv_id, len(chunks))

            # In-memory cache
            self.cv_documents.append({
                "id": cv_id,
                "filename": filename,
                "filepath": path,
                "full_text": truncated,
                "parsed_info": parsed_info
            })
            existing_filenames.add(filename)

            for chunk in chunks:
                all_new_chunks.append(chunk)
                all_chunk_payloads.append({"cv_id": cv_id, "content": chunk})

            success += 1
            logger.info(f"ATS: Extracted {len(chunks)} chunks from {filename}")

        if all_new_chunks:
            if self.index is None:
                logger.warning("ATS: Index was None, initializing now")
                self.index = faiss.IndexFlatL2(config.EMBEDDING_DIM)

            embeddings = self._get_embeddings(all_new_chunks, task_type='document')
            self.index.add(np.ascontiguousarray(embeddings.astype("float32")))
            self.chunk_metadata.extend(all_chunk_payloads)
            self._save_index()
            logger.info(f"ATS: Indexed {success} CVs into {len(all_new_chunks)} chunks")

        return {"success": success, "failed": failed, "total": database.count_ats_cvs()}

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
            doc_id = meta.get("cv_id") or meta.get("doc_id", "")
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
        Global ATS ranking: smart scoring + LLM enhancement.
        1. Smart scoring (Skill 50%, Experience 20%, Education 10%, Semantic 20%)
        2. LLM enhancement for natural-language feedback on top candidates
        3. Falls back gracefully if LLM unavailable.
        """
        if not candidates:
            return {"top_candidates": [], "selection_summary": "No candidates to rank."}

        # Step 1: Smart scoring
        scored = []
        for c in candidates:
            full_text = c.get("full_text", "")
            parsed_info = c.get("parsed_info", {})
            semantic_score = c.get("similarity_score", 0.0)
            score_breakdown = self._score_candidate(full_text, parsed_info, semantic_score)
            scored.append({**c, **score_breakdown})

        scored.sort(key=lambda x: x["final_score"], reverse=True)

        top = scored[:top_n]
        top_candidates = []
        for i, c in enumerate(top):
            top_candidates.append({
                "rank": i + 1,
                "id": c["id"],
                "filename": c["filename"],
                "overall_score": int(round(c["final_score"])),
                "skill_match": c["skill_match"],
                "experience_match": c["experience_match"],
                "education_match": c["education_match"],
                "semantic_match": c["semantic_match"],
                "ats_decision": c["ats_decision"],
                "matching_skills": c["matching_skills"],
                "missing_skills": c["missing_skills"],
                "preferred_skills": c["preferred_skills"],
                "irrelevant_skills": c["irrelevant_skills"],
                "keyword_stuffing": c.get("keyword_stuffing", False),
                "years_experience": c.get("years_experience", 0),
                "llm_model": config.DEFAULT_MODEL,
                "llm_feedback": "",
                "strengths": self._build_strengths(c),
                "weaknesses": self._build_weaknesses(c),
                "why_selected": self._build_reason(c),
            })

        total_cvs = len(candidates)
        accepted = sum(1 for c in scored if c["ats_decision"] == "ACCEPT")
        rejected = sum(1 for c in scored if c["ats_decision"] == "REJECT")

        # Step 2: LLM enhancement
        enhanced = self._llm_enhance(top_candidates, jd_text)
        if enhanced:
            top_candidates = enhanced

        return {
            "top_candidates": top_candidates,
            "selection_summary": self._build_summary(top_candidates, total_cvs, accepted, rejected),
        }

    def _llm_enhance(self, top_candidates: List[Dict], jd_text: str) -> Optional[List[Dict]]:
        """
        Enhance each candidate individually using LLM + their actual CV text from DB.
        Falls back gracefully per-candidate so one failure doesn't break others.
        """
        if not top_candidates:
            return None

        try:
            from services.agent.ollama_service import ollama_service
        except Exception:
            logger.debug("ATS: Ollama not available, skipping LLM enhancement")
            return None

        enhanced_any = False
        for c in top_candidates:
            cv_id = c.get("id", "")
            cv = database.get_ats_cv(cv_id) if cv_id else None
            cv_text = (cv.get("full_text") or "")[:2500] if cv else ""

            prompt = (
                f"وصف الوظيفة:\n{jd_text[:500]}\n\n"
                f"المرشح: {c['filename']}\n"
                f"النتيجة: {c['overall_score']}%\n"
                f"المهارات المطلوبة المتطابقة: {', '.join(c['matching_skills'][:6])}\n"
                f"المهارات المطلوبة المفقودة: {', '.join(c['missing_skills'][:3])}\n\n"
                f"السيرة الذاتية:\n{cv_text[:2000]}\n\n"
                "بناءً على الوظيفة أعلاه، حلل المرشح بجملتين:\n"
                "قوة: نقطة قوة واحدة محددة من سيرته تخص الوظيفة\n"
                "ضعف: نقطة ضعف واحدة محددة من سيرته تخص الوظيفة"
            )

            try:
                raw = ollama_service.generate(
                    prompt=prompt,
                    model=config.DEFAULT_MODEL,
                    system_prompt="أنت خبير توظيف .NET. أجب مباشرة بدون تفكير. رد بجملتين بالعربية فقط: الأولى تبدأ بـ قوة: والثانية بـ ضعف:",
                    temperature=0.3,
                    timeout=300,
                    max_tokens=600,
                )
                if raw and len(raw.strip()) > 15:
                    # Strip thinking block (qwen3 <think>...</think>)
                    raw = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
                    logger.debug(f"ATS: LLM cleaned for {c['filename']}: {raw[:300]}")
                    strength = self._extract_flexible(raw, "قوة")
                    weakness = self._extract_flexible(raw, "ضعف")
                    if strength:
                        c["strengths"] = [strength.strip().lstrip(":-")]
                    if weakness:
                        c["weaknesses"] = [weakness.strip().lstrip(":-")]
                    enhanced_any = True
                    if strength or weakness:
                        feedback_text = f"قوة: {strength or '-'} | ضعف: {weakness or '-'}"
                    else:
                        feedback_text = f"الرد الخام: {raw.strip()[:150]}"
                    c["llm_feedback"] = feedback_text
                    database.update_ats_cv_llm_feedback(cv_id, feedback_text, config.DEFAULT_MODEL)
                    logger.info(f"ATS: Enhanced {c['filename']} with {config.DEFAULT_MODEL}")
            except Exception as exc:
                logger.debug(f"ATS: LLM skip {c['filename']}: {exc}")
                continue

        if enhanced_any:
            logger.info("ATS: LLM enhancement applied to selected candidates")
        return top_candidates if enhanced_any else None

    @staticmethod
    def _extract_flexible(text: str, keyword: str) -> Optional[str]:
        """
        Flexible parser: finds keyword (قوة/ضعف) with optional markdown/colons/spaces
        and returns the rest of the line.
        """
        escaped = re.escape(keyword)
        patterns = [
            rf"(?:\d+[\.\)]\s*)?{escaped}\s*:\s*(.+)",
            rf"\*{{1,2}}{escaped}\*{{1,2}}\s*:\s*(.+)",
            rf"\*{{1,2}}{escaped}\*{{1,2}}\s*(.+)",
            rf"(?:\d+[\.\)]\s*)?{escaped}\s+(.+)",
        ]
        for pat in patterns:
            m = re.search(pat, text)
            if m:
                return m.group(1).strip()
        return None

    # ------------------------------------------------------------------ #
    #  Smart Candidate Scoring
    # ------------------------------------------------------------------ #

    @staticmethod
    def _match_skills(text: str, skill_dict: Dict[str, List[str]]) -> List[str]:
        """Return list of skill names from skill_dict that appear in text."""
        text_lower = text.lower()
        matched = []
        for skill_name, patterns in skill_dict.items():
            for pat in patterns:
                if re.search(pat, text_lower):
                    matched.append(skill_name)
                    break
        return matched

    @staticmethod
    def _count_skill_mentions(text: str, skill_name: str) -> int:
        """Count approximate mentions of a skill in text."""
        text_lower = text.lower()
        # Use the skill name and common variants
        variants = [skill_name.lower(), skill_name.lower().replace(" ", ""), skill_name.lower().replace("/", " ")]
        total = 0
        for v in variants:
            total += text_lower.count(v)
        return total

    @staticmethod
    def _detect_keyword_stuffing(text: str, matched_skills: List[str]) -> bool:
        """
        Detect if skills are repeated excessively without supporting context.
        Checks all known skill keywords, not just matched ones.
        """
        text_lower = text.lower()
        # Check common skill tokens that might be stuffed
        stuffing_tokens = [
            'c#', 'csharp', 'c sharp', '.net', 'asp.net', 'aspnet',
            'sql', 'entity framework', 'rest api', 'git',
            'docker', 'azure', 'python', 'java', 'react', 'angular',
        ]
        for token in stuffing_tokens:
            count = text_lower.count(token)
            if count > 7:
                return True
        return False

    @staticmethod
    def _extract_years_experience(text: str) -> float:
        """Extract total years of professional experience from CV text."""
        text_lower = text.lower()
        years = 0.0

        for pat in EXPERIENCE_PATTERNS:
            matches = re.findall(pat, text_lower)
            for m in matches:
                try:
                    val = float(m)
                    if val > 50:
                        continue
                    if val > years:
                        years = val
                except ValueError:
                    continue

        # Fallback: count date ranges (YYYY - YYYY or YYYY–YYYY)
        if years == 0:
            date_ranges = re.findall(r'(?:19|20)\d{2}\s*[–\-to]+\s*(?:(?:19|20)\d{2}|present|current|حتى|الآن)', text_lower)
            total_years = 0.0
            for dr in date_ranges:
                parts = re.findall(r'(?:19|20)\d{2}', dr)
                if len(parts) == 2:
                    total_years += abs(float(parts[1]) - float(parts[0]))
            if total_years > 0:
                years = total_years

        return years

    @staticmethod
    def _score_education(text: str) -> float:
        """Score education relevance (0-100)."""
        text_lower = text.lower()
        score = 0.0

        has_cs = any(re.search(pat, text_lower) for pat in EDUCATION_KEYWORDS["cs"])
        has_eng = any(re.search(pat, text_lower) for pat in EDUCATION_KEYWORDS["engineering"])
        has_degree = any(re.search(pat, text_lower) for pat in EDUCATION_KEYWORDS["degree"])

        if has_cs and has_degree:
            score = 100.0
        elif has_eng and has_degree:
            score = 80.0
        elif has_degree:
            score = 60.0
        elif has_cs or has_eng:
            score = 40.0

        return score

    @staticmethod
    def _score_project_relevance(text: str, matched_skills: List[str]) -> float:
        """
        Score project relevance based on whether projects mention
        the required tech stack.
        """
        text_lower = text.lower()
        # Count project sections that mention .NET / C# related terms
        project_related = [r'mشروع', r'project', r'system', r'application', r'تطبيق']
        has_projects = any(re.search(pat, text_lower) for pat in project_related)
        if not has_projects:
            return 20.0

        # Check if projects mention .NET-related technologies
        dotnet_in_projects = any(re.search(pat, text_lower) for pat in [r'\.net', r'c#', r'asp\.net', r'entity\s*framework'])
        if not dotnet_in_projects:
            return 30.0

        # Scale based on how many required skills are matched
        base = 50.0
        matched_relevant = sum(1 for s in matched_skills if s in REQUIRED_SKILLS)
        bonus = min(50.0, matched_relevant * 10.0)
        return min(100.0, base + bonus)

    def _score_candidate(self, full_text: str, parsed_info: Dict, semantic_score: float) -> Dict:
        """
        Compute all scoring components for a single candidate.
        Uses global ATS scoring: Skill 50%, Experience 20%, Education 10%, Semantic 20%.
        Returns ACCEPT / REVIEW / REJECT decision.
        """
        text = full_text if full_text else json.dumps(parsed_info) if parsed_info else ""

        # ── Skill Extraction ────────────────────────────────────────────
        matched_required = self._match_skills(text, REQUIRED_SKILLS)
        missing_required = [s for s in REQUIRED_SKILLS if s not in matched_required]
        matched_preferred = self._match_skills(text, PREFERRED_SKILLS)
        matched_irrelevant = self._match_skills(text, NON_DOTNET_SKILLS)

        has_csharp = "C#" in matched_required
        has_aspnet = "ASP.NET Core" in matched_required

        # ── Penalties ───────────────────────────────────────────────────
        non_dotnet_penalty = 0.0
        if matched_irrelevant and not matched_required:
            non_dotnet_penalty = 60.0
        elif matched_irrelevant:
            non_dotnet_penalty = min(30.0, len(matched_irrelevant) * 8.0)

        major_penalty = 0.0
        if not has_csharp and not has_aspnet:
            major_penalty = 50.0
        elif not has_csharp:
            major_penalty = 25.0
        elif not has_aspnet:
            major_penalty = 20.0

        # ── Skill Match (50%) ──────────────────────────────────────────
        required_skill_pct = (len(matched_required) / len(REQUIRED_SKILLS)) * 100.0
        preferred_bonus = min(15.0, (len(matched_preferred) / len(PREFERRED_SKILLS)) * 15.0)
        skill_match = max(0.0, min(100.0, required_skill_pct + preferred_bonus - non_dotnet_penalty - major_penalty))

        # ── Experience Match (20%) ──────────────────────────────────────
        years = self._extract_years_experience(text)
        if years >= 5:
            experience_match = 100.0
        elif years >= 3:
            experience_match = 80.0
        elif years >= 1:
            experience_match = 60.0
        elif years > 0:
            experience_match = 40.0
        else:
            experience_match = 30.0 if matched_required else 10.0

        # ── Education Match (10%) ───────────────────────────────────────
        education_match = self._score_education(text)

        # ── Semantic Similarity (20%) ───────────────────────────────────
        semantic_match = semantic_score if semantic_score else 0.0

        # ── Keyword Stuffing ────────────────────────────────────────────
        is_stuffed = self._detect_keyword_stuffing(text, matched_required)
        if is_stuffed:
            experience_match = max(0.0, experience_match - 15.0)
            skill_match = max(0.0, skill_match - 10.0)

        # ── Final Score ─────────────────────────────────────────────────
        final_score = (
            0.50 * skill_match +
            0.20 * experience_match +
            0.10 * education_match +
            0.20 * semantic_match
        )

        # ── ATS Decision (global ATS style) ────────────────────────────
        # Knockout: no .NET skills at all
        if not has_csharp and not has_aspnet:
            ats_decision = "REJECT"
        elif final_score >= 80:
            ats_decision = "ACCEPT"
        elif final_score >= 50:
            ats_decision = "REVIEW"
        else:
            ats_decision = "REJECT"

        # Knockout: irrelevant stack with zero .NET skills
        if matched_irrelevant and not has_csharp and not has_aspnet:
            ats_decision = "REJECT"

        return {
            "final_score": round(final_score, 1),
            "skill_match": round(skill_match, 1),
            "experience_match": round(experience_match, 1),
            "education_match": round(education_match, 1),
            "semantic_match": round(semantic_match, 1),
            "ats_decision": ats_decision,
            "matching_skills": matched_required,
            "missing_skills": missing_required,
            "preferred_skills": matched_preferred,
            "irrelevant_skills": matched_irrelevant,
            "keyword_stuffing": is_stuffed,
            "years_experience": years,
        }

    # ------------------------------------------------------------------ #
    #  Output formatting helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def _build_strengths(c: Dict) -> List[str]:
        strengths = []
        if c["ats_decision"] == "ACCEPT":
            strengths.append("يستوفي معايير القبول")
        if c.get("skill_match", 0) >= 80:
            strengths.append(f"تغطية ممتازة للمهارات ({c['skill_match']:.0f}%)")
        matched = c.get("matching_skills", [])
        if matched:
            strengths.append(f"المهارات المتطابقة: {', '.join(matched[:4])}")
        if c.get("preferred_skills"):
            strengths.append(f"مهارات إضافية: {', '.join(c['preferred_skills'][:3])}")
        if c.get("years_experience", 0) >= 3:
            strengths.append(f"خبرة {c['years_experience']:.0f} سنوات")
        return strengths[:5]

    @staticmethod
    def _build_weaknesses(c: Dict) -> List[str]:
        weaknesses = []
        if c["ats_decision"] == "REJECT":
            weaknesses.append("مرفوض — لا يستوفي الحد الأدنى")
        elif c["ats_decision"] == "REVIEW":
            weaknesses.append("يحتاج مراجعة بشرية")
        missing = c.get("missing_skills", [])
        if missing:
            weaknesses.append(f"مهارات مفقودة: {', '.join(missing[:4])}")
        if c.get("keyword_stuffing"):
            weaknesses.append("تكرار مفرط للمهارات")
        if c.get("irrelevant_skills"):
            weaknesses.append(f"مهارات غير مرتبطة: {', '.join(c['irrelevant_skills'][:3])}")
        if c.get("years_experience", 0) < 2:
            weaknesses.append("خبرة محدودة")
        return weaknesses[:4]

    @staticmethod
    def _build_reason(c: Dict) -> str:
        decision = c.get("ats_decision", "REVIEW")
        score = c.get("final_score", 0)
        if decision == "REJECT":
            return f"مرفوض. النتيجة: {score:.0f}%. لا يستوفي متطلبات الوظيفة الأساسية."
        if decision == "ACCEPT":
            matched = c.get("matching_skills", [])
            return f"مقبول. مهارات .NET متطابقة ({', '.join(matched[:4])}). النتيجة: {score:.0f}%."
        return (
            f"يحتاج مراجعة. المهارات المتطابقة: {', '.join(c.get('matching_skills', [])[:3])}. "
            f"المفقودة: {', '.join(c.get('missing_skills', [])[:3])}. النتيجة: {score:.0f}%."
        )

    @staticmethod
    def _build_summary(top_candidates: List[Dict], total_cvs: int, accepted: int, rejected: int) -> str:
        top1 = top_candidates[0] if top_candidates else None
        if not top1:
            return "لم يتم العثور على مرشحين مناسبين."
        return (
            f"تم تحليل {total_cvs} سيرة ذاتية. {accepted} مقبول، {rejected} مرفوض. "
            f"الأول: {top1['filename'].rsplit('.', 1)[0]} — {top1['ats_decision']} "
            f"({top1['overall_score']}%)."
        )


# Singleton
ats_service = ATSService()

ats_pipeline = ats_service
