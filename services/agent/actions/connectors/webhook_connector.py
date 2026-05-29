import config
from typing import Dict, Any, Optional
from urllib.parse import urlparse
import ipaddress
import socket
import logging
import hmac
import hashlib
import time
import os
import json
import requests  # type: ignore

logger = logging.getLogger(__name__)

class WebhookConnector:
    def execute(self, action_type: str, payload: Dict[str, Any], connector_config: Optional[Any] = None) -> Dict[str, Any]:
        """
        Hardened Webhook connector for Phase 7.2.
        Supports HMAC signing, Secret references, and Delivery logging.
        """
        # Security Gate 1: Global Enablement
        if not getattr(config, 'ENABLE_REAL_CONNECTORS', False):
            return {"status": "failed", "error": "Real connectors are globally disabled."}
            
        # Security Gate 2: Component Enablement
        if not getattr(config, 'ENABLE_WEBHOOK_CONNECTOR', False):
            return {"status": "failed", "error": "Webhook connector is disabled."}

        # Use config if provided, else fallback to payload (Phase 7.1 style)
        endpoint = (connector_config.endpoint if connector_config else None) or payload.get("webhook_url") or payload.get("endpoint")
        if not endpoint:
            return {"status": "failed", "error": "Missing webhook endpoint."}

        # 1. Protocol Enforcement (HTTPS Only)
        parsed_url = urlparse(endpoint)
        if parsed_url.scheme != "https" and getattr(config, 'FLASK_ENV', 'production') != "development":
             return {"status": "failed", "error": "Security violation: Webhooks must use HTTPS."}

        # 2. Host validation
        host = parsed_url.hostname
        if not host:
            return {"status": "failed", "error": "Invalid host in webhook URL."}

        # 3. Allowlist Enforcement
        allowed_hosts = getattr(config, 'ACTION_WEBHOOK_ALLOWED_HOSTS', [])
        config_allowed_host = connector_config.allowed_host if connector_config else None
        
        if config_allowed_host and host != config_allowed_host:
             return {"status": "failed", "error": f"Host '{host}' does not match allowed_host '{config_allowed_host}'."}
        
        if allowed_hosts and host not in allowed_hosts:
            return {"status": "failed", "error": f"Host '{host}' is not in the ACTION_WEBHOOK_ALLOWED_HOSTS."}

        # 4. SSRF Protection
        if getattr(config, 'FLASK_ENV', 'production') != "development":
            try:
                ip = socket.gethostbyname(host)
                addr = ipaddress.ip_address(ip)
                if addr.is_private or addr.is_loopback:
                     return {"status": "failed", "error": "SSRF Protection: Private/Loopback IPs are blocked."}
            except Exception as e:
                return {"status": "failed", "error": "Could not verify endpoint IP address security."}

        # 5. Authentication & Signing (Phase 7.2.1)
        current_time = int(time.time())
        headers = {
            "Content-Type": "application/json",
            "X-MAESTA-Action-Type": action_type,
            "X-MAESTA-Timestamp": str(current_time),
            "X-MAESTA-Tenant-ID": connector_config.tenant_id if connector_config else "unknown",
            "X-MAESTA-Bot-ID": connector_config.bot_id if connector_config else "unknown"
        }
        
        # 5.1 Timestamp Skew Check (Prevention of Replay Attacks)
        # In a real receiver, they would check this. Here, we ensure our outgoing 
        # timestamp is fresh and matches the signature.
        
        if connector_config:
            if connector_config.auth_type == "hmac":
                secret = self._get_secret(connector_config.secret_ref)
                if not secret:
                    return {"status": "failed", "error": "HMAC secret missing (secret_ref)."}
                
                signature = self._generate_signature(secret, headers["X-MAESTA-Timestamp"], payload)
                headers["X-MAESTA-Signature"] = signature
            
            elif connector_config.auth_type == "bearer":
                secret = self._get_secret(connector_config.secret_ref)
                if secret:
                    headers["Authorization"] = f"Bearer {secret}"
            
            elif connector_config.auth_type == "api_key":
                secret = self._get_secret(connector_config.secret_ref)
                if secret:
                    headers["X-API-Key"] = secret

        # 6. Real Execution (Staging/Sandbox/Dry-Run)
        if connector_config and connector_config.dry_run:
            return {
                "status": "executed",
                "external_reference": f"dry_run_{int(time.time())}",
                "message": "Webhook dry-run successful (no real request sent)."
            }

        # For Phase 7.2 Pilot, we only allow staging/sandbox env
        if connector_config and connector_config.environment == "production":
             # Still blocked unless we explicitly allow it in next phase
             return {"status": "failed", "error": "Production webhook environment is not yet enabled for pilot."}

        # Actual Request (Requests library)
        try:
            timeout = connector_config.timeout_seconds if connector_config else 10
            response = requests.post(endpoint, json=payload, headers=headers, timeout=timeout)
            
            # Mask sensitive parts of response if any
            return {
                "status": "executed" if response.status_code < 300 else "failed",
                "status_code": response.status_code,
                "external_reference": response.headers.get("X-External-ID"),
                "message": f"Webhook returned {response.status_code}",
                "error": response.text[:200] if response.status_code >= 300 else None
            }
        except Exception as e:
            return {"status": "failed", "error": f"Webhook connection error: {str(e)}"}

    def _get_secret(self, secret_ref: Optional[str]) -> Optional[str]:
        if not secret_ref: return None
        # First check Env Var
        val = os.environ.get(secret_ref)
        if val: return val
        # For Local Dev, we might have a mapping or just the ref is the secret (unsafe, but for tests)
        return None

    def _generate_signature(self, secret: str, timestamp: str, payload: Dict[str, Any]) -> str:
        payload_json = json.dumps(payload, sort_keys=True)
        message = f"{timestamp}.{payload_json}"
        signature = hmac.new(
            secret.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
