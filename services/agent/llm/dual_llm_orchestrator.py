"""
Dual-LLM Orchestrator
The brain of MAESTA: coordinates between the small local model (llama.cpp)
and the large cloud model (Gemini / Claude) for optimal speed + accuracy.

Architecture: Draft-and-Verify
- Cloud model classifies question complexity (~100ms)
- Simple questions → llama.cpp drafts → Cloud verifies
- Complex questions → Cloud Pro answers directly
- Greetings → llama.cpp answers instantly (no verification needed)

Cloud Provider Options (CLOUD_PROVIDER env):
- "gemini"  → Google Gemini (default)
- "claude"  → Claude via OpenRouter
- "auto"    → Try Claude first, fallback to Gemini
"""
import asyncio
import logging
import time
import os
from typing import Dict, Optional, List

import config
from services.agent.llm.llama_provider import LlamaCppProvider
from services.agent.llm.gemini_provider import GeminiProvider, ClassificationResult, VerificationResult
from services.agent.llm.claude_provider import ClaudeProvider
from services.agent.llm.janus_provider import JanusColabProvider
from services.agent.llm.prompts.prompts import GEMINI_CONTEXT_PROMPT
from core.logger import get_logger

logger = get_logger(__name__)


class DualLLMOrchestrator:
    """
    Orchestrates between the local small model and Gemini for
    maximum speed and accuracy.
    """

    def __init__(self):
        self.local_llm = LlamaCppProvider()
        self.gemini = GeminiProvider() if config.GEMINI_API_KEY else None
        self.claude = ClaudeProvider() if config.CLAUDE_API_KEY else None
        
        # Janus-Pro Colab Provider (if URL exists in env)
        janus_url = os.getenv("JANUS_COLAB_URL")
        self.janus = JanusColabProvider(janus_url) if janus_url else None
        
        # Cloud provider selection
        self._cloud_provider = config.CLOUD_PROVIDER  # "gemini", "claude", or "auto"
        
        # Determine if any cloud model is available
        self._has_cloud = self.gemini is not None or self.claude is not None
        self._dual_enabled = config.ENABLE_DUAL_LLM and self._has_cloud
        self._verification_enabled = config.ENABLE_GEMINI_VERIFICATION

        # Circuit Breaker state — Gemini
        self._last_gemini_error_time = 0.0
        self._gemini_cooldown_minutes = 30
        self._consecutive_gemini_failures = 0

        # Circuit Breaker state — Claude
        self._last_claude_error_time = 0.0
        self._claude_cooldown_minutes = 30
        self._consecutive_claude_failures = 0

        provider_name = self._cloud_provider.upper()
        if self._dual_enabled:
            logger.info(f"🧠 Dual-LLM Orchestrator: ACTIVE (Local + {provider_name})")
        else:
            logger.info("⚡ Dual-LLM Orchestrator: LOCAL ONLY (no cloud API key)")

    def _is_gemini_available(self) -> bool:
        """Check if Gemini is available and not in cooldown"""
        if not self.gemini:
            return False
        
        if self._last_gemini_error_time > 0:
            elapsed = (time.time() - self._last_gemini_error_time) / 60
            if elapsed < self._gemini_cooldown_minutes:
                logger.warning(f"⚠️ Gemini in COOLDOWN mode. Remaining: {self._gemini_cooldown_minutes - elapsed:.1f} min")
                return False
            else:
                logger.info("🔄 Gemini COOLDOWN expired. Retrying...")
                self._last_gemini_error_time = 0
                self._consecutive_gemini_failures = 0
        
        return True

    def _is_claude_available(self) -> bool:
        """Check if Claude is available and not in cooldown"""
        if not self.claude:
            return False
        
        if self._last_claude_error_time > 0:
            elapsed = (time.time() - self._last_claude_error_time) / 60
            if elapsed < self._claude_cooldown_minutes:
                logger.warning(f"⚠️ Claude in COOLDOWN mode. Remaining: {self._claude_cooldown_minutes - elapsed:.1f} min")
                return False
            else:
                logger.info("🔄 Claude COOLDOWN expired. Retrying...")
                self._last_claude_error_time = 0
                self._consecutive_claude_failures = 0
        
        return True

    def _is_cloud_available(self) -> bool:
        """Check if any cloud provider is available based on CLOUD_PROVIDER setting"""
        if not self._dual_enabled:
            return False
        if self._cloud_provider == "claude":
            return self._is_claude_available()
        elif self._cloud_provider == "gemini":
            return self._is_gemini_available()
        else:  # auto
            return self._is_claude_available() or self._is_gemini_available()

    def _handle_gemini_failure(self, error: Exception):
        """Mark Gemini as down if hits quota or severe error"""
        error_msg = str(error).upper()
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            logger.error("🛑 Gemini Quota EXHAUSTED (429). Triggering 30m cooldown.")
            self._last_gemini_error_time = time.time()
            self._consecutive_gemini_failures += 1
        elif "500" in error_msg or "TIMEOUT" in error_msg:
            self._consecutive_gemini_failures += 1
            if self._consecutive_gemini_failures >= 3:
                logger.error(f"🛑 Gemini failed {self._consecutive_gemini_failures} times. Triggering cooldown.")
                self._last_gemini_error_time = time.time()

    def _handle_claude_failure(self, error: Exception):
        """Mark Claude as down if hits quota or severe error"""
        error_msg = str(error).upper()
        if "429" in error_msg or "RATE_LIMIT" in error_msg:
            logger.error("🛑 Claude Rate Limited (429). Triggering 30m cooldown.")
            self._last_claude_error_time = time.time()
            self._consecutive_claude_failures += 1
        elif "500" in error_msg or "TIMEOUT" in error_msg:
            self._consecutive_claude_failures += 1
            if self._consecutive_claude_failures >= 3:
                logger.error(f"🛑 Claude failed {self._consecutive_claude_failures} times. Triggering cooldown.")
                self._last_claude_error_time = time.time()

    async def classify(self, question: str) -> ClassificationResult:
        """
        Classify question complexity using Gemini Flash.
        Falls back to simple heuristics if Gemini is unavailable.
        """
        if not self.gemini or not self._is_gemini_available() or getattr(config, 'PRIORITIZE_LOCAL', False):
            return ClassificationResult(
                complexity="SIMPLE", confidence=0.5,
                reasoning="Bypassing Gemini (Cooldown or Local Priority)"
            )

        try:
            start = time.time()
            result = await self.gemini.classify_question(question)
            elapsed = time.time() - start
            logger.info(f"🏷️ Classification: {result.complexity} ({result.confidence:.0%}) in {elapsed:.2f}s")
            return result
        except Exception as e:
            logger.warning(f"Classification failed, defaulting to SIMPLE: {e}")
            self._handle_gemini_failure(e)
            return ClassificationResult(
                complexity="SIMPLE", confidence=0.3,
                reasoning=f"Gemini error: {str(e)}"
            )

    async def generate_response(self, prompt: str, context: str | None = None,
                                use_context: bool = True,
                                timeout: Optional[int] = None) -> Dict:
        """
        Main entry point for generating a response.
        Decision logic:
        1. If local is disabled or remote is preferred, use complex path directly.
        2. Otherwise, check if it's a simple or complex question.
        """
        # Cloud-only mode if prioritize_local is false
        if not getattr(config, 'PRIORITIZE_LOCAL', True):
            return await self._complex_path(prompt, context, use_context, timeout)

        total_start = time.time()

        # Step 1: Classify
        classification = await self.classify(prompt)

        # Step 2: Route based on complexity
        if classification.complexity == "GREETING":
            result = await self._greeting_path(prompt)
        elif classification.complexity == "COMPLEX" and self._dual_enabled:
            result = await self._complex_path(prompt, context, use_context, timeout)
        else:
            result = await self._simple_path(prompt, context, use_context, timeout)

        total_elapsed = time.time() - total_start
        result['total_time'] = f"{total_elapsed:.2f}s"
        result['classification'] = classification.complexity
        logger.info(f"🎯 Total orchestration: {total_elapsed:.2f}s | Path: {classification.complexity}")
        return result

    async def _greeting_path(self, prompt: str) -> Dict:
        """Ultra-fast path for greetings — local model, no verification"""
        logger.info("👋 Greeting path: local model only")
        response = await self.local_llm.generate(
            prompt=prompt,
            temperature=0.8,
            max_tokens=100
        )
        return {
            'response': response,
            'model_used': 'local (greeting)',
            'used_fallback': False,
            'verified': False
        }

    async def _simple_path(self, prompt: str, context: str | None = None,
                           use_context: bool = True,
                           timeout: Optional[int] = None) -> Dict:
        """
        Fast path: local model drafts, Gemini verifies in parallel.
        User gets the response from local model immediately.
        If verification finds issues, the corrected answer replaces it.
        """
        logger.info("⚡ Simple path: local draft + Gemini verify")

        from services.agent.llm.prompts.prompts import CONTEXT_PROMPT_TEMPLATE
        from models import database

        settings = database.get_model_settings()
        system_prompt = settings.get('system_prompt') or config.SYSTEM_PERSONA

        if context and use_context:
            full_prompt = CONTEXT_PROMPT_TEMPLATE.format(context=context, question=prompt)
        else:
            full_prompt = prompt

        # Draft with local model
        draft_start = time.time()
        draft_response = await self.local_llm.generate(
            prompt=full_prompt,
            model=settings.get('active_model', config.DEFAULT_MODEL),
            system_prompt=system_prompt,
            temperature=settings.get('temperature', 0.7),
            top_p=settings.get('top_p', 0.9),
            timeout=timeout,
            max_tokens=int(config.DEFAULT_MODEL_PARAMS.get('max_output_tokens', 256))
        )
        draft_elapsed = time.time() - draft_start
        logger.info(f"📝 Local draft in {draft_elapsed:.2f}s")

        # Refine with Gemini (if enabled and available and NOT in cooldown)
        if self.gemini and self._dual_enabled and self._verification_enabled and self._is_gemini_available():
            try:
                verification = await self.gemini.verify_answer(
                    question=prompt,
                    answer=draft_response,
                    context=context
                )

                if verification.corrected_answer:
                    logger.info("✨ Response refined by Gemini")
                    return {
                        'response': verification.corrected_answer,
                        'model_used': f"local → gemini-refined",
                        'used_fallback': False,
                        'verified': True,
                        'had_hallucination': verification.has_hallucination,
                        'issues': verification.issues
                    }
                else:
                    logger.info("✅ Verification passed (Local draft preserved)")
            except Exception as e:
                logger.warning(f"Refinement/Verification failed (using draft): {e}")
                self._handle_gemini_failure(e)

        return {
            'response': draft_response,
            'model_used': settings.get('active_model', config.DEFAULT_MODEL),
            'used_fallback': False,
            'verified': self._verification_enabled and self._dual_enabled
        }

    async def _complex_path(self, prompt: str, context: str | None = None,
                            use_context: bool = True,
                            timeout: Optional[int] = None) -> Dict:
        """
        Smart path: Cloud model (Claude/Gemini) or Janus-Pro handles complex questions.
        Provider selection based on CLOUD_PROVIDER setting.
        """
        logger.info("🧠 Complex path: High-end Model direct")

        # Prefer Janus if available
        if self.janus and not getattr(config, 'FORCE_GEMINI', False):
            try:
                response = await self.janus.generate(prompt=prompt)
                return {
                    'response': response,
                    'model_used': 'janus-pro-7b (colab)',
                    'used_fallback': False,
                    'verified': True
                }
            except Exception as e:
                logger.warning(f"Janus-Pro failed, trying cloud provider: {e}")

        if not self._is_cloud_available():
            if not getattr(config, 'PRIORITIZE_LOCAL', True):
                return {
                    'response': "عذراً، الموديلات السحابية غير متاحة حالياً والوضع المحلي معطل. يرجى المحاولة لاحقاً.",
                    'model_used': 'none',
                    'error': 'Cloud Unavailable',
                    'verified': False
                }
            
            logger.warning("⚠️ High path requested but cloud is in COOLDOWN. Falling back to SIMPLE.")
            return await self._simple_path(prompt, context, use_context, timeout)

        if context and use_context:
            full_prompt = GEMINI_CONTEXT_PROMPT.format(context=context, question=prompt)
        else:
            full_prompt = prompt

        system_prompt = config.SYSTEM_PERSONA

        # --- Try Claude first (if selected or auto) ---
        if self.claude and self._cloud_provider in ("claude", "auto") and self._is_claude_available():
            try:
                response = await self.claude.generate(
                    prompt=full_prompt,
                    model=config.CLAUDE_MODEL,
                    system_prompt=system_prompt,
                    max_tokens=int(config.DEFAULT_MODEL_PARAMS.get('max_output_tokens', 1024))
                )
                
                self._consecutive_claude_failures = 0
                
                return {
                    'response': response,
                    'model_used': config.CLAUDE_MODEL,
                    'used_fallback': False,
                    'verified': True
                }
            except Exception as e:
                logger.error(f"Claude failed: {e}")
                self._handle_claude_failure(e)
                # If auto mode, fall through to Gemini
                if self._cloud_provider != "auto":
                    return await self._simple_path(prompt, context, use_context, timeout)

        # --- Try Gemini (if selected or auto fallback) ---
        if self.gemini and self._cloud_provider in ("gemini", "auto") and self._is_gemini_available():
            try:
                response = await self.gemini.generate(
                    prompt=full_prompt,
                    model=config.GEMINI_PRO_MODEL,
                    system_prompt=system_prompt,
                    max_tokens=int(config.DEFAULT_MODEL_PARAMS.get('max_output_tokens', 1024))
                )
                
                self._consecutive_gemini_failures = 0
                
                return {
                    'response': response,
                    'model_used': config.GEMINI_PRO_MODEL,
                    'used_fallback': False,
                    'verified': True
                }
            except Exception as e:
                logger.error(f"Gemini Pro failed, falling back to local: {e}")
                self._handle_gemini_failure(e)

        # All cloud providers failed — fallback to local
        return await self._simple_path(prompt, context, use_context, timeout)

    async def generate_from_documents(self, question: str,
                                      relevant_docs: List[Dict]) -> Dict:
        """Generate response based on document context"""
        context_parts = []
        sources = []

        max_chunks = 6
        for i, doc in enumerate(relevant_docs[:max_chunks]):
            context_parts.append(f"[Section {i + 1}]\n{doc['content']}")
            sources.append({
                'doc_id': doc['doc_id'],
                'chunk_index': doc['chunk_index'],
                'score': doc['score'],
                'metadata': doc['metadata']
            })

        context = "\n\n".join(context_parts)

        result = await self.generate_response(question, context, use_context=True)
        result['sources'] = sources
        result['source_type'] = 'documents'
        return result

    async def generate_from_knowledge(self, question: str) -> Dict:
        """Generate response from AI knowledge (no documents)"""
        from services.agent.llm.prompts.prompts import KNOWLEDGE_PROMPT_TEMPLATE
        prompt = KNOWLEDGE_PROMPT_TEMPLATE.format(question=question)
        result = await self.generate_response(prompt, use_context=False)
        result['source_type'] = 'ai_model'
        result['sources'] = []
        return result


# Singleton
orchestrator = DualLLMOrchestrator()
