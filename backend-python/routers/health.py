from fastapi import APIRouter
from services.groq_client import groq_client, GROQ_API_KEY
from utils.metrics import metrics_state, get_system_metrics
from utils.cache import redis_client

router = APIRouter()

@router.get("/")
def read_root():
    return {"status": "online", "service": "MedGuide AI Prediction Service"}

@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.get("/health/diagnostics")
def health_diagnostics():
    # Verify Redis status and DB size
    redis_connected = False
    redis_keys = 0
    if redis_client:
        try:
            # Simple connection check
            redis_client.ping()
            redis_connected = True
            redis_keys = redis_client.dbsize()
        except Exception:
            redis_connected = False

    # AI API key configured status
    key_configured = "Configured" if GROQ_API_KEY else "Missing"

    # Get system statistics (CPU, memory, uptime)
    system_stats = get_system_metrics()

    return {
        "fastapi_status": "Running",
        "ai_provider": "Groq",
        "ai_model_name": "qwen/qwen3.6-27b",
        "ai_vision_model_name": "qwen/qwen3.6-27b",
        "api_key_status": key_configured,
        "groq_status": "Connected" if groq_client is not None else "Failed",
        "groq_auth_status": metrics_state["groq_auth_status"],
        "last_successful_request_time": metrics_state["last_successful_request_time"],
        "last_latency_seconds": metrics_state["last_latency"],
        "cache_connected": redis_connected,
        "cache_hits": metrics_state["cache_hits"],
        "cache_misses": metrics_state["cache_misses"],
        "cache_keys_stored": redis_keys,
        "system_metrics": system_stats
    }
