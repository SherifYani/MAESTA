import os
import json
from typing import Dict, Any, Optional
from .openai_compatible_client import OpenAICompatibleClient

class UtilityLLM:
    """
    Uses qwen3-coder:480b-cloud via Ollama for analysis, parsing, and JSON structured outputs.
    Do NOT use for final user responses.
    """
    def __init__(self):
        base_url = os.getenv("UTILITY_MODEL_BASE_URL", "http://localhost:11434/v1")
        model_name = os.getenv("UTILITY_MODEL_NAME", "qwen3-coder:480b-cloud")
        api_key = os.getenv("UTILITY_MODEL_API_KEY", "not-needed")
        self.client = OpenAICompatibleClient(base_url, model_name, api_key)
        
    def generate_json(self, messages: list, schema: Optional[Dict[str, Any]] = None, retries: int = 1) -> Dict[str, Any]:
        """
        Generate guaranteed JSON output for utility tasks.
        """
        print(f"[AI:utility] Using {self.client.model_name} for structured task")
        
        response_format = {"type": "json_object"} 
        if schema is not None:
            response_format = {
                "type": "json_schema", 
                "json_schema": {"name": "output_schema", "schema": schema}
            }
        
        for attempt in range(retries + 1):
            try:
                response = self.client.chat(messages, temperature=0.0, response_format=response_format)
                content = response["choices"][0]["message"]["content"]
                return json.loads(content)
            except (json.JSONDecodeError, KeyError) as e:
                print(f"[AI:utility] JSON parsing failed on attempt {attempt + 1}: {e}")
                if attempt == retries:
                    raise ValueError(f"Failed to generate valid JSON from utility model: {e}")
                # We could append a repair prompt to the messages here for the retry.
                
        raise ValueError("Failed to generate valid JSON: Retries exhausted or invalid retry count.")
