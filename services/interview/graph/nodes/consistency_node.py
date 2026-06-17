"""
Node: Run consistency analysis comparing claimed vs verified skills.
"""
from core.logger import get_logger
from services.interview.evaluators.consistency_checker import consistency_checker

logger = get_logger(__name__)


def run_consistency_analysis(state: dict) -> dict:
    skill_assessments = state.get("skill_assessments", [])
    candidate_answers = state.get("candidate_answers", [])
    cv_text = state.get("cv_text", "")
    jd_text = state.get("jd_text", "")

    analysis = consistency_checker.analyze(
        assessments=skill_assessments,
        answers=candidate_answers,
        cv_text=cv_text,
        jd_text=jd_text,
    )

    trust_gaps = analysis.get("trust_gaps", [])
    risk_flags = analysis.get("risk_flags", [])
    risk_flags_detailed = analysis.get("risk_flags_detailed", [])

    logger.info(f"Consistency analysis: score={analysis.get('consistency_score', 0):.1f}, flags={risk_flags}")

    return {
        "consistency_result": analysis,
        "trust_gaps": trust_gaps,
        "risk_flags": risk_flags,
        "risk_flags_detailed": risk_flags_detailed,
        "consistency_score": analysis.get("consistency_score", 0),
        "trust_score": analysis.get("trust_score", 0),
        "message": f"Consistency analysis complete: {len(risk_flags)} risk flags",
    }
