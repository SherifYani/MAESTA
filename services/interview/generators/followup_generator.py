"""
Dynamic follow-up question generator.
Adapts difficulty based on previous answer quality.
"""
import uuid
from typing import List, Optional, Dict, Any
from core.logger import get_logger
from services.interview.generators.prompt_templates import InterviewPromptTemplates
from services.agent.ollama_service import ollama_service
import config

logger = get_logger(__name__)


class FollowUpGenerator:
    def __init__(self):
        self.ollama = ollama_service

    def generate(self, skill: str, last_answer: str,
                 last_evaluation: Dict[str, Any],
                 followup_count: int = 0,
                 previous_qa: Optional[List[Dict]] = None,
                 language: str = "ar") -> dict:
        if previous_qa is None:
            previous_qa = []

        prompt = InterviewPromptTemplates.followup_generation(
            skill=skill,
            last_answer=last_answer,
            evaluation=last_evaluation,
            followup_count=followup_count + 1,
            language=language,
        )

        try:
            text = self.ollama.generate(
                prompt=prompt,
                model=config.INTERVIEW_DEFAULT_LLM_MODEL,
                temperature=0.7,
                max_tokens=512,
                think=False,
            )
        except Exception as e:
            logger.error(f"Follow-up generation failed: {e}")
            text = self._fallback_followup(skill, last_evaluation)

        new_difficulty = self._compute_new_difficulty(last_evaluation, followup_count)

        question_text = text.strip().strip('"').strip("'")
        import re

        # Clean thinking blocks (qwen3 internal monologue) - multiple formats
        thinking_markers = ['</think>', '</thinking>', 'xièyì', 'thinking', '<thinking>']
        for marker in thinking_markers:
            if marker in question_text:
                parts = question_text.split(marker, 1)
                if len(parts) > 1:
                    cleaned = parts[-1].strip()
                    if cleaned:
                        question_text = cleaned
                        break

        # Remove stray tags and markers
        question_text = re.sub(r'xièyì', '', question_text, flags=re.IGNORECASE)
        question_text = re.sub(r'thinking', '', question_text, flags=re.IGNORECASE)
        question_text = re.sub(r'<thinking>', '', question_text, flags=re.IGNORECASE)
        question_text = re.sub(r'</thinking>', '', question_text, flags=re.IGNORECASE)
        question_text = re.sub(r'xièyì.*?xièyì', '', question_text, flags=re.DOTALL).strip()
        question_text = re.sub(r'thinking.*?thinking', '', question_text, flags=re.DOTALL).strip()
        # Remove Chinese brackets and any remaining thinking markers
        question_text = re.sub(r'（.*?）', '', question_text).strip()
        question_text = re.sub(r'【.*?】', '', question_text).strip()
        question_text = question_text.strip()

        # Strategy: Find the actual question after thinking
        sentences = re.split(r'(?<=[.?!])\s+', question_text)
        # Filter for actual questions (ending with ? or ؟)
        question_candidates = [s.strip() for s in sentences if s.strip().endswith(('?', '؟'))]
        if question_candidates:
            # Take the LAST complete question (after any thinking)
            question_text = question_candidates[-1]
        else:
            # If no clear question marker, take the last meaningful sentence
            # that looks like a question (contains question words)
            question_words = ['what', 'how', 'why', 'when', 'where', 'which', 'who',
                            'explain', 'describe', 'difference', 'elaborate', 'example',
                            'ما', 'كيف', 'لماذا', 'متى', 'أين', 'أي', 'من', 'اذكر', 'اشرح', 'وصف', 'فرق']
            question_like = [s.strip() for s in sentences if any(w in s.lower() for w in question_words)]
            if question_like:
                question_text = question_like[-1]
            else:
                # Last resort: take the last non-empty sentence
                question_text = next((s.strip() for s in reversed(sentences) if s.strip()), question_text)

        return {
            "id": str(uuid.uuid4()),
            "skill": skill,
            "question": question_text,
            "question_type": "technical",
            "difficulty_level": new_difficulty,
            "is_followup": True,
            "followup_count": followup_count + 1,
        }

    def _compute_new_difficulty(self, evaluation: Dict[str, Any], count: int) -> int:
        score = evaluation.get("score", 50)
        # count is 0-based for first follow-up, convert to 1-based
        followup_num = count + 1
        if score > 80:
            return min(5, 2 + followup_num)
        elif score > 60:
            return min(4, 1 + followup_num)
        else:
            # Low score: decrease difficulty, minimum 1
            return max(1, 2 - followup_num)

    def _fallback_followup(self, skill: str, evaluation: dict) -> str:
        weaknesses = evaluation.get("weaknesses", [])
        if weaknesses:
            return f"You mentioned {weaknesses[0]}. Can you elaborate on how you handled that?"
        return f"Can you provide a specific example of a project where you used {skill}?"


followup_generator = FollowUpGenerator()
