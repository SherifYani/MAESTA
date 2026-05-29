import json
from typing import List, Dict, Any, Optional
from services.agent.schemas import BotRuntimeContext, AIResponse
from services.agent.llm.utility_llm import UtilityLLM
from services.agent.llm.answer_generator import AnswerGenerator
from .schemas import CandidateProfile, JobPost, ApplicantRankingResult, RankedCandidateItem
from .scoring_engine import score_candidate_for_job

import config
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIRankingRun

def rank_applicants(runtime: BotRuntimeContext, job_post: JobPost, candidate_profiles: List[CandidateProfile], limit: int = 10) -> AIResponse:
    """
    Ranks applicants for a specific job post using deterministic scoring.
    """
    safety_flags = []
    
    # 1. Validate hiring module enabled
    if "hiring" not in runtime.enabled_modules:
        return AIResponse(
            answer="Hiring module is not enabled for this bot.",
            sources=[], suggested_actions=[], requires_approval=False, safety_flags=["module_disabled"], model_trace={}
        )
        
    # 2. Validate runtime tenant/site/bot and Job ownership
    if job_post.tenant_id != runtime.tenant_id or job_post.site_id != runtime.site_id or job_post.bot_id != runtime.bot_id:
        safety_flags.append("tenant_mismatch")
        return AIResponse(
            answer="You do not have permission to access this job posting.",
            sources=[], suggested_actions=[], requires_approval=False, safety_flags=safety_flags, model_trace={}
        )
        
    # 3. Filter candidates by tenant/site/bot
    filtered_candidates = [
        c for c in candidate_profiles 
        if c.candidate_id and c.full_name # Basic validity
        # In a real system we would check c.tenant_id if profiles were per-tenant, 
        # but here we assume profiles passed are candidate applications for this specific context.
    ]
    
    # 4. Score each candidate
    scored_items = []
    for candidate in filtered_candidates:
        match_result = score_candidate_for_job(candidate, job_post)
        
        ranked_item = RankedCandidateItem(
            candidate_id=candidate.candidate_id,
            candidate_name=candidate.full_name,
            job_id=job_post.job_id,
            overall_score=match_result.overall_score,
            recommendation=match_result.recommendation,
            strengths=match_result.strengths,
            gaps=match_result.gaps,
            risks=match_result.risks,
            evidence=match_result.evidence
        )
        scored_items.append(ranked_item)
        
    # 5. Sort by overall_score descending
    scored_items.sort(key=lambda x: x.overall_score, reverse=True)
    
    # 6. Apply limit and rank
    final_ranked = scored_items[:limit]
    for i, item in enumerate(final_ranked):
        item.rank = i + 1
        
    result_data = ApplicantRankingResult(
        job_id=job_post.job_id,
        ranked_candidates=final_ranked,
        limit=limit,
        requires_human_review=True,
        suggested_actions=[]
    )
    
    # 7. Optional Utility Explanation (JSON only, no score change)
    utility_llm = UtilityLLM()
    explanation_json = {}
    if final_ranked:
        explanation_prompt = [
            {"role": "system", "content": "Analyze the ranking results and provide a brief summary and notes on top candidates. Return strictly JSON."},
            {"role": "user", "content": f"Ranking Results: {result_data.model_dump_json()}"}
        ]
        try:
            explanation_json = utility_llm.generate_json(explanation_prompt, schema={
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "ranking_notes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "candidate_id": {"type": "string"},
                                "note": {"type": "string"},
                                "risk": {"type": "string"}
                            }
                        }
                    }
                }
            })
        except Exception:
            explanation_json = {"summary": "Ranking completed based on deterministic scoring criteria."}

    # 8. Final Answer Generation (Company Assistant)
    answer_generator = AnswerGenerator()
    answer_prompt = [
        {"role": "system", "content": "You are a professional hiring assistant for the company. Present the applicant ranking to the employer. Focus on the top matches and mention any significant risks or gaps found. Do not mention the underlying models or scoring algorithms."},
        {"role": "user", "content": f"Ranking Data:\n{result_data.model_dump_json(indent=2)}\nNotes:\n{json.dumps(explanation_json)}"}
    ]
    
    final_answer = answer_generator.generate_response(answer_prompt)
    
    # Save Ranking Run to AI Storage
    saved_run_id = None
    if config.ENABLE_AI_STORAGE:
        try:
            run_record = AIRankingRun(
                tenant_id=runtime.tenant_id,
                site_id=runtime.site_id,
                bot_id=runtime.bot_id,
                job_id=job_post.job_id,
                ranked_candidates=[item.model_dump() for item in final_ranked],
                limit=limit,
                requires_human_review=True
            )
            ai_storage.ranking_runs.save_ranking_run(run_record)
            saved_run_id = run_record.id
        except Exception as e:
            safety_flags.append("storage_failed")

    # 9. Return AIResponse
    return AIResponse(
        answer=final_answer,
        sources=[{"type": "candidate", "id": c.candidate_id} for c in final_ranked],
        suggested_actions=[],
        requires_approval=False,
        safety_flags=safety_flags,
        model_trace={
            "utility_model": utility_llm.client.model_name,
            "answer_model": answer_generator.client.model_name
        },
        structured_data={
            "ranking_result": result_data.model_dump(),
            "explanation": explanation_json,
            "saved_run_id": saved_run_id
        }
    )
