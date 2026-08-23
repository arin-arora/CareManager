import os

# Strip proxy variables BEFORE importing the groq package to prevent HTTPX from caching them
for var in ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY", "all_proxy"]:
    os.environ.pop(var, None)

from groq import Groq

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
STRICT_AI_MODE = os.environ.get("STRICT_AI_MODE", "false").lower() == "true"

# Safe fallback check if key is passed through other parameters
if not GROQ_API_KEY:
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    if GEMINI_API_KEY.startswith("gsk_"):
        GROQ_API_KEY = GEMINI_API_KEY

groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
