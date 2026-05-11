from typing import Annotated, List, Union, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.messages import BaseMessage
import operator

class AgentState(BaseModel):
    messages: Annotated[List[BaseMessage], operator.add] = Field(default_factory=list)
    next: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)
