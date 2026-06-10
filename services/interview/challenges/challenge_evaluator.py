"""
Challenge evaluator — scores coding challenge submissions using rubric-based evaluation.
"""
from typing import List, Dict, Any
from core.logger import get_logger
from services.interview.challenges.challenge_models import CodingChallenge, ChallengeSubmission, ChallengeEvaluation
from services.agent.ollama_service import ollama_service
import config
import json

logger = get_logger(__name__)


class ChallengeEvaluator:
    def evaluate(self, challenge: CodingChallenge,
                  submission: ChallengeSubmission) -> ChallengeEvaluation:
        correctness = self._evaluate_correctness(challenge, submission)
        quality = self._evaluate_code_quality(submission.candidate_code)
        efficiency = self._evaluate_efficiency(submission.candidate_code)

        rubric = challenge.rubric
        overall = (
            correctness * rubric.get("correctness", 0.4)
            + quality * rubric.get("code_quality", 0.3)
            + efficiency * rubric.get("efficiency", 0.3)
        )

        feedback = self._generate_feedback(challenge, submission, correctness, quality, efficiency)

        return ChallengeEvaluation(
            challenge_id=challenge.id,
            correctness_score=round(correctness, 1),
            code_quality_score=round(quality, 1),
            efficiency_score=round(efficiency, 1),
            test_cases_passed=int(correctness / 100 * 5) if challenge.test_cases else 0,
            total_test_cases=len(challenge.test_cases) or 5,
            overall_score=round(overall, 1),
            feedback=feedback.get("feedback", ""),
            strengths=feedback.get("strengths", []),
            improvements=feedback.get("improvements", []),
        )

    def _evaluate_correctness(self, challenge: CodingChallenge,
                                submission: ChallengeSubmission) -> float:
        if not submission.candidate_code.strip():
            return 0.0
        prompt = f"""Evaluate this solution for correctness (0-100):

Challenge: {challenge.description}

Solution:
{submission.candidate_code[:1000]}

Output: {submission.candidate_output[:500]}

Return JSON: {{"score": 0-100, "reasoning": "..."}}"""
        try:
            resp = ollama_service.generate(prompt=prompt, model=config.INTERVIEW_DEFAULT_LLM_MODEL,
                                           temperature=0.3, max_tokens=200, json_mode=True)
            result = json.loads(resp)
            return max(0, min(100, float(result.get("score", 50))))
        except Exception:
            return self._length_based_score(submission.candidate_code)

    def _evaluate_code_quality(self, code: str) -> float:
        if not code.strip():
            return 0.0
        score = 50.0
        if len(code) > 50: score += 10
        if any(kw in code for kw in ["def ", "class ", "import ", "return"]): score += 10
        if any(kw in code for kw in ["try", "except", "if __name__", "raise"]): score += 10
        if any(kw in code for kw in ["#", "'''", "\"\"\""]): score += 10
        if any(kw in code for kw in ["typing", "Optional", "List", "Dict", "->"]): score += 10
        return min(score, 100)

    def _evaluate_efficiency(self, code: str) -> float:
        if not code.strip():
            return 0.0
        score = 50.0
        import re
        explicit_for_loops = len(re.findall(r'for\s+\w+\s+in\s+.*?:', code))
        has_while = "while " in code.lower()
        inefficiency_count = explicit_for_loops + (1 if has_while else 0)
        efficient_keywords = ["list comprehension", "generator", "map(", "filter(", "sorted(", "set("]
        efficiency_count = sum(1 for kw in efficient_keywords if kw in code.lower())
        has_list_comp = bool(re.search(r'\[.*?\bfor\b.*?\bin\b', code))
        has_generator = bool(re.search(r'\(.*?\bfor\b.*?\bin\b', code))
        if has_list_comp:
            efficiency_count += 1
        if has_generator:
            efficiency_count += 1
        score += (efficiency_count * 10) - (inefficiency_count * 10)
        return max(0, min(100, score))

    def _length_based_score(self, code: str) -> float:
        lines = len(code.strip().split("\n"))
        if lines > 10: return 70
        if lines > 5: return 50
        return 30

    def _generate_feedback(self, challenge: CodingChallenge,
                            submission: ChallengeSubmission,
                            correctness: float, quality: float,
                            efficiency: float) -> Dict:
        prompt = f"""Generate feedback for this coding challenge submission.

Challenge: {challenge.title}
Skill: {challenge.skill}
Correctness: {correctness}%
Code Quality: {quality}%
Efficiency: {efficiency}%

Return JSON:
{{
    "feedback": "2-3 sentence overall assessment",
    "strengths": ["strength1", "strength2"],
    "improvements": ["area1", "area2"]
}}"""
        try:
            resp = ollama_service.generate(prompt=prompt, model=config.INTERVIEW_DEFAULT_LLM_MODEL,
                                           temperature=0.3, max_tokens=300, json_mode=True)
            return json.loads(resp)
        except Exception:
            return {"feedback": "Evaluation complete.", "strengths": [], "improvements": []}


challenge_evaluator = ChallengeEvaluator()
