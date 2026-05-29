from typing import Dict, Any, List
from services.agent.llm.utility_llm import UtilityLLM
from services.agent.schemas import BotRuntimeContext
from .interview_schemas import InterviewPlan, InterviewPlanSection

class InterviewQuestionGenerator:
    """
    توليد خطة المقابلة والأسئلة بناءً على سياق الوظيفة والمرشح.
    يستخدم qwen3-coder لضمان جودة الأسئلة التقنية والمهنية.
    """
    def __init__(self):
        self.llm = UtilityLLM()

    async def generate_interview_plan(self, runtime: BotRuntimeContext, 
                                     interview_id: str,
                                     job_post: Dict[str, Any], 
                                     candidate_profile: Dict[str, Any]) -> InterviewPlan:
        """
        بناء خطة مقابلة منظمة.
        تتجنب الأسئلة الحساسة وتركز على المهارات والمتطلبات.
        """
        prompt = f"""
Generate a structured interview plan for a candidate.
Job Requirements: {job_post.get('requirements', 'N/A')}
Candidate Profile: {candidate_profile.get('summary', 'N/A')}
Gaps Identified: {candidate_profile.get('gaps', 'None')}

STRICT RULES:
1. DO NOT ask about age, religion, gender, marital status, nationality, disability, health, or political views.
2. Focus on: experience, technical skills, project discussion, behavioral, and availability.
3. Salary expectation should be handled as information gathering only.
4. Language: Arabic (for questions).

Required JSON structure:
{{
  "sections": [
    {{
      "section_name": "technical|experience|behavioral|salary_expectation|availability",
      "questions": ["question 1", "question 2"]
    }}
  ],
  "estimated_minutes": 15
}}
"""
        messages = [{"role": "system", "content": "You are a professional hiring manager expert in structured interviews."},
                    {"role": "user", "content": prompt}]
        
        # Define schema for guaranteed output
        schema = {
            "type": "object",
            "properties": {
                "sections": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "section_name": {"type": "string", "enum": ["technical", "experience", "behavioral", "salary_expectation", "availability"]},
                            "questions": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["section_name", "questions"]
                    }
                },
                "estimated_minutes": {"type": "integer"}
            },
            "required": ["sections", "estimated_minutes"]
        }

        result = self.llm.generate_json(messages, schema=schema)
        
        sections = [InterviewPlanSection(**s) for s in result['sections']]
        
        return InterviewPlan(
            interview_id=interview_id,
            job_id=str(job_post.get('id', 'unknown')),
            candidate_id=str(candidate_profile.get('candidate_id', 'unknown')),
            sections=sections,
            estimated_minutes=result.get('estimated_minutes', 15)
        )

question_generator = InterviewQuestionGenerator()
