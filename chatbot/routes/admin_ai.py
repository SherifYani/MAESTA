from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from typing import Dict, Any, List, Optional
from functools import wraps
from services.agent.schemas import BotRuntimeContext
from services.agent.admin.admin_guard import AdminGuard
from services.agent.admin.approval_console_service import ApprovalConsoleService
from services.agent.storage.repositories import (
    AICandidateProfileRepository, AIJobDraftRepository, 
    AIApplicationDraftRepository, AIRankingRunRepository, 
    AIAuditRepository, AIApprovalDraftRepository,
    AIAuditRepository, AIApprovalDraftRepository,
    AIConnectorConfigRepository, AIDeliveryLogRepository,
    AIInterviewSessionRepository, AIInterviewMessageRepository,
    AIInterviewReportRepository
)
from services.agent.actions.action_executor import get_action_executor
from services.agent.actions.connector_registry import registry, ActionConnectorConfig
from services.agent.actions.connectors.mock_connector import MockConnector
import config
import re
import uuid

# Initialize Mock Connectors for Phase 7
mock = MockConnector()
registry.register_connector("mock", mock)

# Enable mock for all supported actions (demo mode)
# In production, this would be done via DB/Config
demo_tenant = "default_tenant" # Default from get_runtime_context
for action in ["submit_application", "publish_job", "send_interview_invite", "send_candidate_message", "send_company_message"]:
    registry.set_config(ActionConnectorConfig(
        tenant_id=demo_tenant, site_id="default_site", bot_id="default_bot",
        action_type=action, connector_type="mock", enabled=True
    ))

admin_ai_bp = Blueprint('admin_ai', __name__, url_prefix='/admin/ai')

# Repositories
candidate_repo = AICandidateProfileRepository()
job_repo = AIJobDraftRepository()
app_repo = AIApplicationDraftRepository()
ranking_repo = AIRankingRunRepository()
audit_repo = AIAuditRepository()
approval_repo = AIApprovalDraftRepository()
config_repo = AIConnectorConfigRepository()
delivery_repo = AIDeliveryLogRepository()
interview_repo = AIInterviewSessionRepository()
message_repo = AIInterviewMessageRepository()
report_repo = AIInterviewReportRepository()

# Services
guard = AdminGuard()
approval_service = ApprovalConsoleService()

def get_runtime_context() -> BotRuntimeContext:
    """Build BotRuntimeContext from session and request"""
    # Fallback to defaults if not in session
    return BotRuntimeContext(
        tenant_id=session.get('tenant_id', 'default_tenant'),
        site_id=session.get('site_id', 'default_site'),
        bot_id=session.get('bot_id', 'default_bot'),
        api_key_id="internal",
        session_id=session.get('session_id', 'admin_session'),
        user_id=session.get('user_id', 'unknown'),
        user_role=session.get('user_role', 'viewer'), # Default to viewer for safety
        enabled_modules=[],
        language="ar",
        allowed_actions=[]
    )

def rbac_required(action: str, resource: str):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            runtime = get_runtime_context()
            # If we have an ID in kwargs, try to fetch the resource for isolation check
            resource_data = None
            # (Fetching logic would go here if needed for specific ID checks)
            
            if not guard.check_permission(runtime, action, resource, resource_data):
                flash("Access Denied - Permission Required", "danger")
                return redirect(url_for('admin.dashboard'))
            return f(runtime, *args, **kwargs)
        return decorated_function
    return decorator

# --- Data Masking Helpers ---

def mask_email(email: str) -> str:
    if not email or "@" not in email: return "***"
    parts = email.split("@")
    return parts[0][0] + "***@" + parts[1]

def mask_phone(phone: str) -> str:
    if not phone: return "***"
    return phone[:4] + "****" + phone[-2:]

def mask_candidate(candidate: Dict[str, Any], reveal: bool = False) -> Dict[str, Any]:
    if reveal: return candidate
    # Deep copy if needed, but here we just modify values
    p = candidate.get('profile', {})
    if 'email' in p: p['email'] = mask_email(p['email'])
    if 'phone' in p: p['phone'] = mask_phone(p['phone'])
    if 'cv_text' in p: p['cv_text'] = p['cv_text'][:100] + "..."
    return candidate

# --- Routes ---

@admin_ai_bp.route('/overview')
@rbac_required('list', 'overview')
def overview(runtime):
    guard.log_action(runtime, "view", "overview")
    return render_template('admin/ai/overview.html')

