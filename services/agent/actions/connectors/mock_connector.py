import uuid
from typing import Dict, Any, Optional

class MockConnector:
    def execute(self, action_type: str, payload: Dict[str, Any], connector_config: Optional[Any] = None) -> Dict[str, Any]:
        """Mock execution of an action"""
        ref_id = str(uuid.uuid4())[:8]
        
        if action_type == "submit_application":
            return {
                "status": "executed",
                "external_reference": f"mock_application_{ref_id}",
                "message": "Application submitted successfully (Mock)"
            }
        elif action_type == "publish_job":
            return {
                "status": "executed",
                "external_reference": f"mock_job_{ref_id}",
                "message": "Job published successfully (Mock)"
            }
        elif action_type == "send_interview_invite":
            return {
                "status": "executed",
                "external_reference": f"mock_invite_{ref_id}",
                "message": "Interview invite sent (Mock)"
            }
        elif action_type == "send_candidate_message" or action_type == "send_company_message":
            return {
                "status": "executed",
                "external_reference": f"mock_message_{ref_id}",
                "message": "Message sent (Mock)"
            }
        else:
            return {
                "status": "failed",
                "error": f"Unsupported action type by mock connector: {action_type}"
            }
