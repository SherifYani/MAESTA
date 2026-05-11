"""
Ollama Service - Manages connection to local Ollama server
(Supports both Ollama native API and OpenAI-compatible /v1 API)
"""
import requests
import json
from typing import List, Dict, Optional, Generator
import config
import sentry_sdk
from core.logger import get_logger
from core.exceptions import (
    OllamaConnectionError,
    OllamaGenerationError,
    OllamaModelNotFoundError
)

logger = get_logger(__name__)


class OllamaService:
    """Service for interacting with llama.cpp server API"""
    
    def __init__(self, base_url: str | None = None):
        self.base_url = base_url or config.OLLAMA_BASE_URL
    
    def check_connection(self) -> Dict:
        """Check if Ollama server is running and accessible"""
        try:
            logger.debug(f"Checking connection to Ollama at {self.base_url}")
            
            # Try Ollama native health endpoint
            try:
                response = requests.get(f"{self.base_url}/", timeout=3)
                if response.status_code == 200:
                    logger.info("Successfully connected to Ollama")
                    return {"connected": True, "message": "Ollama is running"}
            except Exception:
                pass

            # Fallback: try /api/tags
            response = requests.get(f"{self.base_url}/api/tags", timeout=3)
            if response.status_code == 200:
                logger.info("Successfully connected to Ollama (via /api/tags)")
                return {"connected": True, "message": "Ollama is running"}
            
            logger.warning(f"Ollama returned unexpected status: {response.status_code}")
            return {"connected": False, "message": f"Ollama returned status {response.status_code}"}
            
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Cannot connect to Ollama at {self.base_url}: {e}")
            return {"connected": False, "message": "Cannot connect to Ollama. Make sure it's running."}
        except requests.exceptions.Timeout:
            logger.error(f"Connection to Ollama at {self.base_url} timed out")
            return {"connected": False, "message": "Connection to Ollama timed out"}
        except Exception as e:
            logger.error(f"Unexpected error checking Ollama connection: {e}")
            return {"connected": False, "message": str(e)}
    
    def get_available_models(self) -> List[Dict]:
        """Fetch all models from Ollama /api/tags endpoint"""
        try:
            logger.debug("Fetching available models from Ollama")
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                models = data.get("models", [])
                logger.info(f"Found {len(models)} models in Ollama")
                
                return [{
                    "name": model.get("name", "unknown"),
                    "size": model.get("size", 0),
                    "size_formatted": self._format_size(model.get("size", 0)),
                    "modified_at": model.get("modified_at", ""),
                    "digest": model.get("digest", ""),
                    "details": model.get("details", {})
                } for model in models]
            
            logger.warning(f"Failed to fetch models, status: {response.status_code}")
            return []
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return []
    
    def get_model_info(self, model_name: str) -> Optional[Dict]:
        """Get detailed information about a specific model from Ollama"""
        logger.debug(f"Fetching info for model: {model_name}")
        try:
            response = requests.post(f"{self.base_url}/api/show", json={"name": model_name}, timeout=5)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception:
            return None

    def generate(self, prompt: str, model: str | None = None, 
                 system_prompt: str | None = None,
                 temperature: float = 0.5,
                 context_length: int = 4096,
                 top_p: float = 0.9,
                 top_k: int = 40,
                 stream: bool = False,
                 timeout: Optional[int] = None,
                 max_tokens: Optional[int] = None,
                 json_mode: bool = False) -> str:
        """Generate a response using Ollama /api/chat"""
        model = model or config.DEFAULT_MODEL
        gen_timeout = timeout or config.LLM_GENERATION_TIMEOUT
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
                "num_ctx": context_length,
                "top_p": top_p,
                "top_k": top_k,
                "num_predict": max_tokens if max_tokens else 512,
            }
        }
        
        if json_mode:
            payload["format"] = "json"
        
        try:
            import time
            start_time = time.time()
            
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=gen_timeout
            )
            
            elapsed = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                generated_text = data.get("message", {}).get("content", "").strip()
                
                if not generated_text:
                    logger.warning(f"Ollama returned empty response for model={model}")
                    generated_text = "للأسف مش قادر أجاوب دلوقتي. جرب تسأل بطريقة تانية!"
                
                logger.info(f"Ollama took {elapsed:.2f}s | model={model}")
                return generated_text
            else:
                logger.error(f"Ollama generation failed: {response.status_code} - {response.text}")
                raise OllamaGenerationError(model, f"HTTP {response.status_code}")
                
        except requests.exceptions.Timeout:
            raise OllamaGenerationError(model, f"انتهت مهلة الانتظار ({gen_timeout} ثانية).")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise OllamaGenerationError(model, str(e))
    
    def generate_stream(self, prompt: str, model: str | None = None,
                        system_prompt: str | None = None,
                        temperature: float = 0.5,
                        context_length: int = 4096,
                        top_p: float = 0.9,
                        top_k: int = 40) -> Generator[str, None, None]:
        """Generate a streaming response using Ollama /api/chat"""
        model = model or config.DEFAULT_MODEL
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_ctx": context_length,
                "top_p": top_p,
                "top_k": top_k
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                stream=True,
                timeout=120
            )
            
            for line in response.iter_lines():
                if line:
                    import json
                    data = json.loads(line.decode('utf-8'))
                    if "message" in data:
                        yield data["message"].get("content", "")
                    if data.get("done"):
                        break
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            raise OllamaGenerationError(model, str(e))
    
    def pull_model(self, model_name: str) -> Generator[Dict, None, None]:
        """Pull a model from Ollama registry"""
        logger.info(f"Pulling model: {model_name}")
        try:
            response = requests.post(f"{self.base_url}/api/pull", json={"name": model_name}, stream=True)
            for line in response.iter_lines():
                if line:
                    yield json.loads(line.decode('utf-8'))
        except Exception as e:
            yield {"status": "error", "message": str(e)}
    
    def delete_model(self, model_name: str) -> bool:
        """Delete a model from Ollama"""
        try:
            response = requests.delete(f"{self.base_url}/api/delete", json={"name": model_name})
            return response.status_code == 200
        except Exception:
            return False
    
    def embed(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Get embeddings for a list of texts using Ollama /api/embeddings endpoint"""
        model = model or config.EMBEDDING_MODEL
        logger.debug(f"Getting embeddings for {len(texts)} texts with model: {model}")
        
        try:
            embeddings = []
            for i, text in enumerate(texts):
                logger.debug(f"Embedding text {i+1}/{len(texts)}")
                response = requests.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": model, "prompt": text},
                    timeout=60
                )
                
                if response.status_code == 200:
                    data = response.json()
                    emb = data.get("embedding", [])
                    embeddings.append(emb)
                else:
                    logger.error(f"Embedding failed with status {response.status_code}")
                    raise OllamaGenerationError(model, f"HTTP {response.status_code}")
                    
            if len(embeddings) == 0 and len(texts) > 0:
                raise OllamaGenerationError(model, "No embeddings returned")

            logger.debug(f"Successfully retrieved {len(embeddings)} embeddings from Ollama")
            return embeddings
                
        except Exception as e:
            logger.error(f"Error getting embeddings from Ollama: {e}")
            raise OllamaGenerationError(model, str(e))

    def _format_size(self, size_bytes: float) -> str:
        """Format file size to human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024
        return f"{size_bytes:.1f} PB"


# Singleton instance
ollama_service = OllamaService()
