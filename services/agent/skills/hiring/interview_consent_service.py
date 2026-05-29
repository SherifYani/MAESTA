from typing import Optional, Dict, Any
from datetime import datetime
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIInterviewSession, AIAuditEvent
from services.agent.schemas import BotRuntimeContext

class InterviewConsentService:
    """
    إدارة موافقات المرشحين لمقابلات الذكاء الاصطناعي.
    تضمن الالتزام بالشروط القانونية والتشغيلية قبل بدء الحوار.
    """
    CONSENT_MESSAGE_AR = (
        "مرحباً بك. هذه مقابلة مدعومة بالذكاء الاصطناعي لغرض التوظيف. "
        "سيتم تلخيص إجاباتك ومشاركة تقرير مختصر مع الشركة صاحبة الوظيفة. "
        "لن يتم اتخاذ قرار قبول أو رفض تلقائيًا بناءً على هذه المقابلة فقط. "
        "يمكنك في أي وقت التوقف أو رفض المتابعة. هل توافق على البدء؟"
    )

    def request_consent(self, runtime: BotRuntimeContext, interview_id: str) -> str:
        """إرجاع رسالة طلب الموافقة وتحديث حالة الجلسة"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session:
            raise ValueError("Interview session not found")
        
        if session.status == "draft":
            session.status = "consent_pending"
            ai_storage.interviews.save_session(session)
            
        return self.CONSENT_MESSAGE_AR

    def accept_consent(self, runtime: BotRuntimeContext, interview_id: str, candidate_id: str):
        """تسجيل قبول المرشح للمقابلة"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session or session.candidate_id != candidate_id:
            raise ValueError("Invalid session or candidate access denied")
        
        session.consent_status = "accepted"
        session.status = "invited" # Ready to start
        ai_storage.interviews.save_session(session)
        
        # Audit
        ai_storage.audit.append_event(AIAuditEvent(
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            session_id=interview_id,
            event_type="interview_consent_accepted",
            actor_type="candidate",
            action="candidate_accepted_ai_interview"
        ))

    def decline_consent(self, runtime: BotRuntimeContext, interview_id: str, candidate_id: str):
        """تسجيل رفض المرشح للمقابلة وإلغاء الجلسة"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session or session.candidate_id != candidate_id:
            raise ValueError("Invalid session or candidate access denied")
        
        session.consent_status = "declined"
        session.status = "cancelled"
        ai_storage.interviews.save_session(session)
        
        # Audit
        ai_storage.audit.append_event(AIAuditEvent(
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            session_id=interview_id,
            event_type="interview_consent_declined",
            actor_type="candidate",
            action="candidate_declined_ai_interview"
        ))

consent_service = InterviewConsentService()
