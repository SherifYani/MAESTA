from typing import Dict, Any
from services.agent.schemas import BotRuntimeContext, AIResponse

# NOT IMPLEMENTED IN PHASE 3. 
# DO NOT USE IN PRODUCTION.
def conduct_interview(runtime: BotRuntimeContext, candidate_id: str, session_data: Dict[str, Any]) -> AIResponse:
    """
    Placeholder for Phase 4. Currently returns a safe unimplemented response.
    """
    return AIResponse(
        answer="This feature is not implemented yet.",
        sources=[],
        suggested_actions=[],
        requires_approval=False,
        safety_flags=["not_implemented"],
        model_trace={},
        structured_data={}
    )
