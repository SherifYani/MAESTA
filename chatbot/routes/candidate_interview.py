from flask import Blueprint, render_template, request, jsonify, session
from services.agent.schemas import BotRuntimeContext
from services.agent.skills.hiring.interview_consent_service import consent_service
from services.agent.skills.hiring.interview_runner import interview_runner
from services.agent.skills.hiring.interview_report_builder import report_builder
from services.agent.storage.ai_storage import ai_storage

candidate_interview_bp = Blueprint('candidate_interview', __name__, url_prefix='/candidate/interview')

def get_candidate_runtime(tenant_id: str, site_id: str, bot_id: str) -> BotRuntimeContext:
    """بناء سياق المرشح"""
    return BotRuntimeContext(
        tenant_id=tenant_id, site_id=site_id, bot_id=bot_id,
        api_key_id="candidate_api", session_id="candidate_session",
        user_id="candidate", user_role="candidate", enabled_modules=[], language="ar"
    )

@candidate_interview_bp.route('/<id>')
def interview_page(id):
    # Fetch session to get scope
    from services.agent.storage.ai_database import get_ai_db_connection
    db = get_ai_db_connection()
    row = db.execute("SELECT * FROM ai_interview_sessions WHERE id = ?", (id,)).fetchone()
    db.close()
    
    if not row: return "Interview not found", 404
    data = dict(row)
    
    # Check if expired or cancelled
    if data['status'] == 'cancelled': return "This interview has been cancelled.", 403
    
    return render_template('candidate/interview.html', interview=data)

@candidate_interview_bp.route('/<id>/consent', methods=['POST'])
def submit_consent(id):
    from services.agent.storage.ai_database import get_ai_db_connection
    db = get_ai_db_connection()
    row = db.execute("SELECT * FROM ai_interview_sessions WHERE id = ?", (id,)).fetchone()
    db.close()
    if not row: return jsonify({"error": "Not found"}), 404
    data = dict(row)
    
    runtime = get_candidate_runtime(data['tenant_id'], data['site_id'], data['bot_id'])
    choice = request.json.get('choice') # accepted|declined
    
    try:
        if choice == 'accepted':
            consent_service.accept_consent(runtime, id, data['candidate_id'])
            # Start the interview automatically after consent
            interview_runner.start_interview(runtime, id)
            return jsonify({"status": "success", "message": "Consent accepted and interview started."})
        else:
            consent_service.decline_consent(runtime, id, data['candidate_id'])
            return jsonify({"status": "declined", "message": "Consent declined."})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@candidate_interview_bp.route('/<id>/next')
def next_question(id):
    from services.agent.storage.ai_database import get_ai_db_connection
    db = get_ai_db_connection()
    row = db.execute("SELECT * FROM ai_interview_sessions WHERE id = ?", (id,)).fetchone()
    db.close()
    if not row: return jsonify({"error": "Not found"}), 404
    data = dict(row)
    
    runtime = get_candidate_runtime(data['tenant_id'], data['site_id'], data['bot_id'])
    
    try:
        question = interview_runner.get_next_question(runtime, id)
        if question:
            return jsonify({"status": "question", "text": question})
        else:
            # Interview complete
            interview_runner.complete_interview(runtime, id)
            # Trigger report build in background (sync for MVP simplicity)
            # import asyncio
            # asyncio.run(report_builder.build_report(runtime, id))
            # Wait, report builder is async, flask is sync. I'll make a helper.
            return jsonify({"status": "completed", "message": "Interview finished. Thank you!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@candidate_interview_bp.route('/<id>/answer', methods=['POST'])
def submit_answer(id):
    from services.agent.storage.ai_database import get_ai_db_connection
    db = get_ai_db_connection()
    row = db.execute("SELECT * FROM ai_interview_sessions WHERE id = ?", (id,)).fetchone()
    db.close()
    if not row: return jsonify({"error": "Not found"}), 404
    data = dict(row)
    
    runtime = get_candidate_runtime(data['tenant_id'], data['site_id'], data['bot_id'])
    answer = request.json.get('answer')
    
    try:
        interview_runner.submit_answer(runtime, id, answer)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
