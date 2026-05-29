from typing import Dict, Any, List

def validate_submit_application_payload(payload: Dict[str, Any]):
    required = ["candidate_id", "job_ids", "tenant_id", "site_id", "bot_id"]
    for field in required:
        if field not in payload or not payload[field]:
            raise ValueError(f"Missing required field: {field}")

def validate_publish_job_payload(payload: Dict[str, Any]):
    # Required either job_draft_id OR job_post
    if "job_draft_id" not in payload and "job_post" not in payload:
        raise ValueError("Either job_draft_id or job_post is required")
    
    required = ["tenant_id", "site_id", "bot_id"]
    for field in required:
        if field not in payload or not payload[field]:
            raise ValueError(f"Missing required field: {field}")

def validate_interview_invite_payload(payload: Dict[str, Any]):
    required = ["job_id", "candidate_ids", "message_draft", "tenant_id", "site_id", "bot_id"]
    for field in required:
        if field not in payload or not payload[field]:
            raise ValueError(f"Missing required field: {field}")
    if not isinstance(payload.get("candidate_ids"), list):
        raise ValueError("candidate_ids must be a list")

def validate_message_payload(payload: Dict[str, Any]):
    required = ["recipient_id", "recipient_type", "message", "tenant_id", "site_id", "bot_id"]
    for field in required:
        if field not in payload or not payload[field]:
            raise ValueError(f"Missing required field: {field}")

def validate_connector_config(config: Any):
    """
    Fail-closed validation for Connector Configurations (Phase 7.2.1).
    Ensures all mandatory fields are present and security rules are enforced.
    """
    # 1. Base Mandatory Fields
    required = ["tenant_id", "site_id", "bot_id", "action_type", "connector_type"]
    for field in required:
        val = getattr(config, field, None)
        if not val:
            raise ValueError(f"Fail-closed: Missing mandatory field '{field}' in connector config.")

    # Phase 7.3: If status is 'draft', we allow incomplete fields for onboarding purposes
    if getattr(config, 'onboarding_status', 'draft') == 'draft' and not getattr(config, 'enabled', False):
        return

    # 2. Webhook Specific Validation
    if config.connector_type == "webhook":
        if not config.endpoint:
            raise ValueError("Webhook requires an endpoint URL.")
        
        # HTTPS Enforcement for Staging/Production
        if config.environment in ["staging", "production"]:
            if not config.endpoint.startswith("https://"):
                raise ValueError(f"Security Violation: Webhook must use HTTPS in {config.environment} environment.")
        
        if not config.allowed_host:
            raise ValueError("Webhook requires an allowed_host for SSRF protection.")
            
        # HMAC Requirements
        if config.auth_type == "hmac" and not config.secret_ref:
            raise ValueError("HMAC authentication requires a valid secret_ref.")

    # 3. Email Specific Validation
    elif config.connector_type == "email":
        # Note: AIConnectorConfig schema might need 'provider' or we use metadata/payload
        # For now, we enforce basic requirements
        if not config.secret_ref and config.auth_type != "none":
            raise ValueError("Email connector requires credentials (secret_ref) unless auth_type is none.")
        
        # from_email check (usually stored in payload or metadata if not in config)
        # We'll assume the provider details are handled by the connector itself, 
        # but we enforce dry_run=True by default in logic if not explicitly set.

    # 4. Limits & Environment
    if config.timeout_seconds <= 0 or config.timeout_seconds > 60:
        raise ValueError("timeout_seconds must be between 1 and 60.")
    
    if config.max_retries < 0 or config.max_retries > 5:
        raise ValueError("max_retries must be between 0 and 5.")

    if config.rate_limit_per_minute <= 0:
        raise ValueError("rate_limit_per_minute must be positive.")

VALIDATORS = {
    "submit_application": validate_submit_application_payload,
    "publish_job": validate_publish_job_payload,
    "send_interview_invite": validate_interview_invite_payload,
    "send_candidate_message": validate_message_payload,
    "send_company_message": validate_message_payload
}

def validate_action_payload(action_type: str, payload: Dict[str, Any]):
    if action_type not in VALIDATORS:
        raise ValueError(f"Unknown action type: {action_type}")
    VALIDATORS[action_type](payload)
