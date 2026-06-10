"""
Configuration settings for the Knowledge Base Chatbot
All values can be overridden via environment variables
"""
import os
from pathlib import Path

# Suppress TensorFlow logging and oneDNN messages
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # Only show errors and fatal logs

from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).parent.absolute()

# Database
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "chatbot.db"))).resolve()
AI_DATABASE_PATH = Path(os.getenv("AI_DATABASE_PATH", str(BASE_DIR / "data" / "ai_storage.db"))).resolve()

# File uploads
UPLOAD_FOLDER = BASE_DIR / "uploads"
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'csv', 'txt', 'xlsx', 'xls'}
MAX_CONTENT_LENGTH = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50")) * 1024 * 1024

# Vector store
VECTOR_STORE_PATH = BASE_DIR / "data" / "vector_store"

# Models (MVC)
MODELS_DIR = BASE_DIR / "models"
MODELS_WEIGHTS_DIR = MODELS_DIR / "weights"

# Ollama settings
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "qwen3:1.7b")

# Model default parameters
DEFAULT_MODEL_PARAMS = {
    "temperature": float(os.getenv("TEMPERATURE", "0.5")),
    "context_length": int(os.getenv("CONTEXT_LENGTH", "8192")),
    "top_p": float(os.getenv("TOP_P", "0.9")),
    "top_k": int(os.getenv("TOP_K", "40")),
    "max_output_tokens": int(os.getenv("MAX_OUTPUT_TOKENS", "4096")),
}

# Embeddings model — nomic-embed-text via Ollama (768 dim)
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "nomic-embed-text:latest")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "768"))
USE_OLLAMA_EMBEDDING = os.getenv("USE_OLLAMA_EMBEDDING", "true").lower() == "true"

# Chunk settings for document processing
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "800"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "100"))

# Search settings
SIMILARITY_THRESHOLD = float(os.getenv("SIMILARITY_THRESHOLD", "0.20"))
TOP_K_RESULTS = int(os.getenv("TOP_K_RESULTS", "15"))  # Increased for re-ranking headroom

# Admin credentials (change in production!)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# Flask secret key
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    # Generate a random secret key if not set
    import secrets
    SECRET_KEY = secrets.token_hex(32)
    
FLASK_ENV = os.getenv("FLASK_ENV", "development")
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "true").lower() == "true"

# Sentry settings
SENTRY_DSN = os.getenv("SENTRY_DSN", "")
ENABLE_SENTRY = os.getenv("ENABLE_SENTRY", "false").lower() == "true"

# API settings
API_KEY_LENGTH = 32
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

# Logging settings
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_TO_FILE = os.getenv("LOG_TO_FILE", "false").lower() == "true"

# Memory/Conversation settings
MAX_CONVERSATION_HISTORY = int(os.getenv("MAX_CONVERSATION_HISTORY", "5"))  # Smaller context window
SESSION_TIMEOUT_MINUTES = int(os.getenv("SESSION_TIMEOUT_MINUTES", "30"))

# Web Crawling settings
MAX_CRAWL_DEPTH = int(os.getenv("MAX_CRAWL_DEPTH", "2"))
MAX_CRAWL_PAGES = int(os.getenv("MAX_CRAWL_PAGES", "100"))
CRAWL_DELAY_SECONDS = float(os.getenv("CRAWL_DELAY_SECONDS", "1.0"))
CRAWL_TIMEOUT_SECONDS = int(os.getenv("CRAWL_TIMEOUT_SECONDS", "30"))

# Agent Core settings
USE_AGENT = os.getenv("USE_AGENT", "true").lower() == "true"  # Enabled for Expert Teacher interaction
LLM_GENERATION_TIMEOUT = int(os.getenv("LLM_GENERATION_TIMEOUT", "400"))
AGENT_TIMEOUT = int(os.getenv("AGENT_TIMEOUT", "400"))  # Faster fallback for small models
MAX_ITERATIONS = int(os.getenv("MAX_ITERATIONS", "5"))   # Max tool rounds to prevent loops

# --- Dual-LLM (Gemini) settings ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_FLASH_MODEL = os.getenv("GEMINI_FLASH_MODEL", "gemini-2.0-flash")
GEMINI_PRO_MODEL = os.getenv("GEMINI_PRO_MODEL", "gemini-2.5-pro-preview-05-06")
ENABLE_GEMINI_VERIFICATION = os.getenv("ENABLE_GEMINI_VERIFICATION", "true").lower() == "true"
ENABLE_DUAL_LLM = os.getenv("ENABLE_DUAL_LLM", "true").lower() == "true"
PRIORITIZE_LOCAL = os.getenv("PRIORITIZE_LOCAL", "true").lower() == "true"

