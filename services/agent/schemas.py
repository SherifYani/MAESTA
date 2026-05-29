from pydantic import BaseModel, Field
from typing import List, Dict, Any

class BotRuntimeContext(BaseModel):
    tenant_id: str
    site_id: str
    bot_id: str
    api_key_id: str
    session_id: str
    user_id: str
    user_role: str  # "visitor", "candidate", "company", "admin"
    enabled_modules: List[str]
    language: str
    allowed_actions: List[str]
    company_name: str = ""

class AIRequest(BaseModel):
    runtime: BotRuntimeContext
    message: str
    conversation_history: List[Dict[str, str]]
    attachments: List[Dict[str, Any]]
    metadata: Dict[str, Any]

class AIResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    suggested_actions: List[Dict[str, Any]]
    requires_approval: bool
    safety_flags: List[str]
    model_trace: Dict[str, str]
    structured_data: Dict[str, Any] = Field(default_factory=dict)

class DocumentChunk(BaseModel):
    tenant_id: str
    site_id: str
    bot_id: str
    source_type: str
    source_name: str
    visibility: str
    chunk_id: str
