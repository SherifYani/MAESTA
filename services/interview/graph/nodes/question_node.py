"""
Nodes: Generate main question and follow-up questions using the question generator.
"""
from core.logger import get_logger
from services.interview.generators.question_generator import question_generator
from services.interview.generators.followup_generator import followup_generator
from services.interview.knowledge.topic_tracker import topic_tracker, get_unasked_topic

logger = get_logger(__name__)


def generate_question(state: dict) -> dict:
    skill = state.get("current_skill", "")
    matched_skills = state.get("matched_skills", [])
    skill_entry = next((s for s in matched_skills if s["name"] == skill), {})
    difficulty = 1
    if skill_entry.get("claimed_level", 0) > 70:
        difficulty = 2
    if skill_entry.get("claimed_level", 0) > 85:
        difficulty = 3

    # Check if there's already an unanswered question for this skill
    asked = state.get("asked_questions", [])
    answers = state.get("candidate_answers", [])
    answered_qids = {a.get("question_id") for a in answers}

    # Find the last question for this skill that hasn't been answered
    for q in reversed(asked):
        if q.get("skill") == skill and q.get("id") not in answered_qids:
            logger.info(f"Reusing unanswered question for skill '{skill}': {q.get('id')}")
            return {
                "current_question": q,
                "current_question_id": q.get("id", ""),
                "message": f"Reusing pending question for {skill}",
            }

    # Track asked topics for this skill
    asked_topics = set()
    for q in asked:
        if q.get("skill") == skill and q.get("topic"):
            asked_topics.add(q["topic"])

    # Select an unasked topic for this skill
    target_topic = get_unasked_topic(skill, asked_topics)

    # No pending question - generate new one
    context = state.get("cv_text", "")[:2000]
    previous_answers = [a.get("candidate_answer", "") for a in answers if a.get("skill") == skill]

    result = question_generator.generate(
        skill=skill,
        difficulty_level=difficulty,
        question_type="technical",
        context=context,
        previous_answers=[a for a in previous_answers],
        target_topic=target_topic,
        asked_topics=list(asked_topics),
    )

    # Extract topic from generated question
    from services.interview.knowledge.topic_tracker import topic_tracker
    extracted_topic = topic_tracker.extract_topic_from_question(result.get("question", ""), skill)

    logger.info(f"Generated question for skill '{skill}' at difficulty {difficulty}, topic: {target_topic or extracted_topic}")

    return {
        "current_question": result,
        "current_question_id": result.get("id", ""),
        "asked_questions": [result],
        "message": f"Question generated for {skill}",
    }


def generate_followup(state: dict) -> dict:
    skill = state.get("current_skill", "")
    last_answer = state.get("current_answer", "")
    last_eval = state.get("current_answer_evaluation", {})
    followup_count = state.get("skill_followup_count", 0)

    previous_qa = []
    questions = state.get("asked_questions", [])
    answers = state.get("candidate_answers", [])
    for q, a in zip(questions, answers):
        if q.get("skill") == skill:
            previous_qa.append({"question": q.get("question", ""), "answer": a.get("candidate_answer", "")})

    result = followup_generator.generate(
        skill=skill,
        last_answer=last_answer,
        last_evaluation=last_eval,
        followup_count=followup_count,
        previous_qa=previous_qa,
        language="ar",
    )

    new_count = followup_count + 1
    logger.info(f"Generated follow-up #{new_count} for skill '{skill}'")

    return {
        "current_question": result,
        "current_question_id": result.get("id", ""),
        "asked_questions": [result],
        "skill_followup_count": new_count,
        "message": f"Follow-up question #{new_count} generated",
    }
