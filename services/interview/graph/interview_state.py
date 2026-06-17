"""
Interview LangGraph State Definition
Uses TypedDict pattern consistent with existing MAESTA LangGraph infrastructure.
"""
from typing import TypedDict, List, Dict, Any, Optional, Annotated, Literal
from datetime import datetime
from enum import Enum
import operator


def _last_value(old: str, new: str) -> str:
    """Reducer that keeps the last value (for concurrent-safe message updates)."""
    return new


class QuestionType(Enum):
    MAIN = "main"
    FOLLOWUP = "followup"
    CHAT_CLARIFICATION = "chat"
    SKIP_CHECK = "skip_check"


class SkipReason(Enum):
    DONT_KNOW = "dont_know"
    NOT_RELEVANT = "not_relevant"
    TIME_PRESSURE = "time_pressure"
    OTHER = "other"


class InterviewState(TypedDict):
    # --- Identifiers ---
    session_id: str
    candidate_id: str
    job_id: str
    tenant_id: str
    company_id: str
    company_name: str

    # --- Loaded Data ---
    candidate_data: Dict[str, Any]
    job_description: Dict[str, Any]
    ats_results: Dict[str, Any]
    cv_text: str
    jd_text: str

    # --- Skills ---
    matched_skills: List[Dict[str, Any]]
    missing_skills: List[str]
    prioritized_skills: Annotated[List[Dict[str, Any]], operator.add]
    current_skill_index: int
    current_skill: str

    # --- Question / Answer ---
    current_question: Dict[str, Any]
    current_question_id: str
    current_answer: str
    current_answer_evaluation: Dict[str, Any]

    # --- History ---
    asked_questions: Annotated[List[Dict[str, Any]], operator.add]
    candidate_answers: Annotated[List[Dict[str, Any]], operator.add]

    # --- Per-Skill Tracking ---
    skill_questions_asked: int
    skill_followup_count: int
    skill_scores: Dict[str, float]
    skill_assessments: Annotated[List[Dict[str, Any]], operator.add]

    # --- Composite Scores ---
    technical_score: float
    practical_score: float
    experience_score: float
    communication_score: float
    consistency_score: float
    trust_score: float
    cv_match: float
    final_score: float

    # --- Consistency ---
    trust_gaps: Annotated[List[Dict[str, Any]], operator.add]
    risk_flags: Annotated[List[str], operator.add]
    risk_flags_detailed: Annotated[List[Dict[str, Any]], operator.add]
    consistency_result: Dict[str, Any]

    # --- Memory / Claims ---
    claims_history: Annotated[List[Dict[str, Any]], operator.add]
    contradictions: Annotated[List[Dict[str, Any]], operator.add]
    trust_events: Annotated[List[Dict[str, Any]], operator.add]

    # --- Anti-Cheat ---
    anti_cheat_report: Dict[str, Any]
    suspicion_score: float

    # --- Coding Challenge ---
    challenge: Dict[str, Any]
    challenge_submission: Dict[str, Any]
    challenge_evaluation: Dict[str, Any]

    # --- Benchmark ---
    benchmark: Dict[str, Any]

    # --- Report ---
    report: Dict[str, Any]
    recommendation: str
    report_generated: bool
    recruiter_copilot: Dict[str, Any]

    # --- Control ---
    interview_status: str
    error: str
    needs_human_input: bool
    message: Annotated[str, _last_value]

    # --- Time & Skip Tracking (NEW) ---
    started_at: str
    time_limit_minutes: int
    time_warnings_sent: List[int]
    main_questions_count: int
    followup_count_per_skill: Dict[str, int]
    chat_messages_count: int
    skipped_questions: List[Dict]
    last_skipped_question_id: Optional[str]
    skip_used_for_skill: Dict[str, bool]
    skip_reason: Optional[str]
    current_question_type: str
    current_question_topic: Optional[str]


def create_initial_state(
    session_id: str,
    candidate_id: str,
    job_id: str,
    tenant_id: str = "default_tenant",
    company_id: str = "",
    company_name: str = "",
    time_limit_minutes: int = 60,
) -> InterviewState:
    now = datetime.now().isoformat()
    return {
        "session_id": session_id,
        "candidate_id": candidate_id,
        "job_id": job_id,
        "tenant_id": tenant_id,
        "company_id": company_id,
        "company_name": company_name,
        "candidate_data": {},
        "job_description": {},
        "ats_results": {},
        "cv_text": "",
        "jd_text": "",
        "matched_skills": [],
        "missing_skills": [],
        "prioritized_skills": [],
        "current_skill_index": 0,
        "current_skill": "",
        "current_question": {},
        "current_question_id": "",
        "current_answer": "",
        "current_answer_evaluation": {},
        "asked_questions": [],
        "candidate_answers": [],
        "skill_questions_asked": 0,
        "skill_followup_count": 0,
        "skill_scores": {},
        "skill_assessments": [],
        "technical_score": 0.0,
        "practical_score": 0.0,
        "experience_score": 0.0,
        "communication_score": 0.0,
        "consistency_score": 0.0,
        "trust_score": 0.0,
        "cv_match": 0.0,
        "final_score": 0.0,
        "trust_gaps": [],
        "risk_flags": [],
        "risk_flags_detailed": [],
        "consistency_result": {},
        "claims_history": [],
        "contradictions": [],
        "trust_events": [],
        "anti_cheat_report": {},
        "suspicion_score": 0.0,
        "challenge": {},
        "challenge_submission": {},
        "challenge_evaluation": {},
        "benchmark": {},
        "report": {},
        "recommendation": "",
        "report_generated": False,
        "recruiter_copilot": {},
        "interview_status": "pending",
        "error": "",
        "needs_human_input": False,
        "message": "",
        # --- NEW FIELDS ---
        "started_at": datetime.now().isoformat(),
        "time_limit_minutes": time_limit_minutes,
        "time_warnings_sent": [],
        "main_questions_count": 0,
        "followup_count_per_skill": {},
        "chat_messages_count": 0,
        "skipped_questions": [],
        "last_skipped_question_id": None,
        "skip_used_for_skill": {},
        "skip_reason": None,
        "current_question_type": QuestionType.MAIN.value,
        "current_question_topic": None,
    }
