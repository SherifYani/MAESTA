"""
TeacherQuizService - Professional 5-Stage Exam Generation Pipeline
===================================================================
Mimics a real university professor creating a high-quality exam:

  Stage 1 → Deep Material Analysis   (topics, objectives, Bloom's mapping, misconceptions)
  Stage 2 → Professional Blueprint   (distribution, difficulty curve, question types)
  Stage 3 → Question Crafting        (MCQ with smart distractors, bilingual, sourced)
  Stage 4 → Teacher Self-Review      (critique & fix weak / imbalanced questions)
  Stage 5 → Final Professional Output (Markdown exam + Answer Key + clean JSON)

Design rules:
  - 4-5 focused LLM calls (no more than 6).
  - Robust JSON parsing from LLM output (```json blocks or raw extraction).
  - Knowledge-Base–first content retrieval; DB chunks as fallback.
  - Strict "use only provided context" policy.
  - Bilingual Arabic/English — language detected from source material.
  - Graceful degradation: if a stage fails, pipeline continues with partial data.
"""

import json
import re
import uuid
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any

from models import database
from services.agent.ollama_service import ollama_service
from core.logger import get_logger
import config

logger = get_logger(__name__)

# ─────────────────────────────────────────────
# Data Classes (Pydantic-lite, pure Python)
# ─────────────────────────────────────────────

@dataclass
class QuizQuestion:
    """Represents a single exam question in structured form."""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    question_text: str = ""
    question_type: str = "MCQ"           # MCQ | TF | SHORT
    bloom_level: str = "Remember"        # Remember | Understand | Apply | Analyze | Evaluate | Create
    difficulty: str = "Medium"           # Easy | Medium | Hard
    options: List[str] = field(default_factory=list)   # A, B, C, D for MCQ
    correct_answer: str = ""             # "A" or full answer text
    explanation: str = ""                # Why this is the correct answer
    source_reference: str = ""           # Which section / chunk this came from
    language: str = "ar"                 # "ar" | "en" | "mixed"


@dataclass
class ExamBlueprint:
    """Exam blueprint produced by Stage 2."""
    total_questions: int = 5
    difficulty: str = "Medium"
    bloom_distribution: Dict[str, int] = field(default_factory=dict)
    question_type_mix: Dict[str, int] = field(default_factory=dict)
    topic_coverage: List[str] = field(default_factory=list)
    difficulty_curve: str = "ascending"   # ascending | flat | descending
    raw_text: str = ""                    # Full LLM output for reference


@dataclass
class FinalQuizOutput:
    """Complete final output returned to the caller."""
    quiz_id: str = ""
    title: str = ""
    topic: str = ""
    difficulty: str = "Medium"
    num_questions: int = 0
    language: str = "auto"
    questions: List[Dict] = field(default_factory=list)
    markdown_exam: str = ""              # Beautiful Markdown version for students
    answer_key_markdown: str = ""        # Detailed Answer Key + explanations for teachers
    blueprint: Dict = field(default_factory=dict)
    metadata: Dict = field(default_factory=dict)


# ─────────────────────────────────────────────
# Helper Utilities
# ─────────────────────────────────────────────

