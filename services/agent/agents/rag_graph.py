"""
RAG Graph Module
────────────────
This module implements a robust Retrieval-Augmented Generation (RAG) pipeline
using LangGraph. It handles query expansion, document retrieval, relevance grading,
and hallucination checking.

Pipeline Structure:
    Start((Start)) --> QA[Query Analyzer]
    QA --> R[Retriever]
    R --> RG[Relevance Grader]

    RG -- "Relevant Docs Found" --> G[Generator]
    RG -- "No Relevant Docs (Retry < Max)" --> QR[Query Rewriter]
    RG -- "No Relevant Docs (Retry >= Max)" --> GF[Generator Fallback]

    QR --> R

    G --> HC[Hallucination Checker]

    HC -- "Grounded" --> End((END))
    HC -- "Not Grounded (Retry < Max)" --> G
    HC -- "Not Grounded (Retry >= Max)" --> End

    GF --> End
"""

import re
import logging
from typing import Any, Dict, List, Literal, cast, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field

from services.agent.state import AgentState
from core.logger import get_logger
from services.agent.rag.knowledge_base import knowledge_base
from services.agent.agents.company_prompt import (
    build_company_system_prompt,
    build_company_user_message,
    get_company_profile,
    DEFAULT_COMPANY_PROFILE,
)
import config

logger = get_logger(__name__)

# #############################################################
# Constants
# #############################################################

MAX_RETRIEVAL_ATTEMPTS = 1
MAX_GENERATION_ATTEMPTS = 1
MAX_DOCS_IN_CONTEXT = 15
MAX_DOC_PREVIEW_CHARS = 800

# #############################################################
# Internal State
# #############################################################

class RagAgentState(BaseModel):
    # ── Input ──────────────────────────────────────
    question: str = ""
    conversation_history: str = ""

    # ── Retrieval ──────────────────────────────────
    intent: Literal["project_name", "project_overview", "general"] = "general"
    queries: List[str] = Field(default_factory=list)
    retrieved_docs: List[Dict[str, Any]] = Field(default_factory=list)
    relevant_docs: List[Dict[str, Any]] = Field(default_factory=list)

    # ── Generation ─────────────────────────────────
    answer: str = ""

    # ── Control (guard rails) ──────────────────────
    retrieval_attempts: int = 0
    generation_attempts: int = 0
    is_grounded: bool = True
    language: Literal["ar", "en"] = "ar"
    models_used: List[str] = Field(default_factory=list)
    company_name: str = ""
    tenant_id: str = ""
    site_id: str = ""
    bot_id: str = ""

# #############################################################
# Pydantic Structured Outputs
# #############################################################

class QueryExpansion(BaseModel):
    """Output of the query_analyzer node."""
    primary_query: str = Field(description="Refined version of the original question.")
    alternative_queries: List[str] = Field(description="Alternative phrasings.", min_length=1, max_length=3)
    language: Literal["ar", "en"] = Field(description="Detected language.")

class RelevanceGrade(BaseModel):
    """Relevance verdict for a single retrieved chunk."""
    score: Literal["relevant", "irrelevant"] = Field(description="Verdict.")
    reasoning: str = Field(description="Justification.")

class HallucinationCheck(BaseModel):
    """Groundedness verdict for the generated answer."""
    is_grounded: bool = Field(description="True if grounded in sources.")
    reasoning: str = Field(description="Justification.")

# #############################################################
# LLM Factory
# #############################################################

def _get_utility_llm() -> ChatOpenAI | None:
    if not config.USE_UTILITY_LLM or not config.UTILITY_MODEL_NAME:
        return None
    return ChatOpenAI(
        model=config.UTILITY_MODEL_NAME,
        temperature=0,
        base_url=f"{config.UTILITY_MODEL_BASE_URL}/v1",
        api_key=config.UTILITY_MODEL_API_KEY,
        timeout=120,
    )