@admin_ai_bp.route('/candidates')
@rbac_required('list', 'candidates')
def candidates(runtime):
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    profiles, total = candidate_repo.list_candidate_profiles(runtime.tenant_id, runtime.site_id, runtime.bot_id, page, page_size)
    
    # Mask data
    masked_profiles = [mask_candidate(p.dict()) for p in profiles]
    
    guard.log_action(runtime, "list", "candidates", {"page": page, "count": len(profiles)})
    return render_template('admin/ai/candidate_profiles.html', profiles=masked_profiles, total=total, page=page, page_size=page_size)

@admin_ai_bp.route('/candidates/<id>')
@rbac_required('view', 'candidate_detail')
def candidate_detail(runtime, id):
    profile = candidate_repo.get_candidate_profile_by_id(id)
    if not profile: return "Not Found", 404
    
    # Check isolation again just in case
    if not guard.check_permission(runtime, "view", "candidate_detail", profile):
        return "Access Denied", 403
        
    reveal = request.args.get('reveal') == 'true'
    if reveal:
        if not guard.check_permission(runtime, "reveal_sensitive", "candidate_detail"):
            flash("Permission denied to reveal sensitive data", "danger")
            reveal = False
        else:
            guard.log_action(runtime, "reveal_sensitive", "candidate", {"id": id})

    masked_profile = mask_candidate(profile.dict(), reveal=reveal)
    guard.log_action(runtime, "view", "candidate_detail", {"id": id, "revealed": reveal})
    return render_template('admin/ai/candidate_profile_detail.html', profile=masked_profile, revealed=reveal)

@admin_ai_bp.route('/jobs')
@rbac_required('list', 'jobs')
def jobs(runtime):
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    drafts, total = job_repo.list_job_drafts(runtime.tenant_id, runtime.site_id, runtime.bot_id, page, page_size)
    guard.log_action(runtime, "list", "jobs", {"page": page})
    return render_template('admin/ai/job_drafts.html', drafts=[d.dict() for d in drafts], total=total, page=page)

@admin_ai_bp.route('/jobs/<id>')
@rbac_required('view', 'job_detail')
def job_detail(runtime, id):
    draft = job_repo.get_job_draft_by_id(id)
    if not draft: return "Not Found", 404
    if not guard.check_permission(runtime, "view", "job_detail", draft): return "Access Denied", 403
    guard.log_action(runtime, "view", "job_detail", {"id": id})
    return render_template('admin/ai/job_draft_detail.html', draft=draft.dict())

@admin_ai_bp.route('/applications')
@rbac_required('list', 'applications')
def applications(runtime):
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    drafts, total = app_repo.list_application_drafts(runtime.tenant_id, runtime.site_id, runtime.bot_id, page, page_size)
    guard.log_action(runtime, "list", "applications", {"page": page})
    return render_template('admin/ai/application_drafts.html', drafts=[d.dict() for d in drafts], total=total, page=page)

@admin_ai_bp.route('/applications/<id>')
@rbac_required('view', 'application_detail')
def application_detail(runtime, id):
    draft = app_repo.get_application_draft_by_id(id)
    if not draft: return "Not Found", 404
    if not guard.check_permission(runtime, "view", "application_detail", draft): return "Access Denied", 403
    guard.log_action(runtime, "view", "application_detail", {"id": id})
    return render_template('admin/ai/application_draft_detail.html', draft=draft.dict())

@admin_ai_bp.route('/rankings')
@rbac_required('list', 'rankings')
def rankings(runtime):
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    runs, total = ranking_repo.list_ranking_runs(runtime.tenant_id, runtime.site_id, runtime.bot_id, page, page_size)
    guard.log_action(runtime, "list", "rankings", {"page": page})
    return render_template('admin/ai/ranking_runs.html', runs=[r.dict() for r in runs], total=total, page=page)

@admin_ai_bp.route('/rankings/<id>')
@rbac_required('view', 'ranking_detail')
def ranking_detail(runtime, id):
    run = ranking_repo.get_ranking_run_by_id(id)
    if not run: return "Not Found", 404
    if not guard.check_permission(runtime, "view", "ranking_detail", run): return "Access Denied", 403
    guard.log_action(runtime, "view", "ranking_detail", {"id": id})
    return render_template('admin/ai/ranking_run_detail.html', run=run.dict())

@admin_ai_bp.route('/approvals')
@rbac_required('list', 'approvals')
def approvals(runtime):
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    drafts, total = approval_repo.list_approval_drafts(runtime.tenant_id, runtime.site_id, runtime.bot_id, page, page_size)
    guard.log_action(runtime, "list", "approvals", {"page": page})
    return render_template('admin/ai/approval_console.html', drafts=[d.dict() for d in drafts], total=total, page=page)

