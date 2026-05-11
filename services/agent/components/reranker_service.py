"""
Reranker Service - Re-ranks search results using LLM-based relevance scoring.
Uses BATCH scoring (one LLM call for all chunks) for speed.
"""
from typing import List, Dict, Optional
import re
import json
import logging
from services.agent.ollama_service import ollama_service
import config

logger = logging.getLogger(__name__)

class RerankerService:
    """Service for reranking search results using core LLM — batch mode"""
    
    def __init__(self):
        self.ollama = ollama_service
        self.top_k = 3  # Configurable top-k
    
    def rerank(self, question: str, chunks: List[Dict], top_k: int | None = None) -> List[Dict]:
        """
        Rerank chunks based on relevance to the question.
        Uses ONE LLM call to score all chunks at once.
        Returns top_k chunks.
        """
        if not chunks:
            return []
            
        top_k = top_k or self.top_k
        if len(chunks) <= 1:
            return chunks
            
        logger.info(f"Batch-reranking {len(chunks)} chunks for question: {question[:50]}...")
        
        # Build numbered list of chunks
        numbered = []
        for i, chunk in enumerate(chunks):
            content = chunk['content'][:400]  # Truncate each chunk
            numbered.append(f"[Text {i+1}]: {content}")
        
        chunks_text = "\n\n".join(numbered)
        
        prompt = f"""Rate each text's relevance to the question from 0 to 10.
Output ONLY a JSON array of numbers, one score per text, in order.
Example for 3 texts: [8, 2, 5]

Question: {question}

{chunks_text}

Scores (JSON array of {len(chunks)} numbers):"""

        try:
            response = self.ollama.generate(
                prompt=prompt,
                temperature=0.0,
                max_tokens=100,
                timeout=30  # Strict timeout for reranking
            )
            
            # Extract JSON array from response
            match = re.search(r'\[[\d\s,\.]+\]', response.strip())
            if match:
                scores = json.loads(match.group())
                # Apply scores
                for i, chunk in enumerate(chunks):
                    chunk['rerank_score'] = float(scores[i]) if i < len(scores) else 0.0
            else:
                # Fallback: try to extract individual numbers
                numbers = re.findall(r'(\d+(?:\.\d+)?)', response.strip())
                for i, chunk in enumerate(chunks):
                    chunk['rerank_score'] = float(numbers[i]) if i < len(numbers) else 0.0
                    
        except Exception as e:
            logger.warning(f"Batch reranking failed, keeping original order: {e}")
            for chunk in chunks:
                chunk['rerank_score'] = chunk.get('score', 0.0)
        
        # Sort by rerank score descending
        chunks.sort(key=lambda x: x.get('rerank_score', 0), reverse=True)
        return chunks[:top_k]

# Singleton
reranker_service = RerankerService()

