from core.logger import get_logger
from services.interview.challenges.challenge_generator import challenge_generator
from services.interview.challenges.challenge_evaluator import challenge_evaluator
from services.interview.challenges.challenge_models import CodingChallenge, ChallengeSubmission
import config

logger = get_logger(__name__)


def generate_challenge(state: dict) -> dict:
    if not config.INTERVIEW_ENABLE_CHALLENGES:
        return {"challenge": {}, "message": "Challenges disabled"}

    skill = state.get("current_skill", "general")
    skill_assessments = state.get("skill_assessments", [])
    sa = next((a for a in skill_assessments if a.get("skill") == skill), {})
    difficulty = max(1, int(sa.get("verified_level", 50) / 25))

    challenge = challenge_generator.generate(skill=skill, difficulty_level=difficulty)
    challenge_dict = challenge.model_dump()

    return {
        "challenge": challenge_dict,
        "message": f"Generated {challenge_dict.get('challenge_type', 'coding')} challenge",
    }


def evaluate_challenge(state: dict) -> dict:
    challenge = state.get("challenge", {})
    submission = state.get("challenge_submission", {})

    if not challenge or not submission:
        return {
            "challenge_evaluation": {"overall_score": 0, "passed": False},
            "message": "No challenge or submission to evaluate",
        }

    challenge_model = CodingChallenge(**challenge)
    submission_model = ChallengeSubmission(**submission)

    evaluation = challenge_evaluator.evaluate(
        challenge=challenge_model,
        submission=submission_model,
    )

    return {
        "challenge_evaluation": evaluation.model_dump(),
        "message": f"Challenge evaluated: score {evaluation.overall_score:.1f}%",
    }
