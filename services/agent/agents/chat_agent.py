"""
Agent Graph - Defines and builds the LangGraph executable workflow.
Implements a ReAct-style agent loop.
"""
from typing import Literal, Annotated
import logging

from pydantic import BaseModel

from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

from models import database
from services.agent.state import AgentState
from services.agent.tools_registry import get_agent_tools
from core.logger import get_logger
import config

logger = get_logger(__name__)

# --- Configuration ---
def get_chat_llm_with_tools():
    """Build LLM with tied tools from DB settings"""
    settings = database.get_model_settings()
    model_name = settings.get('active_model', config.DEFAULT_MODEL)
    
    try:
        llm = ChatOpenAI(
            model=model_name, 
            temperature=settings.get('temperature', 0),
            base_url=f"{config.OLLAMA_BASE_URL}/v1",
            api_key="no-key"
        )
        
        # Skip tools for specific models that don't support them
        if "company-assistant" in model_name or "qwen3" in model_name:
            logger.info(f"Model {model_name} may not support tools. Skipping tool binding.")
            return llm, {}

        tools = get_agent_tools()
        llm_with_tools = llm.bind_tools(tools)
        tool_map = {t.name: t for t in tools}
        return llm_with_tools, tool_map
    except Exception as e:
        logger.error(f"Failed to initialize LLM/Tools with model {model_name}: {e}")
        return None, {}

# --- Nodes ---

def reasoner(state: AgentState):
    """
    The Brain: Decides what to do next based on the state.
    """
    messages = state.messages
    
    # Use Dynamic Company Prompt if enabled, otherwise use static MAESTA persona
    if config.COMPANY_ASSISTANT_MODE:
        from services.agent.agents.company_prompt import build_company_system_prompt
        system_content = build_company_system_prompt()
    else:
        system_content = """\
You are MAESTA, an intelligent conversational assistant.
Your role is general conversation, answering knowledge questions, and performing calculations.

TOOLS:
- `calculator`: Use for any arithmetic or mathematical calculation.

RULES:
- **LANGUAGE**: Always respond in the same language as the user (Arabic or English).
- **FORMATTING**: Use clear markdown — headers, bullets, bold for key terms.
- **NO FILLER**: Never start with "Sure!", "Of course!", "Great question!" — go straight to the answer.
- **HONEST**: If you don't know something, say so. Do not fabricate facts.
- **SCOPE**: You handle general questions and calculations only.
  Document-specific questions are handled by a dedicated RAG Agent.
"""
    
    system_prompt = SystemMessage(content=system_content)
    
    # Prepend system message if not exists
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [system_prompt] + messages
    
    logger.info(f"Agent Reasoning on {len(messages)} messages...")
    
    llm_with_tools, _ = get_chat_llm_with_tools()
    
    if not llm_with_tools:
        return {"messages": [AIMessage(content="Error: Agent LLM not initialized.")]}

    try:
        # Simple invocation
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"Reasoning error: {e}")
        return {"messages": [AIMessage(content="I encountered an error while thinking.")]}

def tool_executor(state: AgentState):
    """
    Executes tools requested by the LLM.
    """
    messages = state.messages
    last_message = messages[-1]
    
    # We expect tool_calls in the last message
    tool_calls = getattr(last_message, 'tool_calls', [])
    results = []
    
    for tool_call in tool_calls:
        tool_name = tool_call['name']
        tool_args = tool_call['args']
        tool_id = tool_call['id']
        
        logger.info(f"Agent Executing Tool: {tool_name} with {tool_args}")
        
        _, tool_map = get_chat_llm_with_tools()
        
        if tool_name in tool_map:
            start_tool = tool_map[tool_name]
            try:
                tool_output = start_tool.invoke(tool_args)
            except Exception as e:
                tool_output = f"Error executing tool {tool_name}: {e}"
        else:
            tool_output = f"Error: Tool {tool_name} not found."
            
        # Create ToolMessage
        results.append(ToolMessage(
            tool_call_id=tool_id,
            name=tool_name,
            content=str(tool_output)
        ))
        
    return {"messages": results}

# --- Conditional Edges ---

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    """
    Decide whether to execute tools or end.
    Hard-limit of MAX_ITERATIONS to prevent infinite loops with small models.
    """
    messages = state.messages
    last_message = messages[-1]
    
    # Count how many tool-call rounds have happened
    tool_rounds = sum(1 for m in messages if hasattr(m, 'tool_calls') and m.tool_calls)
    if tool_rounds >= config.MAX_ITERATIONS:
        logger.warning(f"Max iterations ({config.MAX_ITERATIONS}) reached. Forcing END.")
        return "__end__"
    
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return "__end__"

# --- Graph Definition ---

def build_graph():
    workflow = StateGraph(AgentState)

    # Define nodes
    workflow.add_node("agent", reasoner)
    workflow.add_node("tools", tool_executor)

    # Define edges
    workflow.set_entry_point("agent")

    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END
        }
    )

    workflow.add_edge("tools", "agent")

    return workflow.compile()

# Singleton instance
agent_app = build_graph()