@admin_ai_bp.route('/approvals/<id>')
@rbac_required('view', 'approval_detail')
def approval_detail(runtime, id):
    draft = approval_repo.get_approval_draft_by_id(id)
    if not draft: return "Not Found", 404
    if not guard.check_permission(runtime, "view", "approval_detail", draft): return "Access Denied", 403
    
    # Check if a connector is available and enabled
    connector = registry.get_connector_for_action(draft.action_type, draft.tenant_id, draft.site_id, draft.bot_id)
    connector_enabled = (connector is not None)
    
    # Check retry eligibility
    max_retries = getattr(config, 'ACTION_CONNECTOR_MAX_RETRIES', 2)
    can_retry = (
        draft.status == "failed" and 
        draft.draft_payload.get("retry_allowed", False) and 
        draft.retry_count < max_retries
    )
    
    # Phase 7.2: Load detailed connector config and delivery history
    connector_config = config_repo.get_config(draft.action_type, draft.tenant_id, draft.site_id, draft.bot_id)
    delivery_logs = delivery_repo.list_logs_for_approval(id)

    guard.log_action(runtime, "view", "approval_detail", {"id": id})
    return render_template(
        'admin/ai/approval_detail.html', 
        draft=draft.dict(), 
        connector_enabled=connector_enabled,
        can_retry=can_retry,
        connector_config=connector_config.dict() if connector_config else None,
        delivery_logs=[log.dict() for log in delivery_logs]
    )

@admin_ai_bp.route('/approvals/<id>/approve', methods=['POST'])
@rbac_required('approve', 'draft')
def approve(runtime, id):
    try:
        approval_service.approve_draft(runtime, id)
        flash("Approved successfully (Status Updated)", "success")
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
    return redirect(url_for('admin_ai.approvals'))

@admin_ai_bp.route('/approvals/<id>/reject', methods=['POST'])
@rbac_required('reject', 'draft')
def reject(runtime, id):
    reason = request.form.get('reason', '')
    try:
        approval_service.reject_draft(runtime, id, reason)
        flash("Rejected successfully", "info")
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
    return redirect(url_for('admin_ai.approvals'))

@admin_ai_bp.route('/approvals/<id>/execute', methods=['POST'])
@rbac_required('execute', 'draft')
def execute(runtime, id):
    executor = get_action_executor()
    idem_key = request.form.get('idempotency_key', str(uuid.uuid4()))
    
    try:
        result = executor.execute_approved_action(runtime, id, idem_key)
        if result.status == "executed":
            flash(f"Action executed successfully! Reference: {result.external_reference}", "success")
        elif result.status == "skipped":
            flash(f"Action skipped: {result.message}", "info")
        else:
            flash(f"Execution failed: {result.error}", "danger")
    except Exception as e:
        flash(f"System error: {str(e)}", "danger")
        
    return redirect(url_for('admin_ai.approval_detail', id=id))

@admin_ai_bp.route('/audit-logs')
@rbac_required('list', 'audit_logs')
def audit_logs(runtime):
    page = int(request.args.get('page', 1))
    page_size = min(int(request.args.get('page_size', 20)), 100)
    events, total = audit_repo.list_audit_events(runtime.tenant_id, runtime.site_id, runtime.bot_id, page, page_size)
    return render_template('admin/ai/audit_logs.html', events=[e.dict() for e in events], total=total, page=page)

# --- Connector Onboarding Routes (Phase 7.3) ---

from services.agent.actions.connector_onboarding import ConnectorOnboardingService
onboarding_service = ConnectorOnboardingService()

@admin_ai_bp.route('/connectors')
@rbac_required('list', 'connectors')
def connectors(runtime):
    configs = config_repo.list_configs(runtime.tenant_id, runtime.site_id, runtime.bot_id)
    return render_template('admin/ai/connectors_list.html', configs=[c.dict() for c in configs])

@admin_ai_bp.route('/connectors', methods=['POST'])
@rbac_required('create', 'connector')
def create_connector(runtime):
    try:
        payload = request.form.to_dict()
        onboarding_service.create_connector_config(runtime, payload)
        flash("Connector draft created successfully.", "success")
    except Exception as e:
        flash(f"Error creating connector: {str(e)}", "danger")
    return redirect(url_for('admin_ai.connectors'))

@admin_ai_bp.route('/connectors/<id>')
@rbac_required('view', 'connector_detail')
def connector_detail(runtime, id):
    try:
        config = onboarding_service._get_and_validate_scope(runtime, id)
        health = onboarding_service.get_connector_health(runtime, id)
        return render_template('admin/ai/connector_detail_onboarding.html', config=config.dict(), health=health)
    except Exception as e:
        flash(str(e), "danger")
        return redirect(url_for('admin_ai.connectors'))

