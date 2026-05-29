import uuid
import json
import socket
from datetime import datetime
from typing import Dict, Any, Optional, List
from services.agent.storage.schemas import AIConnectorConfig, AIApprovalDraft, AIAuditEvent, AIDeliveryLog
from services.agent.storage.repositories import (
    AIConnectorConfigRepository, AIAuditRepository, 
    AIApprovalDraftRepository, AIDeliveryLogRepository
)
from services.agent.schemas import BotRuntimeContext
from services.agent.actions.action_executor import get_action_executor
from services.agent.actions.validators import validate_connector_config

class ConnectorOnboardingService:
    def __init__(self):
        self.config_repo = AIConnectorConfigRepository()
        self.audit_repo = AIAuditRepository()
        self.approval_repo = AIApprovalDraftRepository()
        self.delivery_repo = AIDeliveryLogRepository()
        self.executor = get_action_executor()

    def create_connector_config(self, runtime: BotRuntimeContext, payload: Dict[str, Any]) -> AIConnectorConfig:
        """
        Create a new connector config in 'draft' state.
        Enforces tenant isolation by using runtime IDs.
        """
        config = AIConnectorConfig(
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            action_type=payload.get("action_type"),
            connector_type=payload.get("connector_type"),
            enabled=False, # Always starts disabled
            dry_run=True,  # Always starts in dry_run
            onboarding_status="draft",
            environment=payload.get("environment", "sandbox"),
            endpoint=payload.get("endpoint"),
            allowed_host=payload.get("allowed_host"),
            auth_type=payload.get("auth_type", "none"),
            secret_ref=payload.get("secret_ref"),
            timeout_seconds=payload.get("timeout_seconds", 10),
            max_retries=payload.get("max_retries", 2),
            rate_limit_per_minute=payload.get("rate_limit_per_minute", 30)
        )
        
        self.config_repo.save_config(config)
        self._log_audit(runtime, "onboarding_create", config.action_type, {"config_id": config.id, "status": "draft"})
        return config

    def validate_connector_precheck(self, runtime: BotRuntimeContext, config_id: str) -> Dict[str, Any]:
        """
        Run security and integrity checks before sandbox testing.
        """
        config = self._get_and_validate_scope(runtime, config_id)
        errors = []

        # 1. Basic validation
        try:
            validate_connector_config(config)
        except ValueError as e:
            errors.append(str(e))

        # 2. HTTPS enforcement for webhooks (except in localhost/sandbox if allowed)
        if config.connector_type == "webhook" and config.endpoint:
            if not config.endpoint.startswith("https://") and config.environment != "sandbox":
                errors.append("Production/Staging webhooks MUST use HTTPS.")

        # 3. Private IP check (SSRF)
        if config.connector_type == "webhook" and config.endpoint:
            try:
                host = config.endpoint.split("//")[-1].split("/")[0].split(":")[0]
                ip = socket.gethostbyname(host)
                if self._is_private_ip(ip):
                    errors.append(f"Endpoint resolves to private IP ({ip}). SSRF Protection blocked.")
            except Exception:
                errors.append("Invalid endpoint host or DNS resolution failed.")

        # 4. Auth check
        if config.auth_type != "none" and not config.secret_ref:
            errors.append(f"Auth type '{config.auth_type}' requires a secret_ref.")

        status = "validated" if not errors else "failed"
        self.config_repo.update_onboarding_status(config_id, status, {"errors": errors})
        self._log_audit(runtime, "onboarding_validate", config.action_type, {"status": status, "errors": errors})
        
        return {"status": status, "errors": errors}

    def run_connector_sandbox_test(self, runtime: BotRuntimeContext, config_id: str) -> Dict[str, Any]:
        """
        Execute a real test delivery (sandbox) to verify connectivity.
        """
        config = self._get_and_validate_scope(runtime, config_id)
        
        # 1. Create a test approval draft
        test_payload = {
            "test_mode": True, 
            "message": "MAESTA Sandbox Connectivity Test",
            "tenant_id": config.tenant_id,
            "site_id": config.site_id,
            "bot_id": config.bot_id,
            # Placeholders to satisfy specific validators
            "recipient_id": "sandbox", "recipient_type": "candidate",
            "job_draft_id": "sandbox",
            "candidate_id": "sandbox", "job_ids": ["sandbox"],
            "message_draft": "sandbox", "candidate_ids": ["sandbox"]
        }
        test_draft = AIApprovalDraft(
            tenant_id=config.tenant_id,
            site_id=config.site_id,
            bot_id=config.bot_id,
            action_type=config.action_type,
            status="approved",
            draft_payload=test_payload
        )
        self.approval_repo.save_approval_draft(test_draft)


        # 2. Execute via executor
        # We temporarily force dry_run=False for the test if it's a sandbox test, 
        # but only if we want to test REAL connectivity.
        # However, the task says 'sandbox_test_passed' state.
        
        # 2. Execute via executor
        result = self.executor.execute_approved_action(runtime, test_draft.id, f"test_key_{uuid.uuid4().hex[:8]}", force_test=True)
        
        status = "sandbox_test_passed" if result.status == "executed" else "failed"
        test_data = {
            "execution_status": result.status,
            "error": result.error,
            "delivery_log_id": getattr(result, 'delivery_log_id', None)
        }
        
        self.config_repo.update_onboarding_status(config_id, status, test_data)
        self._log_audit(runtime, "onboarding_sandbox_test", config.action_type, {"status": status, "result": test_data})
        
        return {
            "status": status,
            "message": "Sandbox test completed." if status == "sandbox_test_passed" else f"Sandbox test failed: {result.error}",
            "result": test_data
        }

    def enable_connector_for_tenant(self, runtime: BotRuntimeContext, config_id: str) -> Dict[str, Any]:
        """
        Enable the connector for staging/sandbox use. 
        Production activation is BLOCKED in this phase.
        """
        config = self._get_and_validate_scope(runtime, config_id)
        
        if config.onboarding_status != "sandbox_test_passed":
            return {"status": "failed", "error": "Cannot enable connector before passing sandbox test."}
        
        if config.environment == "production":
             return {"status": "failed", "error": "Production activation is not allowed in Phase 7.3 Pilot."}

        # Update to enabled
        config.enabled = True
        config.onboarding_status = "enabled_staging"
        config.dry_run = False # Move out of dry_run for staging
        self.config_repo.save_config(config)
        
        self._log_audit(runtime, "onboarding_enable", config.action_type, {"status": "enabled_staging"})
        return {"status": "success", "message": f"Connector for {config.action_type} enabled for staging."}

    def disable_connector_for_tenant(self, runtime: BotRuntimeContext, config_id: str) -> Dict[str, Any]:
        """
        Disable the connector.
        """
        config = self._get_and_validate_scope(runtime, config_id)
        self.config_repo.disable_connector(config.tenant_id, config.site_id, config.bot_id, config.action_type)
        return {"status": "success", "message": "Connector disabled."}

    def get_connector_health(self, runtime: BotRuntimeContext, config_id: str) -> Dict[str, Any]:
        """
        Aggregate delivery statistics for health report.
        """
        config = self._get_and_validate_scope(runtime, config_id)
        logs = self.delivery_repo.list_logs_for_bot(config.tenant_id, config.site_id, config.bot_id)
        
        # Filtering logs for this specific action type
        conn_logs = [l for l in logs if l.action_type == config.action_type]
        
        total = len(conn_logs)
        success_logs = [l for l in conn_logs if l.status == "sent"]
        failed_logs = [l for l in conn_logs if l.status == "failed"]
        
        return {
            "connector_id": config.id,
            "action_type": config.action_type,
            "total_executions": total,
            "success_count": len(success_logs),
            "failure_count": len(failed_logs),
            "last_success": success_logs[0].created_at if success_logs else None,
            "last_failure": failed_logs[0].created_at if failed_logs else None,
            "onboarding_status": config.onboarding_status,
            "current_enabled": config.enabled
        }

    def _get_and_validate_scope(self, runtime: BotRuntimeContext, config_id: str) -> AIConnectorConfig:
        config = self.config_repo.get_config_by_id(config_id)
        if not config:
            raise ValueError("Connector configuration not found.")
        
        # Strict scope check
        if config.tenant_id != runtime.tenant_id or config.site_id != runtime.site_id or config.bot_id != runtime.bot_id:
             self._log_audit(runtime, "access_denied", config.action_type, {"config_id": config_id, "reason": "cross_tenant_access"})
             raise PermissionError("Access Denied: Cross-tenant configuration access blocked.")
        
        return config

    def _is_private_ip(self, ip: str) -> bool:
        """Simple private IP check"""
        import ipaddress
        return ipaddress.ip_address(ip).is_private

    def _log_audit(self, runtime: BotRuntimeContext, event_type: str, action: str, details: Dict[str, Any]):
        event = AIAuditEvent(
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            session_id=runtime.session_id,
            event_type=f"onboarding_{event_type}",
            actor_type="admin",
            action=f"Onboarding: {action}",
            model_trace=details
        )
        self.audit_repo.append_event(event)
