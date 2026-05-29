from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class ActionExecutionRequest(BaseModel):
    tenant_id: str
    site_id: str
    bot_id: str
    approval_id: str
    action_type: str
    payload: Dict[str, Any]
    requested_by: str
    idempotency_key: str

class ActionExecutionResult(BaseModel):
    action_type: str
    approval_id: str
    status: str # executed|failed|skipped
    external_reference: Optional[str] = None
    message: Optional[str] = None
    error: Optional[str] = None
    delivery_log_id: Optional[str] = None

class ActionConnectorConfig(BaseModel):
    tenant_id: str
    site_id: str
    bot_id: str
    action_type: str
    connector_type: str # internal|webhook|email|mock
    endpoint: Optional[str] = None
    auth_type: str = "none" # none|bearer|api_key
    enabled: bool = False
    requires_approval: bool = True
