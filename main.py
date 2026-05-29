"""
MAESTA Chatbot — نقطة البداية الرئيسية للتطبيق
================================================
يقوم هذا الملف بتجميع جميع وحدات التطبيق وتشغيل Flask.

الوحدات:
  agent/   → وكيل الذكاء الاصطناعي (LangGraph + LLM + RAG)
  chatbot/ → واجهة الشات بوت (Auth + Admin + API)
  quiz/    → نظام الاختبارات (توليد الأسئلة)
  cvs/     → نظام السير الذاتية ATS

التشغيل:
  python main.py
"""

import sys
import os
import builtins

# Force UTF-8 encoding on stdout/stderr to support emoji and special box characters in Windows console (e.g. cp1256)
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Monkeypatch builtins.open to handle UnicodeDecodeError in transformers library
original_open = builtins.open

def patched_open(*args, **kwargs):
    if len(args) > 0 and isinstance(args[0], str) and 'transformers' in args[0]:
        if kwargs.get('encoding') == 'utf-8':
            kwargs['errors'] = 'ignore'
    return original_open(*args, **kwargs)

builtins.open = patched_open


from flask import Flask, redirect, url_for
from flask_cors import CORS
import config

from models import database


def create_app() -> Flask:
    """Application Factory — يبني ويضبط التطبيق."""
    app = Flask(__name__)

    # ── Configuration ────────────────────────────────────────────────
    app.config['SECRET_KEY'] = config.SECRET_KEY
    app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH
    app.config['UPLOAD_FOLDER'] = str(config.UPLOAD_FOLDER)

    # ── Sentry Error Tracking ────────────────────────────────────────
    from core.sentry_init import init_sentry
    init_sentry(app)

    # ── CORS ─────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Database & Directories ───────────────────────────────────────
    database.init_db()
    config.init_directories()

    # ── RAG Knowledge Base ───────────────────────────────────────────
    from services.agent.rag.knowledge_base import knowledge_base
    knowledge_base.ensure_indexed()

    # ── Graph Visualization ──────────────────────────────────────────
    try:
        from services.agent.agents.rag_graph import save_graph_visualization
        save_graph_visualization("static/rag_graph.png")
    except Exception:
        pass

    # ── Register Controllers (MVC) ────────────────────────────────────
    from controllers.register import register_controllers
    register_controllers(app)

    # ── Root Redirect ────────────────────────────────────────────────
    @app.route('/')
    def index():
        return redirect(url_for('admin.dashboard'))

    # ── Error Handlers ───────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {'error': 'Internal server error'}, 500

    return app


# ── Create singleton app ─────────────────────────────────────────────
app = create_app()


if __name__ == '__main__':
    print("""
    ╔══════════════════════════════════════════════════════╗
    ║              MAESTA Chatbot — Started!               ║
    ╠══════════════════════════════════════════════════════╣
    ║  Dashboard : http://localhost:5000/admin             ║
    ║  API Health: http://localhost:5000/api/v1/health     ║
    ║  ATS System: http://localhost:5000/ats               ║
    ╠══════════════════════════════════════════════════════╣
    ║  Default Login:                                      ║
    ║    Username: admin                                   ║
    ║    Password: admin123                                ║
    ╚══════════════════════════════════════════════════════╝
    """)
    app.run(debug=True, host='0.0.0.0', port=5000)
