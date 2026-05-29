import json
import logging
import time
import asyncio
import time
from typing import Dict, List, Optional, AsyncGenerator, Any

import aiohttp
import sentry_sdk

import config
from core.exceptions import (
    OllamaConnectionError,
    OllamaGenerationError,
    OllamaModelNotFoundError
)
from services.agent.llm.provider_interface import LLMProviderInterface

logger = logging.getLogger(__name__)

class LlamaCppProvider(LLMProviderInterface):
    """Asynchronous provider for Ollama server using aiohttp (OpenAI-compatible /v1 API)"""
    
    def __init__(self, base_url: str | None = None):
        self.base_url = base_url or config.OLLAMA_BASE_URL
        
    async def check_connection(self) -> Dict:
        """Check if LLM server (llama.cpp or Ollama) is running and accessible"""
        try:
            logger.debug(f"Checking async connection to LLM at {self.base_url}")
            async with aiohttp.ClientSession() as session:
                # Try llama.cpp /health first
                try:
                    async with session.get(f"{self.base_url}/health", timeout=aiohttp.ClientTimeout(total=3)) as response:
                        if response.status == 200:
                            return {"connected": True, "message": "llama.cpp is running"}
                except Exception:
                    pass

                # Fallback to Ollama base endpoint /
                async with session.get(f"{self.base_url}/", timeout=aiohttp.ClientTimeout(total=3)) as response:
                    if response.status == 200:
                        return {"connected": True, "message": "Ollama is running"}
                    else:
                        return {"connected": False, "message": f"LLM returned status {response.status}"}
        except Exception as e:
            logger.error(f"Cannot connect to LLM: {e}")
            return {"connected": False, "message": str(e)}

    async def get_available_models(self) -> List[Dict]:
        """Fetch all models if endpoint /v1/models is available"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/v1/models", timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        models = data.get("data", [])
                        return [{
                            "name": model.get("id", "default-model"),
                            "size": 0,
                            "size_formatted": "Unknown",
                            "modified_at": model.get("created", ""),
                            "digest": "",
                            "details": {}
                        } for model in models]
            return []
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return []

    async def generate(self, prompt: str, model: str | None = None, 
                 system_prompt: str | None = None,
                 temperature: float = 0.7,
                 context_length: int = 4096,
                 top_p: float = 0.9,
                 top_k: int = 40,
                 timeout: Optional[int] = None,
                 max_tokens: Optional[int] = None,
                 json_mode: bool = False) -> str:
        """Generate response asynchronously"""
        model = model or config.DEFAULT_MODEL
        gen_timeout = timeout or config.LLM_GENERATION_TIMEOUT
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload: Dict[str, Any] = {
            "messages": messages,
            "stream": False,
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens if max_tokens else 512,
            "presence_penalty": 1.1
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        try:
            start_time = time.time()
            timeout_obj = aiohttp.ClientTimeout(total=gen_timeout)
            
            async with aiohttp.ClientSession(timeout=timeout_obj) as session:
                async with session.post(f"{self.base_url}/v1/chat/completions", json=payload) as response:
                    elapsed = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json()
                        generated_text = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                        if not generated_text:
                            generated_text = "للأسف مش قادر أجاوب على السؤال ده دلوقتي. جرب تسأل بطريقة تانية!"
                        logger.info(f"llama.cpp async took {elapsed:.2f}s | chars={len(generated_text)}")
                        return generated_text
                    elif response.status == 404:
                        raise OllamaModelNotFoundError(model)
                    else:
                        raise OllamaGenerationError(model, f"HTTP {response.status}")
                        
        except asyncio.TimeoutError as e:
            sentry_sdk.capture_exception(e)
            if json_mode:
                return json.dumps({
                    "error": "timeout",
                    "message": "انتهت مهلة الانتظار أثناء الاتصال بخدمة Llama.",
                    "status": "failed"
                }, ensure_ascii=False)
            return "عذراً، انتهت مهلة الانتظار أثناء الاتصال بخدمة الذكاء الاصطناعي المحلية. يرجى المحاولة مرة أخرى لاحقاً."
        except aiohttp.ClientConnectorError as e:
            sentry_sdk.capture_exception(e)
            if json_mode:
                return json.dumps({
                    "error": "connection",
                    "message": "تعذر الاتصال بخدمة Llama (الخادم متوقف أو غير متصل).",
                    "status": "failed"
                }, ensure_ascii=False)
            return "عذراً، تعذر الاتصال بالخادم المحلي لخدمة الذكاء الاصطناعي. يرجى التأكد من تشغيل خادم Llama."
        except (OllamaGenerationError, OllamaModelNotFoundError) as e:
            sentry_sdk.capture_exception(e)
            if json_mode:
                return json.dumps({
                    "error": "model_error",
                    "message": str(e),
                    "status": "failed"
                }, ensure_ascii=False)
            return f"عذراً، حدث خطأ في نموذج الذكاء الاصطناعي: {str(e)}"
        except Exception as e:
            sentry_sdk.capture_exception(e)
            if json_mode:
                return json.dumps({
                    "error": "unexpected",
                    "message": f"حدث خطأ غير متوقع: {str(e)}",
                    "status": "failed"
                }, ensure_ascii=False)
            return f"عذراً، حدث خطأ غير متوقع أثناء معالجة الطلب محلياً: {str(e)}"

    async def generate_stream(self, prompt: str, model: str | None = None,
                        system_prompt: str | None = None,
                        temperature: float = 0.7,
                        context_length: int = 4096,
                        top_p: float = 0.9,
                        top_k: int = 40) -> AsyncGenerator[str, None]:
        """Generate streaming response asynchronously"""
        model = model or config.DEFAULT_MODEL
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "messages": messages,
            "stream": True,
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": 512
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/v1/chat/completions", json=payload) as response:
                    async for line in response.content:
                        if line:
                            line_str = line.decode('utf-8').strip()
                            if line_str.startswith('data: '):
                                line_str = line_str[6:]
                            if not line_str or line_str == '[DONE]':
                                continue
                            try:
                                data = json.loads(line_str)
                                choices = data.get("choices", [{}])
                                if choices:
                                    delta = choices[0].get("delta", {})
                                    if "content" in delta:
                                        yield delta["content"]
                            except json.JSONDecodeError:
                                pass
        except Exception as e:
            logger.error(f"Error during streaming: {e}")
            raise OllamaGenerationError(model, f"Streaming failed: {str(e)}")

    async def embed(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Get embeddings for a list of texts using Ollama /api/embeddings endpoint"""
        model = model or config.EMBEDDING_MODEL
        try:
            embeddings = []
            async with aiohttp.ClientSession() as session:
                for text in texts:
                    async with session.post(
                        f"{self.base_url}/api/embeddings",
                        json={"model": model, "prompt": text}
                    ) as response:
                        if response.status == 200:
                            data = await response.json()
                            embeddings.append(data.get("embedding", []))
                        else:
                            raise OllamaGenerationError(model, f"HTTP {response.status}")
            return embeddings
        except Exception as e:
            raise OllamaGenerationError(model, str(e))
