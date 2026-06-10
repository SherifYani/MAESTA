"""
Skill verification engine: compares claimed vs verified levels across assessments.
Uses multiple signals (keyword evidence, semantic similarity, rubric scores).
"""
from typing import List, Dict, Any
from core.logger import get_logger

logger = get_logger(__name__)


class SkillVerifier:
    def verify(self, skill: str, claimed_level: float,
               assessments: List[Dict[str, Any]]) -> Dict[str, Any]:
        relevant = [a for a in assessments if a.get("skill") == skill]
        if not relevant:
            return {
                "skill": skill,
                "claimed_level": claimed_level,
                "verified_level": 0.0,
                "confidence": 0.0,
                "questions_asked": 0,
                "average_score": 0.0,
            }

        scores = [a.get("average_score", 0) for a in relevant]
        confidences = [a.get("confidence", 0.5) for a in relevant]

        avg_score = sum(scores) / len(scores)
        avg_confidence = sum(confidences) / len(confidences)
        questions = sum(a.get("questions_asked", 0) for a in relevant)

        verified = avg_score * (0.7 + 0.3 * avg_confidence)

        return {
            "skill": skill,
            "claimed_level": claimed_level,
            "verified_level": round(verified, 1),
            "confidence": round(avg_confidence, 2),
            "questions_asked": questions,
            "average_score": round(avg_score, 1),
        }


skill_verifier = SkillVerifier()
