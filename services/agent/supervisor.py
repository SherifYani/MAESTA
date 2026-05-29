"""
Supervisor Agent — Routes incoming requests to the appropriate sub-agent.

Routing logic:
  QUIZ  → quiz_agent   (quiz / exam generation)
  RAG   → rag_graph    (questions over uploaded documents)
  CHAT  → chat_agent   (general conversation, greetings, calculations)

Routing strategy:
  1. Gemini Flash (fast path, ~100 ms) — used when API key is available.
  2. Local LLM fallback — used when Gemini is unavailable.
"""

import json
from typing import Literal

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph
from pydantic import BaseModel

from models import database
from services.agent.agents.chat_agent import agent_app as chat_agent_graph
# from services.agent.agents.quiz_agent import quiz_agent_node  # QUIZ disabled
from services.agent.agents.rag_graph import rag_graph_node
from services.agent.state import AgentState
from core.logger import get_logger
import config

logger = get_logger(__name__)

# ─────────────────────────────────────────────────────────────
# Pydantic Structured Output
# ─────────────────────────────────────────────────────────────

class RoutingDecision(BaseModel):
    """Structured output for the routing decision."""
    next: Literal["RAG", "CHAT"]


# ─────────────────────────────────────────────────────────────
# Router Prompt
# ─────────────────────────────────────────────────────────────

ROUTER_SYSTEM_PROMPT = """\
You are a request router. Read the user's message and select the correct agent.

AGENTS:
    # QUIZ disabled per user request. Routing moved to RAG/CHAT.

2. "RAG"   — Answer technical, educational, or informational questions. Search the knowledge base for answers.
             Use this for ANY question asking for definitions, explanations, advantages, steps, or software concepts.
             Keywords: ما هو, اشرح, مميزات, عيوب, خطوات, ابحث, in software, explain, what is.

3. "CHAT"  — STRICTLY for greetings, casual conversations, math calculations, and small-talk ONLY.
             Keywords: مرحبا, اهلا, ازيك, احسب.

EXAMPLES:
  "اعملي اختبار عن الـ AI"                 → {"next": "RAG"}
  "ايه هي مميزات وعيوب ال Waterfall"       → {"next": "RAG"}
  "What is Version management?"            → {"next": "RAG"}
  "اشرحلي الـ Agile"                       → {"next": "RAG"}
  "مرحبا"                                  → {"next": "CHAT"}
  "What is 2+2?"                           → {"next": "CHAT"}

OUTPUT: Return ONLY valid JSON — {"next": "RAG"} or {"next": "CHAT"}.
When uncertain about an informational question, default to "RAG".
"""

# ─────────────────────────────────────────────────────────────
# LLM Factory
# ─────────────────────────────────────────────────────────────

def _get_router_llm() -> ChatOpenAI:
    """Build local LLM for routing fallback."""
    settings = database.get_model_settings()
    model_name = settings.get("active_model", config.DEFAULT_MODEL)
    return ChatOpenAI(
        model=model_name,
        temperature=0,
        base_url=f"{config.OLLAMA_BASE_URL}/v1",
        api_key="no-key",
    )


# ─────────────────────────────────────────────────────────────
# Routing Helpers
# ─────────────────────────────────────────────────────────────

def _route_with_gemini(message: str) -> str | None:
    """
    Fast routing via Gemini Flash (~100 ms).
    Returns 'QUIZ', 'RAG', or 'CHAT'; None signals fallback to local LLM.
    """
    if not config.GEMINI_API_KEY:
        return None

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=config.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=config.GEMINI_FLASH_MODEL,
            contents=ROUTER_SYSTEM_PROMPT + f"\n\nUser message: {message}",
            config=types.GenerateContentConfig(
                temperature=0.0,
                max_output_tokens=30,
                response_mime_type="application/json",
            ),
        )
        data = json.loads(response.text or "{}")
        decision = data.get("next", "CHAT")
        if decision not in ("QUIZ", "RAG", "CHAT"):
            decision = "CHAT"

        logger.info(f"[Supervisor] ⚡ Gemini routed → {decision}")
        return decision

    except Exception as exc:
        logger.warning(f"[Supervisor] Gemini routing failed: {exc}")
        return None