# --- Claude (AgentRouter) settings ---
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-opus-4-6")
CLAUDE_BASE_URL = os.getenv("CLAUDE_BASE_URL", "https://agentrouter.org/v1")
# Cloud provider selection: "gemini", "claude", or "auto"
CLOUD_PROVIDER = os.getenv("CLOUD_PROVIDER", "gemini")

# ─────────────────────────────────────────────────────────────────────
# Fine-tuning / Company Assistant Integration Flags
# ─────────────────────────────────────────────────────────────────────
# افتراضيًا كل الـ flags = false → النظام القديم يعمل بدون أي تغيير.
# شغّل COMPANY_ASSISTANT_MODE=true فقط بعد التدريب والاختبار الشامل.
# تحذير: لا تشغّل COMPANY_ASSISTANT_MODE مع عدة شركات قبل حل
#         company_id isolation في FAISS (راجع docs/MULTI_COMPANY_RAG_PLAN.md).
# ─────────────────────────────────────────────────────────────────────

# تفعيل company-generic system prompt بدلًا من persona جامعة أسيوط
# في RAG generator فقط (Quiz وChat لا يتأثران)
COMPANY_ASSISTANT_MODE = os.getenv("COMPANY_ASSISTANT_MODE", "false").lower() == "true"

# استخدام prompt العام (build_company_system_prompt) بدلًا من SYSTEM_PERSONA
USE_COMPANY_ASSISTANT_PROMPT = os.getenv("USE_COMPANY_ASSISTANT_PROMPT", "false").lower() == "true"

# تفعيل الموديل المدرّب بدلًا من الموديل الحالي في RAG graph
USE_FINETUNED_MODEL = os.getenv("USE_FINETUNED_MODEL", "false").lower() == "true"
USE_FINETUNED_FOR_FINAL_ONLY = os.getenv("USE_FINETUNED_FOR_FINAL_ONLY", "true").lower() == "true"
FINETUNED_MODEL_NAME = os.getenv("FINETUNED_MODEL_NAME", "qwen3-company-assistant")
FINETUNED_MODEL_PATH = MODELS_WEIGHTS_DIR / "qwen3-company-assistant-q4_k_m.gguf"

# إعدادات الموديل المدرّب (Answer Model) — يعمل الآن عبر Ollama
FINETUNED_MODEL_BASE_URL = os.getenv("FINETUNED_MODEL_BASE_URL", "http://localhost:11434").replace("/v1", "").rstrip("/")

# إعدادات الموديل المساعد (Utility Model) — يعمل الآن عبر Ollama
USE_UTILITY_LLM = os.getenv("USE_UTILITY_LLM", "true").lower() == "true"
UTILITY_MODEL_BASE_URL = os.getenv("UTILITY_MODEL_BASE_URL", "http://localhost:11434").replace("/v1", "").rstrip("/")
UTILITY_MODEL_NAME = os.getenv("UTILITY_MODEL_NAME", "qwen3:1.7b")
UTILITY_MODEL_API_KEY = os.getenv("UTILITY_MODEL_API_KEY", "not-needed")

# API key للموديل المدرّب (llama.cpp لا يحتاجه)
FINETUNED_MODEL_API_KEY = os.getenv("FINETUNED_MODEL_API_KEY", "not-needed")

# --- Unified Bot Persona ---
# Single source of truth for the bot's identity across all prompt paths
SYSTEM_PERSONA = """أنت MAESTA، المساعد الرسمي والودود لجامعة أسيوط. 
أجب دايماً بلباقة، باختصار، وبطريقة مصرية خفيفة ودية."""

SYSTEM_PERSONA_AR = """أنت MAESTA، مساعد ذكي متخصص في قواعد المعرفة.
القواعد:
- قدم إجابات دقيقة مبنية على الأدلة. فضّل حقائق المستندات على التخمين.
- طابق طول الرد مع تعقيد السؤال (مختصر للبسيط، مفصل للمعقد).
- استخدم تنسيق markdown — نقاط، خط عريض، عناوين — لسهولة القراءة.
- لا تبدأ أبداً بعبارات تمهيدية مثل "بالطبع!" أو "سؤال رائع!".
- رد دائماً بنفس لغة المستخدم.
- إذا كنت غير متأكد، قل ذلك بصراحة."""

