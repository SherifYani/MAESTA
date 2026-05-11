"""
Gemini Provider - Async provider for Google Gemini API.
Implements LLMProviderInterface + extra methods for classification and verification.
"""
import logging
import time
import asyncio
from typing import Dict, List, Optional, AsyncGenerator, Any
from pydantic import BaseModel, Field

import sentry_sdk

import config
from services.agent.llm.provider_interface import LLMProviderInterface

import json
import re
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class ClassificationResult(BaseModel):
    """Structured output for question classification"""
    complexity: str = Field(description="SIMPLE, COMPLEX, or GREETING")
    confidence: float = Field(description="Confidence score 0.0-1.0")
    reasoning: str = Field(description="Brief reasoning for the classification")


class VerificationResult(BaseModel):
    """Structured output for answer verification"""
    is_accurate: bool = Field(description="Whether the answer appears accurate")
    has_hallucination: bool = Field(description="Whether the answer contains hallucinated content")
    corrected_answer: Optional[str] = Field(default=None, description="Corrected answer if issues were found")
    issues: List[str] = Field(default_factory=list, description="List of issues found")


class GeminiProvider(LLMProviderInterface):
    """Async provider for Google Gemini API using google-genai SDK"""

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or config.GEMINI_API_KEY
        self._client = None

    @property
    def client(self):
        if self._client is None:
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    async def check_connection(self) -> Dict:
        """Check if Gemini API is accessible"""
        try:
            def _ping():
                return self.client.models.generate_content(
                    model=config.GEMINI_FLASH_MODEL,
                    contents="ping"
                )
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _ping)
            
            if response and response.text:
                return {"connected": True, "message": "Gemini API is accessible"}
            return {"connected": False, "message": "Gemini returned empty response"}
        except Exception as e:
            logger.error(f"Gemini connection check failed: {e}")
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
        """Generate response using Gemini (returns text)"""
        response = await self._generate_full(
            prompt=prompt, model=model, system_prompt=system_prompt,
            temperature=temperature, context_length=context_length,
            top_p=top_p, top_k=top_k, timeout=timeout,
            max_tokens=max_tokens, json_mode=json_mode,
            response_schema=response_schema
        )
        
        # Extract text carefully
        result_text = ""
        try:
            if response and hasattr(response, 'text'):
                result_text = response.text
        except Exception:
            try:
                if response.candidates and response.candidates[0].content.parts:
                    result_text = response.candidates[0].content.parts[0].text
            except:
                pass
        
        if not result_text and (not hasattr(response, 'parsed') or not response.parsed):
            result_text = "للأسف مش قادر أجاوب على السؤال ده دلوقتي."
            
        return result_text

    async def _generate_full(self, prompt: str, model: str | None = None,
                       system_prompt: str | None = None,
                       temperature: float = 0.7,
                       context_length: int = 4096,
                       top_p: float = 0.9,
                       top_k: int = 40,
                       timeout: Optional[int] = None,
                       max_tokens: Optional[int] = None,
                       json_mode: bool = False,
                       response_schema: Optional[type] = None) -> Any:
        """Internal method: Generate response using Gemini (returns full object)"""
        model = model or config.GEMINI_FLASH_MODEL
        start_time = time.time()

        try:
            from google.genai import types

            gen_config = types.GenerateContentConfig(
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                system_instruction=system_prompt if system_prompt else None,
            )

            if json_mode or response_schema:
                gen_config.response_mime_type = "application/json"
            
            if response_schema:
                gen_config.response_schema = response_schema

            # Use run_in_executor for sync SDK call
            def _call_gemini():
                return self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=gen_config
                )

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _call_gemini)

            return response

        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            sentry_sdk.capture_exception()
            raise

    async def generate_stream(self, prompt: str, model: str | None = None,
                              system_prompt: str | None = None,
                              temperature: float = 0.7,
                              context_length: int = 4096,
                              top_p: float = 0.9,
                              top_k: int = 40) -> AsyncGenerator[str, None]:
        """Generate streaming response from Gemini"""
        model = model or config.GEMINI_FLASH_MODEL

        try:
            from google.genai import types

            gen_config = types.GenerateContentConfig(
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                max_output_tokens=1024,
                system_instruction=system_prompt if system_prompt else None,
            )

            def _call_gemini_stream():
                return self.client.models.generate_content_stream(
                    model=model,
                    contents=prompt,
                    config=gen_config
                )

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(None, _call_gemini_stream)

            for chunk in response:
                if chunk.text:
                    yield chunk.text

        except Exception as e:
            logger.error(f"Gemini streaming error: {e}")
            raise

    async def embed(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Get embeddings - delegates to local model since Gemini embeddings are separate"""
        raise NotImplementedError("Use local embedding model for embeddings")

    # ==========================================
    # Extra Methods: Classification & Verification
    # ==========================================

    async def classify_question(self, question: str) -> ClassificationResult:
        """
        Classify a question's complexity using Gemini Flash.
        Ultra-fast (~100-200ms) classification.
        """
        from services.agent.llm.prompts.prompts import CLASSIFIER_PROMPT

        prompt = CLASSIFIER_PROMPT.format(question=question)

        try:
            response = await self._generate_full(
                prompt=prompt,
                model=config.GEMINI_FLASH_MODEL,
                temperature=0.0,
                max_tokens=200,
                response_schema=ClassificationResult
            )

            # Use parsed result if available (Google GenAI SDK 1.0+)
            if hasattr(response, 'parsed') and response.parsed:
                return response.parsed

            import json
            data = self._clean_json_response(response.text)
            return ClassificationResult(
                complexity=data.get("complexity", "SIMPLE"),
                confidence=float(data.get("confidence", 0.5)),
                reasoning=data.get("reasoning", "")
            )
        except Exception as e:
            logger.warning(f"Classification failed, defaulting to SIMPLE: {e}")
            return ClassificationResult(
                complexity="SIMPLE",
                confidence=0.3,
                reasoning=f"Classification failed: {str(e)}"
            )

    async def verify_answer(self, question: str, answer: str,
                            context: str | None = None) -> VerificationResult:
        """
        Verify an answer for hallucination using Gemini Flash.
        Fast verification (~200-400ms).
        """
        from services.agent.llm.prompts.prompts import VERIFIER_PROMPT

        context_section = f"\n\nالسياق المتاح:\n{context}" if context else "\n\n(لا يوجد سياق مرفق)"
        prompt = VERIFIER_PROMPT.format(
            question=question,
            answer=answer,
            context=context_section
        )

        try:
            response = await self._generate_full(
                prompt=prompt,
                model=config.GEMINI_FLASH_MODEL,
                temperature=0.0,
                max_tokens=1000,
                response_schema=VerificationResult
            )

            # Use parsed result if available
            if hasattr(response, 'parsed') and response.parsed:
                return response.parsed

            import json
            data = self._clean_json_response(response.text)
            return VerificationResult(
                is_accurate=data.get("is_accurate", True),
                has_hallucination=data.get("has_hallucination", False),
                corrected_answer=data.get("corrected_answer"),
                issues=data.get("issues", [])
            )
        except Exception as e:
            logger.warning(f"Verification failed, assuming answer is OK: {e}")
            return VerificationResult(
                is_accurate=True,
                has_hallucination=False,
                corrected_answer=None,
                issues=[]
            )

    def _clean_json_response(self, text: str) -> Dict:
        """
        Clean and parse JSON from LLM response.
        Handles markdown backticks, raw newlines in values, and other artifacts.
        """
        if not text:
            return {}
            
        original_text = text
        
        def escape_newlines(match):
            content = match.group(0)
            # Replace actual newlines with literal \n
            return content.replace('\n', '\\n').replace('\r', '')
        
        # 1. Strip markdown backticks if present
        json_match = re.search(r'```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```', text)
        if json_match:
            text = json_match.group(1)
        
        # 1b. If it still doesn't look like JSON, find the first '{' and last '}'
        if not (text.strip().startswith('{') or text.strip().startswith('[')):
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1:
                text = text[start:end+1]
            else:
                # Try brackets for arrays
                start = text.find('[')
                end = text.rfind(']')
                if start != -1 and end != -1:
                    text = text[start:end+1]
        
        text = text.strip()
        
        # 1c. If it looks truncated (starts with { but ends with text), try a crude fix
        if text.startswith('{') and not text.endswith('}'):
            # Count braces
            opens = text.count('{')
            closes = text.count('}')
            # If it multiple open braces, it's too broken, but if it ends in a quote, close it
            if text.count('"') % 2 != 0:
                text += '"'
            # Add missing closes
            for _ in range(opens - closes):
                text += '}'
        
        # If text is still empty, return
        if not text:
            return {}
            
        # 2. Try direct parsing
        try:
            return json.loads(text)
        except (json.JSONDecodeError, TypeError):
            pass
            
        # 3. Handle raw newlines in string values
        # This is the most common cause of failure for long responses.
        # We replace real newlines with \n ONLY when they are inside double quotes.
        try:
            # Simple heuristic: if it looks like JSON but fails, try to escape newlines
            
            def escape_newlines(match):
                content = match.group(0)
                # Replace actual newlines with literal \n
                return content.replace('\n', '\\n').replace('\r', '')

            # Match content between double quotes "..."
            # Note: This is a basic regex and might fail on complex nested escaped quotes,
            # but it solves 99% of LLM JSON issues.
            cleaned_text = re.sub(r'("(?:[^"\\\\]|\\\\.)*")', escape_newlines, text)
            
            try:
                return json.loads(cleaned_text)
            except json.JSONDecodeError:
                pass
        except Exception as e:
            logger.debug(f"Newline escape heuristic failed: {e}")

        # 4. Find start/end braces as a last resort
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1:
            try:
                return json.loads(text[start:end+1])
            except json.JSONDecodeError:
                # Try the newline escape on the substring too
                try:
                    substring = re.sub(r'("(?:[^"\\\\]|\\\\.)*")', escape_newlines, text[start:end+1])
                    return json.loads(substring)
                except:
                    pass
                
        # Return empty if all failed, and log the failure for debugging
        logger.warning(f"Failed to parse JSON. Saving snippet to scratch/failed_json.txt")
        try:
            import os
            os.makedirs("scratch", exist_ok=True)
            with open("scratch/failed_json.txt", "w", encoding="utf-8") as f:
                f.write(original_text)
        except:
            pass
            
        return {}
