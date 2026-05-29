from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class InterviewSession(BaseModel):
    interview_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    job_id: str
    candidate_id: str
    status: str = "draft" # draft|invited|consent_pending|in_progress|completed|cancelled|expired
    consent_status: str = "not_requested" # not_requested|accepted|declined
    created_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class InterviewPlanSection(BaseModel):
    section_name: str # technical|experience|behavioral|salary_expectation|availability
    questions: List[str]

class InterviewPlan(BaseModel):
    interview_id: str
    job_id: str
    candidate_id: str
    sections: List[InterviewPlanSection]
    estimated_minutes: int = 15

class InterviewMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    interview_id: str
    tenant_id: str
    site_id: str
    bot_id: str
    sender: str # ai|candidate
    message: str
    message_type: str = "question" # question|answer|follow_up|system
    created_at: datetime = Field(default_factory=datetime.now)

class InterviewReport(BaseModel):
    interview_id: str
    candidate_id: str
    job_id: str
    technical_score: int = Field(0, ge=0, le=100)
    communication_score: int = Field(0, ge=0, le=100)
    job_fit_score: int = Field(0, ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)
    salary_expectation: Optional[str] = None
    availability: Optional[str] = None
    candidate_questions: List[str] = Field(default_factory=list)
    relevant_quotes: List[Dict[str, Any]] = Field(default_factory=list) # {"text": "", "context": ""}
    recommendation: str = "hold" # strong|good|hold|not_recommended
    summary_for_company: str = ""
    requires_human_review: bool = True
