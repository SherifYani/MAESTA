"""
Unit tests for interview schemas and models.
"""
from services.interview.schemas.interview_models import (
    InterviewSessionModel, InterviewQuestionModel, InterviewAnswerModel,
    SkillAssessmentModel, ConsistencyAnalysisModel, InterviewReportModel,
    SkillInfo, QuestionRequest, AnswerEvaluation, FollowUpDecision,
)
from services.interview.schemas.dto import (
    StartInterviewRequest, SubmitAnswerRequest,
    InterviewStatusResponse, InterviewReportResponse,
)


class TestInterviewModels:
    def test_skill_info_defaults(self):
        s = SkillInfo(name="Python")
        assert s.name == "Python"
        assert s.category == "technical"
        assert s.claimed_level == 0.0
        assert s.priority_score == 0.0

    def test_question_request_defaults(self):
        q = QuestionRequest(skill="Python")
        assert q.skill == "Python"
        assert q.difficulty_level == 1
        assert q.question_type == "technical"
        assert q.previous_answers == []

    def test_answer_evaluation_defaults(self):
        e = AnswerEvaluation()
        assert e.score == 0.0
        assert e.strengths == []
        assert e.weaknesses == []
        assert e.missing_concepts == []
        assert e.confidence == 0.0

    def test_follow_up_decision(self):
        d = FollowUpDecision(needs_followup=True, followup_count=1, reason="Weak answer")
        assert d.needs_followup is True
        assert d.followup_count == 1
        assert d.new_difficulty == 1

    def test_interview_session_model(self):
        s = InterviewSessionModel(candidate_id="cand_1", job_id="job_1")
        assert s.candidate_id == "cand_1"
        assert s.job_id == "job_1"
        assert s.status == "pending"
        assert s.id is not None

    def test_interview_question_model(self):
        q = InterviewQuestionModel(session_id="sess_1", skill="Python", question="What is a decorator?")
        assert q.session_id == "sess_1"
        assert q.skill == "Python"
        assert q.question == "What is a decorator?"
        assert q.is_followup is False

    def test_interview_answer_model(self):
        a = InterviewAnswerModel(question_id="q_1", session_id="sess_1", candidate_answer="A decorator modifies a function.")
        assert a.question_id == "q_1"
        assert a.candidate_answer == "A decorator modifies a function."
        assert a.score == 0.0

    def test_skill_assessment_model(self):
        sa = SkillAssessmentModel(session_id="sess_1", skill="Python", verified_level=75.0)
        assert sa.skill == "Python"
        assert sa.verified_level == 75.0
        assert sa.confidence == 0.0

    def test_consistency_analysis_model(self):
        ca = ConsistencyAnalysisModel(session_id="sess_1", consistency_score=85.0)
        assert ca.consistency_score == 85.0
        assert ca.trust_gaps == []

    def test_interview_report_model(self):
        r = InterviewReportModel(session_id="sess_1", final_score=82.5, recommendation="Hire")
        assert r.final_score == 82.5
        assert r.recommendation == "Hire"
        assert r.strengths == []


class TestInterviewDTOs:
    def test_start_interview_request(self):
        req = StartInterviewRequest(candidate_id="cand_1", job_id="job_1")
        assert req.candidate_id == "cand_1"
        assert req.job_id == "job_1"
        assert req.tenant_id == "default_tenant"

    def test_submit_answer_request(self):
        req = SubmitAnswerRequest(session_id="sess_1", answer="My answer")
        assert req.session_id == "sess_1"
        assert req.answer == "My answer"

    def test_interview_status_response_defaults(self):
        resp = InterviewStatusResponse(session_id="sess_1", status="in_progress")
        assert resp.session_id == "sess_1"
        assert resp.status == "in_progress"
        assert resp.progress_percent == 0.0

    def test_interview_report_response_defaults(self):
        resp = InterviewReportResponse(session_id="sess_1", final_score=90.0, recommendation="Strong Hire")
        assert resp.final_score == 90.0
        assert resp.recommendation == "Strong Hire"
        assert resp.strengths == []
