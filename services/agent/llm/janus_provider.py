import logging
import time
import json
import base64
import aiohttp
import os
from typing import Dict, List, Optional, Any, AsyncGenerator

import config
from services.agent.llm.provider_interface import LLMProviderInterface

logger = logging.getLogger(__name__)

class JanusColabProvider(LLMProviderInterface):
    """
    Provider for DeepSeek Janus-Pro-7B running on Google Colab via Cloudflared tunnel.
    Supports both text and image inputs.
    """
    
    def __init__(self, base_url: str | None = None):
        # We'll use a specific config for Janus URL, fallback to OLLAMA_BASE_URL
        self.base_url = base_url or os.getenv("JANUS_COLAB_URL", config.OLLAMA_BASE_URL)
        if self.base_url.endswith("/"):
            self.base_url = self.base_url[:-1]

    async def check_connection(self) -> Dict:
        """Check if the Colab Janus server is alive"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/health", timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        return {"connected": True, "message": "Janus-Pro Colab Server is LIVE"}
                    return {"connected": False, "message": f"Status {response.status}"}
        except Exception as e:
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
                       response_schema: Optional[type] = None,
                       image_b64: Optional[str] = None) -> str:
        """
        Generate response from Janus on Colab.
        Can optionally take an image in base64 format.
        """
        # If the prompt contains conversation history (from memory service),
        # extract ONLY the new question — Janus should receive a clean, single question.
        clean_question = prompt
        if "[Previous conversation:]" in prompt:
            # Try to extract the new question after the markers
            for marker in ["السؤال الجديد:", "New question:"]:
                if marker in prompt:
                    clean_question = prompt.split(marker)[-1]
                    # Strip any trailing "الجواب:" or "Answer:" that may follow
                    for answer_marker in ["\nالجواب:", "\nAnswer:", "\n\nالجواب:", "\n\nAnswer:"]:
                        clean_question = clean_question.split(answer_marker)[0]
                    clean_question = clean_question.strip()
                    break

        # The official System Prompt required by Janus-Pro
        SYSTEM_PROMPT = "You are a helpful language and vision assistant. You are able to understand the visual content that the user provides, and assist the user with a variety of tasks using natural language.\n\n"

        # Wrap in Janus/DeepSeek native chat markers
        # IMPORTANT: Janus uses the FULLWIDTH vertical line (｜) not ASCII pipe (|)
        if image_b64:
            formatted_prompt = f"{SYSTEM_PROMPT}<｜User｜><image_placeholder>\n{clean_question}\n<｜Assistant｜>"
        else:
            formatted_prompt = f"{SYSTEM_PROMPT}<｜User｜>{clean_question}\n<｜Assistant｜>"



        payload = {
            "prompt": formatted_prompt,
            "image": image_b64,
            "temperature": temperature,
            "max_tokens": max_tokens or 512
        }
        
        try:
            start_time = time.time()
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{self.base_url}/generate", json=payload, timeout=aiohttp.ClientTimeout(total=120)) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data.get("response", "")
                        
                        # Clean the response from instructions or "Answer:" prefixes
                        result = self._clean_response(result)
                        
                        elapsed = time.time() - start_time
                        logger.info(f"✨ Janus-Pro (Colab) responded in {elapsed:.2f}s")
                        return result
                    else:
                        error_text = await response.text()
                        logger.error(f"Janus API error: {response.status} - {error_text}")
                        raise RuntimeError(f"خطأ في الاتصال بسيرفر Colab: {response.status}")
        except Exception as e:
            logger.error(f"Error calling Janus on Colab: {e}")
            raise RuntimeError(f"Connection failed: {e}")

    def _clean_response(self, text: str) -> str:
        """
        Cleans the response from common artifacts like 'Answer:', instructions,
        or echoes of the system prompt.
        """
        if not text:
            return ""
            
        # Remove common technical prefixes
        prefixes_to_strip = [
            "الجواب:", "Answer:", "الرد:", "Response:",
            "Assistant:", "المساعد:"
        ]
        
        cleaned = text.strip()
        for prefix in prefixes_to_strip:
            if cleaned.startswith(prefix):
                cleaned = cleaned[len(prefix):].strip()
        
        # If the model echoes the instructions (e.g. contains part of our long persona)
        # we can try to cut it, but the slicing in Colab is the primary fix.
        
        return cleaned

    async def generate_stream(self, prompt: str, model: str | None = None,
                               system_prompt: str | None = None,
                               temperature: float = 0.7,
                               context_length: int = 4096,
                               top_p: float = 0.9,
                               top_k: int = 40) -> AsyncGenerator[str, None]:
        """Streaming not implemented for simplicity in custom Colab wrapper yet"""
        if False:
            yield ""
        raise NotImplementedError("Streaming is not supported for Janus Colab wrapper.")

    async def embed(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Janus is not intended for embeddings in this setup"""
        return []
