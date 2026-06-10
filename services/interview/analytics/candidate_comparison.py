"""
Candidate comparison — compares candidates against each other for peer ranking.
"""
from typing import List, Dict, Any, Optional
from core.logger import get_logger
from models import database

logger = get_logger(__name__)


class CandidateComparison:
    def compare_with_peers(self, session_id: str) -> Dict[str, Any]:
        session = database.get_interview_session(session_id)
        if not session:
            return {"error": "Session not found"}
        company_id = session.get("company_id")
        all_sessions = database.get_all_interview_sessions(company_id, limit=200)
        completed = [s for s in all_sessions if s.get("status") == "completed" and s.get("final_score", 0) > 0]
        completed.sort(key=lambda s: s.get("final_score", 0), reverse=True)

        candidate_score = session.get("final_score", 0)
        rank = 1
        for s in completed:
            if s["id"] == session_id:
                break
            rank += 1

        peers_above = [s for s in completed if s.get("final_score", 0) > candidate_score]
        peers_below = [s for s in completed if s.get("final_score", 0) < candidate_score]
        similar = [s for s in completed if abs(s.get("final_score", 0) - candidate_score) <= 5 and s["id"] != session_id]

        return {
            "rank": rank,
            "total_candidates": len(completed),
            "percentile": ((len(completed) - rank) / max(len(completed), 1)) * 100,
            "peers_above": len(peers_above),
            "peers_below": len(peers_below),
            "similar_candidates": len(similar),
            "score_distribution": {
                "top_10_threshold": completed[int(len(completed) * 0.1)]["final_score"] if len(completed) >= 10 else None,
                "top_25_threshold": completed[int(len(completed) * 0.25)]["final_score"] if len(completed) >= 4 else None,
            },
        }

    def get_skill_heatmap(self, company_id: Optional[str] = None) -> Dict[str, Any]:
        sessions = database.get_all_interview_sessions(company_id, limit=200)
        all_assessments = []
        for s in sessions:
            assessments = database.get_skill_assessments(s["id"])
            all_assessments.extend(assessments)

        skill_scores = {}
        for a in all_assessments:
            skill = a.get("skill", "unknown")
            verified = a.get("verified_level", 0)
            claimed = a.get("claimed_level", 0)
            if skill not in skill_scores:
                skill_scores[skill] = {"verified": [], "claimed": [], "count": 0}
            skill_scores[skill]["verified"].append(verified)
            skill_scores[skill]["claimed"].append(claimed)
            skill_scores[skill]["count"] += 1

        heatmap = {}
        for skill, data in skill_scores.items():
            if data["count"] >= 3:
                avg_verified = sum(data["verified"]) / len(data["verified"])
                avg_claimed = sum(data["claimed"]) / len(data["claimed"])
                avg_gap = avg_claimed - avg_verified
                heatmap[skill] = {
                    "avg_verified": round(avg_verified, 1),
                    "avg_claimed": round(avg_claimed, 1),
                    "avg_gap": round(avg_gap, 1),
                    "candidates_assessed": data["count"],
                    "risk_level": "high" if avg_gap > 30 else ("medium" if avg_gap > 15 else "low"),
                }

        return {
            "skills": heatmap,
            "total_skills": len(heatmap),
            "total_candidates_assessed": len(set(a.get("session_id") for a in all_assessments)),
        }


candidate_comparison = CandidateComparison()
