from typing import Optional, List, Dict, Any, Tuple
from services.agent.schemas import BotRuntimeContext
from services.agent.storage.repositories import (
    AIJobDraftRepository, AIApplicationDraftRepository, 
    AIApprovalDraftRepository, AIAuditRepository
)
from services.agent.storage.schemas import AIAuditEvent
from .admin_guard import AdminGuard
import uuid
from datetime import datetime

class ApprovalConsoleService:
    def __init__(self):
        self.job_repo = AIJobDraftRepository()
        self.app_repo = AIApplicationDraftRepository()
        self.approval_repo = AIApprovalDraftRepository()
        self.audit_repo = AIAuditRepository()
        self.guard = AdminGuard()

    def list_pending_approvals(self, runtime: BotRuntimeContext, page: int = 1, page_size: int = 20) -> Tuple[List[Dict[str, Any]], int]:
        """List all items pending approval across jobs, applications, and general approvals"""
        # This is a bit complex since they are in different tables.
        # For simplicity in this phase, we'll list from the dedicated AIApprovalDraft table
        # or aggregate them. Let's use the list_* methods.
        
        if not self.guard.check_permission(runtime, "list", "approvals"):
            raise PermissionError("Access denied")

        drafts, total = self.approval_repo.list_approval_drafts(
            runtime.tenant_id, runtime.site_id, runtime.bot_id, 
            page=page, page_size=page_size, 
            filters={"status": "pending_backend_approval"}
        )
        
        # Log the view action
        self.guard.log_action(runtime, "list", "approvals", {"count": len(drafts)})
        
        return [d.dict() for d in drafts], total

    def get_approval_detail(self, runtime: BotRuntimeContext, approval_id: str) -> Dict[str, Any]:
        draft = self.approval_repo.get_approval_draft_by_id(approval_id)
        if not draft:
            raise ValueError("Approval not found")
        
        if not self.guard.check_permission(runtime, "view", "approval_detail", draft):
            raise PermissionError("Access denied")
        
        self.guard.log_action(runtime, "view", "approval_detail", {"id": approval_id})
        return draft.dict()

    def approve_draft(self, runtime: BotRuntimeContext, approval_id: str) -> bool:
        """Move status from pending_backend_approval to approved"""
        draft = self.approval_repo.get_approval_draft_by_id(approval_id)
        if not draft:
            raise ValueError("Approval not found")
        
        if not self.guard.check_permission(runtime, "approve", "draft", draft):
            raise PermissionError("Access denied")
        
        if draft.status != "pending_backend_approval":
            # Allow draft -> pending too if needed, but per rules:
            # draft -> pending_backend_approval -> approved
            if draft.status == "draft":
                self.approval_repo.update_status(approval_id, "pending_backend_approval")
                # Wait for next step
                return True
            raise ValueError(f"Cannot approve from status: {draft.status}")

        self.approval_repo.update_status(approval_id, "approved")
        
        # Log the action
        self.guard.log_action(runtime, "approve", "draft", {"id": approval_id, "type": draft.action_type})
        
        # NO EXTERNAL ACTIONS (email, webhook, etc.) - PER PHASE 6 RULES
        return True

    def reject_draft(self, runtime: BotRuntimeContext, approval_id: str, reason: str = "") -> bool:
        """Move status from pending_backend_approval to rejected"""
        draft = self.approval_repo.get_approval_draft_by_id(approval_id)
        if not draft:
            raise ValueError("Approval not found")
        
        if not self.guard.check_permission(runtime, "reject", "draft", draft):
            raise PermissionError("Access denied")
        
        if draft.status not in ["pending_backend_approval", "draft"]:
            raise ValueError(f"Cannot reject from status: {draft.status}")

        self.approval_repo.update_status(approval_id, "rejected")
        
        # Log the action
        self.guard.log_action(runtime, "reject", "draft", {"id": approval_id, "reason": reason})
        
        return True

    def update_to_pending(self, runtime: BotRuntimeContext, approval_id: str) -> bool:
        """Move status from draft to pending_backend_approval"""
        draft = self.approval_repo.get_approval_draft_by_id(approval_id)
        if not draft:
            raise ValueError("Approval not found")
        
        if draft.status != "draft":
            raise ValueError(f"Only 'draft' can move to 'pending_backend_approval'. Current: {draft.status}")
            
        self.approval_repo.update_status(approval_id, "pending_backend_approval")
        self.guard.log_action(runtime, "status_update", "draft", {"id": approval_id, "to": "pending_backend_approval"})
        return True
