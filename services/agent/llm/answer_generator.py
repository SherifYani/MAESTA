import os
from .openai_compatible_client import OpenAICompatibleClient

class AnswerGenerator:
    """
    Uses qwen3-company-assistant for natural language responses.
    Do NOT use for parsing, logic, or scoring.
    """
    def __init__(self):
        base_url = os.getenv("FINETUNED_MODEL_BASE_URL", "http://localhost:8092/v1")
        model_name = os.getenv("FINETUNED_MODEL_NAME", "qwen3-company-assistant")
        api_key = os.getenv("FINETUNED_MODEL_API_KEY", "not-needed")
        self.client = OpenAICompatibleClient(base_url, model_name, api_key)
        
    def generate_response(self, messages: list, temperature: float = 0.7) -> str:
        """
        Generate the final human-readable answer.
        """
        print(f"[AI:answer] Using {self.client.model_name} for final response")
        
        response = self.client.chat(messages, temperature=temperature)
        return response["choices"][0]["message"]["content"]
