from flask import Flask
from controllers.auth import auth_bp
from controllers.admin import admin_bp
from controllers.api import api_bp
from controllers.quiz import quiz_bp
from controllers.ats import ats_bp
from chatbot.routes.admin_ai import admin_ai_bp
from chatbot.routes.candidate_interview import candidate_interview_bp
from services.interview.routes.interview_routes import interview_bp, interview_api_bp

def register_controllers(app: Flask):
    """
    تسجيل جميع الـ Blueprints الخاصة بالتطبيق.
    هذه الدالة هي Controller Registry المركزي.
    """
    # ── Chatbot Blueprints ───────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(api_bp)
    
    # ── Quiz Blueprint ───────────────────────────────────────────────
    app.register_blueprint(quiz_bp)
    
    # ── ATS Blueprint ────────────────────────────────────────────────
    app.register_blueprint(ats_bp)
    # ── Admin AI Blueprint ───────────────────────────────────────────
    app.register_blueprint(admin_ai_bp)
    # ── Candidate Interview Blueprint ─────────────────────────────────
    app.register_blueprint(candidate_interview_bp)
    # ── AI Interview System ──────────────────────────────────────────
    app.register_blueprint(interview_bp)
    app.register_blueprint(interview_api_bp)
