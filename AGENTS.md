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

