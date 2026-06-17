"""
Interview System Routes — Admin Dashboard + Public API
"""
import json
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, session as flask_session, g
from controllers.auth import admin_required
from controllers.api import require_api_key
from models import database
from services.interview.interview_service import interview_service
from services.interview.schemas.dto import StartInterviewRequest, SubmitAnswerRequest
from core.logger import get_logger

logger = get_logger(__name__)

# --- Admin Blueprint ---
interview_bp = Blueprint('interview', __name__, url_prefix='/interview')

# --- API Blueprint ---
interview_api_bp = Blueprint('interview_api', __name__, url_prefix='/api/v1/interview')


# ============================= ADMIN ROUTES ============================= #

@interview_bp.route('/')
@admin_required
def interview_dashboard():
    company_id = flask_session.get('company_id')
    stats = database.get_interview_stats(company_id)
    sessions = interview_service.get_history(company_id)
    return render_template('interview_dashboard.html', stats=stats, sessions=sessions)


@interview_bp.route('/session/<session_id>')
@admin_required
def interview_session(session_id):
    session = database.get_interview_session(session_id)
    if not session:
        flash('Interview session not found.', 'danger')
        return redirect(url_for('interview.interview_dashboard'))

    questions = [dict(q) for q in database.get_interview_questions(session_id)]
    answers = [dict(a) for a in database.get_interview_answers(session_id)]
    assessments = [dict(a) for a in database.get_skill_assessments(session_id)]
    report = database.get_interview_report(session_id)
    challenges = [dict(c) for c in database.get_interview_challenges(session_id)]
    ca = database.get_consistency_analysis(session_id)

    # Parse report JSON for new fields
    report_data = None
    if session.get("report_json"):
        try:
            import json as _json
            report_data = _json.loads(session["report_json"])
        except Exception:
            pass

    return render_template(
        'interview_session.html',
        session=session, questions=questions, answers=answers,
        assessments=assessments, report=report,
        challenges=challenges, ca=ca,
        report_data=report_data,
    )


@interview_bp.route('/start', methods=['POST'])
@admin_required
def start_interview():
    candidate_id = request.form.get('candidate_id', '').strip()
    job_id = request.form.get('job_id', '').strip()

    if not candidate_id or not job_id:
        flash('Candidate ID and Job ID are required.', 'danger')
        return redirect(url_for('interview.interview_dashboard'))

    req = StartInterviewRequest(
        candidate_id=candidate_id,
        job_id=job_id,
        company_id=flask_session.get('company_id', ''),
    )
    result = interview_service.start_interview(req)

    if result.get('status') == 'error':
        flash(f"Failed to start interview: {result.get('message', 'Unknown error')}", 'danger')
    else:
        flash(f"✅ Interview started: {result['session_id']}", 'success')

    return redirect(url_for('interview.interview_session', session_id=result['session_id']))


@interview_bp.route('/session/<session_id>/delete', methods=['POST'])
@admin_required
def delete_session(session_id):
    database.delete_interview_session(session_id)
    flash('Interview session deleted.', 'success')
    return redirect(url_for('interview.interview_dashboard'))


@interview_bp.route('/session/<session_id>/answer', methods=['POST'])
@admin_required
def submit_answer_web(session_id):
    answer = request.form.get('answer', '').strip()
    question_id = request.form.get('question_id', '').strip()
    if not answer:
        flash('الإجابة مطلوبة.', 'danger')
        return redirect(url_for('interview.interview_session', session_id=session_id))

    from services.interview.schemas.dto import SubmitAnswerRequest
    req = SubmitAnswerRequest(session_id=session_id, answer=answer, question_id=question_id)
    result = interview_service.submit_answer(req)

    if result.get('status') == 'error':
        flash(f"خطأ: {result.get('message', 'Unknown error')}", 'danger')
    else:
        flash('✅ تم إرسال الإجابة بنجاح.', 'success')
    return redirect(url_for('interview.interview_session', session_id=session_id))


@interview_bp.route('/challenge/test')
@admin_required
def challenge_test():
    return render_template('interview_challenge_test.html')


@interview_bp.route('/challenge/generate', methods=['POST'])
@admin_required
def challenge_generate_route():
    skill = request.form.get('skill', 'python')
    difficulty_level = int(request.form.get('difficulty', '2'))
    from services.interview.challenges.challenge_generator import challenge_generator
    ch = challenge_generator.generate(skill=skill, difficulty_level=difficulty_level)
    return jsonify(ch.model_dump() if hasattr(ch, 'model_dump') else ch)


@interview_bp.route('/challenge/evaluate', methods=['POST'])
@admin_required
def challenge_evaluate_route():
    data = request.get_json(silent=True) or {}
    challenge_dict = data.get('challenge', {})
    code = data.get('code', '')
    from services.interview.challenges.challenge_models import CodingChallenge, ChallengeSubmission
    from services.interview.challenges.challenge_evaluator import challenge_evaluator
    challenge = CodingChallenge(**challenge_dict)
    submission = ChallengeSubmission(
        challenge_id=challenge.id,
        candidate_code=code,
    )
    result = challenge_evaluator.evaluate(challenge=challenge, submission=submission)
    return jsonify(result.model_dump() if hasattr(result, 'model_dump') else result)


@interview_bp.route('/analytics')
@admin_required
def interview_analytics():
    company_id = flask_session.get('company_id')
    stats = database.get_interview_stats(company_id)
    reports = database.get_all_interview_reports(company_id, limit=100)
    return render_template('interview_analytics.html', stats=stats, reports=reports)


# ============================= API ROUTES ============================= #

@interview_api_bp.route('/start', methods=['POST'])
@require_api_key
def api_start_interview():
    data = request.get_json(silent=True) or {}
    company_id = g.get('api_key_info', {}).get('company_id', '')

    req = StartInterviewRequest(
        candidate_id=data.get('candidate_id', ''),
        job_id=data.get('job_id', ''),
        tenant_id=data.get('tenant_id', 'default_tenant'),
        site_id=data.get('site_id', 'default_site'),
        bot_id=data.get('bot_id', 'default_bot'),
        company_id=data.get('company_id', company_id),
        company_name=data.get('company_name', ''),
    )

    if not req.candidate_id or not req.job_id:
        return jsonify({'error': 'candidate_id and job_id are required'}), 400

    result = interview_service.start_interview(req)
    status_code = 200 if result.get('status') != 'error' else 500
    return jsonify(result), status_code


@interview_api_bp.route('/answer', methods=['POST'])
@require_api_key
def api_submit_answer():
    data = request.get_json(silent=True) or {}

    req = SubmitAnswerRequest(
        session_id=data.get('session_id', ''),
        answer=data.get('answer', ''),
    )

    if not req.session_id or not req.answer:
        return jsonify({'error': 'session_id and answer are required'}), 400

    result = interview_service.submit_answer(req)
    status_code = 200 if result.get('status') != 'error' else 500
    return jsonify(result), status_code


@interview_api_bp.route('/status/<session_id>', methods=['GET'])
@require_api_key
def api_get_status(session_id):
    status = interview_service.get_status(session_id)
    return jsonify(status.model_dump())


@interview_api_bp.route('/report/<session_id>', methods=['GET'])
@require_api_key
def api_get_report(session_id):
    report = interview_service.get_report(session_id)
    if not report:
        return jsonify({'error': 'Report not found'}), 404
    return jsonify(report)


@interview_api_bp.route('/history', methods=['GET'])
@require_api_key
def api_get_history():
    company_id = g.get('api_key_info', {}).get('company_id')
    history = interview_service.get_history(company_id)
    return jsonify(history)
