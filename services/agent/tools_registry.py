"""
Tools Registry — Defines tools available to the Chat Agent.

Note: RAG search is now handled exclusively by the dedicated RAG Agent.
      The Chat Agent only uses utility tools (e.g. calculator).
"""

from langchain_core.tools import tool

from core.logger import get_logger

logger = get_logger(__name__)


# ─────────────────────────────────────────────────────────────
# Tools
# ─────────────────────────────────────────────────────────────

@tool("calculator")
def calculator(expression: str) -> str:
    """
    Evaluate a simple mathematical expression and return the result.

    Use this for arithmetic questions (e.g. '25 * 4', '100 / 3 + 7').

    Args:
        expression: A mathematical expression string (e.g. '2 + 2').
    """
    _SAFE_BUILTINS = {"abs": abs, "round": round}
    try:
        code = compile(expression, "<calculator>", "eval")
        for name in code.co_names:
            if name not in _SAFE_BUILTINS:
                raise NameError(f"'{name}' is not allowed in expressions.")
        result = eval(code, {"__builtins__": {}}, _SAFE_BUILTINS)  # noqa: S307
        logger.info(f"[Calculator] {expression} = {result}")
        return str(result)
    except Exception as exc:
        logger.warning(f"[Calculator] Evaluation error: {exc}")
        return f"Error: {exc}"


# ─────────────────────────────────────────────────────────────
# Registry
# ─────────────────────────────────────────────────────────────

def get_agent_tools() -> list:
    """Return the list of tools available to the Chat Agent."""
    return [calculator]
