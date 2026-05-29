from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIInterviewSession, AIInterviewMessage, AIAuditEvent
from services.agent.schemas import BotRuntimeContext
from .interview_safety import interview_safety

class InterviewRunner:
    """
    محرك تشغيل المقابلة: يدير تدفق الأسئلة، الإجابات، والحدود الزمنية.
    """
    MAX_QUESTIONS = 10
    FOLLOWUP_LIMIT = 3


    def start_interview(self, runtime: BotRuntimeContext, interview_id: str):
        """بدء جلسة المقابلة فعلياً بعد الموافقة"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session: raise ValueError("Interview not found")
        
        if session.consent_status != "accepted":
            raise ValueError("Cannot start interview without candidate consent")
            
        if session.status != "invited":
            raise ValueError(f"Invalid status to start: {session.status}")
            
        session.status = "in_progress"
        session.started_at = datetime.now()
        ai_storage.interviews.save_session(session)
        
        ai_storage.audit.append_event(AIAuditEvent(
            tenant_id=runtime.tenant_id, site_id=runtime.site_id, bot_id=runtime.bot_id,
            session_id=interview_id, event_type="interview_started", actor_type="ai",
            action="interview_execution_started"
        ))

    def get_next_question(self, runtime: BotRuntimeContext, interview_id: str) -> Optional[str]:
        """تحديد السؤال التالي بناءً على خطة المقابلة والحوار الحالي"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session:
            return None

        # Check if session is expired
        if session.expired_at and datetime.now() > session.expired_at:
            session.status = "expired"
            ai_storage.interviews.save_session(session)
            return None

        if session.status != "in_progress":
            return None

        messages = ai_storage.messages.list_messages_by_interview(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        
        # Check if the last candidate message was a clarification request
        if messages and messages[-1].sender == "candidate":
            intent = interview_safety.detect_candidate_intent(messages[-1].message)
            if intent == "ask_clarification":
                # Find the last asked question
                last_q = next((m.message for m in reversed(messages) if m.sender == "ai" and m.message_type == "question"), None)
                clarification = f"بالتأكيد. السؤال كان: '{last_q}'. يُقصد منه فهم خبرتك في هذا المجال. هل يمكنك الإجابة الآن؟" if last_q else "عذراً، هل يمكنك تحديد ما تود توضيحه؟"
                msg = AIInterviewMessage(
                    interview_id=interview_id, tenant_id=runtime.tenant_id, site_id=runtime.site_id,
                    bot_id=runtime.bot_id, sender="ai", message=clarification, message_type="clarification"
                )
                ai_storage.messages.save_message(msg)
                return clarification
                
            if intent == "pause_or_stop":
                # The session is already cancelled by submit_answer
                return None

        # Count questions and followups
        questions_asked = [m for m in messages if m.message_type == "question"]
        followups_asked = [m for m in messages if m.message_type == "followup"]
        
        if len(questions_asked) >= self.MAX_QUESTIONS:
            return None # Time to complete
            
        # Followup logic would go here if we were generating them dynamically.
        # For now we ensure we don't exceed the limit if such messages are created.

        # Extract plan
        plan = session.interview_plan
        if not plan or 'sections' not in plan:
            return "عذراً، حدث خطأ في تحميل خطة المقابلة."

        # Flatten questions from all sections
        all_questions = []
        for section in plan['sections']:
            all_questions.extend(section['questions'])

        # Find first unasked question
        asked_texts = [m.message for m in questions_asked]
        next_q = None
        for q in all_questions:
            if q not in asked_texts:
                # Safety check on generated question
                is_safe, flag = interview_safety.check_question_safety(q)
                if is_safe:
                    next_q = q
                    break
                else:
                    # Log safety violation by AI
                    ai_storage.audit.append_event(AIAuditEvent(
                        tenant_id=runtime.tenant_id, site_id=runtime.site_id, bot_id=runtime.bot_id,
                        session_id=interview_id, event_type="sensitive_question_blocked",
                        actor_type="ai", action="blocked_sensitive_question_generation",
                        safety_flags=[flag]
                    ))
                    # Also mark it as asked so we skip it
                    msg = AIInterviewMessage(
                        interview_id=interview_id, tenant_id=runtime.tenant_id, site_id=runtime.site_id,
                        bot_id=runtime.bot_id, sender="ai", message=q, message_type="question"
                    )
                    ai_storage.messages.save_message(msg)
                    continue
        
        if next_q:
            # Save and return
            msg = AIInterviewMessage(
                interview_id=interview_id,
                tenant_id=runtime.tenant_id,
                site_id=runtime.site_id,
                bot_id=runtime.bot_id,
                sender="ai",
                message=next_q,
                message_type="question"
            )
            ai_storage.messages.save_message(msg)
            return next_q
            
        return None

    def submit_answer(self, runtime: BotRuntimeContext, interview_id: str, answer_text: str):
        """تسجيل إجابة المرشح مع فحص الأمان ونوايا المرشح"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session or session.status != "in_progress":
            raise ValueError("Interview is not active")

        intent = interview_safety.detect_candidate_intent(answer_text)
        if intent == "pause_or_stop":
            session.status = "cancelled"
            ai_storage.interviews.save_session(session)
            ai_storage.audit.append_event(AIAuditEvent(
                tenant_id=runtime.tenant_id, site_id=runtime.site_id, bot_id=runtime.bot_id,
                session_id=interview_id, event_type="interview_paused_by_candidate",
                actor_type="candidate", action="candidate_stopped_interview"
            ))

        # Safety Check
        safety_flags = interview_safety.check_answer_safety(answer_text)
        
        msg = AIInterviewMessage(
            interview_id=interview_id,
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            sender="candidate",
            message=answer_text,
            message_type="answer"
        )
        ai_storage.messages.save_message(msg)
        
        if safety_flags:
            ai_storage.audit.append_event(AIAuditEvent(
                tenant_id=runtime.tenant_id, site_id=runtime.site_id, bot_id=runtime.bot_id,
                session_id=interview_id, event_type="candidate_safety_violation",
                actor_type="candidate", action="detected_prompt_injection",
                safety_flags=safety_flags
            ))

    def complete_interview(self, runtime: BotRuntimeContext, interview_id: str):
        """إنهاء المقابلة وتغيير الحالة لإتاحة توليد التقرير"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session: return
        
        if session.status != "in_progress":
            return
            
        session.status = "completed"
        session.completed_at = datetime.now()
        ai_storage.interviews.save_session(session)
        
        ai_storage.audit.append_event(AIAuditEvent(
            tenant_id=runtime.tenant_id, site_id=runtime.site_id, bot_id=runtime.bot_id,
            session_id=interview_id, event_type="interview_completed", actor_type="system",
            action="interview_marked_completed"
        ))

interview_runner = InterviewRunner()
