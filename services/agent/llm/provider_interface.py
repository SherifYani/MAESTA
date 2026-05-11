from abc import ABC, abstractmethod
from typing import Dict, List, Optional, AsyncGenerator

class LLMProviderInterface(ABC):
    """Interface for all LLM providers"""

    @abstractmethod
    async def check_connection(self) -> Dict:
        """Check connection to the provider"""
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    def generate_stream(self, prompt: str, model: str | None = None,
                        system_prompt: str | None = None,
                        temperature: float = 0.7,
                        context_length: int = 4096,
                        top_p: float = 0.9,
                        top_k: int = 40) -> AsyncGenerator[str, None]:
        """Generate streaming response asynchronously"""
        pass

    @abstractmethod
    async def embed(self, texts: List[str], model: str | None = None) -> List[List[float]]:
        """Get embeddings for given texts"""
        pass
