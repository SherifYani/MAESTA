"""
Nodes: Evaluate candidate answer, update skill score, decide next action.
"""
from core.logger import get_logger
from services.interview.evaluators.answer_evaluator import answer_evaluator
from services.interview.evaluators.skill_verifier import skill_verifier
from services.interview.evaluators.confidence_calculator import confidence_calculator
import config

logger = get_logger(__name__)


def evaluate_answer(state: dict) -> dict:
    question = state.get("current_question", {})
    answer = state.get("current_answer", "")
    skill = state.get("current_skill", "")
    jd_text = state.get("jd_text", "")
    cv_text = state.get("cv_text", "")
    is_followup = question.get("is_followup", False)

    if not answer.strip():
        return {
            "current_answer_evaluation": {
                "score": 0, "confidence": 0,
                "strengths": [], "weaknesses": ["No answer provided"],
                "missing_concepts": [], "explanation": "Candidate did not provide an answer.",
            }
        }

    evaluation = answer_evaluator.evaluate(
        question_text=question.get("question", ""),
        answer_text=answer,
        skill=skill,
        difficulty_level=question.get("difficulty_level", 1),
        jd_text=jd_text,
        cv_text=cv_text,
        is_followup=is_followup,
    )

    logger.info(
        f"Evaluated {'follow-up' if is_followup else 'main'} answer for '{skill}': "
        f"score={evaluation['score']:.1f}, confidence={evaluation['confidence']:.2f}"
    )

    # Populate skill_scores immediately so _persist_state captures progress
    skill_scores = dict(state.get("skill_scores", {}))
    if skill:
        skill_scores[skill] = evaluation.get("score", 0)

    return {
        "current_answer_evaluation": evaluation,
        "skill_scores": skill_scores,
        "message": f"Answer evaluated: score {evaluation['score']:.1f}%",
    }


def update_skill_score(state: dict) -> dict:
    skill = state.get("current_skill", "")
    evaluation = state.get("current_answer_evaluation", {})
    skill_scores = dict(state.get("skill_scores", {}))
    skill_assessments = list(state.get("skill_assessments", []))
    matched_skills = list(state.get("matched_skills", []))
    asked_questions = list(state.get("asked_questions", []))
    candidate_answers = list(state.get("candidate_answers", []))

    skill_entry = next((s for s in matched_skills if s["name"] == skill), {})
    claimed_level = skill_entry.get("claimed_level", 0)

    # Calculate running average for this skill
    skill_qa = [a for a in candidate_answers if a.get("skill") == skill]
    scores = [a.get("score", 0) for a in skill_qa] + [evaluation.get("score", 0)]
    avg_score = sum(scores) / len(scores) if scores else 0

    verified_level = avg_score
    confidence = confidence_calculator.calculate(
        scores=scores,
        questions_count=len(skill_qa) + 1,
        consistency=evaluation.get("confidence", 0.5),
    )

    skill_scores[skill] = avg_score

    assessment = {
        "skill": skill,
        "claimed_level": claimed_level,
        "verified_level": round(verified_level, 1),
        "confidence": round(confidence, 2),
        "questions_asked": len(skill_qa) + 1,
        "average_score": round(avg_score, 1),
        "evidence": [e.get("explanation", "") for e in [evaluation]],
    }
    skill_assessments.append(assessment)

    logger.info(f"Skill '{skill}' updated: verified={verified_level:.1f}, confidence={confidence:.2f}")

    current_idx = state.get("current_skill_index", 0)
    next_idx = current_idx + 1

    return {
        "skill_scores": skill_scores,
        "skill_assessments": skill_assessments,
        "current_skill_index": next_idx,
        "message": f"Skill '{skill}' score updated: {avg_score:.1f}%",
    }
