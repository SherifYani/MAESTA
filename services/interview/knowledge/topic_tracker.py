"""
Topic Tracker — tracks which sub-topics have been asked per skill during interview.
Ensures variety and prevents duplicate questions across interviews.
Supports both predefined topics (from skill_rubrics) and dynamic LLM-generated topics.
"""
import random
from typing import Dict, List, Optional, Set
from core.logger import get_logger
from services.interview.knowledge.skill_rubrics import get_skill_rubric, SKILL_RUBRICS
from services.interview.knowledge.dynamic_topic_generator import dynamic_topic_generator, get_all_topic_names

logger = get_logger(__name__)


class TopicTracker:
    """Tracks asked topics per skill within an interview session.
    Supports both predefined and dynamically generated topics.
    """

    def __init__(self):
        self.skill_topics: Dict[str, Dict[str, List[str]]] = {}
        self._load_predefined_topics()

    def _load_predefined_topics(self):
        """Extract topics from skill rubrics (static definitions)."""
        for skill_key, rubric in SKILL_RUBRICS.items():
            if "topics" in rubric:
                self.skill_topics[skill_key] = rubric["topics"]

    def _get_all_topics(self, skill: str) -> Dict[str, List[str]]:
        """Get all topics for a skill, combining predefined + dynamic."""
        skill_lower = skill.lower()
        
        # 1. Predefined topics (from skill_rubrics)
        predefined = self.skill_topics.get(skill_lower, {})
        
        # 2. Dynamic topics (LLM-generated, cached)
        dynamic = dynamic_topic_generator.get_topics(skill)
        
        # 3. Merge: predefined first (higher priority), then dynamic
        merged = {**dynamic, **predefined}
        return merged

    def get_available_topics(self, skill: str) -> Dict[str, List[str]]:
        """Get all available sub-topics for a skill (predefined + dynamic)."""
        return self._get_all_topics(skill)

    def get_all_topic_names(self, skill: str) -> List[str]:
        """Get flat list of all topic names for a skill."""
        topics = self._get_all_topics(skill)
        all_topics = []
        for category, topic_list in topics.items():
            all_topics.extend(topic_list)
        return all_topics

    def get_unasked_topics(self, skill: str, asked_topics: Set[str]) -> List[str]:
        """Get list of topics not yet asked for this skill."""
        all_topics = []
        for category, topics in self.get_available_topics(skill).items():
            all_topics.extend(topics)
        asked_lower = {t.lower() for t in asked_topics}
        return [t for t in all_topics if t.lower() not in asked_lower]

    def get_random_unasked_topic(self, skill: str, asked_topics: Set[str]) -> Optional[str]:
        """Get a random unasked topic for the skill."""
        unasked = self.get_unasked_topics(skill, asked_topics)
        if not unasked:
            return None
        return random.choice(unasked)

    def extract_topic_from_question(self, question: str, skill: str) -> Optional[str]:
        """Try to identify which topic a question is about."""
        available = self.get_available_topics(skill)
        question_lower = question.lower()
        for category, topics in available.items():
            for topic in topics:
                if topic.lower() in question_lower:
                    return topic
        return None


# Global instance
topic_tracker = TopicTracker()


def get_skill_topics(skill: str) -> Dict[str, List[str]]:
    """Get all topics for a skill (predefined + dynamic)."""
    return topic_tracker.get_available_topics(skill)


def get_unasked_topic(skill: str, asked_topics: Set[str]) -> Optional[str]:
    """Get a random unasked topic for a skill."""
    return topic_tracker.get_random_unasked_topic(skill, asked_topics)


def mark_topic_asked(skill: str, topic: str, asked_topics: Set[str]) -> None:
    """Add topic to asked set."""
    asked_topics.add(topic.lower())