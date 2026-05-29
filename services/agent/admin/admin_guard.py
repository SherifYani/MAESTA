from typing import Any, List, Optional, Dict
from services.agent.schemas import BotRuntimeContext
from services.agent.storage.repositories import AIAuditRepository
from services.agent.storage.schemas import AIAuditEvent
from datetime import datetime
import uuid

# Roles defined by user
# super_admin, tenant_admin, company_admin, recruiter, candidate, viewer

class AdminGuard:
    def __init__(self):
        self.audit_repo = AIAuditRepository()

    def check_permission(self, runtime: BotRuntimeContext, action: str, target_resource: str, resource_data: Optional[Any] = None) -> bool:
        """
        Check if the current runtime context has permission to perform an action on a resource.
        Fail-Closed: If role is unknown or context is missing, reject.
        """
        try:
            # 1. Basic validation
            if not runtime or not runtime.user_role:
                self._log_access_denied(runtime, action, target_resource, "Missing role or runtime")
                return False

            # 2. Tenant/Site/Bot Isolation
            if resource_data:
                res_tenant = getattr(resource_data, "tenant_id", None) or resource_data.get("tenant_id")
                res_site = getattr(resource_data, "site_id", None) or resource_data.get("site_id")
                res_bot = getattr(resource_data, "bot_id", None) or resource_data.get("bot_id")
                
                # super_admin might bypass tenant check if needed, but per requirements:
                # "لو tenant/site/bot مختلف، ارفض وسجل access_denied"
                if runtime.user_role != "super_admin":
                    if res_tenant != runtime.tenant_id or res_site != runtime.site_id or res_bot != runtime.bot_id:
                        self._log_access_denied(runtime, action, target_resource, f"Tenant mismatch: {res_tenant} != {runtime.tenant_id}")
                        return False

            # 3. RBAC Rules
            role = runtime.user_role
            
            if role == "super_admin":
                return True
            
            if role == "tenant_admin":
                # Can do everything within their tenant
                return True
            
            if role == "company_admin":
                # Similar to tenant_admin for now, or limited to specific company resources
                # In this system, tenant/site/bot is the primary isolation
                return True

            if role == "recruiter":
                # Allowed actions for recruiter
                allowed = ["list", "view", "approve", "reject", "reveal_sensitive"]
                if action in allowed:
                    return True
                
            if role == "viewer":
                # Read-only
                allowed = ["list", "view"]
                if action in allowed:
                    return True
                
            if role == "candidate":
                # Very limited
                if action == "view" and target_resource == "candidate_profile":
                    # Only own profile (assuming user_id matches candidate_id or handled elsewhere)
                    return True
                # Cannot see ranking runs
                if target_resource == "ranking_run":
                    self._log_access_denied(runtime, action, target_resource, "Candidate cannot see ranking runs")
                    return False
            
            # Unknown role or action
            self._log_access_denied(runtime, action, target_resource, f"Action '{action}' not allowed for role '{role}'")
            return False

        except Exception as e:
            # Log unexpected errors as denied
            self._log_access_denied(runtime, action, target_resource, f"Error in guard: {str(e)}")
            return False

    def _log_access_denied(self, runtime: BotRuntimeContext, action: str, target_resource: str, reason: str):
        event = AIAuditEvent(
            id=str(uuid.uuid4()),
            tenant_id=runtime.tenant_id if runtime else "unknown",
            site_id=runtime.site_id if runtime else "unknown",
            bot_id=runtime.bot_id if runtime else "unknown",
            session_id=runtime.session_id if runtime else None,
            event_type="access_denied",
            actor_type="user",
            action=f"{action} on {target_resource}",
            model_trace={"reason": reason},
            created_at=datetime.now()
        )
        self.audit_repo.append_event(event)

    def log_action(self, runtime: BotRuntimeContext, action: str, target_resource: str, details: Optional[Dict[str, Any]] = None):
        """Log a successful admin action"""
        event = AIAuditEvent(
            id=str(uuid.uuid4()),
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            session_id=runtime.session_id,
            event_type="admin_action",
            actor_type="user",
            action=f"{action} on {target_resource}",
            model_trace=details or {},
            created_at=datetime.now()
        )
        self.audit_repo.append_event(event)