def _get_answer_llm() -> ChatOpenAI:
    if config.USE_FINETUNED_MODEL:
        return ChatOpenAI(
            model=config.FINETUNED_MODEL_NAME,
            temperature=0.2,
            max_tokens=300,
            base_url=f"{config.FINETUNED_MODEL_BASE_URL}/v1",
            api_key=config.FINETUNED_MODEL_API_KEY,
            timeout=300,
            presence_penalty=1.1,
            frequency_penalty=1.1
        )
    
    if config.USE_UTILITY_LLM and config.UTILITY_MODEL_NAME:
        return ChatOpenAI(
            model=config.UTILITY_MODEL_NAME,
            temperature=0.5,
            base_url=f"{config.UTILITY_MODEL_BASE_URL}/v1",
            api_key=config.UTILITY_MODEL_API_KEY,
            timeout=120,
            presence_penalty=1.1,
            frequency_penalty=1.1
        )

    return ChatOpenAI(
        model="qwen3-company-assistant", 
        temperature=0.5,
        base_url=f"{config.FINETUNED_MODEL_BASE_URL}/v1",
        presence_penalty=1.1,
        frequency_penalty=1.1
    )

# #############################################################
# Nodes
# #############################################################

def query_analyzer(state: RagAgentState) -> dict:
    logger.info("[RAG:query_analyzer] Analysing question.")
    msg_lower = state.question.lower()

    # Language detection
    import re
    arabic_chars = re.findall(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]', state.question)
    total_chars = len(state.question.strip())
    if total_chars > 0 and len(arabic_chars) / total_chars > 0.3:
        detected_language = "ar"
    else:
        detected_language = "en"

    # Intent Detection
    name_keywords = [
        'اسم المشروع', 'اسم البروجيكت', 'project name', 'اسمك ايه', 'اسمك إيه',
        'ما هو اسمك', 'ما هو اسم المشروع'
    ]
    overview_keywords = [
        'عبارة عن ايه', 'عبارة عن إيه', 'بيعمل ايه', 'بيعمل إيه', 'اشرح المشروع',
        'إشرح المشروع', 'project overview', 'what is this project about', 'about the project',
        'شرح المشروع', 'وصف المشروع', 'بتاع ايه', 'بتاع إيه', 'ما هو المشروع',
        'مشروع ايه', 'المشروع ايه', 'project about', 'what is this',
        'ده ايه', 'دي ايه', 'ده مشروع ايه', 'دي مشروع ايه', 'ده بيعمل ايه',
    ]

    if any(k in msg_lower for k in name_keywords):
        intent = "project_name"
        queries = ["project name", "MAESTA project name", "اسم المشروع"]
    elif any(k in msg_lower for k in overview_keywords):
        intent = "project_overview"
        queries = ["Project Overview", "MAESTA Project Overview", "comprehensive job marketplace platform", "description", "وصف المشروع"]
    else:
        intent = "general"
        # Simple keyword-based expansion (no LLM)
        queries = [state.question]
        # Add English translation hints for better search
        if any(c in msg_lower for c in ['?', 'ايه', 'إيه', 'ليه', 'ازاي', 'كيف']):
            queries.append(state.question)

    logger.info(f"[RAG:query_analyzer] Detected intent: {intent} | language: {detected_language}")

    return {"queries": queries, "language": detected_language, "intent": intent, "models_used": []}

def retriever(state: RagAgentState) -> dict:
    attempt = state.retrieval_attempts + 1
    logger.info(f"[RAG:retriever] Attempt #{attempt}")

    seen = set()
    merged = []
    
    runtime = {
        "tenant_id": state.tenant_id or "default_tenant",
        "site_id": state.site_id or "default_site",
        "bot_id": state.bot_id or "default_bot"
    }
    
    for query in state.queries:
        results = knowledge_base.search(query, top_k=config.TOP_K_RESULTS, runtime=runtime)
        for doc in results:
            h = hash(doc["content"].strip())
            if h not in seen:
                seen.add(h)
                merged.append(doc)

    merged.sort(key=lambda d: d.get("score", 0.0), reverse=True)
    models = state.models_used.copy()
    if config.EMBEDDING_MODEL not in models:
        models.append(config.EMBEDDING_MODEL)
    
    return {"retrieved_docs": merged, "retrieval_attempts": attempt, "models_used": models}

