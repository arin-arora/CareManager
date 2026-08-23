import os
import json
import hashlib
import redis

REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379")

# Initialize Redis client with a short socket timeout to prevent blocking during connection issues
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=2.0)
except Exception as e:
    print(f"Redis client initialization error: {e}")
    redis_client = None

def generate_cache_key(prefix: str, data_str: str) -> str:
    """Generate a SHA-256 hash-based cache key with a domain prefix."""
    h = hashlib.sha256(data_str.encode("utf-8")).hexdigest()
    return f"cache:{prefix}:{h}"

def get_cached_response(key: str) -> dict | None:
    """Fetch cached response dict from Redis. Returns None on cache miss or connection error."""
    from utils.metrics import record_cache
    if not redis_client:
        record_cache(False)
        return None
    try:
        data = redis_client.get(key)
        if data:
            record_cache(True)
            return json.loads(data)
        record_cache(False)
    except Exception as e:
        record_cache(False)
        print(f"Redis cache lookup failed for key {key}: {e}")
    return None

def set_cached_response(key: str, data: dict, expire: int = 86400) -> bool:
    """Store response dict into Redis cache with an expiration TTL (defaults to 24h)."""
    if not redis_client:
        return False
    try:
        redis_client.setex(key, expire, json.dumps(data))
        return True
    except Exception as e:
        print(f"Redis cache write failed for key {key}: {e}")
    return False
