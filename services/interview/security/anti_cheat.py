"""
Anti-cheat engine — detects suspicious interview behavior and generates recruiter warnings.
Never automatically rejects candidates — only flags for review.
Stateless implementation designed for LangGraph.
"""
import statistics
from typing import List, Dict, Any
from core.logger import get_logger

logger = get_logger(__name__)

class AntiCheatEngine:
    def analyze_answers(self, answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        flags = []
        suspicion_score = 0.0

        scores = [a.get("score", 0) for a in answers]
        answer_lengths = [len(a.get("candidate_answer", a.get("answer", "")).split()) for a in answers]
        
        # We don't have response_time in state natively yet, but we'll prepare for it
        response_times = [a.get("response_time_seconds", 0) for a in answers if "response_time_seconds" in a]

        if len(scores) >= 3:
            recent = scores[-3:]
            earlier = scores[:-3]
            if earlier and statistics.mean(earlier) < 40 and statistics.mean(recent) > 80:
                flags.append({
                    "type": "Sudden Quality Jump",
                    "severity": "high",
                    "details": f"Scores jumped from {statistics.mean(earlier):.0f}% to {statistics.mean(recent):.0f}%",
                })
                suspicion_score += 0.3

        if len(answer_lengths) >= 3:
            recent_lens = answer_lengths[-3:]
            if statistics.stdev(recent_lens) > 100 and max(recent_lens) / max(min(recent_lens), 1) > 5:
                flags.append({
                    "type": "Answer Length Inconsistency",
                    "severity": "medium",
                    "details": f"Lengths vary dramatically: {recent_lens}",
                })
                suspicion_score += 0.15

        if len(response_times) >= 3:
            recent_times = response_times[-3:]
            avg_time = statistics.mean(recent_times)
            scores_avg = statistics.mean(scores[-3:]) if len(scores) >= 3 else 0
            if avg_time > 0 and avg_time < 5.0 and scores_avg > 85:
                flags.append({
                    "type": "Suspicious Response Speed",
                    "severity": "medium",
                    "details": f"Very fast responses ({avg_time:.1f}s avg) with high scores ({scores_avg:.0f}%)",
                })
                suspicion_score += 0.2

        if suspicion_score > 0.5:
            flags.append({
                "type": "Possible AI Assistance",
                "severity": "high" if suspicion_score > 0.7 else "medium",
                "details": f"Combined suspicion score: {suspicion_score:.2f}",
            })

        warnings = []
        for flag in flags:
            warnings.append({
                "warning_type": flag.get("type", "Unknown"),
                "severity": flag.get("severity", "low"),
                "details": flag.get("details", ""),
                "recommendation": self._get_recommendation(flag),
            })

        suspicion_score = round(min(suspicion_score, 1.0), 2)
        
        return {
            "suspicion_score": suspicion_score,
            "warnings": warnings,
            "behavior_metrics": {
                "avg_response_time": round(statistics.mean(response_times), 1) if response_times else 0,
                "avg_answer_length": round(statistics.mean(answer_lengths), 1) if answer_lengths else 0,
                "score_volatility": round(statistics.stdev(scores), 1) if len(scores) >= 2 else 0,
                "total_answers_analyzed": len(scores),
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

anti_cheat_engine = AntiCheatEngine()
