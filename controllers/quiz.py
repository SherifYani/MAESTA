"""
Quiz API Routes - Professional Exam Generation Endpoints
=========================================================
  GET  /api/v1/quiz/list           → List all saved quizzes
  GET  /api/v1/quiz/<id>           → Get a single quiz by ID
  POST /api/v1/quiz/generate       → Standard quiz (legacy QuizService)
  POST /api/v1/quiz/generate/pro   → Professional quiz (TeacherQuizService, 5-stage pipeline)

All routes require a valid API key (X-API-Key header or ?api_key= query param).
"""
from dataclasses import asdict
from flask import Blueprint, request, jsonify
from functools import wraps

from models import database
from services.quiz.quizzes_pipeline import quizzes_pipeline
from services.quiz.teacher_quizzes_pipeline import teacher_quizzes_pipeline
from core.logger import get_logger

# Aliases used throughout this module
quiz_service = quizzes_pipeline
teacher_quiz_service = teacher_quizzes_pipeline

logger = get_logger(__name__)
quiz_bp = Blueprint('quiz', __name__, url_prefix='/api/v1/quiz')


# ──────────────────────────────────────────────
# Auth decorator
# ──────────────────────────────────────────────

def require_api_key(f):
    """Decorator: reject requests without a valid API key."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        if not api_key:
            return jsonify({'error': 'API key required'}), 401
        key_info = database.verify_api_key(api_key)
        if not key_info:
            return jsonify({'error': 'Invalid or inactive API key'}), 401
        return f(*args, **kwargs)
    return decorated_function


# ──────────────────────────────────────────────
# Legacy endpoint (standard QuizService)
# ──────────────────────────────────────────────

@quiz_bp.route('/generate', methods=['POST'])
@require_api_key
def generate_quiz():
    """
    Generate a standard quiz using the classic QuizService.

    Request Body (JSON):
    {
        "topic":         "Neural Networks",
        "doc_id":        "optional-document-uuid",
        "content":       "optional raw text (ignored if doc_id provided)",
        "difficulty":    "Easy | Medium | Hard",   (default: Medium)
        "num_questions": 5                          (default: 5)
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body provided'}), 400

    topic         = data.get('topic', 'General Quiz')
    difficulty    = data.get('difficulty', 'Medium')
    num_questions = int(data.get('num_questions', 5))
    content       = data.get('content', '')
    doc_id        = data.get('doc_id')

    # Retrieve text from DB chunks when doc_id is given
    if doc_id:
        chunks = database.get_document_chunks(doc_id)
        if chunks:
            content = "\n\n".join([c['content'] for c in chunks])
        else:
            return jsonify({'error': 'Document not found or has no indexed chunks'}), 404

    if not content:
        return jsonify({'error': 'No content provided. Supply "content" text or a valid "doc_id".'}), 400

    try:
        logger.info(f"[quiz/generate] topic={topic} | diff={difficulty} | n={num_questions}")
        result = quiz_service.generate_quiz(
            content=content,
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions
        )
        return jsonify(result)
    except Exception as e:
        logger.error(f"[quiz/generate] Failed: {e}", exc_info=True)
        return jsonify({'error': 'Quiz generation failed', 'message': str(e)}), 500


# ──────────────────────────────────────────────
# Professional endpoint (TeacherQuizService)
# ──────────────────────────────────────────────

@quiz_bp.route('/generate/pro', methods=['POST'])
@require_api_key
def generate_professional_quiz():
    """
    Generate a professional exam using the 5-stage TeacherQuizService.

    This endpoint runs a full professor-style pipeline:
      Stage 1 → Deep Material Analysis
      Stage 2 → Professional Exam Blueprint (Bloom's distribution)
      Stage 3 → Question Crafting (MCQ with intelligent distractors)
      Stage 4 → Teacher Self-Review & Refinement
      Stage 5 → Professional Final Output (Markdown + Answer Key + JSON)

    Request Body (JSON):
    {
        "topic":         "Artificial Intelligence",   (required)
        "doc_id":        "uuid-of-uploaded-doc",      (optional but recommended)
        "content":       "raw text fallback",          (optional, used if no doc_id)
        "difficulty":    "Easy | Medium | Hard",       (default: Medium)
        "num_questions": 10,                           (default: 5, max recommended: 20)
        "language":      "auto | ar | en"              (default: auto-detect)
    }

    Response (JSON):
    {
        "quiz_id":             "uuid",
        "title":               "topic name",
        "topic":               "...",
        "difficulty":          "Medium",
        "num_questions":       10,
        "language":            "ar",
        "questions":           [ { ...QuizQuestion... }, ... ],
        "markdown_exam":       "# Exam\n...",         ← Student-facing Markdown
        "answer_key_markdown": "# Answer Key\n...",   ← Teacher Answer Key
        "blueprint":           { ...ExamBlueprint... },
        "metadata":            { ...stats... }
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body provided'}), 400

    topic         = data.get('topic')
    if not topic:
        return jsonify({'error': '"topic" field is required'}), 400

    doc_id        = data.get('doc_id')
    content       = data.get('content', '')
    difficulty    = data.get('difficulty', 'Medium')
    num_questions = int(data.get('num_questions', 5))
    language      = data.get('language', 'auto')

    # Clamp num_questions to a reasonable range
    num_questions = max(3, min(num_questions, 30))

    # Validate difficulty
    if difficulty not in ('Easy', 'Medium', 'Hard'):
        difficulty = 'Medium'

    logger.info(
        f"[quiz/generate/pro] topic={topic} | doc_id={doc_id} | "
        f"diff={difficulty} | n={num_questions} | lang={language}"
    )

    try:
        result = teacher_quiz_service.generate_quiz(
            topic=topic,
            doc_id=doc_id,
            content=content if content else None,
            difficulty=difficulty,
            num_questions=num_questions,
            language=language,
        )

        # Serialize the dataclass to a plain dict for JSON response
        result_dict = asdict(result)

        return jsonify({
            'success': True,
            'quiz': result_dict
        })

    except ValueError as e:
        # Content-related errors (e.g. no material found)
        logger.warning(f"[quiz/generate/pro] Content error: {e}")
        return jsonify({'error': str(e)}), 400

    except Exception as e:
        logger.error(f"[quiz/generate/pro] Unexpected error: {e}", exc_info=True)
        return jsonify({
            'error': 'Professional quiz generation failed',
            'message': str(e)
        }), 500


# ──────────────────────────────────────────────
# List & Retrieve endpoints
# ──────────────────────────────────────────────

@quiz_bp.route('/list', methods=['GET'])
@require_api_key
def list_quizzes():
    """
    List all saved quizzes (both standard and professional).

    Query Params:
      ?type=professional   → filter to professional quizzes only
      ?type=standard       → filter to standard quizzes only
    """
    quiz_type = request.args.get('type')  # optional filter
    quizzes = database.get_all_quizzes()

    if quiz_type:
        quizzes = [q for q in quizzes if q.get('quiz_type') == quiz_type]

    return jsonify({
        'total': len(quizzes),
        'quizzes': quizzes
    })


@quiz_bp.route('/<quiz_id>', methods=['GET'])
@require_api_key
def get_quiz(quiz_id):
    """Retrieve a specific quiz by ID (full content_json included)."""
    quiz = database.get_quiz_by_id(quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    # Optionally parse content_json for a richer response
    import json
    try:
        quiz['content'] = json.loads(quiz.get('content_json', '{}'))
    except (json.JSONDecodeError, TypeError):
        quiz['content'] = {}

    return jsonify(quiz)
