"""
Anti-cheat engine — detects suspicious interview behavior and generates recruiter warnings.
Never automatically rejects candidates — only flags for review.
"""
from typing import List, Dict, Any
from core.logger import get_logger
from services.interview.security.behavior_analyzer import behavior_analyzer

logger = get_logger(__name__)


class AntiCheatEngine:
    def analyze_answer(self, answer_text: str, score: float, skill: str,
                        response_time_seconds: float = 0) -> Dict[str, Any]:
        result = behavior_analyzer.record_answer(
            answer_text=answer_text,
            score=score,
            skill=skill,
            response_time_seconds=response_time_seconds,
        )
        return result

    def get_full_report(self) -> Dict[str, Any]:
        analysis = behavior_analyzer.get_full_analysis()
        flags = analysis.get("flags", [])
        warnings = []
        for flag in flags:
            warnings.append({
                "warning_type": flag.get("type", "Unknown"),
                "severity": flag.get("severity", "low"),
                "details": flag.get("details", ""),
                "recommendation": self._get_recommendation(flag),
            })
        return {
            "suspicion_score": analysis.get("suspicion_score", 0),
            "warnings": warnings,
            "behavior_metrics": {
                "avg_response_time": analysis.get("response_time_avg", 0),
                "avg_answer_length": analysis.get("answer_length_avg", 0),
                "score_volatility": analysis.get("score_volatility", 0),
                "total_answers_analyzed": analysis.get("total_answers", 0),
            },
            "flagged": len(warnings) > 0,
        }

    def _get_recommendation(self, flag: Dict) -> str:
        ftype = flag.get("type", "")
        if "AI Assistance" in ftype or "External Help" in ftype:
            return "Review recording manually. Consider a proctored re-interview."
        if "Quality Jump" in ftype:
            return "Ask detailed follow-up questions on the topics where sudden improvement occurred."
        if "Length Inconsistency" in ftype:
            return "Check if candidate ran out of time or had access issues."
        if "Response Speed" in ftype:
            return "Verify with timed coding challenge."
        return "Flag for manual review."

    def reset(self):
        behavior_analyzer.reset()


anti_cheat_engine = AntiCheatEngine()
