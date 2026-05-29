"""
Public API Routes - External API for users
"""
from flask import Blueprint, request, jsonify, g
from functools import wraps
from models import database
from services.agent.pipelines.chat_router import chat_router as chat_service
from services.agent.ollama_service import ollama_service
from core.logger import get_logger

logger = get_logger(__name__)

api_bp = Blueprint('api', __name__, url_prefix='/api/v1')


from collections import defaultdict
import time as _time

_rate_limit_store: dict = defaultdict(list)
_RATE_WINDOW = 60  # seconds


def require_api_key(f):
    """Decorator to require valid API key and enforce rate limit"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        
        if not api_key:
            return jsonify({
                'error': 'API key required',
                'message': 'Please provide your API key in the X-API-Key header or as api_key parameter'
            }), 401
        
        key_info = database.verify_api_key(api_key)
        
        if not key_info:
            return jsonify({
                'error': 'Invalid API key',
                'message': 'The provided API key is invalid or has been revoked'
            }), 401
        
        # Enforce rate limit
        key_id = key_info['id']
        rate_limit = key_info.get('rate_limit', 60)
        now = _time.time()
        window_start = now - _RATE_WINDOW

        _rate_limit_store[key_id] = [
            t for t in _rate_limit_store[key_id] if t > window_start
        ]

        if len(_rate_limit_store[key_id]) >= rate_limit:
            oldest = _rate_limit_store[key_id][0]
            retry_after = int(_RATE_WINDOW - (now - oldest)) + 1
            return jsonify({
                'error': 'Rate limit exceeded',
                'message': f'Limit: {rate_limit} req/min. Retry after {retry_after}s.',
                'retry_after': retry_after,
            }), 429

        _rate_limit_store[key_id].append(now)
        
        # Store key info in request context
        g.api_key_info = key_info
        
        return f(*args, **kwargs)
    return decorated_function


@api_bp.route('/health')
def health():
    """Health check endpoint (no auth required)"""
    ollama_status = ollama_service.check_connection()
    return jsonify({
        'status': 'healthy',
        'ollama': ollama_status
    })


@api_bp.route('/chat', methods=['POST'])
@require_api_key
def chat():
    """
    Send a message and get a response with conversation memory.

    Request Body:
    {
        "question": "Your question here",
        "use_rag": true,         // optional, default: true
        "session_id": "uuid"     // optional – enables conversation memory
    }

    Response:
    {
        "answer": "The AI response",
        "session_id": "uuid",
        "source_type": "documents" or "ai_model" or "nlp_general",
        "from_documents": true/false,
        "rag_enabled": true/false,
        "sources": [...] (if from documents),
        "nlp_info": {...} (if rag disabled)
    }
    """
    import uuid as _uuid
    from services.agent.schemas import BotRuntimeContext

    data = request.get_json()

    if not data or not data.get('question'):
        return jsonify({
            'error': 'Missing question',
            'message': 'Please provide a "question" field in the request body'
        }), 400

    question = data['question'].strip()
    if not question:
        return jsonify({'error': 'Empty question'}), 400

    use_rag = data.get('use_rag', True)  # Default to True for backward compatibility
    session_id = data.get('session_id') or f"api-{g.api_key_info['id']}"

    # Build runtime context from API key's company
    company_id = g.api_key_info.get('company_id')
    company = None
    if company_id:
        company = database.get_company_by_id(company_id)

    runtime = BotRuntimeContext(
        tenant_id=f"company_{company_id}" if company_id else "default_tenant",
        site_id="default_site",
        bot_id="default_bot",
        api_key_id=str(g.api_key_info['id']),
        session_id=session_id,
        user_id="",
        user_role="visitor",
        enabled_modules=["chat", "rag"],
        language=company.get('language', 'ar') if company else 'ar',
        allowed_actions=["read", "ask"],
        company_name=company['name'] if company else "",
    )

    try:
        result = chat_service.process_question(
            question=question,
            api_key_id=g.api_key_info['id'],
            use_rag=use_rag,
            session_id=session_id,
            runtime=runtime,
        )

        response_data = {
            'answer': result['answer'],
            'session_id': session_id,
            'source_type': result.get('source_type', 'unknown'),
            'from_documents': result.get('from_documents', False),
            'rag_enabled': result.get('rag_enabled', True),
            'sources': result.get('sources', []),
            'model_used': result.get('model_used', ''),
            'note': result.get('note', ''),
        }

        # Include NLP info if available
        if 'nlp_info' in result:
            response_data['nlp_info'] = result['nlp_info']

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        return jsonify({
            'error': 'Processing error',
            'message': str(e)
        }), 500


@api_bp.route('/documents', methods=['GET'])
@require_api_key
def list_documents():
    """
    List all available documents
    
    Response:
    {
        "documents": [
            {
                "id": "...",
                "filename": "...",
                "file_type": "...",
                "chunk_count": 10,
                "is_indexed": true
            }
        ]
    }
    """
    docs = database.get_all_documents()
    
    return jsonify({
        'documents': [{
            'id': doc['id'],
            'filename': doc['original_filename'],
            'file_type': doc['file_type'],
            'chunk_count': doc['chunk_count'],
            'is_indexed': bool(doc['is_indexed']),
            'created_at': doc['created_at']
        } for doc in docs]
    })


@api_bp.route('/stats', methods=['GET'])
@require_api_key
def get_stats():
    """
    Get chatbot statistics
    
    Response:
    {
        "total_documents": 5,
        "total_chunks": 100,
        "total_chats": 50
    }
    """
    stats = chat_service.get_stats()
    return jsonify(stats)


# ----- Ollama API (requires valid API key) -----

@api_bp.route('/ollama/status')
@require_api_key
def ollama_status():
    """Check Ollama connection status"""
    status = ollama_service.check_connection()
    return jsonify(status)


@api_bp.route('/ollama/models')
@require_api_key
def ollama_models():
    """Get available Ollama models"""
    models = ollama_service.get_available_models()
    return jsonify({'models': models})


@api_bp.route('/ollama/models/<model_name>')
@require_api_key
def ollama_model_info(model_name):
    """Get info about a specific model"""
    info = ollama_service.get_model_info(model_name)
    if info:
        return jsonify(info)
    return jsonify({'error': 'Model not found'}), 404