def _parse_json_from_response(text: str) -> Any:
    """
    Robust JSON extraction from an LLM response.
    Tries (in order):
      1. ```json ... ``` fenced block
      2. ``` ... ``` fenced block (non-typed)
      3. First { ... } or [ ... ] span in the raw text
    Returns parsed Python object or None on failure.
    """
    # 1. Fenced JSON block
    json_block = re.search(r'```json\s*([\s\S]*?)\s*```', text, re.IGNORECASE)
    if json_block:
        try:
            return json.loads(json_block.group(1))
        except json.JSONDecodeError:
            pass

    # 2. Any fenced block
    any_block = re.search(r'```\s*([\s\S]*?)\s*```', text)
    if any_block:
        try:
            return json.loads(any_block.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Raw extraction - array
    arr_match = re.search(r'(\[[\s\S]*\])', text)
    if arr_match:
        try:
            return json.loads(arr_match.group(1))
        except json.JSONDecodeError:
            pass

    # 4. Raw extraction - object
    obj_match = re.search(r'(\{[\s\S]*\})', text)
    if obj_match:
        try:
            return json.loads(obj_match.group(1))
        except json.JSONDecodeError:
            pass

    return None


def _detect_language(text: str) -> str:
    """Detect dominant language: 'ar', 'en', or 'mixed'."""
    arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
    latin_chars = len(re.findall(r'[a-zA-Z]', text))
    if arabic_chars == 0 and latin_chars == 0:
        return "ar"
    ratio = arabic_chars / (arabic_chars + latin_chars + 1)
    if ratio > 0.65:
        return "ar"
    elif ratio < 0.35:
        return "en"
    return "mixed"


def _build_context_from_chunks(chunks: List[Dict], max_chars: int = 12000) -> str:
    """Build a numbered context string from document chunks."""
    parts = []
    total = 0
    for i, chunk in enumerate(chunks):
        content = chunk.get('content', '')
        if total + len(content) > max_chars:
            # Add partial content to fill remaining space
            remaining = max_chars - total
            if remaining > 200:
                parts.append(f"[Section {i+1}]\n{content[:remaining]}...")
            break
        parts.append(f"[Section {i+1}]\n{content}")
        total += len(content)
    return "\n\n---\n\n".join(parts)


# ─────────────────────────────────────────────
# Main Service Class
# ─────────────────────────────────────────────

class TeacherQuizService:
    """
    Professional 5-stage exam generation service.
    Acts like a senior university professor crafting a rigorous, pedagogically
    sound exam from uploaded knowledge-base documents.
    """

    BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]

    # Default Bloom distribution (%) per difficulty
    BLOOM_DISTRIBUTION = {
        "Easy":   {"Remember": 40, "Understand": 35, "Apply": 15, "Analyze": 10},
        "Medium": {"Remember": 25, "Understand": 35, "Apply": 25, "Analyze": 15},
        "Hard":   {"Remember": 10, "Understand": 20, "Apply": 35, "Analyze": 25, "Evaluate": 10},
    }

    def __init__(self):
        self.ollama = ollama_service
        self.model = config.DEFAULT_MODEL
        # Use generous token limits for quiz generation (quality > speed here)
        self.max_tokens = 2000
        self.temperature = 0.6   # Slightly creative but mostly deterministic

    # ─────────────────────────────────────────────
    # Public API
    # ─────────────────────────────────────────────

    def generate_quiz(
        self,
        topic: str = "General",
        doc_id: Optional[str] = None,
        content: Optional[str] = None,
        difficulty: str = "Medium",
        num_questions: int = 5,
        language: str = "auto",
    ) -> FinalQuizOutput:
        """
        Main entry point. Runs the full 5-stage pipeline.

        Priority for source material:
          1. doc_id  → retrieve relevant chunks from KnowledgeBase (hybrid search)
          2. content → raw text passed directly by the caller
          3. DB chunks for doc_id (fallback if KB is cold)

        Returns a FinalQuizOutput dataclass (serialise with asdict()).
        """
        logger.info(f"[TeacherQuiz] Starting 5-stage pipeline | topic={topic} | doc_id={doc_id} | n={num_questions} | difficulty={difficulty}")

        # ── Resolve source content ──────────────────────────────────────────
        chunks = self._resolve_chunks(topic, doc_id, content)

        if not chunks:
            logger.error("[TeacherQuiz] No content available for quiz generation.")
            raise ValueError("لا يوجد محتوى كافٍ لتوليد الامتحان. يرجى رفع ملف أو تمرير نص مباشر.")

        context_text = _build_context_from_chunks(chunks)
        detected_lang = language if language != "auto" else _detect_language(context_text)

        logger.info(f"[TeacherQuiz] Context: {len(chunks)} chunks | {len(context_text)} chars | lang={detected_lang}")

        # ── Stage 1: Deep Material Analysis ───────────────────────────────
        analysis = self._stage1_analyze(context_text, detected_lang)
        logger.info("[TeacherQuiz] OK Stage 1 complete: Material Analysis")

        # ── Stage 2: Professional Exam Blueprint ──────────────────────────
        blueprint = self._stage2_blueprint(analysis, difficulty, num_questions, detected_lang)
        logger.info("[TeacherQuiz] OK Stage 2 complete: Exam Blueprint")

        # ── Stage 3: Question Crafting ─────────────────────────────────────
        raw_questions = self._stage3_craft_questions(context_text, blueprint, detected_lang, num_questions)
        logger.info(f"[TeacherQuiz] OK Stage 3 complete: {len(raw_questions)} questions crafted")

        # ── Stage 4: Teacher Self-Review & Refinement ─────────────────────
        refined_questions = self._stage4_review(raw_questions, blueprint, context_text, detected_lang)
        logger.info(f"[TeacherQuiz] OK Stage 4 complete: {len(refined_questions)} refined questions")

        # ── Stage 5: Professional Final Output ────────────────────────────
        final = self._stage5_format(refined_questions, blueprint, topic, detected_lang, difficulty)
        logger.info("[TeacherQuiz] OK Stage 5 complete: Final output formatted")

        # ── Save to Database ───────────────────────────────────────────────
        try:
            quiz_id = database.save_professional_quiz(
                topic=topic,
                doc_id=doc_id,
                difficulty=difficulty,
                num_questions=len(final.questions),
                language=detected_lang,
                content_json=json.dumps(asdict(final), ensure_ascii=False)
            )
            final.quiz_id = quiz_id
            logger.info(f"[TeacherQuiz] Quiz saved to DB: quiz_id={quiz_id}")
        except Exception as e:
            logger.error(f"[TeacherQuiz] Failed to save quiz to DB: {e}")
            final.quiz_id = str(uuid.uuid4())  # Assign a temp ID anyway

        return final

    def analyze_material_interactive(
        self,
        topic: str = "General",
        doc_id: Optional[str] = None,
        content: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Interactive Step 1: Analyze material and return a 'prospectus' for the user.
        Used by the chat agent to propose an exam design to the user.
        """
        logger.info(f"[TeacherQuiz] Interactive analysis started | topic={topic}")
        
        chunks = self._resolve_chunks(topic, doc_id, content)
        if not chunks:
            raise ValueError("No enough context found to analyze.")
            
        context_text = _build_context_from_chunks(chunks)
        lang = _detect_language(context_text)
        
        # Run Stage 1: Material Analysis
        raw_analysis = self._stage1_analyze(context_text, lang)
        
        return {
            "analysis": raw_analysis,
            "lang": lang,
            "doc_id": doc_id,
            "topic": topic,
            "chunks_count": len(chunks)
        }


    # ─────────────────────────────────────────────
    # Content Resolution
    # ─────────────────────────────────────────────

    def _resolve_chunks(self, topic: str, doc_id: Optional[str], content: Optional[str]) -> List[Dict]:
        """
        Resolve the source content into a list of chunk dicts.
        Priority: KnowledgeBase search → raw content string → DB direct fetch.
        """
        # 1. Try KnowledgeBase hybrid search (best quality)
        try:
            from services.agent.rag.knowledge_base import knowledge_base
            knowledge_base.ensure_indexed()
            kb_results = knowledge_base.search(topic, top_k=12, doc_id=doc_id)
            if kb_results:
                logger.debug(f"[TeacherQuiz] KB search returned {len(kb_results)} chunks")
                return kb_results
        except Exception as e:
            logger.warning(f"[TeacherQuiz] KB search failed: {e}")

        # 2. Raw content provided directly
        if content and content.strip():
            # Wrap as a single pseudo-chunk
            return [{"content": content, "metadata": "Provided content", "doc_id": doc_id or "unknown"}]

        # 3. Fallback: get all DB chunks for doc_id
        if doc_id:
            try:
                db_chunks = database.get_document_chunks(doc_id)
                if db_chunks:
                    logger.debug(f"[TeacherQuiz] DB fallback: {len(db_chunks)} chunks for doc_id={doc_id}")
                    return db_chunks
            except Exception as e:
                logger.warning(f"[TeacherQuiz] DB chunk fetch failed: {e}")

        return []

    # ─────────────────────────────────────────────
    # Stage 1: Deep Material Analysis
    # ─────────────────────────────────────────────

    def _stage1_analyze(self, context: str, lang: str) -> str:
        """
        Stage 1: Analyze the material deeply.
        Extracts: key topics, learning objectives (Bloom's), common misconceptions.
        """
        if lang == "en":
            prompt = f"""You are Dr. Omar Farouk, a senior educational assessment expert with 25 years of experience.

Perform a DEEP analysis of the following academic material. Your analysis must include:

1. **Key Themes**: List the 3-7 most important themes/topics in bullet form.
2. **Learning Objectives (Bloom's Taxonomy)**: Map 5-8 explicit learning objectives to Bloom's levels (Remember, Understand, Apply, Analyze, Evaluate, Create).
3. **Common Misconceptions**: Identify 3-5 common student misconceptions about this material that would make excellent distractor options.
4. **Key Terms & Concepts**: List 8-12 important vocabulary terms and their brief definitions.
5. **Difficulty Assessment**: Rate the material overall difficulty (Easy/Medium/Hard) with justification.

IMPORTANT RULES:
- Base your analysis STRICTLY on the provided material. Do NOT add outside knowledge.
- Be specific — use exact terms from the text.
- Your analysis will be used to craft exam questions, so be thorough.

--- MATERIAL START ---
{context[:9000]}
--- MATERIAL END ---

Provide your structured analysis:"""
        else:
            prompt = f"""أنت د. عمر فاروق، خبير تقييم تعليمي أكاديمي بخبرة 25 عاماً.

قم بتحليل عميق ودقيق للمادة العلمية التالية. يجب أن يشمل تحليلك:

1. **المواضيع الرئيسية**: اذكر أهم 3-7 مواضيع رئيسية وفرعية.
2. **أهداف التعلم (تصنيف بلوم)**: حدد 5-8 أهداف تعلم واضحة مع ربطها بمستويات بلوم (تذكر، فهم، تطبيق، تحليل، تقييم، إبداع).
3. **المفاهيم الخاطئة الشائعة**: حدد 3-5 مفاهيم خاطئة يقع فيها الطلاب عادةً - ستُستخدم كخيارات مموهة (Distractors) ذكية.
4. **المصطلحات والمفاهيم الأساسية**: اذكر 8-12 مصطلحاً مهماً مع تعريف موجز لكل منها.
5. **تقييم الصعوبة**: قيّم مستوى صعوبة المادة (سهل/متوسط/صعب) مع المبرر.

قواعد صارمة:
- استند حرفياً إلى المادة المرفقة فقط. لا تضف معلومات خارجية.
- كن دقيقاً - استخدم المصطلحات الواردة في النص بالضبط.
- هذا التحليل سيُستخدم لصياغة أسئلة امتحان عالية الجودة.

--- بداية المادة ---
{context[:9000]}
--- نهاية المادة ---

قدم تحليلك المنظم:"""

        try:
            return self.ollama.generate(
                prompt=prompt,
                model=self.model,
                temperature=0.4,
                max_tokens=self.max_tokens
            )
        except Exception as e:
            logger.error(f"[TeacherQuiz Stage 1] Failed: {e}")
            return f"Material covers: {context[:500]}"   # Minimal fallback

    # ─────────────────────────────────────────────
    # Stage 2: Professional Exam Blueprint
    # ─────────────────────────────────────────────

    def _stage2_blueprint(self, analysis: str, difficulty: str, num_questions: int, lang: str) -> ExamBlueprint:
        """
        Stage 2: Design the detailed exam blueprint.
        Determines Bloom's distribution, question types, and topic coverage.
        """
        bloom_dist = self.BLOOM_DISTRIBUTION.get(difficulty, self.BLOOM_DISTRIBUTION["Medium"])

        # Calculate actual question counts from percentages
        bloom_counts = {}
        remaining = num_questions
        levels = list(bloom_dist.keys())
        for i, level in enumerate(levels):
            if i == len(levels) - 1:
                bloom_counts[level] = remaining  # Give remainder to last level
            else:
                count = max(1, round(num_questions * bloom_dist[level] / 100))
                count = min(count, remaining - (len(levels) - i - 1))
                bloom_counts[level] = count
                remaining -= count

        # MCQ-dominant with some True/False
        mcq_count = max(1, round(num_questions * 0.8))
        tf_count = num_questions - mcq_count
        q_type_mix = {"MCQ": mcq_count, "TF": tf_count}

        if lang == "en":
            prompt = f"""You are an experienced exam designer. Based on the following material analysis, create a detailed EXAM BLUEPRINT.

Material Analysis:
{analysis[:3000]}

Exam Parameters:
- Total Questions: {num_questions}
- Difficulty Level: {difficulty}
- Bloom's Distribution: {json.dumps(bloom_counts)}
- Question Types: {json.dumps(q_type_mix)}

Your blueprint must specify:
1. **Topic Coverage Plan**: Which topics from the analysis will be tested and how many questions each.
2. **Bloom's Level Mapping**: Which specific questions test which Bloom's level.
3. **Difficulty Curve**: How difficulty progresses across the exam (e.g., questions 1-2 Easy, 3-4 Medium, 5 Hard).
4. **Key Concepts to Test**: The 5-8 most important concepts that MUST be covered.
5. **Distractor Strategy**: What types of common misconceptions to use as wrong answer choices.

Respond with a well-structured blueprint:"""
        else:
            prompt = f"""أنت مصمم اختبارات أكاديمي متمرس. بناءً على التحليل التالي للمادة، ضع مخططاً تفصيلياً للامتحان.

تحليل المادة:
{analysis[:3000]}

معايير الامتحان:
- إجمالي الأسئلة: {num_questions}
- مستوى الصعوبة: {difficulty}
- توزيع مستويات بلوم: {json.dumps(bloom_counts, ensure_ascii=False)}
- أنواع الأسئلة: {json.dumps(q_type_mix, ensure_ascii=False)}

يجب أن يوضح المخطط:
1. **خطة تغطية المواضيع**: أي المواضيع ستُختبر وعدد الأسئلة لكل موضوع.
2. **ربط مستويات بلوم**: أي الأسئلة تقيس أي مستوى من مستويات بلوم.
3. **منحنى الصعوبة**: كيف تتدرج الصعوبة عبر الامتحان.
4. **المفاهيم الجوهرية**: أهم 5-8 مفاهيم يجب تغطيتها حتماً.
5. **استراتيجية المشتتات**: أنواع المفاهيم الخاطئة التي ستُستخدم كخيارات خاطئة.

المخطط التفصيلي:"""

        try:
            blueprint_text = self.ollama.generate(
                prompt=prompt,
                model=self.model,
                temperature=0.3,
                max_tokens=self.max_tokens
            )
        except Exception as e:
            logger.error(f"[TeacherQuiz Stage 2] Failed: {e}")
            blueprint_text = ""

        bp = ExamBlueprint(
            total_questions=num_questions,
            difficulty=difficulty,
            bloom_distribution=bloom_counts,
            question_type_mix=q_type_mix,
            raw_text=blueprint_text
        )
        return bp

    # ─────────────────────────────────────────────
    # Stage 3: Question Crafting
    # ─────────────────────────────────────────────

    def _stage3_craft_questions(
        self, context: str, blueprint: ExamBlueprint, lang: str, num_questions: int
    ) -> List[QuizQuestion]:
        """
        Stage 3: Craft exam questions using a simple, model-friendly prompt.
        Uses JSON parsing first, then regex fallback for small/weak models.
        """
        mcq_count = blueprint.question_type_mix.get('MCQ', num_questions)
        tf_count  = blueprint.question_type_mix.get('TF', 0)

        # ── Ultra-simple prompt that even small models can follow ────────────
        if lang == "en":
            prompt = f"""Create {num_questions} exam questions from the material below.

Rules:
- Use ONLY information from the material. Do not add outside facts.
- Make {mcq_count} multiple-choice (MCQ) and {tf_count} true/false questions.
- MCQ must have exactly 4 options labeled A, B, C, D.
- For every question include: the question, 4 options, the correct letter, and a brief explanation.

MATERIAL:
{context[:6000]}

Return a JSON array. Each item must have these EXACT keys:
"question_text", "question_type" (MCQ or TF), "options" (list of "A. ...", "B. ...", etc.), "correct_answer" (just the letter), "explanation"

Start your response with [ and end with ]. No extra text outside the JSON."""
        else:
            prompt = f"""أنشئ {num_questions} سؤالاً امتحانياً من المادة التالية.

القواعد:
- استخدم المعلومات الموجودة في المادة فقط. لا تضف معلومات خارجية.
- اجعل {mcq_count} سؤال اختيار من متعدد و{tf_count} سؤال صح/خطأ.
- أسئلة الاختيار يجب أن تحتوي على 4 خيارات مسماة أ، ب، ج، د.

المادة:
{context[:6000]}

أعد مصفوفة JSON. كل عنصر يجب أن يحتوي على هذه المفاتيح بالضبط:
"question_text", "question_type" (MCQ أو TF), "options" (قائمة "أ. ..."، "ب. ..." إلخ), "correct_answer" (الحرف فقط), "explanation"

ابدأ ردك بـ [ وأنهِه بـ ]. لا تضع أي نص خارج JSON."""

        try:
            response = self.ollama.generate(
                prompt=prompt,
                model=self.model,
                temperature=0.5,
                max_tokens=3000   # Give more room for multiple questions
            )
            logger.debug(f"[TeacherQuiz Stage 3] Raw response length: {len(response)} chars")
        except Exception as e:
            logger.error(f"[TeacherQuiz Stage 3] Generation failed: {e}")
            return []

        # 1st attempt: JSON parsing
        questions = self._parse_questions(response, blueprint.difficulty)
        if questions:
            logger.info(f"[TeacherQuiz Stage 3] JSON parsed {len(questions)} questions")
            return questions

        # 2nd attempt: regex fallback for weak/small models
        logger.warning("[TeacherQuiz Stage 3] JSON parse failed — trying regex fallback")
        questions = self._parse_questions_regex(response, blueprint.difficulty, lang)
        if questions:
            logger.info(f"[TeacherQuiz Stage 3] Regex fallback found {len(questions)} questions")
        return questions

    def _parse_questions(self, response_text: str, default_difficulty: str) -> List[QuizQuestion]:
        """Parse LLM response into a list of QuizQuestion objects (JSON path)."""
        parsed = _parse_json_from_response(response_text)

        if parsed is None:
            return []

        # Handle both array and dict with 'questions' key
        if isinstance(parsed, dict):
            parsed = parsed.get('questions', [])

        if not isinstance(parsed, list):
            return []

        questions = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            # Normalize options — accept list or dict
            options = item.get('options', [])
            if isinstance(options, dict):
                options = [f"{k}. {v}" for k, v in options.items()]

            q = QuizQuestion(
                question_text=str(item.get('question_text', '')).strip(),
                question_type=item.get('question_type', 'MCQ'),
                bloom_level=item.get('bloom_level', 'Understand'),
                difficulty=item.get('difficulty', default_difficulty),
                options=options,
                correct_answer=str(item.get('correct_answer', '')).strip(),
                explanation=str(item.get('explanation', '')).strip(),
                source_reference=str(item.get('source_reference', '')).strip(),
                language=_detect_language(item.get('question_text', ''))
            )

            if q.question_text:
                questions.append(q)

        return questions

    def _parse_questions_regex(self, text: str, default_difficulty: str, lang: str = 'ar') -> List[QuizQuestion]:
        """
        Regex fallback parser — extracts questions from free-form LLM text
        when JSON parsing fails. Handles numbered questions and lettered options.
        """
        questions = []

        # Split on question boundaries: "1.", "Question 1", "السؤال 1", "Q1:", etc.
        # Try to split on digit+dot or Arabic question markers
        q_blocks = re.split(
            r'(?:^|\n)(?:(?:Question|Q|السؤال|سؤال)?\s*\d+[.):])\s*',
            text, flags=re.MULTILINE
        )
        q_blocks = [b.strip() for b in q_blocks if b.strip() and len(b.strip()) > 20]

        for block in q_blocks:
            lines = [l.strip() for l in block.split('\n') if l.strip()]
            if not lines:
                continue

            # First non-empty line = question text
            question_text = lines[0]

            # Extract options: lines starting with A./B./C./D. or أ./ب./ج./د.
            opt_pattern = re.compile(
                r'^([A-Da-dأبجد][.):\s])\s*(.+)$'
            )
            options = []
            correct_answer = "A"
            explanation = ""
            remaining = []

            for line in lines[1:]:
                m = opt_pattern.match(line)
                if m:
                    letter = m.group(1)[0].upper()
                    # Normalize Arabic letters to A,B,C,D
                    ar_map = {'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D'}
                    letter = ar_map.get(letter, letter)
                    options.append(f"{letter}. {m.group(2).strip()}")
                elif re.match(r'(?:correct|answer|الإجابة|الصحيح)[:\s]*([A-Dأبجد])', line, re.IGNORECASE):
                    ca = re.search(r'([A-Dأبجد])', line)
                    if ca:
                        c = ca.group(1)
                        ar_map = {'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D'}
                        correct_answer = ar_map.get(c, c.upper())
                elif re.match(r'(?:explanation|explain|الشرح|التفسير)[:\s]', line, re.IGNORECASE):
                    explanation = re.sub(r'^[^:]+:\s*', '', line)
                else:
                    remaining.append(line)

            # If answer not found in a labeled line, look in remaining text
            if correct_answer == "A" and remaining:
                for r in remaining:
                    m = re.search(r'(?:correct|answer|answer is|الإجابة)[:\s]*([A-Dأبجد])', r, re.IGNORECASE)
                    if m:
                        c = m.group(1)
                        ar_map = {'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D'}
                        correct_answer = ar_map.get(c, c.upper())
                        break

            if question_text and options:
                questions.append(QuizQuestion(
                    question_text=question_text,
                    question_type='MCQ' if len(options) > 2 else 'TF',
                    bloom_level='Understand',
                    difficulty=default_difficulty,
                    options=options,
                    correct_answer=correct_answer,
                    explanation=explanation,
                    language=_detect_language(question_text)
                ))

        return questions

    # ─────────────────────────────────────────────
    # Stage 4: Teacher Self-Review & Refinement
    # ─────────────────────────────────────────────

    def _stage4_review(
        self,
        questions: List[QuizQuestion],
        blueprint: ExamBlueprint,
        context: str,
        lang: str
    ) -> List[QuizQuestion]:
        """
        Stage 4: Teacher self-review. Skipped if fewer than 2 questions
        (saves an LLM call and avoids wasting budget on small models).
        """
        if len(questions) < 2:
            logger.warning(f"[TeacherQuiz Stage 4] Only {len(questions)} question(s) — skipping review to preserve output.")
            return questions

        questions_json = json.dumps(
            [asdict(q) for q in questions], ensure_ascii=False, indent=2
        )

        if lang == "en":
            prompt = f"""You are a strict academic exam reviewer with 30 years of experience.

Critically review the following exam questions. For each question, assess:
1. CLARITY: Is the question unambiguous? Could it be interpreted differently?
2. ACCURACY: Is the correct answer definitively correct based on the material?
3. DISTRACTOR QUALITY: Are the wrong choices plausible but clearly incorrect to a student who understood the material?
4. BLOOM'S ALIGNMENT: Does the question actually test the stated Bloom's level?
5. FAIRNESS: Is the question testing knowledge, not trick knowledge?

Overall exam check:
- Are there any duplicate or near-duplicate questions? Remove them.
- Is the difficulty distribution balanced?
- Do all questions trace back to the provided material?

Return the IMPROVED questions as a valid JSON array in the SAME schema as input.
If a question is good, keep it unchanged.
If a question is weak, improve it or replace it with a better one on the same topic.

Questions to review:
{questions_json[:4000]}

Material reference (for accuracy checking):
{context[:3000]}

Return ONLY the improved JSON array:"""

        else:
            prompt = f"""أنت مراجع أكاديمي صارم بخبرة 30 عاماً. راجع أسئلة الامتحان التالية نقداً حقيقياً.

لكل سؤال، قيّم:
1. **الوضوح**: هل السؤال واضح وغير ملتبس؟
2. **الدقة**: هل الإجابة الصحيحة صحيحة بناءً على المادة بالفعل؟
3. **جودة المشتتات**: هل الخيارات الخاطئة معقولة لكنها واضحة الخطأ لمن يفهم؟
4. **تحقق مستوى بلوم**: هل السؤال يقيس المستوى المذكور فعلاً؟
5. **العدالة**: هل السؤال يقيس الفهم وليس الحيلة؟

فحص شامل:
- هل تكررت أسئلة أو تشابهت؟ احذف التكرارات.
- هل توزيع الصعوبة متوازن؟
- هل جميع الأسئلة مستمدة من المادة المرفقة؟

أعد الأسئلة المُحسَّنة بنفس شكل JSON المدخل.
إذا كان السؤال جيداً أبقه كما هو.
إذا كان ضعيفاً حسّنه أو استبدله بسؤال أفضل عن نفس الموضوع.

الأسئلة للمراجعة:
{questions_json[:4000]}

المرجع (للتحقق من الدقة):
{context[:3000]}

أعد مصفوفة JSON المُحسَّنة فقط:"""

        try:
            response = self.ollama.generate(
                prompt=prompt,
                model=self.model,
                temperature=0.3,   # Lower temp for review = more conservative
                max_tokens=self.max_tokens
            )
            refined = self._parse_questions(response, blueprint.difficulty)
            if refined:
                logger.info(f"[TeacherQuiz Stage 4] Review produced {len(refined)} refined questions")
                return refined
            else:
                logger.warning("[TeacherQuiz Stage 4] Review parsing failed — using original questions")
                return questions
        except Exception as e:
            logger.error(f"[TeacherQuiz Stage 4] Review failed: {e}. Using original questions.")
            return questions

    # ─────────────────────────────────────────────
    # Stage 5: Professional Final Output
    # ─────────────────────────────────────────────

    def _stage5_format(
        self,
        questions: List[QuizQuestion],
        blueprint: ExamBlueprint,
        topic: str,
        lang: str,
        difficulty: str
    ) -> FinalQuizOutput:
        """
        Stage 5: Format the polished final output.
        Generates:
          - Beautiful Markdown exam for students (no answers)
          - Detailed Answer Key with explanations for teachers
          - Clean JSON structure
        """
        if not questions:
            return FinalQuizOutput(
                title=topic,
                topic=topic,
                difficulty=difficulty,
                language=lang
            )

        # Build Markdown versions
        markdown_exam = self._build_student_exam_markdown(questions, topic, difficulty, lang)
        answer_key = self._build_answer_key_markdown(questions, topic, lang)

        return FinalQuizOutput(
            title=topic,
            topic=topic,
            difficulty=difficulty,
            num_questions=len(questions),
            language=lang,
            questions=[asdict(q) for q in questions],
            markdown_exam=markdown_exam,
            answer_key_markdown=answer_key,
            blueprint=asdict(blueprint),
            metadata={
                "total_questions": len(questions),
                "bloom_distribution": blueprint.bloom_distribution,
                "question_types": blueprint.question_type_mix,
                "difficulty_level": difficulty,
                "generation_model": self.model,
            }
        )

    def _build_student_exam_markdown(
        self, questions: List[QuizQuestion], topic: str, difficulty: str, lang: str
    ) -> str:
        """Build the student-facing exam sheet in Markdown."""
        now = __import__('datetime').datetime.now().strftime("%Y-%m-%d")

        if lang == "en":
            lines = [
                f"# 📝 Exam: {topic}",
                f"**Difficulty:** {difficulty} | **Questions:** {len(questions)} | **Date:** {now}",
                "",
                "---",
                "",
                "> **Instructions:**",
                "> - Read each question carefully before answering.",
                "> - For MCQ questions, choose ONE best answer.",
                "> - For True/False questions, write True or False only.",
                "> - No partial credit for wrong answers.",
                "",
                "---",
                ""
            ]
            for i, q in enumerate(questions, 1):
                bloom_badge = f"*[{q.bloom_level}]*"
                diff_badge = f"*({q.difficulty})*"
                lines.append(f"### Question {i} {bloom_badge} {diff_badge}")
                lines.append("")
                lines.append(q.question_text)
                lines.append("")
                if q.question_type == "MCQ" and q.options:
                    for opt in q.options:
                        lines.append(f"   {opt}")
                elif q.question_type == "TF":
                    lines.append("   A. True")
                    lines.append("   B. False")
                lines.append("")
                lines.append("---")
                lines.append("")
        else:
            lines = [
                f"# 📝 امتحان: {topic}",
                f"**مستوى الصعوبة:** {difficulty} | **عدد الأسئلة:** {len(questions)} | **التاريخ:** {now}",
                "",
                "---",
                "",
                "> **تعليمات الامتحان:**",
                "> - اقرأ كل سؤال جيداً قبل الإجابة.",
                "> - في أسئلة الاختيار من متعدد: اختر إجابة واحدة فقط.",
                "> - في أسئلة صح/خطأ: اكتب (صح) أو (خطأ) فقط.",
                "> - لا يوجد تصحيح جزئي للإجابات الخاطئة.",
                "",
                "---",
                ""
            ]
            bloom_ar = {
                "Remember": "تذكر", "Understand": "فهم", "Apply": "تطبيق",
                "Analyze": "تحليل", "Evaluate": "تقييم", "Create": "إبداع"
            }
            diff_ar = {"Easy": "سهل", "Medium": "متوسط", "Hard": "صعب"}
            for i, q in enumerate(questions, 1):
                bloom_label = bloom_ar.get(q.bloom_level, q.bloom_level)
                diff_label = diff_ar.get(q.difficulty, q.difficulty)
                lines.append(f"### السؤال {i} *[{bloom_label}]* *({diff_label})*")
                lines.append("")
                lines.append(q.question_text)
                lines.append("")
                if q.question_type == "MCQ" and q.options:
                    for opt in q.options:
                        lines.append(f"   {opt}")
                elif q.question_type == "TF":
                    lines.append("   أ. صح")
                    lines.append("   ب. خطأ")
                lines.append("")
                lines.append("---")
                lines.append("")

        return "\n".join(lines)

    def _build_answer_key_markdown(
        self, questions: List[QuizQuestion], topic: str, lang: str
    ) -> str:
        """Build the detailed teacher answer key with explanations."""
        if lang == "en":
            lines = [
                f"# 🔑 Answer Key & Explanations: {topic}",
                f"*For Teacher Use Only — Do NOT distribute to students*",
                "",
                "---",
                ""
            ]
            for i, q in enumerate(questions, 1):
                lines.append(f"### Q{i}: {q.question_text[:80]}{'...' if len(q.question_text) > 80 else ''}")
                lines.append(f"- **Type:** {q.question_type} | **Bloom's:** {q.bloom_level} | **Difficulty:** {q.difficulty}")
                lines.append(f"- **✅ Correct Answer:** **{q.correct_answer}**")
                if q.explanation:
                    lines.append(f"- **📖 Explanation:** {q.explanation}")
                if q.source_reference:
                    lines.append(f"- **📌 Source:** {q.source_reference}")
                lines.append("")
                lines.append("---")
                lines.append("")
        else:
            lines = [
                f"# 🔑 مفتاح الإجابات والشرح: {topic}",
                f"*للمعلم فقط — لا توزع على الطلاب*",
                "",
                "---",
                ""
            ]
            bloom_ar = {
                "Remember": "تذكر", "Understand": "فهم", "Apply": "تطبيق",
                "Analyze": "تحليل", "Evaluate": "تقييم", "Create": "إبداع"
            }
            diff_ar = {"Easy": "سهل", "Medium": "متوسط", "Hard": "صعب"}
            for i, q in enumerate(questions, 1):
                short_q = q.question_text[:80] + ("..." if len(q.question_text) > 80 else "")
                bloom_label = bloom_ar.get(q.bloom_level, q.bloom_level)
                diff_label = diff_ar.get(q.difficulty, q.difficulty)
                lines.append(f"### س{i}: {short_q}")
                lines.append(f"- **النوع:** {q.question_type} | **مستوى بلوم:** {bloom_label} | **الصعوبة:** {diff_label}")
                lines.append(f"- **✅ الإجابة الصحيحة:** **{q.correct_answer}**")
                if q.explanation:
                    lines.append(f"- **📖 الشرح:** {q.explanation}")
                if q.source_reference:
                    lines.append(f"- **📌 المصدر:** {q.source_reference}")
                lines.append("")
                lines.append("---")
                lines.append("")

        return "\n".join(lines)


# ─────────────────────────────────────────────
# Singleton instance
# ─────────────────────────────────────────────
teacher_quiz_service = TeacherQuizService()

teacher_quizzes_pipeline = teacher_quiz_service
