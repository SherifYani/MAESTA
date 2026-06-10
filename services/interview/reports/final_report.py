"""
Final interview report generator with recruiter copilot analysis.
Produces structured output with recommendation, risks, benchmark, and next steps.
"""
from typing import List, Dict, Any
from core.logger import get_logger

logger = get_logger(__name__)

HIRING_THRESHOLDS = {
    "strong_hire": (90, "Exceptional match — strong recommend to proceed"),
    "hire": (80, "Good match — recommend hiring"),
    "maybe": (65, "Adequate match — consider with reservations"),
    "weak_hire": (50, "Below average — not recommended"),
}


class InterviewReportGenerator:
    def generate(self, final_score: float, technical: float, practical: float,
                 experience: float, communication: float, consistency: float,
                 trust: float, cv_match: float,
                 trust_gaps: List[Dict], risk_flags: List[str],
                 risk_flags_detailed: List[Dict[str, Any]],
                 anti_cheat_report: Dict[str, Any],
                 challenge_evaluation: Dict[str, Any],
                benchmark: Dict[str, Any],
                 recruiter_notes: str = "") -> Dict[str, Any]:
        recommendation = self._get_recommendation(final_score)
        recommendation_text = HIRING_THRESHOLDS.get(recommendation, ("", ""))[1]

        risks = []
        for rf in risk_flags_detailed:
            risks.append(rf.get("explanation", rf.get("type", "")))
        for flag in risk_flags:
            if flag not in [r.get("type") for r in risk_flags_detailed]:
                risks.append(f"Risk: {flag}")

        # Trust breakdown
        trust_analysis = self._build_trust_analysis(trust_gaps, trust)

        # Anti-cheat summary
        anti_cheat_summary = {
            "status": "clean" if anti_cheat_report.get("suspicion_score", 0) < 0.3 else "flagged",
            "suspicion_score": anti_cheat_report.get("suspicion_score", 0),
            "flags": anti_cheat_report.get("flags", []),
        } if anti_cheat_report else {"status": "not_available", "suspicion_score": 0, "flags": []}

        return {
            "final_score": round(final_score, 1),
            "recommendation": recommendation,
            "recommendation_text": recommendation_text,
            "scores": {
                "technical": round(technical, 1),
                "practical": round(practical, 1),
                "experience": round(experience, 1),
                "communication": round(communication, 1),
                "consistency": round(consistency, 1),
                "trust": round(trust, 1),
                "cv_match": round(cv_match, 1),
            },
            "risks": risks[:10],
            "trust_analysis": trust_analysis,
            "anti_cheat": anti_cheat_summary,
            "benchmark": benchmark or {},
            "challenge": {
                "score": challenge_evaluation.get("overall_score", 0),
                "passed": challenge_evaluation.get("passed", False),
            } if challenge_evaluation else {"score": 0, "passed": False},
            "recruiter_copilot": self._build_copilot(
                final_score, recommendation, risks, trust_analysis,
                anti_cheat_summary, premium_text=recruiter_notes,
            ),
            "recruiter_notes": recruiter_notes,
        }

    def _get_recommendation(self, score: float) -> str:
        for rec, (threshold, _) in HIRING_THRESHOLDS.items():
            if score >= threshold:
                return rec
        return "no_recommendation"

    def _build_trust_analysis(self, trust_gaps: List[Dict],
                                trust_score: float) -> Dict[str, Any]:
        return {
            "trust_score": round(trust_score, 1),
            "verified_level": "strong" if trust_score >= 80 else "moderate" if trust_score >= 60 else "weak",
            "total_gaps": len(trust_gaps),
            "gaps": [f"{tg['skill']}: claimed {tg['claimed']}%, verified {tg['verified']}% (gap {tg['gap']}%)"
                     for tg in trust_gaps[:5]],
        }

    def _build_copilot(self, final_score: float, recommendation: str,
                        risks: List[str], trust_analysis: Dict,
                        anti_cheat_summary: Dict, premium_text: str = "") -> Dict[str, Any]:
        next_step = "Proceed to offer" if final_score >= 85 else \
                    "Schedule next interview round" if final_score >= 70 else \
                    "Send rejection with feedback" if final_score < 50 else \
                    "Review with hiring manager"

        if recommendation in ("strong_hire", "hire"):
            next_step = "Proceed to offer"
        elif recommendation == "maybe":
            next_step = "Schedule next interview round"
        elif recommendation == "weak_hire":
            next_step = "Send rejection with feedback"

        trust_concerns = trust_analysis.get("total_gaps", 0) > 2 or trust_analysis.get("trust_score", 100) < 60
        anti_cheat_concern = anti_cheat_summary.get("suspicion_score", 0) > 0.5

        return {
            "recommended_next_step": next_step,
            "trust_concerns": trust_concerns,
            "anti_cheat_concerns": anti_cheat_concern,
            "risk_count": len(risks),
            "overall_risk": "high" if len(risks) > 5 else "medium" if len(risks) > 2 else "low",
            "recruiter_notes": premium_text,
        }


FinalReportGenerator = InterviewReportGenerator
report_generator = InterviewReportGenerator()
final_report_generator = report_generator  # backward compat
