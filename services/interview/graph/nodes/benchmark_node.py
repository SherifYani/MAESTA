from core.logger import get_logger
from services.interview.analytics.benchmark_engine import benchmark_engine
from services.interview.analytics.candidate_comparison import candidate_comparison

logger = get_logger(__name__)


def run_benchmark_analysis(state: dict) -> dict:
    session_id = state.get("session_id", "")
    final_score = state.get("final_score", 0)
    skill_scores = state.get("skill_scores", {})
    job_id = state.get("job_id", "")
    company_id = state.get("company_id", "")

    benchmark = benchmark_engine.benchmark_candidate(
        candidate_score=final_score,
        company_id=company_id or None,
        job_id=job_id or None,
    )

    return {
        "benchmark": benchmark,
        "message": f"Benchmark: top {100 - benchmark.get('global_percentile', 50):.0f}% percentile",
    }
