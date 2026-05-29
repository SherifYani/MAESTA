import os
import httpx
from typing import List, Dict, Any, Optional
import json

class OpenAICompatibleClient:
    """
    A generic HTTP client for OpenAI-compatible APIs (like Ollama or vLLM).
    """
    def __init__(self, base_url: str, model_name: str, api_key: str = "not-needed"):
        self.base_url = base_url.rstrip('/')
        self.model_name = model_name
        self.api_key = api_key
        
    def chat(self, messages: List[Dict[str, str]], temperature: float = 0.0, max_tokens: int = 1024, response_format: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Send a chat completion request to the OpenAI-compatible endpoint.
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload: Dict[str, Any] = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        if response_format:
            payload["response_format"] = response_format
            
        url = f"{self.base_url}/chat/completions"
        
        try:
            with httpx.Client(timeout=120.0) as client:
                response = client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"[AI:Error] Request failed for model {self.model_name}: {e}")
            raise
