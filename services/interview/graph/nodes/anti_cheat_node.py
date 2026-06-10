from core.logger import get_logger
from services.interview.security.anti_cheat import anti_cheat_engine
import config

logger = get_logger(__name__)


def run_anti_cheat_analysis(state: dict) -> dict:
    if not config.INTERVIEW_ENABLE_ANTI_CHEAT:
        return {"anti_cheat_report": {}, "suspicion_score": 0.0}

    answers = state.get("candidate_answers", [])

    for a in answers:
        anti_cheat_engine.analyze_answer(
            answer_text=a.get("answer", ""),
            score=a.get("score", 0),
            skill=a.get("skill", ""),
        )
    report = anti_cheat_engine.get_full_report()

    return {
        "anti_cheat_report": report,
        "suspicion_score": report.get("suspicion_score", 0),
        "message": f"Anti-cheat: suspicion score {report.get('suspicion_score', 0):.2f}",
    }
