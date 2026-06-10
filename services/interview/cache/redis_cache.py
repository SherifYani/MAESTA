"""
Redis cache layer for interview system — reduces LLM calls and speeds up responses.
Gracefully falls back to in-memory dict cache if Redis is unavailable.
"""
import time
import json
from typing import Any, Optional, Dict
from core.logger import get_logger

logger = get_logger(__name__)

try:
    import redis as redis_module
    HAS_REDIS = True
except ImportError:
    HAS_REDIS = False
    logger.info("Redis not installed. Using in-memory cache fallback.")


class RedisCache:
    def __init__(self):
        self._memory_cache: Dict[str, Any] = {}
        self._memory_ttl: Dict[str, float] = {}
        self._redis_client = None
        self._enabled = False
        self._init_redis()

    def _init_redis(self):
        if not HAS_REDIS:
            return
        try:
            self._redis_client = redis_module.Redis(
                host='localhost', port=6379, db=0,
                socket_connect_timeout=1, socket_timeout=1,
                decode_responses=True,
            )
            self._redis_client.ping()
            self._enabled = True
            logger.info("Redis cache connected")
        except Exception as e:
            logger.warning(f"Redis unavailable, using in-memory cache: {e}")
            self._enabled = False

    def get(self, key: str) -> Optional[Any]:
        if self._enabled and self._redis_client:
            try:
                val = self._redis_client.get(key)
                if val:
                    return json.loads(val)
            except Exception:
                pass
        # Fallback to memory cache
        if key in self._memory_cache:
            if time.time() < self._memory_ttl.get(key, 0):
                return self._memory_cache[key]
            else:
                del self._memory_cache[key]
                del self._memory_ttl[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 300):
        if self._enabled and self._redis_client:
            try:
                self._redis_client.setex(key, ttl, json.dumps(value, default=str))
                return
            except Exception:
                pass
        # Fallback to memory cache
        self._memory_cache[key] = value
        self._memory_ttl[key] = time.time() + ttl

    def delete(self, key: str):
        if self._enabled and self._redis_client:
            try:
                self._redis_client.delete(key)
            except Exception:
                pass
        self._memory_cache.pop(key, None)
        self._memory_ttl.pop(key, None)

    def clear_pattern(self, pattern: str):
        if self._enabled and self._redis_client:
            try:
                for key in self._redis_client.scan_iter(match=pattern):
                    self._redis_client.delete(key)
            except Exception:
                pass
        # Clear from memory
        keys = [k for k in self._memory_cache if pattern.rstrip('*') in k]
        for k in keys:
            self._memory_cache.pop(k, None)
            self._memory_ttl.pop(k, None)

    def flush(self):
        self._memory_cache.clear()
        self._memory_ttl.clear()
        if self._enabled and self._redis_client:
            try:
                self._redis_client.flushdb()
            except Exception:
                pass


redis_cache = RedisCache()
