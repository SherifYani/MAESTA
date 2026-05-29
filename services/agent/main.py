"""
Agent Module — نقطة الدخول الرئيسية لوحدة وكيل الذكاء الاصطناعي
================================================================
هذا الملف يجمع كل مكونات الوكيل ويصدّرها كواجهة موحدة.

المكونات:
  - supervisor_app    : LangGraph Supervisor (QUIZ / RAG / CHAT)
  - chat_router       : Pipeline التوجيه الرئيسي للمحادثات
  - orchestrator      : Dual-LLM Orchestrator (Gemini + Ollama)
  - knowledge_base    : قاعدة المعرفة الخاصة بالـ RAG
  - conversation_memory: إدارة ذاكرة المحادثات
"""

# ── Supervisor Graph (LangGraph) ─────────────────────────────────────
from services.agent.supervisor import supervisor_app

# ── Main Chat Pipeline (Dual-LLM) ───────────────────────────────────
from services.agent.pipelines.chat_router import chat_router

# ── LLM Orchestrator ────────────────────────────────────────────────
from services.agent.llm.dual_llm_orchestrator import orchestrator

# ── RAG Knowledge Base ──────────────────────────────────────────────
from services.agent.rag.knowledge_base import knowledge_base

# ── Memory Management ───────────────────────────────────────────────
from services.agent.memory.memory_service import conversation_memory

# ── AI Storage Initialization (Phase 5) ─────────────────────────────
from services.agent.storage.ai_storage import AIStorage
AIStorage.initialize()

# ── LLM Providers (available for direct use if needed) ──────────────
from services.agent.llm.gemini_provider import GeminiProvider
from services.agent.llm.claude_provider import ClaudeProvider
from services.agent.llm.llama_provider import LlamaCppProvider
from services.agent.llm.janus_provider import JanusColabProvider

__all__ = [
    "supervisor_app",
    "chat_router",
    "orchestrator",
    "knowledge_base",
    "conversation_memory",
    "GeminiProvider",
    "ClaudeProvider",
    "LlamaCppProvider",
    "JanusColabProvider",
]
