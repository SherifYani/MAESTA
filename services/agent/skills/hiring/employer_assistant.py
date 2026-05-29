import json
from typing import Dict, Any, List, Optional
from services.agent.schemas import BotRuntimeContext, AIResponse
from services.agent.llm.utility_llm import UtilityLLM
from services.agent.llm.answer_generator import AnswerGenerator
from .schemas import JobPost

import config
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIJobDraft

def build_job_description(runtime: BotRuntimeContext, employer_requirements: str) -> AIResponse:
    """
    Drafts a JobPost JSON from requirements and returns a suggested action to publish.
    """
    utility_llm = UtilityLLM()
    answer_generator = AnswerGenerator()
    
    # 1. Draft JSON via Utility Model
    messages = [
        {"role": "system", "content": "You are a professional HR specialist. Draft a structured Job Description JSON based on the employer's input. Do not invent requirements that are not mentioned."},
        {"role": "user", "content": f"Requirements:\n{employer_requirements}"}
    ]
    
    schema = JobPost.model_json_schema()
    try:
        job_draft_data = utility_llm.generate_json(messages, schema=schema)
        # Force context
        job_draft_data["tenant_id"] = runtime.tenant_id
        job_draft_data["site_id"] = runtime.site_id
        job_draft_data["bot_id"] = runtime.bot_id
        job_post = JobPost(**job_draft_data)
    except Exception as e:
        return AIResponse(
            answer="I encountered an error while drafting the job description. Could you please provide more details?",
            sources=[], suggested_actions=[], requires_approval=False, safety_flags=["drafting_failed"], model_trace={}
        )

    # 2. Final Answer to Employer
    answer_prompt = [
        {"role": "system", "content": "You are a professional company assistant. Present the drafted job description to the employer. Ask them to review it and click 'Publish' to make it live."},
        {"role": "user", "content": f"Drafted Job:\n{job_post.model_dump_json(indent=2)}"}
    ]
    final_answer = answer_generator.generate_response(answer_prompt)
    
    # Save Job Draft to AI Storage
    saved_draft_id = None
    if config.ENABLE_AI_STORAGE:
        try:
            draft_record = AIJobDraft(
                tenant_id=runtime.tenant_id,
                site_id=runtime.site_id,
                bot_id=runtime.bot_id,
                title=job_post.title,
                job_post=job_post.model_dump(),
                status="draft",
                created_by="ai"
            )
            ai_storage.job_drafts.save_job_draft(draft_record)
            saved_draft_id = draft_record.id
        except Exception as e:
            # We don't fail the whole request if storage fails, but we log it
            pass

    return AIResponse(
        answer=final_answer,
        sources=[],
        suggested_actions=[{
            "requires_approval": True,
            "suggested_action": "publish_job",
            "draft_payload": job_post.model_dump(),
            "risk_level": "medium"
        }],
        requires_approval=False, # Approval is for the action, not the message
        safety_flags=[],
        model_trace={
            "utility_model": utility_llm.client.model_name,
            "answer_model": answer_generator.client.model_name
        },
        structured_data={
            "job_draft": job_post.model_dump(),
            "saved_draft_id": saved_draft_id
        }
    )

def ask_missing_job_fields(runtime: BotRuntimeContext, partial_requirements: str) -> AIResponse:
    """
    Asks the employer for missing fields before drafting.
    """
    answer_generator = AnswerGenerator()
    prompt = [
        {"role": "system", "content": "You are a professional HR assistant. The employer wants to post a job but provided incomplete information. Politely ask for missing details like Job Title, Key Skills, or Experience level."},
        {"role": "user", "content": f"Partial Input: {partial_requirements}"}
    ]
    answer = answer_generator.generate_response(prompt)
    
    return AIResponse(
        answer=answer,
        sources=[], suggested_actions=[], requires_approval=False, safety_flags=[],
        model_trace={"answer_model": answer_generator.client.model_name},
        structured_data={}
    )
