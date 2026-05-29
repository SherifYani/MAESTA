import os
import time
from typing import List, Optional

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from llama_cpp import Llama

# ─── Configuration ────────────────────────────────────────────────────────────
API_TOKEN = os.getenv("LLM_API_TOKEN", "change-me")
MODEL_REPO = os.getenv("MODEL_REPO", "Qwen/Qwen3-1.7B-GGUF")
MODEL_FILE = os.getenv("MODEL_FILE", "Qwen3-1.7B-Q8_0.gguf")
N_CTX = int(os.getenv("N_CTX", "2048"))
N_THREADS = int(os.getenv("N_THREADS", "2"))
MAX_TOKENS_DEFAULT = int(os.getenv("MAX_TOKENS_DEFAULT", "300"))

# ─── Load Model at Startup ────────────────────────────────────────────────────
print(f"[BOOT] Loading model: {MODEL_REPO} / {MODEL_FILE}")
print(f"[BOOT] n_ctx={N_CTX}, n_threads={N_THREADS}, n_gpu_layers=0 (CPU)")

llm = Llama.from_pretrained(
    repo_id=MODEL_REPO,
    filename=MODEL_FILE,
    n_ctx=N_CTX,
    n_threads=N_THREADS,
    n_gpu_layers=0,   # CPU Basic Free — no GPU
    verbose=False,
)

print("[BOOT] Model loaded successfully ✓")

# ─── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="MAESTA Qwen3 1.7B API",
    description="OpenAI-compatible API wrapper for Qwen3-1.7B-GGUF running on Hugging Face Spaces.",
    version="1.0.0",
)


# ─── Pydantic Schemas ──────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: Optional[str] = "qwen3-1.7b"
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.3
    max_tokens: Optional[int] = None   # falls back to MAX_TOKENS_DEFAULT


# ─── Helpers ───────────────────────────────────────────────────────────────────
def require_auth(authorization: Optional[str]) -> None:
    """Validate Bearer token; raise 401 if missing or wrong."""
    expected = f"Bearer {API_TOKEN}"
    if not authorization or authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized: invalid or missing Bearer token.")


def build_prompt(messages: List[ChatMessage]) -> str:
    """Convert a list of chat messages into a simple text prompt."""
    prompt = ""
    for msg in messages:
        role = msg.role.lower().strip()
        content = msg.content.strip()

        if role == "system":
            prompt += f"System: {content}\n"
        elif role == "user":
            prompt += f"User: {content}\n"
        elif role == "assistant":
            prompt += f"Assistant: {content}\n"

    prompt += "Assistant:"
    return prompt


# ─── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    """Basic status endpoint — no auth required."""
    return {
        "status": "ok",
        "service": "MAESTA Qwen3 1.7B API",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    """Health check — no auth required."""
    return {
        "status": "ok",
        "model_repo": MODEL_REPO,
        "model_file": MODEL_FILE,
        "n_ctx": N_CTX,
        "n_threads": N_THREADS,
    }


@app.get("/v1/models")
def list_models():
    """List available models — no auth required."""
    return {
        "object": "list",
        "data": [
            {
                "id": "qwen3-1.7b",
                "object": "model",
                "owned_by": "maesta",
            }
        ],
    }


@app.post("/v1/chat/completions")
def chat_completions(
    req: ChatRequest,
    authorization: Optional[str] = Header(None),
):
    """
    OpenAI-compatible chat completion endpoint.
    Requires: Authorization: Bearer <LLM_API_TOKEN>
    """
    require_auth(authorization)

    start = time.time()
    prompt = build_prompt(req.messages)
    max_tok = req.max_tokens if req.max_tokens is not None else MAX_TOKENS_DEFAULT
    temperature = req.temperature if req.temperature is not None else 0.3

    try:
        out = llm(
            prompt,
            max_tokens=max_tok,
            temperature=temperature,
            stop=["User:", "System:"],
            echo=False,
        )

        text = out["choices"][0]["text"].strip()
        latency = round(time.time() - start, 3)

        return {
            "id": "chatcmpl-maesta",
            "object": "chat.completion",
            "model": req.model or "qwen3-1.7b",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": text,
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
            },
            "maesta": {
                "latency_seconds": latency,
            },
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model inference error: {str(exc)}")
