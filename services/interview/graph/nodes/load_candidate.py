"""
Node: Load candidate data, job description, and ATS results from DB.
"""
import json
from models import database
from core.logger import get_logger

logger = get_logger(__name__)


def load_candidate_data(state: dict) -> dict:
    session_id = state.get("session_id", "")
    candidate_id = state.get("candidate_id", "")
    job_id = state.get("job_id", "")

    # Load interview session from DB
    session = database.get_interview_session(session_id)
    if not session:
        return {"error": f"Interview session {session_id} not found", "interview_status": "error"}

    # Load ATS job
    job = database.get_ats_job_by_id(job_id)
    jd_text = job.get("description", "") if job else ""
    job_title = job.get("title", "") if job else ""

    results_json = {}
    if job and job.get("results_json"):
        try:
            results_json = json.loads(job["results_json"])
        except (json.JSONDecodeError, TypeError):
            results_json = {}

    # Find this candidate in ATS results
    candidate_data = {}
    candidates = results_json.get("top_candidates", [])
    for c in candidates:
        if str(c.get("id", "")) == str(candidate_id):
            candidate_data = c
            break

    cv_text = candidate_data.get("summary", "") or candidate_data.get("why_selected", "")

    if not cv_text:
        cv_text = job.get("description", "")[:500] if job else ""

    # Populate ATS results summary
    ats_summary = {
        "job_title": job_title,
        "candidates_found": len(candidates),
        "candidate_rank": candidate_data.get("rank", 0),
        "ats_score": candidate_data.get("overall_score", 0),
        "strengths": candidate_data.get("strengths", []),
        "weaknesses": candidate_data.get("weaknesses", []),
    }

    logger.info(f"Loaded candidate {candidate_id} for job {job_id}")

    return {
        "candidate_data": candidate_data,
        "job_description": job,
        "ats_results": ats_summary,
        "cv_text": cv_text,
        "jd_text": jd_text,
        "interview_status": "in_progress",
        "message": f"Loaded candidate for position: {job_title}",
    }
