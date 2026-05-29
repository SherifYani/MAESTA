import json
from typing import Dict, Any
from services.agent.schemas import BotRuntimeContext, AIResponse
from services.agent.llm.utility_llm import UtilityLLM
from services.agent.llm.answer_generator import AnswerGenerator

# Since schema is Pydantic, we can use model_json_schema() but UtilityLLM doesn't directly take Pydantic models in its simple implementation. We'll pass a dict schema.
from .schemas import CandidateProfile
from .skill_normalizer import normalize_skills

import config
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AICandidateProfile

def _scan_for_prompt_injection(text: str) -> bool:
    """Basic deterministic scan for common injection phrases."""
    lower_text = text.lower()
    dangerous_phrases = ["ignore previous instructions", "system prompt", "you are an ai", "bypass", "override"]
    for phrase in dangerous_phrases:
        if phrase in lower_text:
            return True
    return False

def analyze_cv(runtime: BotRuntimeContext, cv_text: str) -> AIResponse:
    """
    1. prompt injection scan.
    2. qwen3-coder extracts CandidateProfile JSON.
    3. validate JSON.
    4. deterministic validation (no invented skills, maintain names/emails).
    5. qwen3-company-assistant formats the user response.
    """
    safety_flags = []
    
    # 1. Prompt injection scan
    if _scan_for_prompt_injection(cv_text):
        safety_flags.append("cv_prompt_injection_detected")
        return AIResponse(
            answer="I'm sorry, but I cannot process this document due to security constraints.",
            sources=[],
            suggested_actions=[],
            requires_approval=False,
            safety_flags=safety_flags,
            model_trace={}
        )
        
    utility_llm = UtilityLLM()
    answer_generator = AnswerGenerator()
    
    # 2. Extract JSON via utility model
    messages = [
        {"role": "system", "content": "Extract candidate information strictly from the provided CV text. Do NOT invent skills. If a field is missing, leave it empty or null."},
        {"role": "user", "content": f"CV Text:\n{cv_text}"}
    ]
    
    # Get JSON schema from Pydantic model
    schema = CandidateProfile.model_json_schema()
    
    try:
        extracted_data = utility_llm.generate_json(messages, schema=schema)
    except Exception as e:
        return AIResponse(
            answer="There was an error parsing the CV data.",
            sources=[],
            suggested_actions=[],
            requires_approval=False,
            safety_flags=["parsing_failed"],
            model_trace={"utility_model": utility_llm.client.model_name}
        )
        
    # 3. Validate JSON to CandidateProfile
    try:
        profile = CandidateProfile(**extracted_data)
    except Exception as e:
        safety_flags.append("candidate_profile_validation_failed")
        return AIResponse(
            answer="There was a validation error parsing your CV profile data. Please ensure it is correctly formatted.",
            sources=[],
            suggested_actions=[],
            requires_approval=False,
            safety_flags=safety_flags,
            model_trace={"utility_model": utility_llm.client.model_name},
            structured_data={"partial_data": extracted_data}
        )
        
    # 4. Deterministic validation
    cv_text_lower = cv_text.lower()
    validated_skills = []
    
    # Normalize original skills from CV to improve matching
    # Extract words roughly as skills to normalize against
    words_in_cv = set(cv_text_lower.replace(",", " ").replace(".", " ").split())
    
    for skill in profile.skills:
        skill_lower = skill.lower()
        # Direct substring match
        if skill_lower in cv_text_lower:
            validated_skills.append(skill)
        else:
            # Check if normalized version matches any word in CV
            norm_skill = normalize_skills([skill])
            if norm_skill:
                canonical = norm_skill[0]["canonical"].lower()
                # Check if the canonical term or its aliases are in the CV
                if canonical in cv_text_lower:
                    validated_skills.append(skill)
                # Or check if any word from CV normalizes to this canonical skill
                elif any(normalize_skills([w]) and normalize_skills([w])[0]["canonical"].lower() == canonical for w in words_in_cv if len(w) > 1):
                    validated_skills.append(skill)
            
    # Normalize skills
    normalized_list = normalize_skills(validated_skills)
    profile.skills = [item["canonical"] for item in normalized_list]
    
    # Maintain explicit missing fields tracking
    missing = []
    if not profile.email: missing.append("email")
    if not profile.phone: missing.append("phone")
    if not profile.skills: missing.append("skills")
    if not profile.experience: missing.append("experience")
    profile.missing_fields = missing
    
    # 5. Generate final answer using Answer Generator
    answer_prompt = [
        {"role": "system", "content": "You are a helpful company assistant. Summarize the parsed CV profile. Mention the candidate's name, top skills, and any major missing fields. Be welcoming and concise."},
        {"role": "user", "content": f"Parsed Profile:\n{profile.model_dump_json(indent=2)}"}
    ]
    
    final_answer = answer_generator.generate_response(answer_prompt)
    
    # Save to AI Storage
    saved_id = None
    if config.ENABLE_AI_STORAGE:
        try:
            profile_record = AICandidateProfile(
                tenant_id=runtime.tenant_id,
                site_id=runtime.site_id,
                bot_id=runtime.bot_id,
                candidate_id=profile.candidate_id,
                session_id=runtime.session_id,
                profile=profile.model_dump(),
                source="cv_upload",
                visibility="candidate_private"
            )
            ai_storage.candidates.save_candidate_profile(profile_record)
            saved_id = profile_record.id
        except Exception as e:
            safety_flags.append("storage_failed")
    
    return AIResponse(
        answer=final_answer,
        sources=[],
        suggested_actions=[],
        requires_approval=False,
        safety_flags=safety_flags,
        model_trace={
            "utility_model": utility_llm.client.model_name,
            "answer_model": answer_generator.client.model_name
        },
        structured_data={
            "candidate_profile": profile.model_dump(),
            "saved_record_id": saved_id
        }
    )
