"""
Skill Knowledge Base — comprehensive structured knowledge for interview evaluation.
"""
import json
from typing import Dict, Any, List, Optional
from core.logger import get_logger
from services.interview.knowledge.skill_rubrics import (
    SKILL_RUBRICS, get_skill_rubric, get_concept_score,
)
from services.interview.cache.redis_cache import redis_cache

logger = get_logger(__name__)


class SkillKnowledgeBase:
    def get_rubric(self, skill: str) -> Dict[str, Any]:
        cache_key = f"rubric:{skill.lower()}"
        cached = redis_cache.get(cache_key)
        if cached:
            return cached
        rubric = get_skill_rubric(skill)
        redis_cache.set(cache_key, rubric, ttl=3600)
        return rubric

    def evaluate_concept_coverage(self, answer_text: str, skill: str,
                                    difficulty_level: int = 1) -> Dict[str, Any]:
        level_map = {1: "beginner", 2: "beginner", 3: "intermediate", 4: "advanced", 5: "advanced"}
        level = level_map.get(difficulty_level, "intermediate")
        result = get_concept_score(answer_text, skill, level)
        beginner_result = get_concept_score(answer_text, skill, "beginner")
        result["beginner_coverage"] = beginner_result["concept_coverage"]
        if difficulty_level >= 3:
            intermediate_result = get_concept_score(answer_text, skill, "intermediate")
            result["intermediate_coverage"] = intermediate_result["concept_coverage"]
        if difficulty_level >= 4:
            advanced_result = get_concept_score(answer_text, skill, "advanced")
            result["advanced_coverage"] = advanced_result["concept_coverage"]
        return result

    def get_all_skills(self) -> List[str]:
        return list(SKILL_RUBRICS.keys())

    def get_skills_by_category(self, category: str) -> List[str]:
        return [k for k, v in SKILL_RUBRICS.items() if v.get("category") == category]

    def get_category_for_skill(self, skill: str) -> str:
        rubric = self.get_rubric(skill)
        return rubric.get("category", "general")


skill_knowledge_base = SkillKnowledgeBase()
