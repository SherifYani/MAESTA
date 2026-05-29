import config
from datetime import datetime
from typing import Dict, Any, Optional
import json
import re
import logging
from services.agent.schemas import BotRuntimeContext
from services.agent.storage.repositories import (
    AIApprovalDraftRepository, AIAuditRepository,
    AIConnectorConfigRepository, AIDeliveryLogRepository
)
from services.agent.storage.schemas import AIAuditEvent, AIDeliveryLog
from .schemas import ActionExecutionRequest, ActionExecutionResult
from .connector_registry import registry
from .validators import validate_action_payload
from .idempotency import IdempotencyManager
from .connectors.mock_connector import MockConnector

logger = logging.getLogger(__name__)

# Sensitive patterns to mask in logs/audit
SECRET_PATTERNS = [
    r'bearer\s+[a-zA-Z0-9\._\-]+',
    r'api_key=["\'][a-zA-Z0-9\._\-]+["\']',
    r'password=["\'][^"\']+["\']',
    r'token=["\'][^"\']+["\']'
]

class ActionExecutor:
    def __init__(self, approval_repo: AIApprovalDraftRepository, audit_repo: AIAuditRepository, 
                 config_repo: AIConnectorConfigRepository, delivery_repo: AIDeliveryLogRepository):
        self.approval_repo = approval_repo
        self.audit_repo = audit_repo
        self.config_repo = config_repo
        self.delivery_repo = delivery_repo
        self.idempotency = IdempotencyManager(approval_repo)

    def execute_approved_action(self, runtime: BotRuntimeContext, approval_id: str, idempotency_key: str, force_test: bool = False) -> ActionExecutionResult:
        """
        Controlled pilot execution engine for Phase 7.2.
        Manages per-tenant config, delivery logs, security gates, and auditing.
        Force Test: Allows execution even if disabled (used for Onboarding Sandbox).
        """
        # 1. Load draft
        draft = self.approval_repo.get_approval_draft_by_id(approval_id)
        if not draft:
            return ActionExecutionResult(action_type="unknown", approval_id=approval_id, status="failed", error="Draft not found")

        # 1b. Validate Payload (Phase 9 Hardening)
        try:
            validate_action_payload(draft.action_type, draft.draft_payload)
        except ValueError as ve:
            error_msg = f"Payload Validation Error: {str(ve)}"
            self.approval_repo.update_execution_status(approval_id, "failed", error=error_msg, executed_by=runtime.user_id)
            return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error=error_msg)

        # 2. Check Idempotency
        idem_result = self.idempotency.check_idempotency(approval_id, idempotency_key)
        if idem_result:
            return ActionExecutionResult(
                action_type=draft.action_type,
                approval_id=approval_id,
                status=idem_result["status"],
                external_reference=idem_result.get("external_reference"),
                message=idem_result.get("message"),
                error=idem_result.get("error")
            )

        # 3. Security Check: Tenant Isolation & RBAC
        if draft.tenant_id != runtime.tenant_id or draft.site_id != runtime.site_id:
            return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error="Access Denied: Tenant mismatch.")

        if runtime.user_role in ["viewer", "candidate"]:
            return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error="RBAC: Unauthorized role.")

        # 4. Status Check
        if draft.status not in ["approved", "failed"]:
            return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error=f"Invalid status: {draft.status}")

        # 5. Load Connector Config (Phase 7.2.1 Hardening)
        # Fail-closed: We REQUIRE a DB config now. No legacy memory-based fallback.
        connector_config = self.config_repo.get_config(draft.action_type, draft.tenant_id, draft.site_id, draft.bot_id)
        
        if not connector_config or (not connector_config.enabled and not force_test):
            error_msg = f"Action Type '{draft.action_type}' not configured or disabled in DB for this tenant."
            self.approval_repo.update_execution_status(approval_id, "failed", error=error_msg, executed_by=runtime.user_id)
            return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error=error_msg)

        # 6. Get Connector Implementation
        connector = registry.get_connector_by_type(connector_config.connector_type)
            
        if not connector:
            error_msg = f"Connector implementation '{connector_config.connector_type}' not found in registry."
            self.approval_repo.update_execution_status(approval_id, "failed", error=error_msg, executed_by=runtime.user_id)
            return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error=error_msg)

        # Security Gate: Mock is always allowed in dev/test, others check global flag
        is_mock = connector.__class__.__name__ == "MockConnector"
        if not is_mock and not getattr(config, 'ENABLE_REAL_CONNECTORS', False):
            return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error="Security: Real connectors are globally disabled.")

        # 7. Create Delivery Log Record
        delivery_log = AIDeliveryLog(
            tenant_id=draft.tenant_id,
            site_id=draft.site_id,
            bot_id=draft.bot_id,
            approval_id=approval_id,
            action_type=draft.action_type,
            connector_type=connector_config.connector_type if connector_config else connector.__class__.__name__.lower().replace("connector", ""),
            status="sending"
        )
        self.delivery_repo.create_log(delivery_log)

        # 8. Update Draft Status
        status_before = draft.status
        is_retry = (status_before == "failed")
        if is_retry:
            max_retries = connector_config.max_retries if connector_config else getattr(config, 'ACTION_CONNECTOR_MAX_RETRIES', 2)
            if draft.retry_count >= max_retries:
                error_msg = f"Max retry count ({max_retries}) reached for this action."
                self.approval_repo.update_execution_status(approval_id, "failed", error=error_msg, executed_by=runtime.user_id)
                return ActionExecutionResult(action_type=draft.action_type, approval_id=approval_id, status="failed", error=error_msg)
            self.approval_repo.increment_retry_count(approval_id)
        self.approval_repo.update_execution_status(approval_id, "executing", executed_by=runtime.user_id)

        self._log_audit(runtime, "execution_started", f"Pilot Execution: {draft.action_type}", {
            "approval_id": approval_id,
            "connector": delivery_log.connector_type,
            "environment": connector_config.environment if connector_config else "default",
            "payload": draft.draft_payload # _log_audit will mask it
        })

        # 9. Call Connector with config
        try:
            result = connector.execute(draft.action_type, draft.draft_payload, connector_config=connector_config)
            
            final_status = "sent" if result.get("status") == "executed" else "failed"
            
            # Update Delivery Log with Masked Error
            masked_error = self._mask_secrets(result.get("error")) if result.get("error") else None
            
            self.delivery_repo.update_log(
                delivery_log.id, 
                status=final_status,
                external_ref=result.get("external_reference"),
                status_code=result.get("status_code"),
                error=masked_error
            )

            # Update Approval Draft
            if final_status == "sent":
                self.approval_repo.update_execution_status(
                    approval_id, "executed", 
                    external_ref=result.get("external_reference"),
                    executed_by=runtime.user_id
                )
                return ActionExecutionResult(
                    action_type=draft.action_type,
                    approval_id=approval_id,
                    status="executed",
                    external_reference=result.get("external_reference"),
                    message=self._mask_secrets(result.get("message")),
                    delivery_log_id=delivery_log.id
                )
            else:
                error_msg = masked_error or "Connector failure"
                self.approval_repo.update_execution_status(approval_id, "failed", error=error_msg, executed_by=runtime.user_id)
                return ActionExecutionResult(
                    action_type=draft.action_type, 
                    approval_id=approval_id, 
                    status="failed", 
                    error=error_msg,
                    delivery_log_id=delivery_log.id
                )

        except Exception as e:
            error_msg = f"Pilot System Error: {str(e)}"
            if 'delivery_log' in locals():
                self.delivery_repo.update_log(delivery_log.id, status="failed", error=error_msg)
            self.approval_repo.update_execution_status(approval_id, "failed", error=error_msg, executed_by=runtime.user_id)
            return ActionExecutionResult(
                action_type=draft.action_type, 
                approval_id=approval_id, 
                status="failed", 
                error=error_msg,
                delivery_log_id=delivery_log.id if 'delivery_log' in locals() else None
            )

    def _log_audit(self, runtime: BotRuntimeContext, event_type: str, action: str, details: Dict[str, Any]):
        try:
            safe_details = self._mask_secrets(details)
            # Force string conversion for SQLite binding safety in tests
            event = AIAuditEvent(
                tenant_id=str(runtime.tenant_id), 
                site_id=str(runtime.site_id), 
                bot_id=str(runtime.bot_id),
                session_id=str(runtime.session_id), 
                event_type=f"action_{event_type}",
                actor_type="admin", 
                action=action, 
                model_trace=safe_details
            )
            self.audit_repo.append_event(event)
        except Exception as e:
            # Re-raise to allow the execution try-block to handle if necessary, 
            # though _log_audit is usually outside it.
            raise e

    def _mask_secrets(self, data: Any) -> Any:
        SENSITIVE_KEYS = {"api_key", "token", "password", "secret", "authorization", "bearer"}
        if isinstance(data, dict):
            result = {}
            for k, v in data.items():
                if k.lower() in SENSITIVE_KEYS:
                    result[k] = "********"
                else:
                    result[k] = self._mask_secrets(v)
            return result
        if isinstance(data, list):
            return [self._mask_secrets(item) for item in data]
        if isinstance(data, str):
            masked = data
            for pattern in SECRET_PATTERNS:
                masked = re.sub(pattern, lambda m: m.group(0).split('=')[0] + '="********"' if '=' in m.group(0) else 'Bearer ********', masked, flags=re.IGNORECASE)
            return masked
        return data

def get_action_executor():
    return ActionExecutor(
        AIApprovalDraftRepository(), 
        AIAuditRepository(),
        AIConnectorConfigRepository(),
        AIDeliveryLogRepository()
    )
