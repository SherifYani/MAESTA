from typing import Dict, Any
from .base_skill import BaseSkill
from services.agent.schemas import AIRequest, AIResponse
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIAuditEvent
import config

class SkillRouter:
    def __init__(self):
        self.skills: Dict[str, BaseSkill] = {}
        
    def register_skill(self, skill: BaseSkill):
        self.skills[skill.skill_name] = skill
        
    def route_request(self, request: AIRequest, target_skill: str) -> AIResponse:
        runtime = request.runtime
        
        # Audit Start
        if config.ENABLE_AI_STORAGE:
            try:
                ai_storage.audit.append_event(AIAuditEvent(
                    tenant_id=runtime.tenant_id,
                    site_id=runtime.site_id,
                    bot_id=runtime.bot_id,
                    session_id=runtime.session_id,
                    event_type="skill_route_start",
                    action=f"Routing to {target_skill}",
                    model_trace={"intent": request.metadata.get("intent")}
                ))
            except Exception: pass
        
        # Security/Policy Check: Enabled Modules
        if target_skill not in runtime.enabled_modules:
            # Special case for hiring as per instructions
            if target_skill == "hiring":
                msg = "الميزة دي غير مفعلة لهذا البوت حاليًا."
            else:
                msg = f"The requested module '{target_skill}' is not enabled for this bot."
                
            return AIResponse(
                answer=msg,
                sources=[],
                suggested_actions=[],
                requires_approval=False,
                safety_flags=["module_disabled"],
                model_trace={},
                structured_data={}
            )
            
        skill = self.skills.get(target_skill)
        if not skill:
            return AIResponse(
                answer=f"Skill '{target_skill}' not found.",
                sources=[],
                suggested_actions=[],
                requires_approval=False,
                safety_flags=["skill_not_found"],
                model_trace={},
                structured_data={}
            )
            
        # Before calling skill, check if intent metadata is missing for critical flows
        intent = request.metadata.get("intent")
        if target_skill == "hiring":
            if intent == "rank_applicants" and not request.metadata.get("job_id"):
                return AIResponse(
                    answer="من فضلك حدد الوظيفة التي تريد ترتيب المتقدمين لها.",
                    sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={}, structured_data={}
                )
            # Add more router-level follow-ups if needed
            
        response = skill.handle_request(request)

        # Audit End
        if config.ENABLE_AI_STORAGE:
            try:
                ai_storage.audit.append_event(AIAuditEvent(
                    tenant_id=runtime.tenant_id,
                    site_id=runtime.site_id,
                    bot_id=runtime.bot_id,
                    session_id=runtime.session_id,
                    event_type="skill_route_complete",
                    action=f"Completed {target_skill}",
                    safety_flags=response.safety_flags,
                    approval_required=response.requires_approval,
                    model_trace=response.model_trace
                ))
            except Exception: pass

        return response
