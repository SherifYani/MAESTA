from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class StartInterviewRequest(BaseModel):
    candidate_id: str
    job_id: str
    tenant_id: str = "default_tenant"
    site_id: str = "default_site"
    bot_id: str = "default_bot"
    company_id: str = ""
    company_name: str = ""


class SubmitAnswerRequest(BaseModel):
    session_id: str
    answer: str
    question_id: str = ""


class InterviewStatusResponse(BaseModel):
    session_id: str
    status: str
    current_skill: str = ""
    total_skills: int = 0
    assessed_skills: int = 0
    progress_percent: float = 0.0
    current_question: Optional[Dict[str, Any]] = None
    message: str = ""


class InterviewReportResponse(BaseModel):
    session_id: str
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
    generated_at: str = ""


class InterviewHistoryItem(BaseModel):
    session_id: str
    candidate_id: str
    job_id: str
    status: str
    final_score: float = 0.0
    recommendation: str = ""
    created_at: str = ""
    completed_at: str = ""


class InterviewConfig(BaseModel):
    weights: Dict[str, float] = Field(default_factory=lambda: {
        "technical": 0.50, "experience": 0.20,
        "consistency": 0.20, "communication": 0.10,
    })
    thresholds: Dict[str, float] = Field(default_factory=lambda: {
        "strong_hire": 90, "hire": 80,
        "maybe": 65, "weak_hire": 50,
    })
    max_followups: int = 3
    questions_per_skill: int = 3
    llm_model: str = "qwen3:1.7b"
