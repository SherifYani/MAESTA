from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
import uuid


class SkillInfo(BaseModel):
    name: str
    category: str = "technical"
    claimed_level: float = 0.0
    jd_importance: float = 0.5
    priority_score: float = 0.0
    ats_similarity: float = 0.0


class QuestionRequest(BaseModel):
    skill: str
    difficulty_level: int = 1
    question_type: str = "technical"
    context: str = ""
    previous_answers: List[str] = Field(default_factory=list)
    language: str = "ar"


class AnswerEvaluation(BaseModel):
    score: float = 0.0
    semantic_score: float = 0.0
    coverage_score: float = 0.0
    accuracy_score: float = 0.0
    completeness_score: float = 0.0
    confidence: float = 0.0
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_concepts: List[str] = Field(default_factory=list)
    explanation: str = ""


class FollowUpDecision(BaseModel):
    needs_followup: bool = False
    followup_count: int = 0
    reason: str = ""
    new_difficulty: int = 1


class FinalScore(BaseModel):
    technical_score: float = 0.0
    experience_score: float = 0.0
    consistency_score: float = 0.0
    communication_score: float = 0.0
    trust_score: float = 0.0
    final_score: float = 0.0
    cv_match: float = 0.0


class HiringRecommendation(BaseModel):
    recommendation: Literal["Strong Hire", "Hire", "Maybe", "Weak Hire", "Reject"] = "Maybe"
    final_score: float = 0.0
    reasoning: str = ""


class InterviewSessionModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_id: str = ""
    job_id: str = ""
    company_id: str = ""
    tenant_id: str = ""
    site_id: str = ""
    bot_id: str = ""
    status: str = "pending"
    current_skill: str = ""
    matched_skills: List[SkillInfo] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    skill_scores: Dict[str, float] = Field(default_factory=dict)
    confidence_scores: Dict[str, float] = Field(default_factory=dict)
    technical_score: float = 0.0
    experience_score: float = 0.0
    communication_score: float = 0.0
    consistency_score: float = 0.0
    trust_score: float = 0.0
    final_score: float = 0.0
    cv_match: float = 0.0
    recommendation: str = ""
    report_json: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class InterviewQuestionModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = ""
    skill: str = ""
    skill_index: int = 0
    question: str = ""
    question_type: str = "technical"
    difficulty_level: int = 1
    is_followup: bool = False
    followup_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class InterviewAnswerModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_id: str = ""
    session_id: str = ""
    candidate_answer: str = ""
    score: float = 0.0
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_concepts: List[str] = Field(default_factory=list)
    semantic_score: float = 0.0
    coverage_score: float = 0.0
    accuracy_score: float = 0.0
    completeness_score: float = 0.0
    confidence: float = 0.0
    evaluated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class SkillAssessmentModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = ""
    skill: str = ""
    claimed_level: float = 0.0
    verified_level: float = 0.0
    confidence: float = 0.0
    questions_asked: int = 0
    average_score: float = 0.0
    evidence: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class ConsistencyAnalysisModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = ""
    trust_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    consistency_score: float = 0.0
    trust_score: float = 0.0
    risk_flags: List[str] = Field(default_factory=list)
    evidence: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class InterviewReportModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = ""
    candidate_name: str = ""
    job_title: str = ""
    cv_match: float = 0.0
    technical_score: float = 0.0
    experience_score: float = 0.0
    consistency_score: float = 0.0
    communication_score: float = 0.0
    trust_score: float = 0.0
    final_score: float = 0.0
    recommendation: str = ""
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    skill_breakdown: List[Dict[str, Any]] = Field(default_factory=list)
    trust_analysis: Dict[str, Any] = Field(default_factory=dict)
    evidence: Dict[str, Any] = Field(default_factory=dict)
    recommended_actions: List[str] = Field(default_factory=list)
    report_text: str = ""
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
