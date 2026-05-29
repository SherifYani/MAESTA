from datetime import datetime, timedelta, timezone
from typing import List, Optional
from services.agent.schemas import BotRuntimeContext
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.schemas import AIMemory
from services.agent.storage.tenant_guard import assert_runtime_scope

class MemoryService:
    @staticmethod
    def save_session_summary(runtime: BotRuntimeContext, content: str, ttl_seconds: Optional[int] = None):
        assert_runtime_scope(runtime)
        expires_at = None
        if ttl_seconds:
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
        
        memory = AIMemory(
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            session_id=runtime.session_id,
            user_id=runtime.user_id,
            memory_type="session_summary",
            content=content,
            visibility="session",
            ttl_seconds=ttl_seconds,
            expires_at=expires_at
        )
        ai_storage.memory.save_memory(memory)

    @staticmethod
    def get_session_memory(runtime: BotRuntimeContext) -> List[AIMemory]:
        assert_runtime_scope(runtime)
        return ai_storage.memory.get_session_memory(
            runtime.tenant_id, runtime.site_id, runtime.bot_id, runtime.session_id
        )

    @staticmethod
    def save_user_preference(runtime: BotRuntimeContext, content: str):
        assert_runtime_scope(runtime)
        if not runtime.user_id:
            return # Cannot save user preference without user_id
            
        memory = AIMemory(
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            session_id=runtime.session_id,
            user_id=runtime.user_id,
            memory_type="user_preference",
            content=content,
            visibility="user"
        )
        ai_storage.memory.save_memory(memory)

    @staticmethod
    def save_temporary_task_state(runtime: BotRuntimeContext, content: str, ttl_seconds: int):
        assert_runtime_scope(runtime)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
        
        memory = AIMemory(
            tenant_id=runtime.tenant_id,
            site_id=runtime.site_id,
            bot_id=runtime.bot_id,
            session_id=runtime.session_id,
            user_id=runtime.user_id,
            memory_type="temporary_task_state",
            content=content,
            visibility="session",
            ttl_seconds=ttl_seconds,
            expires_at=expires_at
        )
        ai_storage.memory.save_memory(memory)

    @staticmethod
    def clear_session_memory(runtime: BotRuntimeContext):
        # We don't have a bulk delete by session in the repo yet, but we could add it.
        # For now, this is a placeholder or we can implement it in repo.
        pass

    # ==========================================
    # Compatibility Methods for chat_router.py
    # ==========================================
    def add_exchange(self, question: Optional[str] = None, answer: Optional[str] = None, 
                     user_message: Optional[str] = None, assistant_message: Optional[str] = None,
                     session_id: Optional[str] = None, runtime: Optional[BotRuntimeContext] = None, 
                     metadata: Optional[dict] = None):
        """Compatibility method for legacy chat_router calls."""
        import logging
        logger = logging.getLogger(__name__)
        try:
            q = question or user_message or ""
            a = answer or assistant_message or ""
            logger.debug(f"add_exchange called for session {session_id}")
            if runtime:
                content = f"User: {q}\nAI: {a}"
                self.save_session_summary(runtime, content)
        except Exception as e:
            logger.warning(f"Failed to save exchange to memory: {e}")

    def get_session_info(self, session_id: Optional[str] = None) -> dict:
        """Compatibility method"""
        import logging
        logger = logging.getLogger(__name__)
        try:
            return {"message_count": 0, "has_context": False}
        except Exception as e:
            logger.warning(f"Failed to get session info: {e}")
            return {"message_count": 0, "has_context": False}

    def get_context_for_prompt(self, question: str, session_id: str, language: str) -> Optional[str]:
        """Compatibility method"""
        import logging
        logger = logging.getLogger(__name__)
        try:
            return None
        except Exception as e:
            logger.warning(f"Failed to get context for prompt: {e}")
            return None

    def clear_session(self, session_id: Optional[str] = None):
        """Compatibility method"""
        import logging
        logger = logging.getLogger(__name__)
        try:
            logger.debug(f"clear_session called for {session_id}")
        except Exception as e:
            logger.warning(f"Failed to clear session: {e}")

# Singleton instance
conversation_memory = MemoryService()
