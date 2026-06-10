# Agent Instructions

## Package Manager

Use **pip**: `pip install -r requirements.txt`

## Commit Attribution

AI commits MUST include:

```
Co-Authored-By: Antigravity Agent <noreply@google.com>
```

## File-Scoped Commands

| Task    | Command          |
| ------- | ---------------- |
| Run app | `python main.py` |

## Project Architecture

The project is organized into 4 main modules, each with its own `main.py` entry point:

| Module     | Path        | Description                                      |
| ---------- | ----------- | ------------------------------------------------ |
| **Agent**  | `agent/`    | LangGraph Supervisor + LLM Providers + RAG       |
| **Chatbot**| `chatbot/`  | Flask routes: Auth, Admin Dashboard, Public API  |
| **Quiz**   | `quiz/`     | Quiz generation pipelines & routes               |
| **CVs**    | `cvs/`      | ATS system: CV indexing & ranking pipelines      |

- `main.py` (root) → Flask App Factory, wires all modules together
- `services/` → shared internal services (keep imports from here)
- `models/`   → SQLite database layer
- `routes/`   → Flask Blueprints (imported by module main.py files)

## Key Conventions

- **Mandatory Language**: All artifacts and technical architectural discussions for this project must be communicated primarily in ARABIC.
- **Agent Architecture**: Use LangGraph patterns for workflows (e.g. `services/agent/agents/...`). Use Structured Outputs (Pydantic) instead of regex parsing for LLMs.
- Sentry/Error Handling: Ensure controlled fallback responses for the `OllamaService` timeouts.

## Interview System — Phase 2 Upgrades

| # | Upgrade | Status | Files |
|---|---------|--------|-------|
| 1 | Skill Knowledge Base | ✅ | `services/interview/knowledge/` (skill_rubrics.py, skill_knowledge_base.py, concept_matcher.py) |
| 2 | Interview Memory Engine | ✅ | `services/interview/memory/` (claim_tracker.py, contradiction_detector.py, interview_memory.py) |
| 3 | Advanced Consistency | ✅ | Enhanced `services/interview/evaluators/consistency_checker.py` (severity levels, evidence tracking, 6 risk types) |
| 4 | Anti-Cheating Engine | ✅ | `services/interview/security/` (behavior_analyzer.py, anti_cheat.py) |
| 5 | Coding Challenge Engine | ✅ | `services/interview/challenges/` (challenge_models.py, challenge_generator.py, challenge_evaluator.py) |
| 6 | Benchmarking Engine | ✅ | `services/interview/analytics/` (benchmark_engine.py, candidate_comparison.py) |
| 7 | Recruiter Copilot | ✅ | Enhanced `services/interview/reports/final_report.py` (risks, next_step, benchmark, trust_analysis) |
| 8 | Analytics Dashboard | ✅ | `templates/interview_analytics.html`, route at `/interview/analytics` |
| 9 | Redis Cache Layer | ✅ | `services/interview/cache/redis_cache.py` (in-memory fallback when Redis unavailable) |
| 10 | Scoring Enhancement | ✅ | `config.py` new weights: Technical=35%, Practical=20%, Experience=15%, Consistency=15%, Communication=10%, Trust=5% |

### Integration Points
- `answer_evaluator.py`: Now uses `concept_matcher` for knowledge score + concept_coverage
- `interview_state.py`: 10+ new fields (memory, anti_cheat, challenges, benchmarks, recruiter_copilot)
- `interview_graph.py`: New nodes for anti-cheat, challenge, benchmark; new edges: consistency → anti_cheat → challenge → benchmark → report
- `interview_service.py`: Persists practical_score, challenge evaluations
- `database.py`: New `interview_challenges` table + `practical_score` migration
- `base.html`: Analytics sidebar link added

