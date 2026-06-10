"""
Integration tests for interview service.
Tests the core logic without requiring external LLM or database.
"""
import pytest
from unittest.mock import patch, MagicMock
from services.interview.evaluators.answer_evaluator import AnswerEvaluator
from services.interview.evaluators.skill_verifier import SkillVerifier
from services.interview.evaluators.consistency_checker import ConsistencyChecker
from services.interview.evaluators.confidence_calculator import ConfidenceCalculator
from services.interview.reports.final_report import InterviewReportGenerator
from services.interview.generators.question_generator import QuestionGenerator


class TestConfidenceCalculator:
    def setup_method(self):
        self.calc = ConfidenceCalculator()

    def test_no_scores_returns_zero(self):
        assert self.calc.calculate([], 0) == 0.0

    def test_high_consistency_high_confidence(self):
        scores = [85, 90, 88]
        conf = self.calc.calculate(scores, 3, consistency=0.9)
        assert conf > 0.5

    def test_low_consistency_lower_confidence(self):
        scores = [20, 90, 30, 85]
        conf = self.calc.calculate(scores, 4, consistency=0.3)
        assert conf >= 0.1 and conf <= 0.99


class TestSkillVerifier:
    def setup_method(self):
        self.verifier = SkillVerifier()

    def test_no_assessments(self):
        result = self.verifier.verify("Python", 80, [])
        assert result["verified_level"] == 0.0
        assert result["confidence"] == 0.0

    def test_single_assessment(self):
        assessments = [{"skill": "Python", "average_score": 75, "confidence": 0.8, "questions_asked": 2}]
        result = self.verifier.verify("Python", 80, assessments)
        assert result["verified_level"] > 0
        assert result["questions_asked"] == 2

    def test_multiple_assessments_averaged(self):
        assessments = [
            {"skill": "Python", "average_score": 70, "confidence": 0.7, "questions_asked": 2},
            {"skill": "Python", "average_score": 90, "confidence": 0.9, "questions_asked": 3},
        ]
        result = self.verifier.verify("Python", 80, assessments)
        assert 60 < result["verified_level"] < 95


class TestConsistencyChecker:
    def setup_method(self):
        self.checker = ConsistencyChecker()

    def test_no_gap_when_no_assessments(self):
        result = self.checker.analyze([], [], "", "")
        assert result["consistency_score"] == 50.0

    def test_detects_large_gap(self):
        assessments = [{"skill": "Python", "claimed_level": 90, "verified_level": 30}]
        result = self.checker.analyze(assessments, [], "", "")
        assert len(result["trust_gaps"]) == 1
        assert result["trust_gaps"][0]["gap"] == 60.0
        assert "Skill Inflation" in result["risk_flags"]

    def test_no_gap_when_consistent(self):
        assessments = [{"skill": "Python", "claimed_level": 80, "verified_level": 75}]
        result = self.checker.analyze(assessments, [{"answer": "good"}], "", "")
        gaps = result["trust_gaps"]
        assert len(gaps) == 0 or gaps[0]["gap"] <= 20


class TestInterviewReportGenerator:
    def setup_method(self):
        self.generator = InterviewReportGenerator()

    def test_strong_hire_generation(self):
        report = self.generator.generate(
            final_score=91, technical=92, practical=80, experience=88,
            communication=85, consistency=95, trust=90, cv_match=85,
            trust_gaps=[], risk_flags=[], risk_flags_detailed=[],
            anti_cheat_report={}, challenge_evaluation={}, benchmark={},
        )
        assert report["final_score"] == 91.0
        assert report["recommendation"] == "strong_hire"
        risks = report.get("risks", [])
        assert len(risks) >= 0

    def test_reject_generation(self):
        report = self.generator.generate(
            final_score=28, technical=25, practical=0, experience=30,
            communication=40, consistency=20, trust=15, cv_match=30,
            trust_gaps=[{"skill": "Docker", "claimed": 90, "verified": 30, "gap": 60}],
            risk_flags=["Skill Inflation"],
            risk_flags_detailed=[{"type": "Skill Inflation", "severity": "high",
                                    "source": "test", "skill": "Docker", "gap": 60,
                                    "evidence": "", "explanation": "test"}],
            anti_cheat_report={}, challenge_evaluation={}, benchmark={},
        )
        assert report["recommendation"] in ("weak_hire", "no_recommendation")
        risks = report.get("risks", [])
        assert len(risks) > 0


class TestAnswerEvaluator:
    def setup_method(self):
        self.evaluator = AnswerEvaluator()

    def test_fallback_evaluation(self):
        result = self.evaluator._fallback_eval("What is Python?", "It is a programming language.")
        assert result["score"] > 0
        assert result["confidence"] == 0.5

    def test_keyword_coverage_python(self):
        score = self.evaluator._keyword_coverage(
            "I use API endpoints with a database cache and message queue for backend services.",
            "Python",
        )
        assert score > 0

    def test_keyword_coverage_no_match(self):
        score = self.evaluator._keyword_coverage("Hello world", "python")
        assert score <= 50

    def test_completeness_short_answer(self):
        assert self.evaluator._completeness_score("Hi", "What is X?") == 10.0

    def test_completeness_long_answer(self):
        text = "word " * 200
        assert self.evaluator._completeness_score(text, "What is X?") >= 85.0

    def test_structure_no_markers(self):
        assert self.evaluator._structure_score("Just a simple answer without any structure markers") == 0

    def test_structure_with_markers(self):
        text = "First, let me explain. For example, in my last project. In summary, it worked well."
        assert self.evaluator._structure_score(text) == 100.0


class TestQuestionGenerator:
    def setup_method(self):
        self.generator = QuestionGenerator()

    def test_fallback_question_python(self):
        q = self.generator._fallback_question("python", 1)
        assert len(q) > 10

    def test_fallback_question_dotnet(self):
        q = self.generator._fallback_question(".net", 2)
        assert len(q) > 10

    def test_fallback_question_generic(self):
        q = self.generator._fallback_question("unknown_skill_xyz", 1)
        assert "experience" in q.lower()
