from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class AIDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    source_type: str # document|faq|website|job|cv|company_profile|interview_report
    source_id: Optional[str] = None
    source_name: Optional[str] = None
    visibility: str = "public" # public|tenant_private|candidate_private|company_private|admin_only
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AIChunk(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    tenant_id: str
    site_id: str
    bot_id: str
    source_type: str
    source_id: Optional[str] = None
    chunk_text: str
    embedding_id: Optional[str] = None
    visibility: str = "public"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)

class AIMemory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    session_id: str
    user_id: Optional[str] = None
    memory_type: str # session_summary|user_preference|candidate_context|employer_context|temporary_task_state
    content: str
    visibility: str = "session" # session|user|bot|tenant
    ttl_seconds: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)
    expires_at: Optional[datetime] = None

class AICandidateProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    candidate_id: str
    session_id: Optional[str] = None
    profile: Dict[str, Any]
    source: str = "cv_upload" # cv_upload|manual|chat
    visibility: str = "candidate_private" # candidate_private|company_visible_after_application
    created_at: datetime = Field(default_factory=datetime.now)

class AIJobDraft(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    job_id: Optional[str] = None
    title: Optional[str] = None
    job_post: Dict[str, Any]
    status: str = "draft" # draft|pending_approval|approved|rejected
    created_by: str = "ai"
    created_at: datetime = Field(default_factory=datetime.now)

class AIApplicationDraft(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    candidate_id: str
    job_ids: List[str]
    cover_letter_draft: Optional[str] = None
    status: str = "draft" # draft|pending_approval|approved|rejected|submitted
    requires_approval: bool = True
    created_at: datetime = Field(default_factory=datetime.now)

class AIRankingRun(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    job_id: str
    ranked_candidates: List[Dict[str, Any]]
    limit: int = 10
    requires_human_review: bool = True
    created_at: datetime = Field(default_factory=datetime.now)

class AIAuditEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    session_id: Optional[str] = None
    event_type: str
    actor_type: str = "ai" # user|candidate|company|ai|backend
    action: str
    model_trace: Dict[str, Any] = Field(default_factory=dict)
    safety_flags: List[str] = Field(default_factory=list)
    approval_required: bool = False
    created_at: datetime = Field(default_factory=datetime.now)

class AIApprovalDraft(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    action_type: str
    draft_payload: Dict[str, Any]
    risk_level: str = "low"
    status: str = "draft" # draft|pending_backend_approval|approved|rejected|executing|executed|failed
    
    # Execution fields
    executed_at: Optional[datetime] = None
    executed_by: Optional[str] = None
    external_reference: Optional[str] = None
    error_message: Optional[str] = None
    idempotency_key: Optional[str] = None
    retry_count: int = 0
    
    created_at: datetime = Field(default_factory=datetime.now)

class AIConnectorConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    action_type: str
    connector_type: str # webhook|email|internal|mock
    enabled: bool = False
    environment: str = "sandbox" # sandbox|staging|production
    endpoint: Optional[str] = None
    allowed_host: Optional[str] = None
    auth_type: str = "none" # none|bearer|api_key|hmac
    secret_ref: Optional[str] = None
    timeout_seconds: int = 10
    max_retries: int = 2
    rate_limit_per_minute: int = 30
    dry_run: bool = True
    onboarding_status: str = "draft" # draft|validated|sandbox_test_passed|enabled_staging|disabled|failed
    last_test_result: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AIDeliveryLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    approval_id: str
    action_type: str
    connector_type: str
    status: str = "queued" # queued|sending|sent|failed|skipped
    attempt_count: int = 0
    external_reference: Optional[str] = None
    status_code: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class AIInterviewSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str
    site_id: str
    bot_id: str
    job_id: str
    candidate_id: str
    status: str = "draft" # draft|invited|consent_pending|in_progress|completed|cancelled|expired
    consent_status: str = "not_requested" # not_requested|accepted|declined
    interview_plan: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None

class AIInterviewMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    interview_id: str
    tenant_id: str
    site_id: str
    bot_id: str
    sender: str # ai|candidate
    message: str
    message_type: str = "question" # question|answer|follow_up|system
    created_at: datetime = Field(default_factory=datetime.now)

class AIInterviewReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    interview_id: str
    tenant_id: str
    site_id: str
    bot_id: str
    candidate_id: str
    job_id: str
    technical_score: int = 0
    communication_score: int = 0
    job_fit_score: int = 0
    strengths: List[str] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)
    salary_expectation: Optional[str] = None
    availability: Optional[str] = None
    candidate_questions: List[str] = Field(default_factory=list)
    relevant_quotes: List[Dict[str, Any]] = Field(default_factory=list)
    recommendation: str = "hold" # strong|good|hold|not_recommended
    summary_for_company: str = ""
    requires_human_review: bool = True
    full_transcript_revealed: bool = False

    created_at: datetime = Field(default_factory=datetime.now)
