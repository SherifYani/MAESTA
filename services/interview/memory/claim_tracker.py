"""
Claim tracker — tracks all claims made by candidate during interview.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from core.logger import get_logger

logger = get_logger(__name__)


class ClaimTracker:
    def __init__(self):
        self.claims: List[Dict[str, Any]] = []

    def add_claim(self, skill: str, claim_text: str, claim_type: str = "skill",
                   question_id: str = "", question_text: str = "") -> Dict[str, Any]:
        claim = {
            "id": len(self.claims) + 1,
            "skill": skill,
            "claim_text": claim_text,
            "claim_type": claim_type,
            "question_id": question_id,
            "question_text": question_text,
            "timestamp": datetime.now().isoformat(),
            "verified": False,
            "verification_result": None,
        }
        self.claims.append(claim)
        return claim

    def extract_claims_from_answer(self, answer_text: str, skill: str,
                                     question_id: str = "", question_text: str = "") -> List[Dict[str, Any]]:
        import re
        new_claims = []
        patterns = [
            (r"(\d+)\s*years?\s*(?:of\s*)?experience", "experience"),
            (r"(?:worked\s*(?:with|on|at)\s*)([\w\s]+)", "project"),
            (r"(?:used|using|utilized)\s+([A-Z][\w\s]+)", "tool"),
            (r"(?:built|created|developed|designed)\s+(?:a|an|the\s*)?([\w\s]+)", "project"),
            (r"(?:led|managed|responsible\s*for)\s+(?:a|an|the\s*)?([\w\s]+)", "responsibility"),
        ]
        for pattern, claim_type in patterns:
            matches = re.findall(pattern, answer_text, re.IGNORECASE)
            for match in matches:
                text = match.strip() if isinstance(match, str) else match[0].strip()
                if len(text) > 3:
                    claim = self.add_claim(skill, text, claim_type, question_id, question_text)
                    new_claims.append(claim)
        # Always track the skill claim
        self.add_claim(skill, f"Knowledge of {skill}", "skill", question_id, question_text)
        return new_claims

    def get_claims_by_skill(self, skill: str) -> List[Dict[str, Any]]:
        return [c for c in self.claims if c["skill"] == skill]

    def get_claims_by_type(self, claim_type: str) -> List[Dict[str, Any]]:
        return [c for c in self.claims if c["claim_type"] == claim_type]

    def get_all_claims(self) -> List[Dict[str, Any]]:
        return self.claims

    def mark_verified(self, claim_id: int, result: bool, evidence: str = ""):
        for claim in self.claims:
            if claim["id"] == claim_id:
                claim["verified"] = result
                claim["verification_result"] = {"verified": result, "evidence": evidence}
                break

    def to_dict(self) -> Dict[str, Any]:
        return {
            "claims": self.claims,
            "total_claims": len(self.claims),
            "verified_claims": sum(1 for c in self.claims if c.get("verified")),
            "unverified_claims": sum(1 for c in self.claims if not c.get("verified")),
        }


claim_tracker = ClaimTracker()
