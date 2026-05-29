from typing import Dict, Any, List
from services.agent.llm.utility_llm import UtilityLLM
from services.agent.llm.dual_llm_orchestrator import orchestrator
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIInterviewReport, AIAuditEvent
from services.agent.schemas import BotRuntimeContext

from services.agent.skills.hiring.interview_rubric import interview_rubric
from services.agent.skills.hiring.interview_safety import interview_safety

class InterviewReportBuilder:
    """
    بناء تقرير المقابلة الاستشاري.
    يحلل الحوار ويستخرج الدرجات بناءً على أدلة ملموسة (Evidence).
    """
    def __init__(self):
        self.utility_llm = UtilityLLM()

    async def build_report(self, runtime: BotRuntimeContext, interview_id: str) -> AIInterviewReport:
        """تحليل المقابلة وتوليد التقرير النهائي"""
        session = ai_storage.interviews.get_session_by_id(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        if not session or session.status != "completed":
            raise ValueError("Interview is not completed")

        messages = ai_storage.messages.list_messages_by_interview(
            interview_id, runtime.tenant_id, runtime.site_id, runtime.bot_id
        )
        
        # Check if transcript is too short
        qa_messages = [m for m in messages if m.message_type in ["question", "answer"]]
        transcript = "\n".join([f"{m.sender}: {m.message}" for m in qa_messages])
        
        early_safety_flags = []
        if len(qa_messages) < 4:
            early_safety_flags.append("transcript_too_short")

        # 1. Use qwen3-coder for structured scoring and analysis
        analysis_prompt = f"""
Analyze the following interview transcript and provide a structured report.
Transcript:
{transcript}

STRICT RULES:
1. Scores must be between 0 and 100.
2. Every score MUST have an "evidence" quote from the transcript.
3. Identify strengths and concerns.
4. Extract salary expectation and availability if mentioned.
5. Recommendation must be advisory: strong|good|hold|not_recommended.
6. NO FINAL HIRING DECISION.
7. NO SALARY OFFER LANGUAGE.
8. DO NOT RETURN ANY 'accept_candidate', 'reject_candidate', or 'send_offer' actions.

Required JSON structure:
{{
  "technical_score": 0,
  "communication_score": 0,
  "job_fit_score": 0,
  "strengths": [],
  "concerns": [],
  "salary_expectation": "",
  "availability": "",
  "candidate_questions": [],
  "relevant_quotes": [
    {{"text": "quote text", "context": "reason for choosing this quote"}}
  ],
  "recommendation": "hold",
  "internal_summary": "detailed technical summary"
}}
"""
        analysis_result = self.utility_llm.generate_json(
            [{"role": "user", "content": analysis_prompt}]
        )

        # 2. Use qwen3-company-assistant (Claude/Gemini) for friendly company summary
        summary_prompt = f"""
Summarize the following interview analysis for a hiring manager. 
Keep it professional, objective, and friendly. 
Do not make a final decision, auto accept, or auto reject.
Analysis: {analysis_result.get('internal_summary', '')}
"""
        summary_response = await orchestrator.generate_response(summary_prompt)
        company_summary = summary_response.get('response', 'Summary generation failed.')
        
        # Add the company summary into the raw analysis result for the rubric to capture
        analysis_result['internal_summary'] = company_summary
        
        # 3. Apply the deterministic rubric
        final_data, rubric_flags = interview_rubric.evaluate(analysis_result)
        
        all_flags = list(set(early_safety_flags + rubric_flags))
        if "insufficient_evidence" in all_flags:
            # If evidence is poor, ensure recommendation is not strong
            if final_data["recommendation"] in ["strong", "good"]:
                final_data["recommendation"] = "hold"

        report = AIInterviewReport(
            interview_id=interview_id,
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            candidate_id=session.candidate_id,
            job_id=session.job_id,
            technical_score=final_data["technical_score"],
            communication_score=final_data["communication_score"],
            job_fit_score=final_data["job_fit_score"],
            strengths=final_data["strengths"],
            concerns=final_data["concerns"],
            salary_expectation=final_data["salary_expectation"],
            availability=final_data.get("availability"),
            candidate_questions=analysis_result.get("candidate_questions", []),
            relevant_quotes=final_data["relevant_quotes"],
            recommendation=final_data["recommendation"],
            summary_for_company=final_data["summary_for_company"],
            requires_human_review=True,
            full_transcript_revealed=False # Hidden by default
        )
        
        ai_storage.reports.save_report(report)
        
        # Log audit if flags present
        if all_flags:
            ai_storage.audit.append_event(AIAuditEvent(
                tenant_id=runtime.tenant_id, site_id=runtime.site_id, bot_id=runtime.bot_id,
                session_id=interview_id, event_type="interview_report_flagged",
                actor_type="system", action="generated_report_with_flags",
                safety_flags=all_flags
            ))
            
        return report

report_builder = InterviewReportBuilder()
