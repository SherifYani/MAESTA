import re
from typing import List, Dict, Any, Optional
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIAuditEvent, AIInterviewMessage
from services.agent.schemas import BotRuntimeContext

class TranscriptPrivacy:
    """
    نظام حماية خصوصية المحادثات (Transcript Privacy).
    يضمن حجب تفاصيل المحادثات وعرض الاقتباسات فقط، وتوثيق أي كشف للسجل الكامل (Audit).
    """

    def get_safe_report_view(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """يعيد نسخة آمنة من التقرير تحتوي على التلخيص والاقتباسات فقط بدون السجل الكامل."""
        safe_view = report_data.copy()
        # Ensure raw transcript is never included in the safe view
        safe_view.pop('raw_transcript', None)
        return safe_view

    def reveal_transcript_with_audit(self, runtime: BotRuntimeContext, session_id: str) -> List[AIInterviewMessage]:
        """
        يكشف سجل المحادثة الكامل فقط للأدوار المصرح لها، ويسجل ذلك في الـ Audit.
        يقوم بعمل (Masking) للبيانات الشخصية كأرقام الهواتف والبريد الإلكتروني.
        """
        allowed_roles = ["super_admin", "tenant_admin", "company_admin"]
        if runtime.user_role not in allowed_roles:
            raise PermissionError("Access Denied: Insufficient role to reveal transcript.")

        # Log audit event
        ai_storage.audit.append_event(AIAuditEvent(
            tenant_id=runtime.tenant_id, site_id=runtime.site_id, bot_id=runtime.bot_id,
            session_id=session_id, event_type="reveal_interview_transcript",
            actor_type="admin", action="admin_revealed_interview_transcript",
            resource_id=session_id
        ))

        # Retrieve and mask transcript
        messages = ai_storage.messages.list_messages_by_interview(
            session_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        return self._mask_sensitive_transcript_fields(messages)

    def _mask_sensitive_transcript_fields(self, messages: List[AIInterviewMessage]) -> List[AIInterviewMessage]:
        """يقوم بإخفاء البريد الإلكتروني وأرقام الهواتف من المحادثة لحماية الخصوصية"""
        masked_messages = []
        
        # Simple regex for masking
        email_regex = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
        phone_regex = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")

        for msg in messages:
            safe_text = msg.message
            if msg.message_type == "answer":
                safe_text = email_regex.sub("[EMAIL HIDDEN]", safe_text)
                safe_text = phone_regex.sub("[PHONE HIDDEN]", safe_text)
            
            # Create a masked copy
            masked_msg = AIInterviewMessage(
                id=msg.id,
                interview_id=msg.interview_id,
                tenant_id=msg.tenant_id,
                site_id=msg.site_id,
                bot_id=msg.bot_id,
                sender=msg.sender,
                message=safe_text,
                message_type=msg.message_type,
                created_at=msg.created_at
            )
            masked_messages.append(masked_msg)
            
        return masked_messages

transcript_privacy = TranscriptPrivacy()
