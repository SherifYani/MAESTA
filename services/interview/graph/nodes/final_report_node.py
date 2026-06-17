"""
Node: Generate the final hiring report with deterministic scoring.
"""
from core.logger import get_logger
from services.interview.reports.final_report import final_report_generator
import config
import json

logger = get_logger(__name__)


def generate_final_report(state: dict) -> dict:
    weights = config.INTERVIEW_WEIGHTS
    thresholds = config.INTERVIEW_THRESHOLDS

    # Filter out skipped answers from scoring
    candidate_answers = state.get("candidate_answers", [])
    evaluated_answers = [a for a in candidate_answers if not a.get("skipped", False)]
    skipped_answers = [a for a in candidate_answers if a.get("skipped", False)]

    technical_score = state.get("technical_score", 0)
    practical_score = state.get("practical_score", 0)
    experience_score = state.get("experience_score", 0)
    consistency_score = state.get("consistency_score", 0)
    communication_score = state.get("communication_score", 0)
    trust_score = state.get("trust_score", 0)

    # Derive technical_score from skill assessments if not set
    if technical_score == 0 and state.get("skill_assessments"):
        scores = [s.get("verified_level", 0) for s in state["skill_assessments"]]
        technical_score = sum(scores) / len(scores) if scores else 0

    # Derive communication_score from answer quality (avg of evaluated answers' accuracy)
    if communication_score == 0 and evaluated_answers:
        answer_scores = [
            a.get("evaluation", {}).get("accuracy_score", a.get("score", 0))
            for a in evaluated_answers
        ]
        communication_score = sum(answer_scores) / len(answer_scores) if answer_scores else 50

    if experience_score == 0:
        experience_score = (technical_score * 0.7 + communication_score * 0.3)

    # Use challenge score for practical if available
    if practical_score == 0 and state.get("challenge_evaluation"):
        practical_score = state["challenge_evaluation"].get("overall_score", 0)

    # --- Dynamic weight redistribution ---
    # If no challenge was completed (practical=0), redistribute that 20% weight
    # proportionally across technical, experience, and communication.
    base_weights = dict(weights)  # copy from config
    has_challenge = practical_score > 0
    if not has_challenge:
        practical_w = base_weights.get("practical", 0.20)
        # Redistribute practical weight: 50% to technical, 30% to experience, 20% to communication
        base_weights["technical"] = base_weights.get("technical", 0.35) + practical_w * 0.50
        base_weights["experience"] = base_weights.get("experience", 0.15) + practical_w * 0.30
        base_weights["communication"] = base_weights.get("communication", 0.10) + practical_w * 0.20
        base_weights["practical"] = 0.0
        logger.info(f"No challenge submission — redistributed practical weight. New weights: {base_weights}")

    # Deterministic final score with adjusted weights
    final_score = (
        base_weights.get("technical", 0.35) * technical_score
        + base_weights.get("practical", 0.20) * practical_score
        + base_weights.get("experience", 0.15) * experience_score
        + base_weights.get("consistency", 0.15) * consistency_score
        + base_weights.get("communication", 0.10) * communication_score
        + base_weights.get("trust", 0.05) * trust_score
    )

    # Recommendation thresholds
    if final_score >= thresholds.get("strong_hire", 90):
        recommendation = "Strong Hire"
    elif final_score >= thresholds.get("hire", 80):
        recommendation = "Hire"
    elif final_score >= thresholds.get("maybe", 65):
        recommendation = "Maybe"
    elif final_score >= thresholds.get("weak_hire", 50):
        recommendation = "Weak Hire"
    else:
        recommendation = "Reject"

    candidate_data = state.get("candidate_data", {})
    job_description = state.get("job_description", {})
    ats_results = state.get("ats_results", {})

    report = final_report_generator.generate(
        final_score=round(final_score, 1),
        technical=round(technical_score, 1),
        practical=round(practical_score, 1),
        experience=round(experience_score, 1),
        communication=round(communication_score, 1),
        consistency=round(consistency_score, 1),
        trust=round(trust_score, 1),
        cv_match=ats_results.get("ats_score", 0) or state.get("cv_match", 0),
        trust_gaps=state.get("trust_gaps", []),
        risk_flags=state.get("risk_flags", []),
        risk_flags_detailed=state.get("risk_flags_detailed", []),
        anti_cheat_report=state.get("anti_cheat_report", {}),
        challenge_evaluation=state.get("challenge_evaluation", {}),
        benchmark=state.get("benchmark", {}),
        skipped_count=state.get("skipped_count", 0),
        total_questions=state.get("total_questions", len(candidate_answers)),
    )

    logger.info(f"Final report: score={final_score:.1f}, recommendation={recommendation}")

    return {
        "report": report,
        "recommendation": recommendation,
        "final_score": round(final_score, 1),
        "technical_score": round(technical_score, 1),
        "practical_score": round(practical_score, 1),
        "experience_score": round(experience_score, 1),
        "communication_score": round(communication_score, 1),
        "consistency_score": round(consistency_score, 1),
        "trust_score": round(trust_score, 1),
        "report_generated": True,
        "interview_status": "completed",
        "message": f"Interview complete. Recommendation: {recommendation} ({final_score:.1f}%)",
    }
