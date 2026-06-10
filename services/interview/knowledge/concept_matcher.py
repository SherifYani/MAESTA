"""
Concept matcher — matches candidate answers against structured skill concepts.
"""
import re
from typing import List, Dict, Any
from core.logger import get_logger
from services.interview.knowledge.skill_knowledge_base import skill_knowledge_base

logger = get_logger(__name__)


class ConceptMatcher:
    def match(self, answer_text: str, skill: str,
              difficulty_level: int = 1) -> Dict[str, Any]:
        return skill_knowledge_base.evaluate_concept_coverage(
            answer_text, skill, difficulty_level,
        )

    def extract_missing_concepts(self, matched: List[str],
                                   all_concepts: List[str]) -> List[str]:
        return [c for c in all_concepts if c not in matched]

    def calculate_breadth(self, matched: List[str], total: int) -> float:
        return (len(matched) / max(total, 1)) * 100

    def calculate_breadth_score(self, answer_text: str, skill: str) -> float:
        rubric = skill_knowledge_base.get_rubric(skill)
        all_levels = ["beginner", "intermediate", "advanced", "scenario"]
        all_concepts = []
        for level in all_levels:
            all_concepts.extend(rubric.get(level, []))
        answer_lower = answer_text.lower()
        matched = [c for c in all_concepts if c.lower() in answer_lower]
        return self.calculate_breadth(matched, len(all_concepts))


concept_matcher = ConceptMatcher()
