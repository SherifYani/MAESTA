"""
Confidence calculator for skill assessments.
Combines multiple signals: score consistency, question count, evaluation confidence.
"""
import math
from typing import List
from core.logger import get_logger

logger = get_logger(__name__)


class ConfidenceCalculator:
    def calculate(self, scores: List[float], questions_count: int,
                  consistency: float = 0.5) -> float:
        if not scores:
            return 0.0

        score_variance = self._variance(scores)
        variance_penalty = min(score_variance / 2500, 0.3)
        count_bonus = min(questions_count / 5, 0.2)
        base = 0.5 - variance_penalty + count_bonus
        final = base * (0.7 + 0.3 * consistency)
        return max(0.1, min(0.99, final))

    def _variance(self, values: List[float]) -> float:
        if len(values) < 2:
            return 0.0
        mean = sum(values) / len(values)
        return sum((v - mean) ** 2 for v in values) / len(values)


confidence_calculator = ConfidenceCalculator()
