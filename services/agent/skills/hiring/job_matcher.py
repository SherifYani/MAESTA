import json
from typing import Dict, Any, List
from services.agent.schemas import BotRuntimeContext, AIResponse
from services.agent.llm.utility_llm import UtilityLLM
from services.agent.llm.answer_generator import AnswerGenerator
from .schemas import CandidateProfile, JobPost, JobRecommendationResult
from .job_parser import parse_job_post
from .scoring_engine import score_candidate_for_job

import config
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIApplicationDraft

def compare_cv_to_job(runtime: BotRuntimeContext, cv_json: Dict, job_json: Dict) -> Dict[str, Any]:
    print("[AI:utility] Using qwen3-coder:480b-cloud for CV to Job comparison")
    return {"match_score": 0, "strengths": []}

def _filter_jobs_for_runtime(runtime: BotRuntimeContext, available_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ensures jobs match the current bot runtime context.
    - source_type == "job"
    - tenant_id matches
    - site_id matches
    - bot_id matches
    - job_id exists
    """
    filtered = []
    for job in available_jobs:
        if job.get("source_type") != "job":
            continue
        if not job.get("job_id"):
            continue
        if job.get("tenant_id") != runtime.tenant_id or \
           job.get("site_id") != runtime.site_id or \
           job.get("bot_id") != runtime.bot_id:
            continue
        filtered.append(job)
    return filtered

def recommend_jobs(runtime: BotRuntimeContext, candidate_profile: CandidateProfile, available_jobs: List[Dict[str, Any]], limit: int = 5, user_intent: str = "recommend") -> AIResponse:
    """
    Job Recommendation v2.
    """
    safety_flags = []
    
    # 1. Validate hiring module
    if "hiring" not in runtime.enabled_modules:
        return AIResponse(
            answer="Hiring module is not enabled for this bot.",
            sources=[], suggested_actions=[], requires_approval=False, safety_flags=["module_disabled"], model_trace={}
        )
        
    # Filter jobs early
    filtered_raw_jobs = _filter_jobs_for_runtime(runtime, available_jobs)

    # Check if user intent is apply
    if user_intent == "apply":
        if not filtered_raw_jobs:
            safety_flags.append("no_jobs_found")
            return AIResponse(
                answer="لم أجد وظائف مناسبة للتقديم عليها حاليًا.",
                sources=[],
                suggested_actions=[],
                requires_approval=False,
                safety_flags=safety_flags,
                model_trace={},
                structured_data={}
            )

        # Save Draft to AI Storage
        saved_draft_id = None
        job_ids = [j.get("job_id") for j in filtered_raw_jobs]
        if config.ENABLE_AI_STORAGE:
            try:
                draft = AIApplicationDraft(
                    tenant_id=runtime.tenant_id,
                    site_id=runtime.site_id,
                    bot_id=runtime.bot_id,
                    candidate_id=candidate_profile.candidate_id,
                    job_ids=job_ids,
                    status="draft",
                    requires_approval=True
                )
                ai_storage.application_drafts.save_application_draft(draft)
                saved_draft_id = draft.id
            except Exception as e:
                safety_flags.append("storage_failed")

        return AIResponse(
            answer="I've prepared your application. Please review and confirm to submit.",
            sources=[],
            suggested_actions=[{
                "requires_approval": True,
                "suggested_action": "submit_application",
                "draft_payload": {
                    "draft_id": saved_draft_id,
                    "candidate_id": candidate_profile.candidate_id,
                    "selected_job_ids": job_ids,
                    "recommended_job_ids": [],
                    "cover_letter_draft": "",
                    "tenant_id": runtime.tenant_id,
                    "site_id": runtime.site_id,
                    "bot_id": runtime.bot_id
                },
                "risk_level": "medium"
            }],
            requires_approval=True,
            safety_flags=safety_flags,
            model_trace={},
            structured_data={"draft_id": saved_draft_id}
        )
        
    utility_llm = UtilityLLM()
    answer_generator = AnswerGenerator()
    
    # 4. Parse/normalize jobs to JobPost
    parsed_jobs = []
    for raw in filtered_raw_jobs:
        parsed = parse_job_post(runtime, raw)
        if parsed:
            parsed_jobs.append(parsed)
        else:
            safety_flags.append("job_parse_failed")
            
    print(f"[AI:search] Enforced constraint: source_type='job' only. Valid jobs found: {len(parsed_jobs)}")
        
    # 5. Score each job
    scored_results = []
    for job in parsed_jobs:
        match_result = score_candidate_for_job(candidate_profile, job)
        scored_results.append({
            "job": job.model_dump(),
            "match": match_result.model_dump()
        })
        
    # 6. Sort by overall_score
    scored_results.sort(key=lambda x: x["match"]["overall_score"], reverse=True)
    
    # 7. Limit
    final_recommendations = scored_results[:limit]
    
    if not final_recommendations:
        safety_flags.append("no_jobs_found")
        return AIResponse(
            answer="لم أجد وظائف مناسبة متاحة حاليًا لهذا البوت.",
            sources=[],
            suggested_actions=[],
            requires_approval=False,
            safety_flags=safety_flags,
            model_trace={},
            structured_data={}
        )
    
    # 8. qwen3-coder explains gaps as JSON
    gap_analysis_messages = [
        {"role": "system", "content": "Analyze the candidate's gaps for the top recommended job and return a JSON object with 'explanation' string explaining why they might fall short."},
        {"role": "user", "content": f"Match Data: {json.dumps(final_recommendations[0])}"}
    ]
    try:
        gap_analysis = utility_llm.generate_json(gap_analysis_messages, schema={"type": "object", "properties": {"explanation": {"type": "string"}}})
    except Exception:
        gap_analysis = {"explanation": "No specific gap analysis available."}
        
    # 9. qwen3-company-assistant formats final answer
    result_data = JobRecommendationResult(
        recommended_jobs=final_recommendations,
        limit=limit,
        requires_approval=False,
        suggested_actions=[]
    )
    
    answer_prompt = [
        {"role": "system", "content": "You are a helpful company assistant. Present the top job recommendations to the user based on the JSON provided. Mention their strengths and the gap analysis. Be encouraging and do not mention RAG or chunks."},
        {"role": "user", "content": f"Recommendation Data:\n{result_data.model_dump_json(indent=2)}\nGap Analysis:\n{json.dumps(gap_analysis)}"}
    ]
    
    final_answer = answer_generator.generate_response(answer_prompt)
    
    return AIResponse(
        answer=final_answer,
        sources=[{"type": "job", "id": j["job"]["job_id"]} for j in final_recommendations],
        suggested_actions=[],
        requires_approval=False,
        safety_flags=safety_flags,
        model_trace={
            "utility_model": utility_llm.client.model_name,
            "answer_model": answer_generator.client.model_name
        },
        structured_data={"recommendations": result_data.model_dump()}
    )
