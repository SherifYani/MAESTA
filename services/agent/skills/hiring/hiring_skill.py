from typing import Dict, Any
from services.agent.schemas import AIRequest, AIResponse
from ..base_skill import BaseSkill
from .cv_parser import analyze_cv
from .job_matcher import recommend_jobs
from .applicant_ranker import rank_applicants
from .employer_assistant import build_job_description, ask_missing_job_fields
from .schemas import CandidateProfile, JobPost
import uuid
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIInterviewSession

class HiringSkill(BaseSkill):
    @property
    def skill_name(self) -> str:
        return "hiring"

    def handle_request(self, request: AIRequest) -> AIResponse:
        runtime = request.runtime
        intent = request.metadata.get("intent")
        
        # Candidate Intents
        if intent == "analyze_cv":
            cv_text = request.message # Or from attachments
            return analyze_cv(runtime, cv_text)
            
        elif intent == "recommend_jobs":
            # Check if profile exists in metadata or structured_data
            candidate_data = request.metadata.get("candidate_profile")
            if not candidate_data:
                return AIResponse(
                    answer="من فضلك ارفع CV أو أرسل ملخص خبراتك أولًا لنتمكن من ترشيح وظائف مناسبة لك.",
                    sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={}
                )
            candidate = CandidateProfile(**candidate_data)
            jobs = request.metadata.get("available_jobs", [])
            return recommend_jobs(runtime, candidate, jobs)
            
        elif intent == "apply_to_job":
            job_ids = request.metadata.get("selected_job_ids")
            if not job_ids:
                return AIResponse(
                    answer="من فضلك حدد الوظائف التي تريد التقديم عليها.",
                    sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={}
                )
            candidate_data = request.metadata.get("candidate_profile")
            if not candidate_data:
                 return AIResponse(
                    answer="من فضلك ارفع CV أولاً قبل التقديم.",
                    sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={}
                )
            candidate = CandidateProfile(**candidate_data)
            # Available jobs needed for payload building
            available_jobs = request.metadata.get("available_jobs", [])
            return recommend_jobs(runtime, candidate, available_jobs, user_intent="apply")

        # Employer Intents
        elif intent == "rank_applicants":
            job_id = request.metadata.get("job_id")
            if not job_id:
                return AIResponse(
                    answer="من فضلك حدد الوظيفة التي تريد ترتيب المتقدمين لها.",
                    sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={}
                )
            
            # In a real scenario, we'd fetch job and candidates from RAG/DB
            raw_job = request.metadata.get("job_post")
            if not raw_job:
                return AIResponse(answer="لم يتم العثور على بيانات الوظيفة المطلوبة.", sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={})
            
            job = JobPost(**raw_job)
            raw_candidates = request.metadata.get("candidate_profiles", [])
            candidates = [CandidateProfile(**c) for c in raw_candidates]
            
            return rank_applicants(runtime, job, candidates)

        elif intent == "build_job_description":
            requirements = request.message
            if len(requirements) < 20:
                return ask_missing_job_fields(runtime, requirements)
            return build_job_description(runtime, requirements)

        elif intent == "draft_interview_invite":
            candidate_ids = request.metadata.get("candidate_ids", [])
            job_id = request.metadata.get("job_id", "")
            
            if not candidate_ids or not job_id:
                return AIResponse(
                    answer="من فضلك حدد الوظيفة والمرشحين الذين تريد دعوتهم للمقابلة.",
                    sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={}
                )
            
            session_ids = [str(uuid.uuid4()) for _ in candidate_ids]
            
            # Create draft sessions in DB
            for i, cand_id in enumerate(candidate_ids):
                sess = AIInterviewSession(
                    id=session_ids[i],
                    tenant_id=runtime.tenant_id,
                    site_id=runtime.site_id,
                    bot_id=runtime.bot_id,
                    job_id=job_id,
                    candidate_id=cand_id,
                    status="draft"
                )
                ai_storage.interviews.save_session(sess)

            return AIResponse(
                answer=f"لقد قمت بإعداد مسودة دعوات لـ {len(candidate_ids)} مرشحين. هل تود إرسالها؟",
                sources=[],
                suggested_actions=[{
                    "requires_approval": True,
                    "suggested_action": "send_interview_invite",
                    "draft_payload": {
                        "job_id": job_id,
                        "candidate_ids": candidate_ids,
                        "tenant_id": runtime.tenant_id,
                        "site_id": runtime.site_id,
                        "bot_id": runtime.bot_id,
                        "message_draft": "ندعوك لإجراء مقابلة ذكية لموقعنا الوظيفي. يرجى الضغط على الرابط للمتابعة.",
                        "interview_session_ids": session_ids
                    },
                    "risk_level": "medium"
                }],
                requires_approval=True,
                safety_flags=[],
                model_trace={}
            )

        return AIResponse(
            answer="عذرًا، لم أفهم طلبك بخصوص التوظيف. هل تريد تحليل CV أم البحث عن مرشحين؟",
            sources=[], suggested_actions=[], requires_approval=False, safety_flags=[], model_trace={}
        )
