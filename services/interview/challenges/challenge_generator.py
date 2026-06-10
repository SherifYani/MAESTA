"""
Coding challenge generator — produces practical assessments for skill verification.
"""
import uuid
from typing import List, Dict, Any, Optional
from core.logger import get_logger
from services.agent.ollama_service import ollama_service
from services.interview.challenges.challenge_models import CodingChallenge
from services.interview.cache.redis_cache import redis_cache
import config
import json

logger = get_logger(__name__)

CHALLENGE_TEMPLATES = {
    "python": {
        "coding": {
            "beginner": "Write a function that ...",
            "intermediate": "Implement a class that ...",
            "advanced": "Design and implement a system that ...",
        },
        "debugging": {
            "beginner": "Fix the bug in this function: ...",
            "intermediate": "The following code has performance issues. Identify and fix them.",
            "advanced": "This distributed system has a race condition. Find and fix it.",
        },
    },
    "sql": {
        "coding": {
            "beginner": "Write a query to ...",
            "intermediate": "Write an optimized query that ...",
            "advanced": "Design a database schema and write queries for ...",
        },
    },
}


class ChallengeGenerator:
    def generate(self, skill: str, challenge_type: str = "coding",
                  difficulty_level: int = 2) -> CodingChallenge:
        cache_key = f"challenge:{skill}:{challenge_type}:{difficulty_level}"
        cached = redis_cache.get(cache_key)
        if cached:
            return CodingChallenge(**cached)

        prompt = self._build_prompt(skill, challenge_type, difficulty_level)
        try:
            resp = ollama_service.generate(
                prompt=prompt,
                model=config.INTERVIEW_DEFAULT_LLM_MODEL,
                temperature=0.7,
                max_tokens=512,
            )
            challenge = CodingChallenge(
                skill=skill,
                challenge_type=challenge_type,
                difficulty_level=difficulty_level,
                title=f"{challenge_type.replace('_', ' ').title()} Challenge: {skill}",
                description=resp.strip(),
                language="python" if "sql" not in skill.lower() else "sql",
                rubric={
                    "correctness": 0.4,
                    "code_quality": 0.3,
                    "efficiency": 0.3,
                },
            )
        except Exception as e:
            logger.warning(f"Challenge generation failed: {e}")
            challenge = self._fallback_challenge(skill, challenge_type, difficulty_level)

        redis_cache.set(cache_key, challenge.model_dump(), ttl=1800)
        return challenge

    def _build_prompt(self, skill: str, ctype: str, difficulty: int) -> str:
        return f"""Generate a {ctype} challenge for assessing {skill} skills at difficulty level {difficulty}/5.

Requirements:
- Clear problem description
- Specific expected output
- Should take 10-15 minutes to solve
- Tests practical knowledge, not theory
- Difficulty {difficulty}: {"Basic" if difficulty <= 2 else "Intermediate" if difficulty <= 3 else "Advanced"}

Return ONLY the challenge description. No labels."""

    def _fallback_challenge(self, skill: str, ctype: str, difficulty: int) -> CodingChallenge:
        templates = {
            "coding": f"Write a function that demonstrates your understanding of {skill}. Include error handling and follow best practices.",
            "sql": f"Write SQL queries to demonstrate your understanding of {skill} concepts including joins, aggregations, and optimization.",
            "debugging": f"The following {skill} code has bugs. Identify and fix all issues: [code placeholder]",
            "api_design": f"Design a REST API for a {skill} service. Include endpoints, request/response formats, and error handling.",
            "architecture": f"Design a scalable architecture for a {skill}-based system. Consider performance, reliability, and maintainability.",
        }
        desc = templates.get(ctype, templates["coding"])
        return CodingChallenge(
            skill=skill,
            challenge_type=ctype,
            difficulty_level=difficulty,
            title=f"{ctype.replace('_', ' ').title()} Challenge",
            description=desc,
        )


challenge_generator = ChallengeGenerator()