@admin_ai_bp.route('/connectors/<id>/test', methods=['POST'])
@rbac_required('test', 'connector')
def test_connector(runtime, id):
    try:
        # 1. Pre-check
        precheck = onboarding_service.validate_connector_precheck(runtime, id)
        if precheck["status"] == "failed":
            return jsonify(precheck), 400
        
        # 2. Run Sandbox Test
        result = onboarding_service.run_connector_sandbox_test(runtime, id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_ai_bp.route('/connectors/<id>/enable', methods=['POST'])
@rbac_required('enable', 'connector')
def enable_connector(runtime, id):
    try:
        result = onboarding_service.enable_connector_for_tenant(runtime, id)
        if result["status"] == "success":
            flash(result["message"], "success")
        else:
            flash(result["error"], "danger")
    except Exception as e:
        flash(str(e), "danger")
    return redirect(url_for('admin_ai.connector_detail', id=id))

@admin_ai_bp.route('/connectors/<id>/disable', methods=['POST'])
@rbac_required('disable', 'connector')
def disable_connector(runtime, id):
    try:
        result = onboarding_service.disable_connector_for_tenant(runtime, id)
        flash(result["message"], "info")
    except Exception as e:
        flash(str(e), "danger")
    return redirect(url_for('admin_ai.connector_detail', id=id))

@admin_ai_bp.route('/connectors/<id>/health')
@rbac_required('view', 'connector_health')
def connector_health(runtime, id):
    try:
        health = onboarding_service.get_connector_health(runtime, id)
        return jsonify(health)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Interview Management Routes (Phase 8) ---

@admin_ai_bp.route('/interviews')
@rbac_required('list', 'interviews')
def interviews(runtime):
    # In a real app, we'd add pagination to AIInterviewSessionRepository
    # For now, we list candidate-specific or all (using a custom list method if added)
    # Let's assume we want to list all interviews for the current bot
    conn = AIInterviewSessionRepository() # Using repo directly for custom list
    # (Simplified listing for demo)
    # sessions = conn.list_all_for_bot(runtime.tenant_id, runtime.site_id, runtime.bot_id)
    # Since we didn't add list_all_for_bot, I'll use a generic fetch for now
    from services.agent.storage.ai_database import get_ai_db_connection
    db = get_ai_db_connection()
    rows = db.execute('''
        SELECT * FROM ai_interview_sessions 
        WHERE tenant_id = ? AND site_id = ? AND bot_id = ?
        ORDER BY created_at DESC
    ''', (runtime.tenant_id, runtime.site_id, runtime.bot_id)).fetchall()
    db.close()
    
    sessions_list = [dict(row) for row in rows]
    guard.log_action(runtime, "list", "interviews")
    return render_template('admin/ai/interviews_list.html', interviews=sessions_list)

@admin_ai_bp.route('/interviews/<id>')
@rbac_required('view', 'interview_detail')
def interview_detail(runtime, id):
    session = interview_repo.get_session_by_id(id, runtime.tenant_id, runtime.site_id, runtime.bot_id)
    if not session: return "Not Found", 404
    
    messages = message_repo.list_messages_by_interview(id, runtime.tenant_id, runtime.site_id, runtime.bot_id)
    
    reveal = request.args.get('reveal') == 'true'
    if reveal:
        if not guard.check_permission(runtime, "reveal_transcript", "interview"):
            flash("Permission denied to reveal interview transcript", "danger")
            reveal = False
        else:
            guard.log_action(runtime, "reveal_transcript", "interview", {"id": id})

    guard.log_action(runtime, "view", "interview_detail", {"id": id, "revealed": reveal})
    return render_template('admin/ai/interview_detail.html', 
                           interview=session.dict(), 
                           messages=[m.dict() for m in messages],
                           revealed=reveal)

@admin_ai_bp.route('/interviews/<id>/report')
@rbac_required('view', 'interview_report')
def interview_report(runtime, id):
    report = report_repo.get_report_by_interview(id, runtime.tenant_id, runtime.site_id, runtime.bot_id)
    if not report: return "Report not generated yet", 404
    
    guard.log_action(runtime, "view", "interview_report", {"id": id})
    return render_template('admin/ai/interview_report.html', report=report.dict())

@admin_ai_bp.route('/interviews/<id>/cancel', methods=['POST'])
@rbac_required('cancel', 'interview')
def cancel_interview(runtime, id):
    session = interview_repo.get_session_by_id(id, runtime.tenant_id, runtime.site_id, runtime.bot_id)
    if not session: return "Not Found", 404
    
    session.status = "cancelled"
    interview_repo.save_session(session)
    
    guard.log_action(runtime, "cancel", "interview", {"id": id})
    flash("Interview cancelled successfully", "info")
    return redirect(url_for('admin_ai.interviews'))
