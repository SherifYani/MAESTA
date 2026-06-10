"""
Contradiction detector — finds contradictions in candidate claims across the interview.
"""
from typing import List, Dict, Any
from datetime import datetime
from core.logger import get_logger

logger = get_logger(__name__)


class ContradictionDetector:
    def detect(self, claims_history: List[Dict[str, Any]],
               answers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        contradictions = []
        contradictions.extend(self._detect_experience_contradictions(claims_history, answers))
        contradictions.extend(self._detect_skill_contradictions(claims_history, answers))
        contradictions.extend(self._detect_project_contradictions(claims_history))
        return contradictions

    def _detect_experience_contradictions(self, claims: List[Dict],
                                            answers: List[Dict]) -> List[Dict]:
        contradictions = []
        exp_claims = [c for c in claims if c.get("claim_type") == "experience"]
        for i, c1 in enumerate(exp_claims):
            for c2 in exp_claims[i + 1:]:
                if c1["skill"] == c2["skill"]:
                    year1 = self._extract_years(c1["claim_text"])
                    year2 = self._extract_years(c2["claim_text"])
                    if year1 and year2 and abs(year1 - year2) > 2:
                        contradictions.append({
                            "type": "Experience Contradiction",
                            "skill": c1["skill"],
                            "claim_1": c1["claim_text"],
                            "claim_2": c2["claim_text"],
                            "severity": "high",
                            "source": "claim_tracker",
                            "evidence": f"Claimed {year1} years and {year2} years for same skill",
                            "explanation": f"Candidate claimed inconsistent experience levels for {c1['skill']}",
                            "timestamp": datetime.now().isoformat(),
                        })
        return contradictions

    def _detect_skill_contradictions(self, claims: List[Dict],
                                       answers: List[Dict]) -> List[Dict]:
        contradictions = []
        skill_claims = {}
        for c in claims:
            if c["skill"] not in skill_claims:
                skill_claims[c["skill"]] = []
            skill_claims[c["skill"]].append(c)

        for skill, skill_claim_list in skill_claims.items():
            if len(skill_claim_list) < 2:
                continue
            has_expert = any("expert" in c["claim_text"].lower() or "advanced" in c["claim_text"].lower()
                            for c in skill_claim_list)
            if not has_expert:
                continue
            # Check answers for this skill
            skill_answers = [a for a in answers if a.get("skill") == skill]
            avg_score = sum(a.get("score", 0) for a in skill_answers) / max(len(skill_answers), 1)
            if avg_score < 40 and has_expert:
                contradictions.append({
                    "type": "Skill Inflation",
                    "skill": skill,
                    "severity": "high",
                    "source": "contradiction_detector",
                    "evidence": f"Claimed expert level but scored {avg_score:.1f}% on answers",
                    "explanation": f"Candidate claimed expert knowledge of {skill} but could not demonstrate it",
                    "timestamp": datetime.now().isoformat(),
                })
        return contradictions

    def _detect_project_contradictions(self, claims: List[Dict]) -> List[Dict]:
        contradictions = []
        project_claims = [c for c in claims if c.get("claim_type") == "project"]
        for i, c1 in enumerate(project_claims):
            for c2 in project_claims[i + 1:]:
                if c1["skill"] == c2["skill"] and self._is_same_project(c1["claim_text"], c2["claim_text"]):
                    contradictions.append({
                        "type": "Project Contradiction",
                        "skill": c1["skill"],
                        "severity": "medium",
                        "source": "contradiction_detector",
                        "evidence": f"Conflicting descriptions of project: '{c1['claim_text']}' vs '{c2['claim_text']}'",
                        "explanation": "Candidate gave inconsistent descriptions of the same project",
                        "timestamp": datetime.now().isoformat(),
                    })
        return contradictions

    def _extract_years(self, text: str) -> int:
        import re
        match = re.search(r"(\d+)\s*years?", text, re.IGNORECASE)
        return int(match.group(1)) if match else 0

    def _is_same_project(self, text1: str, text2: str) -> bool:
        words1 = set(text1.lower().split()[:3])
        words2 = set(text2.lower().split()[:3])
        overlap = len(words1 & words2)
        return overlap >= 2 and len(words1) > 0 and len(words2) > 0


contradiction_detector = ContradictionDetector()
