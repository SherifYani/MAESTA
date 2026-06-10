"""
Dynamic Topic Generator — generates sub-topics for ANY skill/domain on-demand using LLM.
Caches results for performance. Works for ANY domain (not just technical).
"""
import json
import re
from typing import Dict, List, Optional, Set
from core.logger import get_logger
from services.agent.ollama_service import ollama_service
from services.interview.cache.redis_cache import redis_cache
import config

logger = get_logger(__name__)


class DynamicTopicGenerator:
    """Generates sub-topics for ANY skill/domain using LLM with caching."""
    
    CACHE_TTL = 86400 * 7  # 7 days
    CACHE_PREFIX = "topics:"
    
    def __init__(self):
        self._local_cache: Dict[str, Dict] = {}
    
    def _cache_key(self, skill: str) -> str:
        return f"{self.CACHE_PREFIX}{skill.lower().strip()}"
    
    def get_topics(self, skill: str, context: str = "", use_cache: bool = True) -> Dict[str, List[str]]:
        """
        Get sub-topics for a skill. Uses cache first, then LLM generation.
        
        Returns:
            Dict[category, List[topic]] - e.g., {"structural": ["load calculations", "foundation design"]}
        """
        skill_normalized = skill.lower().strip()
        
        # 1. Check local memory cache
        if skill_normalized in self._local_cache:
            return self._local_cache[skill_normalized]
        
        # 2. Check Redis cache
        if use_cache:
            cache_key = f"topics:{skill_normalized}"
            cached = redis_cache.get(cache_key)
            if cached:
                self._local_cache[skill_normalized] = cached
                return cached
        
        # 3. Generate via LLM
        logger.info(f"Generating topics for skill: {skill}")
        topics = self._generate_via_llm(skill)
        
        # 4. Cache results
        if topics:
            self._local_cache[skill_normalized] = topics
            if use_cache:
                cache_key = f"topics:{skill_normalized}"
                redis_cache.set(cache_key, topics, ttl=86400 * 7)
        
        return topics
    
    def _generate_via_llm(self, skill: str) -> Dict[str, List[str]]:
        """Generate topics using LLM."""
        prompt = self._build_prompt(skill)
        
        try:
            text = ollama_service.generate(
                prompt=prompt,
                model=config.DEFAULT_MODEL,
                temperature=0.3,
                max_tokens=800,
                think=False,
            )
            
            # Parse JSON from response
            topics = self._parse_llm_response(text)
            
            if topics:
                logger.info(f"Generated {sum(len(v) for v in topics.values())} topics for {skill}")
                return topics
            
        except Exception as e:
            logger.error(f"LLM topic generation failed for {skill}: {e}")
        
        # Fallback to generic
        return self._fallback_topics()
    
    def _build_prompt(self, skill: str) -> str:
        return f"""You are an expert interviewer designing a comprehensive assessment for a {skill} professional.

Generate a comprehensive list of sub-topics organized by category that would be used to thoroughly assess a candidate's {skill} expertise.

Requirements:
1. Cover 5-8 categories relevant to {skill}
2. Each category should have 4-6 specific, testable sub-topics
3. Sub-topics must be specific enough to generate precise interview questions
4. Avoid generic terms - be specific to {skill}
5. Include a mix of theoretical, practical, and scenario-based topics
6. Cover beginner to advanced levels

Return ONLY valid JSON in this exact format:
{{
  "category_name": ["specific sub-topic 1", "specific sub-topic 2", "specific sub-topic 3", "specific sub-topic 4"],
  "another_category": ["sub-topic 1", "sub-topic 2", "sub-topic 3", "sub-topic 4"]
}}

Example for "software engineering":
{{
  "data_structures_algorithms": ["trees and graphs", "dynamic programming", "sorting algorithms", "complexity analysis"],
  "system_design": ["scalability patterns", "database sharding", "caching strategies", "load balancing"],
  "distributed_systems": ["consensus algorithms", "eventual consistency", "service discovery", "circuit breakers"]
}}

Now generate for: {skill}"""

    def _parse_llm_response(self, text: str) -> Optional[Dict[str, List[str]]]:
        """Extract JSON from LLM response."""
        text = text.strip()
        
        # Try direct JSON parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # Try to extract JSON from markdown code blocks
        import re
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find JSON object in text
        json_match = re.search(r'(\{.*\})', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        logger.warning("Failed to parse LLM topics response")
        return None
    
    def _fallback_topics(self) -> Dict[str, List[str]]:
        """Generic fallback topics."""
        return {
            "fundamentals": ["basic concepts", "core terminology", "fundamental principles", "key concepts"],
            "practical_application": ["common tools", "standard workflows", "best practices", "common pitfalls"],
            "advanced_concepts": ["optimization techniques", "architecture patterns", "performance tuning", "troubleshooting"],
            "real_world_scenarios": ["problem solving", "decision making", "trade-off analysis", "case studies"],
        }


# Global instance
dynamic_topic_generator = DynamicTopicGenerator()


def get_dynamic_topics(skill: str, context: str = "") -> Dict[str, List[str]]:
    """Public API to get topics for any skill."""
    return dynamic_topic_generator.get_topics(skill)


def get_all_topic_names(skill: str) -> List[str]:
    """Flatten all topics into a single list."""
    topics = dynamic_topic_generator.get_topics(skill)
    all_topics = []
    for category, topic_list in topics.items():
        all_topics.extend(topic_list)
    return all_topics