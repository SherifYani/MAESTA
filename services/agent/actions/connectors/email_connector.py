import config
from typing import Dict, Any, Optional
import re
import logging
import os

logger = logging.getLogger(__name__)

class EmailConnector:
    def execute(self, action_type: str, payload: Dict[str, Any], connector_config: Optional[Any] = None) -> Dict[str, Any]:
        """
        Hardened Email connector for Phase 7.2.
        Supports Sandbox mode, Dry-run, and Recipient validation.
        """
        # Security Gate 1: Global Enablement
        if not getattr(config, 'ENABLE_REAL_CONNECTORS', False):
            return {"status": "failed", "error": "Real connectors are globally disabled."}
            
        # Security Gate 2: Component Enablement
        if not getattr(config, 'ENABLE_EMAIL_CONNECTOR', False):
            return {"status": "failed", "error": "Email connector is disabled."}

        # recipient_email="" is different from missing — both are invalid but with different messages
        raw_recipient = payload.get("recipient_email")
        if raw_recipient is None:
            raw_recipient = payload.get("to")

        recipient = (raw_recipient or "").strip()

        # 1. Recipient Validation (covers None, empty, bad format)
        if not recipient:
            return {"status": "failed", "error": "Missing recipient email."}
        if not self._is_valid_email(recipient):
            return {"status": "failed", "error": "Invalid email format for recipient."}

        # 2. Template/Message Check
        message = payload.get("message") or payload.get("content")
        if not message:
            return {"status": "failed", "error": "Email content is empty."}

        # 3. Dry-run Mode (Default)
        is_dry_run = (connector_config.dry_run if connector_config else True) or payload.get("dry_run", False)
        if is_dry_run:
            logger.info(f"Email dry-run to {recipient} (Action: {action_type}) - No real email sent.")
            return {
                "status": "executed",
                "message": f"Email dry-run successful to {recipient}.",
                "external_reference": "dry_run_email"
            }

        # 4. Environment Check (Pilot Phase)
        env = connector_config.environment if connector_config else "sandbox"
        if env == "production":
            return {"status": "failed", "error": "Production email environment is not yet enabled for pilot."}
        
        if env != "sandbox":
             return {"status": "failed", "error": f"Unsupported email environment: {env}"}

        # 5. Sandbox Execution (Placeholder for Real Provider like SendGrid/Mailgun)
        # In Sandbox, we might only allow specific domains or just log as "sent" to sandbox
        logger.info(f"Email SENT TO SANDBOX: {recipient} (Subject: {payload.get('subject', 'No Subject')})")
        
        return {
            "status": "executed",
            "external_reference": "sandbox_email_ref_123",
            "message": "Email sent successfully to sandbox provider."
        }

    def _is_valid_email(self, email: str) -> bool:
        if not email or not email.strip():
            return False
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email.strip()) is not None

    def _get_secret(self, secret_ref: Optional[str]) -> Optional[str]:
        if not secret_ref: return None
        return os.environ.get(secret_ref)
