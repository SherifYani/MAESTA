from core.logger import get_logger
from services.interview.security.anti_cheat import anti_cheat_engine
import config

logger = get_logger(__name__)


def run_anti_cheat_analysis(state: dict) -> dict:
    if not config.INTERVIEW_ENABLE_ANTI_CHEAT:
        return {"anti_cheat_report": {}, "suspicion_score": 0.0}

    answers = state.get("candidate_answers", [])
    
    # Stateless analysis of all answers collected so far
    report = anti_cheat_engine.analyze_answers(answers)

    return {
        "anti_cheat_report": report,
        "suspicion_score": report.get("suspicion_score", 0),
        "message": f"Anti-cheat: suspicion score {report.get('suspicion_score', 0):.2f}",
    }
