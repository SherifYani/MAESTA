"""
Hybrid answer evaluator: combines concept matching, semantic similarity,
keyword coverage, rubric evaluation, and LLM-based scoring.
"""
import json
import re
from typing import List, Dict, Any
from core.logger import get_logger
from services.interview.generators.prompt_templates import InterviewPromptTemplates
from services.interview.knowledge.concept_matcher import concept_matcher
from services.interview.knowledge.skill_knowledge_base import skill_knowledge_base
from services.agent.ollama_service import ollama_service
from services.interview.cache.redis_cache import redis_cache
import config

logger = get_logger(__name__)


class AnswerEvaluator:
    def __init__(self):
        self.ollama = ollama_service

    def evaluate(self, question_text: str, answer_text: str, skill: str,
                 difficulty_level: int = 1, jd_text: str = "",
                 cv_text: str = "", is_followup: bool = False) -> Dict[str, Any]:
        cache_key = f"eval:{skill}:{hash(answer_text)}:{difficulty_level}:{is_followup}"
        cached = redis_cache.get(cache_key)
        if cached:
            return cached

        # Concept matching from knowledge base
        concept_result = concept_matcher.match(answer_text, skill, difficulty_level)
        concept_coverage = concept_result.get("concept_coverage", 50)
        knowledge_score = concept_result.get("knowledge_score", 50)

        keyword_score = self._keyword_coverage(answer_text, skill)
        length_score = self._completeness_score(answer_text, question_text)
        structure_score = self._structure_score(answer_text)

        llm_score = self._llm_evaluation(
            question_text, answer_text, skill, difficulty_level, jd_text,
            is_followup=is_followup,
        )

        if is_followup:
            # Follow-up: penalize low concept coverage less — reward depth and accuracy instead
            # Weights: accuracy 40%, LLM coverage 20%, keyword 20%, knowledge depth 15%, structure 5%
            score = int(round(
                llm_score.get("accuracy_score", 50) * 0.40
                + llm_score.get("coverage_score", 50) * 0.20
                + keyword_score * 0.20
                + knowledge_score * 0.15
                + structure_score * 0.05
            ))
        else:
            # Main question: concept breadth matters more
            # Weights: concept 25%, LLM accuracy 20%, LLM coverage 15%, keyword 15%, knowledge 10%, length 5%, structure 10%
            score = int(round(
                concept_coverage * 0.25
                + llm_score.get("accuracy_score", 50) * 0.20
                + llm_score.get("coverage_score", 50) * 0.15
                + keyword_score * 0.15
                + knowledge_score * 0.10
                + length_score * 0.05
                + structure_score * 0.10
            ))

        # Merge missing concepts from both sources
        llm_missing = llm_score.get("missing_concepts", [])
        kb_missing = concept_result.get("missing_concepts", [])
        all_missing = list(dict.fromkeys(llm_missing + kb_missing))

        result = {
            "score": max(0, min(100, score)),
            "semantic_score": round(llm_score.get("semantic_score", 50), 1),
            "coverage_score": round(concept_coverage, 1),
            "accuracy_score": round(llm_score.get("accuracy_score", 50), 1),
            "completeness_score": round(length_score, 1),
            "knowledge_score": round(knowledge_score, 1),
            "concept_coverage": round(concept_coverage, 1),
            "confidence": round(llm_score.get("confidence", 0.5), 2),
            "strengths": llm_score.get("strengths", []),
            "weaknesses": llm_score.get("weaknesses", []),
            "missing_concepts": all_missing,
            "matched_concepts": concept_result.get("matched_concepts", []),
            "explanation": llm_score.get("explanation", ""),
            "is_followup": is_followup,
        }

        redis_cache.set(cache_key, result, ttl=600)
        return result

    def _keyword_coverage(self, answer: str, skill: str) -> float:
        answer_lower = answer.lower()
        # Use knowledge base categories for smarter keyword matching
        category = skill_knowledge_base.get_category_for_skill(skill)
        skill_keywords = {
            "backend": ["api", "database", "cache", "queue", "service", "endpoint", "middleware", "auth"],
            "data_science": ["model", "train", "data", "feature", "accuracy", "loss", "validation", "analysis"],
            "frontend": ["component", "state", "render", "event", "callback", "async", "hook"],
            "databases": ["query", "index", "join", "transaction", "schema", "normalization", "lock"],
            "infrastructure": ["deploy", "pipeline", "container", "monitoring", "config", "scale"],
            "data": ["analysis", "visualization", "statistics", "correlation", "etl", "pipeline"],
        }
        keywords = skill_keywords.get(category, ["implementation", "design", "solution", "architecture"])
        matched = sum(1 for kw in keywords if kw in answer_lower)
        return min(matched / max(len(keywords) * 0.3, 1), 1.0) * 100

    def _completeness_score(self, answer: str, question: str) -> float:
        word_count = len(answer.split())
        if word_count < 5: return 10.0
        if word_count < 20: return 30.0
        if word_count < 50: return 50.0
        if word_count < 100: return 70.0
        if word_count < 200: return 85.0
        return 95.0

    def _structure_score(self, answer: str) -> float:
        has_intro = any(marker in answer.lower() for marker in ["first", "there are", "several", "basically"])
        has_example = any(marker in answer.lower() for marker in ["for example", "for instance", "such as", "like when"])
        has_conclusion = any(marker in answer.lower() for marker in ["in summary", "overall", "finally", "in conclusion", "therefore"])
        score = 0
        if has_intro: score += 30
        if has_example: score += 40
        if has_conclusion: score += 30
        return float(score)

    def _llm_evaluation(self, question: str, answer: str, skill: str,
                        difficulty: int, jd_context: str,
                        is_followup: bool = False) -> Dict:
        prompt = InterviewPromptTemplates.answer_evaluation(
            question=question, answer=answer, skill=skill,
            difficulty=difficulty, jd_context=jd_context,
            is_followup=is_followup,
        )
        try:
            resp = self.ollama.generate(
                prompt=prompt,
                model=config.INTERVIEW_DEFAULT_LLM_MODEL,
                temperature=0.3,
                max_tokens=512,
                json_mode=True,
            )
            result = json.loads(resp)
            for key in ["score", "semantic_score", "coverage_score", "accuracy_score", "completeness_score"]:
                if key in result:
                    result[key] = max(0, min(100, int(result[key])))
            result["confidence"] = max(0.0, min(1.0, float(result.get("confidence", 0.5))))
            return result
        except Exception as e:
            logger.warning(f"LLM eval failed, using fallback: {e}")
            return self._fallback_eval(question, answer)

    def _fallback_eval(self, question: str, answer: str) -> Dict:
        words = len(answer.split())
        score = min(70, max(20, int(words / 3)))
        return {
            "score": score, "semantic_score": score, "coverage_score": score,
            "accuracy_score": score, "completeness_score": min(score + 10, 100),
            "confidence": 0.5, "strengths": [], "weaknesses": [],
            "missing_concepts": [], "explanation": "Fallback evaluation used.",
        }


answer_evaluator = AnswerEvaluator()
