"""
Graph Extractor - Extracts a Knowledge Graph from document text
"""
import json
import re
from typing import List, Dict, Any, Optional
from core.logger import get_logger
from services.agent.ollama_service import ollama_service

logger = get_logger(__name__)

import asyncio
import config

class GraphExtractor:
    """Extracts entities and relationships from text to build a Knowledge Graph"""
    
    def __init__(self):
        self.is_cloud = False
        if config.CLAUDE_API_KEY and config.CLOUD_PROVIDER in ("claude", "auto"):
            from services.agent.llm.claude_provider import ClaudeProvider
            self.llm = ClaudeProvider()
            self.is_cloud = True
        elif config.GEMINI_API_KEY:
            from services.agent.llm.gemini_provider import GeminiProvider
            self.llm = GeminiProvider()
            self.is_cloud = True
        else:
            from services.agent.ollama_service import ollama_service
            self.llm = ollama_service

    def extract_graph(self, text: str, max_entities: int = 40) -> Dict[str, Any]:
        """
        Extract nodes and edges from text using LLM.
        For large documents, we use cloud models with massive context windows if available,
        otherwise we sample key parts for the local model.
        """
        if not text or len(text.strip()) < 100:
            return {"nodes": [], "edges": []}

        # Sampling strategy for local small models to prevent token exhaustion
        if not self.is_cloud and len(text) > 8000:
            sample_size = 2500
            mid = len(text) // 2
            sample_text = (
                text[:sample_size] + 
                "\n\n[... middle section ...]\n\n" + 
                text[mid-sample_size//2 : mid+sample_size//2] + 
                "\n\n[... final section ...]\n\n" + 
                text[-sample_size:]
            )
        else:
            sample_text = text  # Cloud models get the full document!

        prompt = f"""
        Analyze the text below and build a highly specific and rigorous Knowledge Graph.
        
        Extraction Requirements:
        1. Nodes: Identify specific components, protocols, actors, algorithms, or systems.
        2. Edges: Define precise relationships like "implements", "controls", "depends_on", "communicates_with".
        3. Detail: DO NOT USE GENERIC LABELS. You are strictly forbidden from using generic terms like "System", "Technology", "Challenge", "Book", "Section", "Concept". You must extract the EXACT technical term (e.g. "Agile", "Microservices", "TCP/IP", "PostgreSQL").
        4. Hierarchy: Clearly map how high-level systems depend on low-level components.
        
        Output Structure (Strict JSON):
        {{
            "nodes": [
                {{"id": "camelCaseId", "label": "Exact Technical Name", "type": "System/Technology/Role/Data/Concept"}}
            ],
            "edges": [
                {{"source": "id1", "target": "id2", "label": "verb phrase"}}
            ]
        }}
        
        Goal: Maximum {max_entities} nodes. Focus strictly on the core technical architecture and specific entities.
        
        Text to analyze:
        {sample_text}
        """

        try:
            # Generate response
            if self.is_cloud:
                logger.info(f"Using Cloud LLM (Full Context) to extract graph from {len(sample_text)} chars")
                # Cloud models are async
                response = asyncio.run(self.llm.generate(
                    prompt=prompt,
                    system_prompt="You are an elite Knowledge Graph architect. Output strictly valid JSON. NEVER use generic placeholder names like 'System' or 'Challenge'.",
                    temperature=0.1,
                    json_mode=True,
                    max_tokens=4000
                ))
            else:
                logger.info(f"Using Local LLM (Sampled Context) to extract graph from {len(sample_text)} chars")
                response = self.llm.generate(
                    prompt=prompt,
                    system_prompt="You are a Knowledge Graph extraction expert. Output strictly valid JSON.",
                    temperature=0.1,
                    json_mode=True,
                    max_tokens=2000
                )
            
            json_str = self._clean_json(response)
            graph_data = json.loads(json_str)
            
        except Exception as e:
            logger.warning(f"First extraction failed ({e}), retrying with smaller context...")
            try:
                # Fallback: Try again with a much smaller text chunk for small models
                small_text = text[:1500]
                fallback_prompt = f"Extract a simple Knowledge Graph from this text. Output strict JSON with 'nodes' and 'edges'. Text: {small_text}"
                
                if self.is_cloud:
                    response = asyncio.run(self.llm.generate(
                        prompt=fallback_prompt, system_prompt="Output strictly valid JSON with 'nodes' and 'edges'.",
                        temperature=0.1, json_mode=True, max_tokens=1000
                    ))
                else:
                    response = self.llm.generate(
                        prompt=fallback_prompt, system_prompt="Output strictly valid JSON with 'nodes' and 'edges'.",
                        temperature=0.1, json_mode=True, max_tokens=1000
                    )
                    
                json_str = self._clean_json(response)
                graph_data = json.loads(json_str)
            except Exception as fallback_e:
                logger.error(f"Fallback extraction also failed: {fallback_e}")
                return {"nodes": [], "edges": []}
                
        # Basic validation
        if "nodes" not in graph_data: graph_data["nodes"] = []
        if "edges" not in graph_data: graph_data["edges"] = []
        
        logger.info(f"Successfully extracted graph with {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edges")
        return graph_data

    def _clean_json(self, text: str) -> str:
        """Strip markdown code blocks and find the first {{ and last }}"""
        # Handle cases where LLM might wrap in ```json ... ```
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        
        start = text.find('{')
        end = text.rfind('}') + 1
        
        if start != -1 and end != 0:
            return text[start:end]
        return text

    def to_mermaid(self, graph_data: Dict[str, Any], direction: str = "LR") -> str:
        """Convert graph data to Mermaid.js diagram code"""
        if not graph_data or not graph_data.get('nodes'):
            return ""
            
        lines = [f"graph {direction}"]
        
        # Styling
        lines.append("    classDef concept fill:#1e1b4b,stroke:#6366f1,stroke-width:3px,color:#fff,font-size:20px,font-weight:bold;")
        lines.append("    classDef system fill:#1e1b4b,stroke:#3b82f6,stroke-width:3px,color:#fff,font-size:20px,font-weight:bold;")
        lines.append("    classDef tech fill:#064e3b,stroke:#10b981,stroke-width:3px,color:#fff,font-size:20px,font-weight:bold;")
        lines.append("    classDef role fill:#78350f,stroke:#f59e0b,stroke-width:3px,color:#fff,font-size:20px,font-weight:bold;")
        
        # Organize nodes by type for subgraphs
        by_type = {}
        for node in graph_data.get('nodes', []):
            ntype = node.get('type', 'Concept').capitalize()
            if ntype not in by_type: by_type[ntype] = []
            by_type[ntype].append(node)
            
        # Add nodes within subgraphs
        for ntype, nodes in by_type.items():
            lines.append(f"    subgraph {ntype}")
            for node in nodes:
                node_id = node.get('id', '').replace(' ', '_').replace('-', '_')
                label = node.get('label', node_id)
                
                # Assign shape based on type
                if 'System' in ntype:
                    lines.append(f'        {node_id}[["{label}"]]:::system')
                elif 'Tech' in ntype:
                    lines.append(f'        {node_id}>"{label}"]:::tech')
                elif 'Role' in ntype:
                    lines.append(f'        {node_id}("{label}"):::role')
                else:
                    lines.append(f'        {node_id}("{label}"):::concept')
            lines.append("    end")
                
        # Add edges
        for edge in graph_data.get('edges', []):
            src = edge.get('source', '').replace(' ', '_').replace('-', '_')
            target = edge.get('target', '').replace(' ', '_').replace('-', '_')
            label = edge.get('label', '')
            if label:
                lines.append(f'    {src} -- "{label}" --> {target}')
            else:
                lines.append(f'    {src} --> {target}')
                
        return "\n".join(lines)

# Singleton instance
graph_extractor = GraphExtractor()
