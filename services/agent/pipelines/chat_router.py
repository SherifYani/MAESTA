"""
Chat Router Pipeline - Routes questions through the Dual-LLM Orchestrator.
Handles request routing, AI matching, and background tasks.
"""
from typing import Dict, Optional, Any, List
import asyncio
import threading
import json
import os

from models import database
from services.agent.rag.knowledge_base import knowledge_base
from services.agent.llm.dual_llm_orchestrator import orchestrator
from services.agent.agents.rag_graph import rag_graph, RagAgentState
from services.agent.components.nlp_service import nlp_service
from services.agent.memory.memory_service import conversation_memory
from core.logger import get_logger
import config

logger = get_logger(__name__)


def background_save_task(question: str, answer: str, source_type: str, sources: List, session_id: Optional[str], api_key_id: Optional[str], company_id: Optional[str] = None):
    """Background task to save chat history and memory without blocking the user response"""
    try:
        logger.debug(f"Background save task started for session {session_id}")
        conversation_memory.add_exchange(
            question=question, answer=answer,
            session_id=session_id,
            metadata={'source_type': source_type}
        )
        database.add_chat_history(
            api_key_id=api_key_id, question=question, answer=answer,
            source_type=source_type,
            source_documents=json.dumps(sources),
            session_id=session_id,
            company_id=company_id,
        )
        logger.debug(f"Background save task completed for session {session_id}")
    except Exception as e:
        logger.error(f"Background save task failed: {e}")


