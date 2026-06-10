"""
Behavior analyzer — tracks response patterns to detect suspicious behavior.
"""
import time
import statistics
from typing import List, Dict, Any, Optional
from datetime import datetime
from core.logger import get_logger

logger = get_logger(__name__)


class BehaviorAnalyzer:
    def __init__(self):
        self.response_times: List[float] = []
        self.answer_lengths: List[int] = []
        self.scores: List[float] = []
        self.skills: List[str] = []

    def record_answer(self, answer_text: str, score: float, skill: str,
                       response_time_seconds: Optional[float] = None) -> Dict[str, Any]:
        self.answer_lengths.append(len(answer_text.split()))
        self.scores.append(score)
        self.skills.append(skill)
        if response_time_seconds is not None:
            self.response_times.append(response_time_seconds)
        return self._analyze_latest()

    def reset(self):
        self.response_times = []
        self.answer_lengths = []
        self.scores = []
        self.skills = []

    def _analyze_latest(self) -> Dict[str, Any]:
        flags = []
        suspicion_score = 0.0

        if len(self.scores) >= 3:
            recent = self.scores[-3:]
            earlier = self.scores[:-3]
            if earlier and statistics.mean(earlier) < 40 and statistics.mean(recent) > 80:
                flags.append({
                    "type": "Sudden Quality Jump",
                    "severity": "high",
                    "details": f"Scores jumped from {statistics.mean(earlier):.0f}% to {statistics.mean(recent):.0f}%",
                })
                suspicion_score += 0.3

        if len(self.answer_lengths) >= 3:
            recent_lens = self.answer_lengths[-3:]
            if statistics.stdev(recent_lens) > 100 and max(recent_lens) / max(min(recent_lens), 1) > 5:
                flags.append({
                    "type": "Answer Length Inconsistency",
                    "severity": "medium",
                    "details": f"Lengths vary dramatically: {recent_lens}",
                })
                suspicion_score += 0.15

        if len(self.response_times) >= 3:
            recent_times = self.response_times[-3:]
            avg_time = statistics.mean(recent_times)
            scores_avg = statistics.mean(self.scores[-3:]) if len(self.scores) >= 3 else 0
            if avg_time < 5.0 and scores_avg > 85:
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

        return {
            "flags": flags,
            "suspicion_score": round(min(suspicion_score, 1.0), 2),
            "response_time_avg": round(statistics.mean(self.response_times), 1) if self.response_times else 0,
            "answer_length_avg": round(statistics.mean(self.answer_lengths), 1) if self.answer_lengths else 0,
            "answers_analyzed": len(self.scores),
        }

    def get_full_analysis(self) -> Dict[str, Any]:
        analysis = self._analyze_latest()
        analysis["total_answers"] = len(self.scores)
        analysis["score_volatility"] = round(statistics.stdev(self.scores), 1) if len(self.scores) >= 2 else 0
        if self.response_times:
            analysis["response_time_min"] = round(min(self.response_times), 1)
            analysis["response_time_max"] = round(max(self.response_times), 1)
        return analysis


behavior_analyzer = BehaviorAnalyzer()
