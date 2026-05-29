from abc import ABC, abstractmethod
from services.agent.schemas import AIRequest, AIResponse

class BaseSkill(ABC):
    @property
    @abstractmethod
    def skill_name(self) -> str:
        pass
        
    @abstractmethod
    def handle_request(self, request: AIRequest) -> AIResponse:
        pass
