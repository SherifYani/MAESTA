"""
Conversation Memory Service - Manages conversation context and history
"""
from typing import Dict, List, Optional
from collections import deque
from datetime import datetime, timedelta
import hashlib


class ConversationMemory:
    """Manages conversation memory for contextual responses"""
    
    def __init__(self, max_history: int = 10, session_timeout_minutes: int = 30):
        """
        Initialize conversation memory
        
        Args:
            max_history: Maximum number of message pairs to keep in memory
            session_timeout_minutes: Session expires after this many minutes of inactivity
        """
        self.max_history = max_history
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
        self.sessions: Dict[str, dict] = {}
    
    def _get_session_id(self, user_id: Optional[str] = None) -> str:
        """Generate or get session ID"""
        if user_id:
            return user_id
        # Default session for admin testing
        return "default_session"
    
    def _is_session_valid(self, session: dict) -> bool:
        """Check if session is still valid (not expired)"""
        if not session.get('last_activity'):
            return False
        return datetime.now() - session['last_activity'] < self.session_timeout
    
    def _get_or_create_session(self, session_id: str) -> dict:
        """Get existing session or create new one with persistent history"""
        if session_id in self.sessions:
            session = self.sessions[session_id]
            if self._is_session_valid(session):
                return session
        
        # Create new session
        from models import database
        history = deque(maxlen=self.max_history)
        
        try:
            # Load last messages from DB to maintain context across restarts
            db_history = database.get_session_history(session_id, limit=self.max_history)
            # db_history is newest first, we need oldest first for the deque
            for entry in reversed(db_history):
                history.append({
                    'question': entry['question'],
                    'answer': entry['answer'],
                    'timestamp': entry.get('created_at', datetime.now()),
                    'metadata': {'persistent': True}
                })
        except Exception as e:
            # Fallback to empty history if DB fails
            pass
            
        self.sessions[session_id] = {
            'history': history,
            'last_activity': datetime.now(),
            'context_summary': None,
            'topic': None
        }
        return self.sessions[session_id]
    
    def add_exchange(self, question: str, answer: str, 
                     session_id: Optional[str] = None,
                     metadata: Optional[dict] = None):
        """
        Add a question-answer exchange to memory
        
        Args:
            question: User's question
            answer: Bot's answer
            session_id: Optional session identifier
            metadata: Optional metadata (source_type, intent, etc.)
        """
        sid = self._get_session_id(session_id)
        session = self._get_or_create_session(sid)
        
        exchange = {
            'question': question,
            'answer': answer,
            'timestamp': datetime.now(),
            'metadata': metadata or {}
        }
        
        session['history'].append(exchange)
        session['last_activity'] = datetime.now()
        
        # Try to detect topic from the conversation
        self._update_topic(session, question)
    
    def _update_topic(self, session: dict, question: str):
        """Update conversation topic based on recent messages"""
        # Simple topic detection - could be enhanced with NLP
        keywords = question.lower().split()
        if len(keywords) > 2:
            # Use longest meaningful word as potential topic
            meaningful = [w for w in keywords if len(w) > 3 and w not in 
                         ['what', 'how', 'when', 'where', 'why', 'who', 'which',
                          'ما', 'كيف', 'متى', 'أين', 'لماذا', 'من', 'هل']]
            if meaningful:
                session['topic'] = meaningful[0]
    
    def get_context(self, session_id: Optional[str] = None, 
                    max_messages: int = 3) -> str:
        """
        Get formatted conversation context for AI prompt
        
        Args:
            session_id: Optional session identifier
            max_messages: Maximum number of recent exchanges to include
            
        Returns:
            Formatted context string for AI prompt
        """
        sid = self._get_session_id(session_id)
        session = self._get_or_create_session(sid)
        
        if not session['history']:
            return ""
        
        # Get recent exchanges (reduced for speed)
        recent = list(session['history'])[-max_messages:]
        
        if not recent:
            return ""
        
        # Format as conversation context (truncated for speed)
        lines = ["[Previous conversation:]"]
        for exchange in recent:
            q = exchange['question'][:150]  # Shorter truncation
            a = exchange['answer'][:200]    # Shorter truncation
            lines.append(f"User: {q}")
            lines.append(f"Assistant: {a}")
        
        lines.append("[End of previous conversation]\n")
        
        return "\n".join(lines)
    
    def get_context_for_prompt(self, new_question: str,
                               session_id: Optional[str] = None,
                               language: str = 'english') -> str | None:
        """
        Build full context-aware prompt for AI
        
        Args:
            new_question: The new question being asked
            session_id: Optional session identifier
            language: Detected language
            
        Returns:
            Full prompt with conversation context
        """
        context = self.get_context(session_id)
        
        if not context:
            return None  # No context available
        
        if language == 'arabic':
            prompt = f"""أنت MAESTA في محادثة متعددة الأدوار.
التعليمات:
- إذا أشار السؤال الجديد لشيء من المحادثة (مثل "هو"، "ذلك"، "نفس الشيء")، حدد المرجع من السياق.
- إذا كان السؤال متابعة، ابنِ على الإجابة السابقة — لا تكرر المعلومات.
- إذا كان السؤال غير مرتبط، أجب عليه مباشرة بدون فرض السياق.

{context}

السؤال الجديد: {new_question}

الجواب:"""
        else:
            prompt = f"""You are MAESTA in a multi-turn conversation.
INSTRUCTIONS:
- If the new question references something from the conversation (e.g., "it", "that", "the same"), resolve the reference using the history.
- If the new question is a follow-up, build on the previous answer — don't repeat information.
- If the new question is unrelated, answer it fresh without forcing context.

{context}

New question: {new_question}

Answer:"""
        
        return prompt
    
    def get_history(self, session_id: Optional[str] = None) -> List[Dict]:
        """Get full conversation history for a session"""
        sid = self._get_session_id(session_id)
        session = self._get_or_create_session(sid)
        return list(session['history'])
    
    def clear_session(self, session_id: Optional[str] = None):
        """Clear a session's history"""
        sid = self._get_session_id(session_id)
        if sid in self.sessions:
            del self.sessions[sid]
    
    def get_session_info(self, session_id: Optional[str] = None) -> Dict:
        """Get info about a session"""
        sid = self._get_session_id(session_id)
        session = self._get_or_create_session(sid)
        
        return {
            'message_count': len(session['history']),
            'topic': session.get('topic'),
            'last_activity': session['last_activity'].isoformat() if session.get('last_activity') else None,
            'is_active': self._is_session_valid(session)
        }


# Singleton instance
conversation_memory = ConversationMemory(max_history=10, session_timeout_minutes=30)