# --- Phase 5: AI Storage Settings ---
ENABLE_AI_STORAGE = os.getenv("ENABLE_AI_STORAGE", "true").lower() == "true"
AI_STORAGE_BACKEND = os.getenv("AI_STORAGE_BACKEND", "sqlite") # sqlite|postgres|memory
AI_STORAGE_DATABASE_URL = os.getenv("AI_STORAGE_DATABASE_URL", "postgresql://localhost/ai_storage")
AI_STORAGE_SCHEMA = os.getenv("AI_STORAGE_SCHEMA", "ai_storage")

# --- Interview System Settings ---
INTERVIEW_WEIGHTS = {
    "technical": float(os.getenv("INTERVIEW_WEIGHT_TECHNICAL", "0.35")),
    "practical": float(os.getenv("INTERVIEW_WEIGHT_PRACTICAL", "0.20")),
    "experience": float(os.getenv("INTERVIEW_WEIGHT_EXPERIENCE", "0.15")),
    "consistency": float(os.getenv("INTERVIEW_WEIGHT_CONSISTENCY", "0.15")),
    "communication": float(os.getenv("INTERVIEW_WEIGHT_COMMUNICATION", "0.10")),
    "trust": float(os.getenv("INTERVIEW_WEIGHT_TRUST", "0.05")),
}
INTERVIEW_THRESHOLDS = {
    "strong_hire": float(os.getenv("INTERVIEW_THRESHOLD_STRONG_HIRE", "90")),
    "hire": float(os.getenv("INTERVIEW_THRESHOLD_HIRE", "80")),
    "maybe": float(os.getenv("INTERVIEW_THRESHOLD_MAYBE", "65")),
    "weak_hire": float(os.getenv("INTERVIEW_THRESHOLD_WEAK_HIRE", "50")),
}
INTERVIEW_MAX_FOLLOWUPS = int(os.getenv("INTERVIEW_MAX_FOLLOWUPS", "3"))
INTERVIEW_QUESTIONS_PER_SKILL = int(os.getenv("INTERVIEW_QUESTIONS_PER_SKILL", "3"))
INTERVIEW_DEFAULT_LLM_MODEL = os.getenv("INTERVIEW_DEFAULT_LLM_MODEL", "qwen3:1.7b")
INTERVIEW_ENABLED = os.getenv("INTERVIEW_ENABLED", "true").lower() == "true"
INTERVIEW_ENABLE_CHALLENGES = os.getenv("INTERVIEW_ENABLE_CHALLENGES", "true").lower() == "true"
INTERVIEW_ENABLE_ANTI_CHEAT = os.getenv("INTERVIEW_ENABLE_ANTI_CHEAT", "true").lower() == "true"
INTERVIEW_ENABLE_REDIS = os.getenv("INTERVIEW_ENABLE_REDIS", "false").lower() == "true"

# --- Phase 7.1: Action Connector Hardening ---
ENABLE_REAL_CONNECTORS = os.getenv("ENABLE_REAL_CONNECTORS", "false").lower() == "true"
ENABLE_WEBHOOK_CONNECTOR = os.getenv("ENABLE_WEBHOOK_CONNECTOR", "false").lower() == "true"
ENABLE_EMAIL_CONNECTOR = os.getenv("ENABLE_EMAIL_CONNECTOR", "false").lower() == "true"
ACTION_CONNECTOR_TIMEOUT_SECONDS = int(os.getenv("ACTION_CONNECTOR_TIMEOUT_SECONDS", "10"))
ACTION_CONNECTOR_MAX_RETRIES = int(os.getenv("ACTION_CONNECTOR_MAX_RETRIES", "2"))
ACTION_CONNECTOR_RATE_LIMIT_PER_MINUTE = int(os.getenv("ACTION_CONNECTOR_RATE_LIMIT_PER_MINUTE", "30"))
ACTION_WEBHOOK_ALLOWED_HOSTS = os.getenv("ACTION_WEBHOOK_ALLOWED_HOSTS", "").split(",") if os.getenv("ACTION_WEBHOOK_ALLOWED_HOSTS") else []

# Create necessary directories
def init_directories():
    """Create necessary directories if they don't exist"""
    directories = [
        BASE_DIR / "data",
        UPLOAD_FOLDER,
        VECTOR_STORE_PATH,
    ]
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)