def _route_with_local_llm(message: str) -> str:
    """
    Fallback routing via the local LLM.
    Returns 'QUIZ', 'RAG', or 'CHAT'.
    """
    # 1. Very Fast Keyword Pre-filter to avoid agonizingly slow local LLM generations
    msg_lower = message.lower()
        
    rag_keywords = [
        'ما هو', 'ايه هو', 'إيه هو', 'من أنت', 'من انت', 'إنت مين', 'انت مين', 'ما هي', 'ما هى',
        'اشرح', 'إشرح', 'مميزات', 'عيوب', 'خطوات', 'ابحث', 'إبحث', 'ازاي', 'إزاي', 'كيف', 'ليه', 'الفرق',
        'بيانات', 'معلومات', 'تفاصيل', 'شركة', 'موقع', 'ملف', 'مستند',
        'what is', 'explain', 'how', 'why', 'compare', 'advantage', 'data', 'information', 'company', 'identity'
    ]
    if any(k in msg_lower for k in rag_keywords):
        logger.info("[Supervisor] ⚡ Keyword pre-filter routed → RAG")
        return "RAG"
        
    chat_keywords = ['مرحبا', 'اهلا', 'أهلا', 'ازيك', 'إزيك', 'هلا', 'hello', 'hi', 'hi there']
    if any(msg_lower.strip().startswith(k) for k in chat_keywords):
        logger.info("[Supervisor] ⚡ Keyword pre-filter routed → CHAT")
        return "CHAT"

    # 2. If it's a completely ambiguous query, use the local LLM (slow path)
    if not config.USE_UTILITY_LLM:
        logger.warning("[Supervisor] No keyword match and Utility LLM is disabled. Defaulting to RAG.")
        return "RAG"

    logger.info("[Supervisor] No exact keyword match found, evaluating via Local LLM...")
    response = None
    try:
        llm = _get_router_llm()
        response = llm.invoke([
            SystemMessage(content=ROUTER_SYSTEM_PROMPT),
            HumanMessage(content=message),
        ])

        raw = str(response.content).strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        data = json.loads(raw)
        decision = data.get("next", "CHAT")
        if decision not in ("RAG", "CHAT"):
            decision = "RAG"

        logger.info(f"[Supervisor] 🤖 Local LLM routed → {decision}")
        return decision

    except json.JSONDecodeError:
        # Last-resort keyword scan
        content = str(response.content) if response else ""
        upper = content.upper()
        if "QUIZ" in upper:
            return "QUIZ"
        if "RAG" in upper:
            return "RAG"
        return "CHAT"

    except Exception as exc:
        logger.error(f"[Supervisor] Local LLM routing error: {exc}. Defaulting to CHAT.")
        return "CHAT"


# ─────────────────────────────────────────────────────────────
# Supervisor Node
# ─────────────────────────────────────────────────────────────

def supervisor_node(state: AgentState) -> dict:
    """
    Classify the latest user message and set state['next'] to the
    appropriate sub-agent: 'QUIZ', 'RAG', or 'CHAT'.
    """
    messages = state.messages
    last_message = messages[-1].content if messages else ""

    # Skip Gemini when local-first mode is active
    decision: str | None = None
    if not getattr(config, "PRIORITIZE_LOCAL", False):
        decision = _route_with_gemini(str(last_message))

    if decision is None:
        decision = _route_with_local_llm(str(last_message))

    logger.info(f"[Supervisor] Final decision → {decision}")
    return {"next": decision}


# ─────────────────────────────────────────────────────────────
# Chat Agent Wrapper
# ─────────────────────────────────────────────────────────────

def _call_chat_agent(state: AgentState) -> dict:
    """Invoke chat_agent sub-graph and surface only its last message."""
    result = chat_agent_graph.invoke(state)
    # LangGraph returns the state object or a dict; if it's our Pydantic state:
    if hasattr(result, "messages"):
        return {"messages": [result.messages[-1]]}
    return {"messages": [result["messages"][-1]]}


# ─────────────────────────────────────────────────────────────
# Graph Assembly
# ─────────────────────────────────────────────────────────────

def _build_supervisor_graph() -> CompiledStateGraph:
    graph = StateGraph(AgentState)

    # ── Nodes ─────────────────────────────────────────────────
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("rag_graph", rag_graph_node)
    graph.add_node("chat_agent", _call_chat_agent)

    # ── Edges ─────────────────────────────────────────────────
    graph.set_entry_point("supervisor")

    graph.add_conditional_edges(
        "supervisor",
        lambda state: state.next,
        {
            "RAG": "rag_graph",
            "CHAT": "chat_agent",
        },
    )

    graph.add_edge("rag_graph", END)
    graph.add_edge("chat_agent", END)

    return graph.compile()


# Compiled graph (singleton)
supervisor_app = _build_supervisor_graph()