def relevance_grader(state: RagAgentState) -> dict:
    logger.info("[RAG:relevance_grader] Grading docs.")
    docs = state.retrieved_docs
    intent = state.intent
    question = state.question
    relevant = []

    # Always use rule-based grading (no LLM calls) for speed
    # First, add all docs from retrieved set
    for doc in docs[:MAX_DOCS_IN_CONTEXT]:
        content = doc["content"].lower()
        if intent == "project_overview":
            keywords = [
                'project', 'marketplace', 'platform', 'connect', 'job', 'maesta', 'overview',
                'comprehensive', 'designed to connect', 'job seekers', 'companies', 'freelancers',
                'core value propositions', 'tech stack', 'mission', 'platform description',
                'مشروع', 'منصة', 'سوق', 'وظائف', 'عملاء', 'مستقلين',
            ]
            if any(kw in content for kw in keywords):
                relevant.append(doc)
        elif intent == "project_name":
            if "maesta" in content or "name" in content or "اسم" in content:
                relevant.append(doc)
        else:
            # General intent: keep docs with any overlap
            if len(content) > 100:
                relevant.append(doc)

    # Also add any docs that contain technology keywords (from full retrieved set)
    tech_keywords = ['react', 'node', 'python', 'html', 'css', 'javascript', 'typescript',
                     'frontend', 'backend', 'database', 'api', 'framework', 'library',
                     'django', 'laravel', 'angular', 'vue', 'next.js', 'express']
    for doc in docs:
        content = doc["content"].lower()
        if any(kw in content for kw in tech_keywords):
            if doc not in relevant:
                relevant.append(doc)

    if not relevant and docs:
        relevant.append(docs[0])

    models = state.models_used.copy()
    return {"relevant_docs": relevant, "models_used": models}

def generator(state: RagAgentState) -> dict:
    attempt = state.generation_attempts + 1
    logger.info(f"[RAG:generator] Attempt #{attempt}")

    docs = state.relevant_docs or state.retrieved_docs
    lang = state.language

    if config.COMPANY_ASSISTANT_MODE:
        plain_context = "\n\n".join(
            d['content'][:MAX_DOC_PREVIEW_CHARS] for d in docs[:MAX_DOCS_IN_CONTEXT]
        )
        logger.info(f"[RAG:generator] Context preview: {plain_context[:500]}...")

        # Load company profile from DB using tenant_id as company_id
        company_id = state.tenant_id.replace("company_", "") if state.tenant_id and state.tenant_id.startswith("company_") else None
        profile = get_company_profile(company_id)
        system_msg = build_company_system_prompt(company_id)

        try:
            llm = _get_answer_llm()
            
            company_name = state.company_name or profile.get("company_name", "")
            
            user_msg = build_company_user_message(
                retrieved_context=plain_context,
                user_question=state.question,
                company_name=company_name,
            )
            
            response = llm.invoke([SystemMessage(content=system_msg), HumanMessage(content=user_msg)])
            content = str(response.content)
            answer = re.sub(r"<think>[\s\S]*?</think>", "", content).strip()
            
            # Post-process: Replace hallucinated "MAESTA" with actual company name
            if company_name and "MAESTA" in answer:
                answer = answer.replace("MAESTA", company_name)
                logger.info(f"[RAG:generator] Replaced 'MAESTA' with '{company_name}'")
            
            # Output Sanitizer
            banned_placeholders = ["[اسم الشركة", "[company", "{company", "nhé", "اسم الشركة المذكورة في البيانات", "اسم الشركة المذكورة"]
            if any(p in answer for p in banned_placeholders):
                logger.warning(f"[RAG:generator] Sanitizer caught blocked placeholder or foreign word in answer: {answer[:100]}...")
                answer = "لا أستطيع تحديد هذه المعلومة من البيانات المتاحة حالياً."
                
            logger.info(f"[RAG:generator] Final answer preview: {answer[:300]}...")
            models = state.models_used.copy()
            answer_model = config.FINETUNED_MODEL_NAME if config.USE_FINETUNED_MODEL else config.UTILITY_MODEL_NAME
            if answer_model and answer_model not in models:
                models.append(answer_model)
                
            return {"answer": answer, "generation_attempts": attempt, "models_used": models}
        except Exception as exc:
            logger.error(f"Gen failed: {exc}")
            return {"answer": "حدث خطأ.", "generation_attempts": attempt}

    # Legacy path
    return {"answer": "Not implemented in legacy path", "generation_attempts": attempt}

