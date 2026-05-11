"""
Claude Provider — Async provider via AgentRouter (OpenAI-compatible API).
Uses the openai SDK (already installed via langchain-openai) with a custom base_url.
Implements LLMProviderInterface for seamless integration with the orchestrator.
"""
import asyncio
import json
import logging
import time
from typing import Any, AsyncGenerator, Dict, List, Optional

import sentry_sdk
from openai import OpenAI
from pydantic import BaseModel

import config
from services.agent.llm.provider_interface import LLMProviderInterface

logger = logging.getLogger(__name__)


class ClaudeProvider(LLMProviderInterface):
    """Async provider for Claude via OpenRouter (OpenAI-compatible API)"""

    def __init__(self, api_key: str | None = None, base_url: str | None = None):
        self.api_key = api_key or config.CLAUDE_API_KEY
        self.base_url = base_url or config.CLAUDE_BASE_URL
        self._client = None

    @property
    def client(self) -> OpenAI:
        if self._client is None:
            self._client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
        return self._client

    async def check_connection(self) -> Dict:
        """Check if Claude API (via OpenRouter) is accessible"""
        try:
            def _ping():
                return self.client.chat.completions.create(
                    model=config.CLAUDE_MODEL,
                    messages=[{"role": "user", "content": "ping"}],
                    max_tokens=10,
                )

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _ping)

            if response and response.choices:
                return {"connected": True, "message": "Claude API is accessible via OpenRouter"}
            return {"connected": False, "message": "Claude returned empty response"}
        except Exception as e:
            logger.error(f"Claude connection check failed: {e}")
            return {"connected": False, "message": str(e)}

    async def generate(self, prompt: str, model: str | None = None,
                       system_prompt: str | None = None,
                       temperature: float = 0.7,
                       context_length: int = 4096,
                       top_p: float = 0.9,
                       top_k: int = 40,
                       timeout: Optional[int] = None,
                       max_tokens: Optional[int] = None,
                       json_mode: bool = False,
                       response_schema: Optional[type] = None) -> str:
        """Generate response using Claude via OpenRouter"""
        model = model or config.CLAUDE_MODEL
        max_tokens = int(max_tokens or config.DEFAULT_MODEL_PARAMS.get("max_output_tokens", 4096))
        start_time = time.time()

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            def _call_claude():
                kwargs: Dict[str, Any] = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "top_p": top_p,
                    "max_tokens": max_tokens,
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                return self.client.chat.completions.create(**kwargs)

            loop = asyncio.get_event_loop()
            response: Any = await loop.run_in_executor(None, _call_claude)

            elapsed = time.time() - start_time
            result_text = ""

            if response and response.choices:
                result_text = response.choices[0].message.content or ""

            if not result_text:
                result_text = "للأسف مش قادر أجاوب على السؤال ده دلوقتي."

            logger.info(f"Claude ({model}) took {elapsed:.2f}s | chars={len(result_text)}")

            # If structured output is requested, parse JSON
            if response_schema and result_text:
                try:
                    data = json.loads(result_text)
                    return response_schema(**data)
                except (json.JSONDecodeError, Exception) as parse_err:
                    logger.warning(f"Failed to parse Claude structured output: {parse_err}")

            return result_text

        except Exception as e:
            logger.error(f"Claude generation error: {e}")
            sentry_sdk.capture_exception()
            raise

    async def generate_stream(self, prompt: str, model: str | None = None,
                              system_prompt: str | None = None,
                              temperature: float = 0.7,
                              context_length: int = 4096,
                              top_p: float = 0.9,
                              top_k: int = 40) -> AsyncGenerator[str, None]:
        """Generate streaming response from Claude via OpenRouter"""
        model = model or config.CLAUDE_MODEL

        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            def _call_stream():
                return self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    top_p=top_p,
                    max_tokens=1024,
                    stream=True,
                )

            loop = asyncio.get_event_loop()
            stream = await loop.run_in_executor(None, _call_stream)

            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            logger.error(f"Claude streaming error: {e}")
            raise

    async def embed(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Embeddings not supported via Claude — use local embedding model"""
        raise NotImplementedError("Use local embedding model for embeddings")
