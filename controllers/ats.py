"""
ATS Routes - Applicant Tracking System endpoints
"""
import os
import json
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, send_file
from werkzeug.utils import secure_filename
from controllers.auth import admin_required
from models import database
from services.cvs.ats_pipeline import ats_pipeline, ats_service
import config

ats_bp = Blueprint('ats', __name__, url_prefix='/ats')

ALLOWED_CV_EXTENSIONS = {'pdf'}


def allowed_cv_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_CV_EXTENSIONS


# ------------------------------------------------------------------ #
#  View CV PDF
# ------------------------------------------------------------------ #

@ats_bp.route('/view-cv/<doc_id>')
@admin_required
def view_cv(doc_id):
    """Serve a CV PDF file for viewing in the browser"""
    cv = ats_service.get_cv_by_id(doc_id)
    if not cv or not os.path.exists(cv['filepath']):
        flash('CV file not found.', 'danger')
        return redirect(url_for('ats.ats_main'))
    
    return send_file(
        cv['filepath'],
        mimetype='application/pdf',
        as_attachment=False,
        download_name=cv['filename']
    )


# ------------------------------------------------------------------ #
#  Main ATS page
# ------------------------------------------------------------------ #

@ats_bp.route('/')
@admin_required
def ats_main():
    """ATS main page: upload CVs + enter job description"""
    stats = ats_service.get_stats()
    jobs = database.get_all_ats_jobs()
    return render_template('ats_main.html', stats=stats, jobs=jobs)


# ------------------------------------------------------------------ #
#  Upload CVs
# ------------------------------------------------------------------ #

@ats_bp.route('/upload-cvs', methods=['POST'])
@admin_required
def upload_cvs():
    """Upload one or more CV PDF files and index them"""
    files = request.files.getlist('cv_files')

    if not files or all(f.filename == '' for f in files):
        flash('Please select at least one PDF file.', 'danger')
        return redirect(url_for('ats.ats_main'))

    # Save files to a temp location then index
    saved_paths = []
    cv_upload_dir = config.UPLOAD_FOLDER / 'cvs'
    cv_upload_dir.mkdir(parents=True, exist_ok=True)

    for file in files:
        filename = file.filename or ""
        if file and allowed_cv_file(filename):
            filename_secure = secure_filename(filename)
            dest = cv_upload_dir / filename_secure
            file.save(str(dest))
            saved_paths.append(str(dest))

    if not saved_paths:
        flash('No valid PDF files found. Only PDF files are accepted.', 'danger')
        return redirect(url_for('ats.ats_main'))

    result = ats_service.index_cv_files(saved_paths)

    msg = f"✅ Indexed {result['success']} CV(s). Total in database: {result['total']}."
    if result['failed']:
        msg += f" ⚠️ Failed to read: {', '.join(result['failed'])}"
        flash(msg, 'warning')
    else:
        flash(msg, 'success')

    return redirect(url_for('ats.ats_main'))


# ------------------------------------------------------------------ #
#  Reset CV index
# ------------------------------------------------------------------ #

@ats_bp.route('/reset-index', methods=['POST'])
@admin_required
def reset_index():
    """Clear all indexed CVs from the ATS vector store"""
    ats_service.reset_index()
    flash('✅ CV index has been reset.', 'success')
    return redirect(url_for('ats.ats_main'))


# ------------------------------------------------------------------ #
#  Analyze (search + LLM rank)
# ------------------------------------------------------------------ #

@ats_bp.route('/analyze', methods=['POST'])
@admin_required
def analyze():
    """
    1. Embed the JD
    2. Pull top 10 by similarity
    3. Send to LLM for final ranking
    4. Save results & redirect to results page
    """
    title = request.form.get('job_title', '').strip()
    jd_text = request.form.get('job_description', '').strip()
    top_n = int(request.form.get('top_n', 3))

    if not jd_text:
        flash('Please enter a Job Description.', 'danger')
        return redirect(url_for('ats.ats_main'))

    if not title:
        title = 'Untitled Job'

    stats = ats_service.get_stats()
    if stats['total_cvs'] == 0:
        flash('No CVs indexed yet. Please upload CV files first.', 'warning')
        return redirect(url_for('ats.ats_main'))

    # Step 1: Vector search – top 10 (Fast mode enabled)
    top_k = min(10, stats['total_cvs'])
    candidates = ats_service.search_top_candidates(jd_text, top_k=top_k)

    if not candidates:
        flash('No candidates found. The CV index may be empty.', 'warning')
        return redirect(url_for('ats.ats_main'))

    # Step 2: LLM re-ranking – best top_n
    ranking = ats_service.rank_with_llm(jd_text, candidates, top_n=top_n)

    # Step 3: Save to DB
    job_id = database.create_ats_job(title, jd_text, top_n)
    database.update_ats_job_results(
        job_id,
        results_json=json.dumps(ranking, ensure_ascii=False),
        cv_count=stats['total_cvs']
    )

    return redirect(url_for('ats.ats_results', job_id=job_id))


# ------------------------------------------------------------------ #
#  Results page
# ------------------------------------------------------------------ #

@ats_bp.route('/results/<job_id>')
@admin_required
def ats_results(job_id):
    """Display final ATS ranking results"""
    job = database.get_ats_job_by_id(job_id)
    if not job:
        flash('Job analysis not found.', 'danger')
        return redirect(url_for('ats.ats_main'))

    ranking = {}
    if job.get('results_json'):
        try:
            ranking = json.loads(job['results_json'])
        except Exception:
            ranking = {}

    return render_template('ats_results.html', job=job, ranking=ranking)


# ------------------------------------------------------------------ #
#  Delete job record
# ------------------------------------------------------------------ #

@ats_bp.route('/jobs/<job_id>/delete', methods=['POST'])
@admin_required
def delete_job(job_id):
    database.delete_ats_job(job_id)
    flash('Job deleted.', 'success')
    return redirect(url_for('ats.ats_main'))