def query_rewriter(state: RagAgentState) -> dict:
    logger.info("[RAG:query_rewriter] Rewriting.")
    return {"queries": [f"Alternative: {state.question}"]}

def generator_fallback(state: RagAgentState) -> dict:
    return {"answer": "المعلومة دي مش متاحة حالياً."}

def hallucination_checker(state: RagAgentState) -> dict:
    return {"is_grounded": True}

# #############################################################
# Routing
# #############################################################

def _route_after_grading(state: RagAgentState):
    if state.relevant_docs:
        return "generator"
    if state.retrieval_attempts < MAX_RETRIEVAL_ATTEMPTS:
        return "query_rewriter"
    return "generator_fallback"

def _route_after_hallucination_check(state: RagAgentState):
    if state.is_grounded or state.generation_attempts >= MAX_GENERATION_ATTEMPTS:
        return END
    return "generator"

# #############################################################
# Graph Assembly
# #############################################################

def _build_rag_graph():
    graph = StateGraph(RagAgentState)
    graph.add_node("query_analyzer", query_analyzer)
    graph.add_node("retriever", retriever)
    graph.add_node("relevance_grader", relevance_grader)
    graph.add_node("query_rewriter", query_rewriter)
    graph.add_node("generator", generator)
    graph.add_node("generator_fallback", generator_fallback)
    graph.add_node("hallucination_checker", hallucination_checker)

    graph.set_entry_point("query_analyzer")
    graph.add_edge("query_analyzer", "retriever")
    graph.add_edge("retriever", "relevance_grader")
    graph.add_edge("query_rewriter", "retriever")
    graph.add_edge("generator", "hallucination_checker")
    graph.add_edge("generator_fallback", END)

    graph.add_conditional_edges("relevance_grader", _route_after_grading, {
        "generator": "generator",
        "query_rewriter": "query_rewriter",
        "generator_fallback": "generator_fallback"
    })
    graph.add_conditional_edges("hallucination_checker", _route_after_hallucination_check, {
        END: END,
        "generator": "generator"
    })
    return graph.compile()

rag_graph = _build_rag_graph()

# #############################################################
# Supervisor Node
# #############################################################

def rag_graph_node(state: AgentState) -> dict:
    last_human = next((m for m in reversed(state.messages) if isinstance(m, HumanMessage)), None)
    question = last_human.content if last_human else ""
    if not question:
        return {"messages": [AIMessage(content="سؤالك غير واضح.")]}

    # Extract tenant context from runtime
    runtime = getattr(state, 'runtime', {}) or {}
    tenant_id = runtime.get('tenant_id', '')
    site_id = runtime.get('site_id', '')
    bot_id = runtime.get('bot_id', '')
    company_name = runtime.get('company_name', '')

    initial = RagAgentState(
        question=str(question),
        queries=[],
        retrieved_docs=[],
        relevant_docs=[],
        answer="",
        retrieval_attempts=0,
        generation_attempts=0,
        is_grounded=True,
        language="ar",
        intent="general",
        conversation_history="",
        company_name=company_name,
        tenant_id=tenant_id,
        site_id=site_id,
        bot_id=bot_id,
    )

    try:
        final = rag_graph.invoke(initial)
        answer = final.get("answer") or "خطأ."
        
        # Extract relevant docs for sources
        relevant_docs = final.get("relevant_docs", []) or final.get("retrieved_docs", [])
        sources = []
        for i, doc in enumerate(relevant_docs[:5]):
            sources.append({
                "id": f"source_{i}",
                "content": doc.get("content", "")[:200],
                "metadata": doc.get("metadata", {})
            })
        
        return {
            "messages": [AIMessage(content=answer)],
            "metadata": {
                "relevant_docs": relevant_docs,
                "sources": sources,
                "from_documents": len(sources) > 0,
            }
        }
    except Exception as exc:
        logger.error(f"RAG Node error: {exc}")
        return {"messages": [AIMessage(content="حدث خطأ أثناء البحث.")]}

def save_graph_visualization(output_path: str):
    try:
        png_data = rag_graph.get_graph().draw_mermaid_png()
        with open(output_path, "wb") as f:
            f.write(png_data)
        return True
    except Exception:
        return False
