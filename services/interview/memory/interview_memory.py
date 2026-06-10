"""
Interview Memory Engine — tracks claims, detects contradictions throughout the interview.
"""
from typing import List, Dict, Any
from core.logger import get_logger
from services.interview.memory.claim_tracker import claim_tracker
from services.interview.memory.contradiction_detector import contradiction_detector

logger = get_logger(__name__)


class InterviewMemory:
    def __init__(self):
        self.reset()

    def reset(self):
        self.claims_history: List[Dict[str, Any]] = []
        self.contradictions: List[Dict[str, Any]] = []
        self.trust_events: List[Dict[str, Any]] = []
        self.contradiction_events: List[Dict[str, Any]] = []

    def process_answer(self, answer_text: str, skill: str,
                        evaluation: Dict[str, Any],
                        question_id: str = "", question_text: str = "") -> Dict[str, Any]:
        new_claims = claim_tracker.extract_claims_from_answer(
            answer_text, skill, question_id, question_text,
        )
        self.claims_history.extend(new_claims)

        contradictions = contradiction_detector.detect(self.claims_history, [])
        new_contradictions = [c for c in contradictions if c not in self.contradictions]
        self.contradictions.extend(new_contradictions)

        trust_event = self._create_trust_event(skill, evaluation, new_claims, new_contradictions)
        if trust_event:
            self.trust_events.append(trust_event)

        return {
            "new_claims": len(new_claims),
            "new_contradictions": len(new_contradictions),
            "total_claims": len(self.claims_history),
            "total_contradictions": len(self.contradictions),
            "trust_events": self.trust_events[-3:] if self.trust_events else [],
        }

    def _create_trust_event(self, skill: str, evaluation: Dict[str, Any],
                              claims: List[Dict], contradictions: List[Dict]) -> Dict:
        score = evaluation.get("score", 0)
        confidence = evaluation.get("confidence", 0.5)
        trust_delta = 0
        if score < 30 and confidence > 0.7:
            trust_delta = -10
        elif score > 80 and confidence > 0.7:
            trust_delta = 5
        elif contradictions:
            trust_delta = -15

        if trust_delta != 0:
            return {
                "skill": skill,
                "trust_delta": trust_delta,
                "score": score,
                "confidence": confidence,
                "contradictions_found": len(contradictions),
                "claims_made": len(claims),
            }
        return None

    def get_memory_summary(self) -> Dict[str, Any]:
        return {
            "total_claims": len(self.claims_history),
            "total_contradictions": len(self.contradictions),
            "total_trust_events": len(self.trust_events),
            "net_trust_delta": sum(e.get("trust_delta", 0) for e in self.trust_events),
            "claims": self.claims_history,
            "contradictions": self.contradictions,
            "trust_events": self.trust_events,
        }


interview_memory = InterviewMemory()
