"""
Pydantic models for coding challenges.
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid


class CodingChallenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    skill: str = ""
    challenge_type: str = "coding"  # coding, sql, debugging, api_design, architecture
    title: str = ""
    description: str = ""
    difficulty_level: int = 1
    starter_code: str = ""
    expected_output: str = ""
    test_cases: List[Dict[str, Any]] = Field(default_factory=list)
    hints: List[str] = Field(default_factory=list)
    time_limit_minutes: int = 15
    language: str = "python"
    rubric: Dict[str, float] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class ChallengeSubmission(BaseModel):
    challenge_id: str = ""
    candidate_code: str = ""
    candidate_output: str = ""
    time_taken_seconds: int = 0
    session_id: str = ""
    submitted_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class ChallengeEvaluation(BaseModel):
    challenge_id: str = ""
    correctness_score: float = 0.0
    code_quality_score: float = 0.0
    efficiency_score: float = 0.0
    test_cases_passed: int = 0
    total_test_cases: int = 0
    overall_score: float = 0.0
    feedback: str = ""
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