class ChatRouterPipeline:
    """Main routing pipeline powered by Dual-LLM Orchestrator"""

    def __init__(self):
        self.kb = knowledge_base
        self.orchestrator = orchestrator
        self.nlp = nlp_service
        self.memory = conversation_memory

    def get_event_loop(self):
        try:
            loop = asyncio.get_event_loop()
            if loop.is_closed():
                raise RuntimeError
            return loop
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            return loop

    def process_question(self, question: str, api_key_id: Optional[str] = None,
                         use_rag: bool = True, session_id: Optional[str] = None,
                         image_b64: Optional[str] = None, runtime: Optional[Any] = None) -> Dict:
        """Route the question through the Dual-LLM pipeline"""
        sid = session_id or api_key_id or "default_session"
        logger.info(f"Pipeline processing: {question[:30]}... | use_rag={use_rag} | agent={config.USE_AGENT} | has_image={bool(image_b64)}")

        loop = self.get_event_loop()

        # If an image is attached, always go to Janus-Pro Vision directly
        if image_b64:
            result = loop.run_until_complete(self._async_process_with_vision(question, image_b64, sid))
        elif config.USE_AGENT:
            try:
                result = self._process_with_agent(question, sid, runtime)
            except Exception as e:
                logger.error(f"Agent failed, falling back: {e}")
                if use_rag:
                    result = loop.run_until_complete(self._async_process_with_rag(question, sid, runtime))
                else:
                    result = loop.run_until_complete(self._async_process_with_nlp(question, sid))
        elif use_rag:
            result = loop.run_until_complete(self._async_process_with_rag(question, sid, runtime))
        else:
            result = loop.run_until_complete(self._async_process_with_nlp(question, sid))

        # Background save
        company_id = None
        if runtime:
            company_id = getattr(runtime, 'api_key_id', None)
            # Extract company_id from tenant_id if available
            tenant_id = getattr(runtime, 'tenant_id', '')
            if tenant_id and tenant_id.startswith('company_'):
                company_id = tenant_id.replace('company_', '')

        save_thread = threading.Thread(
            target=background_save_task,
            args=(question, result.get('answer', ''),
                  result.get('source_type', 'unknown'),
                  result.get('sources', []), sid, api_key_id, company_id)
        )
        save_thread.start()

        session_info = self.memory.get_session_info(sid)
        result['memory_info'] = {
            'message_count': session_info['message_count'] + 1,
            'has_context': session_info['message_count'] > 0
        }

        return result

    def _process_with_agent(self, question: str, session_id: str, runtime: Optional[Any] = None) -> Dict:
        """Agent processing using LangGraph Supervisor"""
        from services.agent.supervisor import supervisor_app
        from langchain_core.messages import HumanMessage, AIMessage
        import concurrent.futures

        AGENT_TIMEOUT_SECONDS = config.AGENT_TIMEOUT

        messages = []
        messages.append(HumanMessage(content=question))

        # Build runtime dict for tenant context
        runtime_dict = {}
        if runtime:
            runtime_dict = {
                "tenant_id": getattr(runtime, 'tenant_id', ''),
                "site_id": getattr(runtime, 'site_id', ''),
                "bot_id": getattr(runtime, 'bot_id', ''),
                "company_name": getattr(runtime, 'company_name', ''),
                "api_key_id": getattr(runtime, 'api_key_id', ''),
            }

        inputs = {"messages": messages, "runtime": runtime_dict}

        def run_agent():
            return supervisor_app.invoke(inputs, config={"recursion_limit": 10})

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(run_agent)
                output = future.result(timeout=AGENT_TIMEOUT_SECONDS)
        except concurrent.futures.TimeoutError:
            raise TimeoutError(f"Agent timed out after {AGENT_TIMEOUT_SECONDS}s")

        if "messages" in output and output["messages"]:
            response_text = output["messages"][-1].content
        else:
            response_text = "I'm sorry, I couldn't process your request."

        # Extract sources from RAG graph output if available
        sources = []
        from_documents = False
        
        # Check metadata for sources (from rag_graph_node)
        if "metadata" in output and output["metadata"]:
            meta = output["metadata"]
            if isinstance(meta, dict) and "sources" in meta:
                sources = meta["sources"]
                from_documents = meta.get("from_documents", False)
        
        # Fallback: check relevant_docs/retrieved_docs directly
        if not sources:
            if "relevant_docs" in output and output["relevant_docs"]:
                for i, doc in enumerate(output["relevant_docs"][:5]):
                    sources.append({
                        "id": f"source_{i}",
                        "content": doc.get("content", "")[:200],
                        "metadata": doc.get("metadata", {}),
                        "score": doc.get("score", 0.0)
                    })
                from_documents = len(sources) > 0
            elif "retrieved_docs" in output and output["retrieved_docs"]:
                for i, doc in enumerate(output["retrieved_docs"][:3]):
                    sources.append({
                        "id": f"source_{i}",
                        "content": doc.get("content", "")[:200],
                        "metadata": doc.get("metadata", {}),
                        "score": doc.get("score", 0.0)
                    })
                from_documents = len(sources) > 0

        settings = database.get_model_settings()
        return {
            'answer': response_text,
            'source_type': 'rag_graph' if from_documents else 'agent_network',
            'rag_enabled': True,
            'from_documents': from_documents,
            'models_used': [settings.get('active_model', config.DEFAULT_MODEL)],
            'sources': sources,
        }

    async def _async_process_with_rag(self, question: str, session_id: str, runtime: Optional[Any] = None) -> Dict:
        """Asynchronous RAG pipeline using the advanced RAG Graph workflow"""
        logger.info(f"Pipeline: Routing through RAG Graph... | Session: {session_id}")
        
        initial_state = RagAgentState(
            question=question,
            queries=[],
            retrieved_docs=[],
            relevant_docs=[],
            answer="",
            retrieval_attempts=0,
            generation_attempts=0,
            is_grounded=True,
            language="ar",
            tenant_id=runtime.tenant_id if runtime else "",
            site_id=runtime.site_id if runtime else "",
            bot_id=runtime.bot_id if runtime else "",
            company_name=getattr(runtime, 'company_name', '') if runtime else "",
        )

        try:
            # Using ainvoke for better async performance in the pipeline
            final_state = await rag_graph.ainvoke(initial_state)
            
            # Use attribute access for Pydantic state
            answer = getattr(final_state, "answer", "لم أتمكن من العثور على إجابة.")
            
            # Extract sources from graph state
            relevant_docs = getattr(final_state, "relevant_docs", []) or getattr(final_state, "retrieved_docs", [])
            sources = []
            for i, doc in enumerate(relevant_docs):
                sources.append({
                    "id": f"source_{i}",
                    "content": doc.get("content", "")[:200], # Preview
                    "metadata": doc.get("metadata", {})
                })

            settings = database.get_model_settings()
            return {
                'answer': answer,
                'source_type': 'rag_graph',
                'models_used': final_state.get("models_used", []),
                'sources': sources,
                'from_documents': len(sources) > 0,
                'rag_enabled': True,
                'is_grounded': final_state.get("is_grounded", True)
            }
        except Exception as e:
            logger.error(f"RAG Graph failed in pipeline: {e}")
            return {
                'answer': "عذراً، حدث خطأ أثناء معالجة المستندات.",
                'source_type': 'error',
                'rag_enabled': True,
                'sources': []
            }

    async def _async_process_with_nlp(self, question: str, session_id: str) -> Dict:
        """Asynchronous NLP pipeline"""
        nlp_result = self.nlp.process_for_general_response(question)

        if nlp_result.get('quick_response'):
            return {
                'answer': nlp_result['quick_response'],
                'source_type': 'nlp_general',
                'models_used': ['quick_response'],
                'sources': [], 'from_documents': False, 'rag_enabled': False,
                'nlp_info': {
                    'intent': nlp_result['intent'],
                    'confidence': nlp_result['intent_confidence'],
                    'language': nlp_result['language'],
                    'method': nlp_result['detection_method']
                }
            }

        context_prompt = self.memory.get_context_for_prompt(
            question, session_id, nlp_result['language']
        )
        if context_prompt:
            result = await self.orchestrator.generate_response(context_prompt, use_context=False)
        else:
            result = await self.orchestrator.generate_response(nlp_result['enhanced_prompt'], use_context=False)

        return {
            'answer': result['response'],
            'source_type': 'nlp_general',
            'models_used': [result.get('model_used', '')],
            'sources': [], 'from_documents': False, 'rag_enabled': False,
            'nlp_info': {
                'intent': nlp_result['intent'],
                'confidence': nlp_result['intent_confidence'],
                'language': nlp_result['language'],
                'method': nlp_result['detection_method']
            }
        }

    async def _async_process_with_vision(self, question: str, image_b64: str, session_id: str) -> Dict:
        """Direct Vision path: sends image + question to Janus-Pro on Colab"""
        logger.info("🖼️  Vision path: Routing to Janus-Pro Colab")
        
        if not self.orchestrator.janus:
            logger.warning("Vision path failed: Janus-Pro provider not initialized (missing URL)")
            return {
                'answer': 'عذراً، ميزة تحليل الصور غير مفعلة حالياً. يرجى مراجعة الإعدادات.',
                'source_type': 'error', 'models_used': ['none'], 'sources': []
            }

        try:
            response = await self.orchestrator.janus.generate(
                prompt=question,
                image_b64=image_b64
            )
            return {
                'answer': response,
                'source_type': 'vision_ai',
                'models_used': ['janus-pro-7b (vision)'],
                'sources': [], 'from_documents': False,
                'rag_enabled': False, 'verified': True
            }
        except Exception as e:
            logger.error(f"Vision path failed: {e}")
            return {
                'answer': 'عذراً، تعذّر تحليل الصورة. يرجى التأكد من تشغيل سيرفر Colab.',
                'source_type': 'error', 'models_used': ['none'], 'sources': []
            }

    def get_chat_history(self, limit: int = 50) -> List[Dict]:
        return database.get_chat_history(limit)[::-1]

    def get_stats(self) -> Dict:
        return {**database.get_chat_stats(), **self.kb.get_stats()}

    def clear_memory(self, session_id: Optional[str] = None):
        self.memory.clear_session(session_id)

    def get_memory_info(self, session_id: Optional[str] = None) -> Dict:
        return self.memory.get_session_info(session_id)


chat_router = ChatRouterPipeline()
chat_service = chat_router  # Backward compatibility
