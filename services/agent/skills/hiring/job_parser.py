import json
from typing import Dict, Any, Union, Optional
from services.agent.schemas import BotRuntimeContext
from services.agent.llm.utility_llm import UtilityLLM
from .schemas import JobPost
from .skill_normalizer import normalize_skills

def parse_job_post(runtime: BotRuntimeContext, job_data: Union[str, Dict[str, Any]]) -> Optional[JobPost]:
    """
    Parses job data (either text or dictionary) into a structured JobPost.
    Uses qwen3-coder if text parsing is needed. Does NOT use company-assistant.
    """
    utility_llm = UtilityLLM()
    
    if isinstance(job_data, str):
        # Extract JobPost JSON via utility model
        messages = [
            {"role": "system", "content": "Extract job posting details strictly into the provided schema. Do not invent requirements."},
            {"role": "user", "content": f"Job Posting Text:\n{job_data}"}
        ]
        
        schema = JobPost.model_json_schema()
        
        try:
            extracted_data = utility_llm.generate_json(messages, schema=schema)
        except Exception as e:
            print(f"[AI:utility] Error parsing job text: {e}")
            return None
            
    elif isinstance(job_data, dict):
        # Already a dictionary, just use it
        extracted_data = job_data
    else:
        return None

    # Validate and normalize
    try:
        # Enforce tenant context from runtime
        extracted_data["tenant_id"] = runtime.tenant_id
        extracted_data["site_id"] = runtime.site_id
        extracted_data["bot_id"] = runtime.bot_id
        
        job = JobPost(**extracted_data)
        
        # Normalize skills
        if job.must_have_skills:
            norm_must = normalize_skills(job.must_have_skills)
            job.must_have_skills = [s["canonical"] for s in norm_must]
            
        if job.nice_to_have_skills:
            norm_nice = normalize_skills(job.nice_to_have_skills)
            job.nice_to_have_skills = [s["canonical"] for s in norm_nice]
            
        return job
        
    except Exception as e:
        print(f"Error validating JobPost: {e}")
        return None
