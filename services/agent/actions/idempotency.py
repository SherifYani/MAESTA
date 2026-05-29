from typing import Dict, Any, Optional
from services.agent.storage.repositories import AIApprovalDraftRepository
import config

class IdempotencyManager:
    def __init__(self, repo: AIApprovalDraftRepository):
        self.repo = repo

    def check_idempotency(self, approval_id: str, idempotency_key: str) -> Optional[Dict[str, Any]]:
        """
        Hardened Idempotency check.
        Prevents duplicate executions and manages retries for failed actions.
        """
        draft = self.repo.get_approval_draft_by_id(approval_id)
        if not draft:
            return {"status": "failed", "error": "Approval draft not found"}

        # 1. Success blocking
        if draft.status == "executed":
            return {
                "status": "skipped",
                "message": "Action already executed successfully.",
                "external_reference": draft.external_reference
            }
        
        # 2. In-progress blocking (Concurrency protection)
        if draft.status == "executing":
            return {
                "status": "skipped",
                "message": "Action is currently being executed. Duplicate request ignored."
            }

        # 3. Idempotency Key mismatch protection
        # Skip this check for retries — a new key is expected on each retry
        if draft.idempotency_key and draft.idempotency_key != idempotency_key:
            if draft.status != "failed":  # Only enforce on non-retry attempts
                return {
                    "status": "failed",
                    "error": "Idempotency key mismatch. Execution denied for safety."
                }

        # 4. Retry Logic for 'failed' status
        if draft.status == "failed":
            # Check if payload explicitly allows retry (default to false for safety)
            retry_allowed = draft.draft_payload.get("retry_allowed", False)
            if not retry_allowed:
                return {
                    "status": "failed",
                    "error": "Action failed previously and retry is not allowed for this action."
                }
            
            # Check global retry limit
            max_retries = getattr(config, 'ACTION_CONNECTOR_MAX_RETRIES', 2)
            if draft.retry_count >= max_retries:
                 return {
                    "status": "failed",
                    "error": f"Maximum retry limit reached ({max_retries})."
                }

        return None
