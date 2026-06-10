"""
Benchmark engine — compares candidate scores against historical interview data.
"""
import json
import statistics
from typing import List, Dict, Any, Optional
from datetime import datetime
from core.logger import get_logger
from models import database
from services.interview.cache.redis_cache import redis_cache

logger = get_logger(__name__)


class BenchmarkEngine:
    def compute_percentile(self, candidate_score: float,
                            comparison_scores: List[float]) -> float:
        if not comparison_scores:
            return 50.0
        below = sum(1 for s in comparison_scores if s < candidate_score)
        return (below / len(comparison_scores)) * 100

    def get_historical_scores(self, company_id: Optional[str] = None) -> List[float]:
        cache_key = f"historical_scores:{company_id or 'global'}"
        cached = redis_cache.get(cache_key)
        if cached is not None:
            return cached
        sessions = database.get_all_interview_sessions(company_id, limit=500)
        scores = [s.get("final_score", 0) for s in sessions if s.get("status") == "completed"]
        redis_cache.set(cache_key, scores, ttl=300)
        return scores

    def get_job_specific_scores(self, job_id: str) -> List[float]:
        cache_key = f"job_scores:{job_id}"
        cached = redis_cache.get(cache_key)
        if cached is not None:
            return cached
        all_sessions = database.get_all_interview_sessions(None, limit=500)
        scores = [s.get("final_score", 0) for s in all_sessions
                  if s.get("job_id") == job_id and s.get("status") == "completed"]
        redis_cache.set(cache_key, scores, ttl=300)
        return scores

    def benchmark_candidate(self, candidate_score: float,
                              company_id: Optional[str] = None,
                              job_id: Optional[str] = None) -> Dict[str, Any]:
        historical = self.get_historical_scores(company_id)
        job_scores = self.get_job_specific_scores(job_id) if job_id else []

        global_percentile = self.compute_percentile(candidate_score, historical) if historical else 50.0
        job_percentile = self.compute_percentile(candidate_score, job_scores) if job_scores else None

        def rank_label(pct):
            if pct >= 90: return "Top 10%"
            if pct >= 75: return "Top 25%"
            if pct >= 50: return "Above Average"
            if pct >= 25: return "Average"
            return "Below Average"

        result = {
            "candidate_score": candidate_score,
            "global_percentile": round(global_percentile, 1),
            "global_rank": rank_label(global_percentile),
            "historical_data_points": len(historical),
        }

        if job_percentile is not None:
            result["job_percentile"] = round(job_percentile, 1)
            result["job_rank"] = rank_label(job_percentile)
            result["job_data_points"] = len(job_scores)

        if historical:
            result["historical_mean"] = round(statistics.mean(historical), 1)
            result["historical_median"] = round(statistics.median(historical), 1)
            result["historical_std"] = round(statistics.stdev(historical), 1) if len(historical) > 1 else 0

        return result


benchmark_engine = BenchmarkEngine()
