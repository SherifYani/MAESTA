"""
Adaptive question generator using Dual-LLM orchestration.
Generates questions only for skills present in both CV and JD.
"""
import uuid
import json
from typing import List, Optional
from core.logger import get_logger
from services.interview.generators.prompt_templates import InterviewPromptTemplates
from services.agent.ollama_service import ollama_service
import config

logger = get_logger(__name__)


class QuestionGenerator:
    def __init__(self):
        self.ollama = ollama_service

    def generate(self, skill: str, difficulty_level: int = 1,
                 question_type: str = "technical", context: str = "",
                 previous_answers: Optional[List[str]] = None,
                 language: str = "ar") -> dict:
        if previous_answers is None:
            previous_answers = []

        prompt = InterviewPromptTemplates.question_generation(
            skill=skill,
            difficulty=difficulty_level,
            question_type=question_type,
            context=context,
            previous_answers=previous_answers,
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
            logger.error(f"Question generation failed: {e}")
            text = self._fallback_question(skill, difficulty_level)

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
        # Split into sentences, keeping punctuation
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
            "question_type": question_type,
            "difficulty_level": difficulty_level,
            "is_followup": False,
            "followup_count": 0,
        }

    def _fallback_question(self, skill: str, difficulty: int) -> str:
        fallbacks = {
            "python": [
                "Explain how Python's GIL works and its impact on multithreaded applications.",
                "Describe Python's list comprehension syntax and provide an example.",
                "How does Python handle memory management?",
            ],
            ".net": [
                "Explain the difference between value types and reference types in .NET.",
                "Describe the ASP.NET Core request pipeline.",
                "How does garbage collection work in .NET?",
            ],
            "ai/ml": [
                "Explain the bias-variance tradeoff in machine learning.",
                "Describe how a transformer model works.",
                "What is the difference between supervised and unsupervised learning?",
            ],
        }
        domain = skill.lower()
        for key, questions in fallbacks.items():
            if key in domain:
                idx = min(difficulty - 1, len(questions) - 1)
                return questions[idx]
        return f"Describe your experience with {skill} and provide a specific example of a challenging problem you solved."


question_generator = QuestionGenerator()
