"""
Admin Routes - Dashboard and management pages
"""
import os
import json
import time
import base64
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from werkzeug.utils import secure_filename
from controllers.auth import admin_required
from models import database
from services.agent.rag.document_processor import document_processor
from services.agent.rag.knowledge_base import knowledge_base
from services.agent.rag.graph_extractor import graph_extractor
from services.agent.ollama_service import ollama_service
from services.agent.pipelines.chat_router import chat_router as chat_service
from services.agent.tools.web_crawler import web_crawler
from services.quiz.quizzes_pipeline import quizzes_pipeline
from services.quiz.teacher_quizzes_pipeline import teacher_quizzes_pipeline as teacher_quiz_service
import config
from core.logger import get_logger

logger = get_logger(__name__)

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/')
@admin_required
def dashboard():
    """Main admin dashboard"""
    stats = database.get_dashboard_stats()
    model_settings = database.get_model_settings()
    ollama_status = ollama_service.check_connection()
    
    return render_template('dashboard.html', 
                          stats=stats, 
                          model_settings=model_settings,
                          ollama_status=ollama_status)


@admin_bp.route('/documents')
@admin_required
def documents():
    """Document management page"""
    docs = database.get_all_documents()
    companies = database.get_all_companies()
    return render_template('documents.html', documents=docs, companies=companies)


@admin_bp.route('/documents/upload', methods=['POST'])
@admin_required
def upload_document():
    """Upload and process a document"""
    if 'file' not in request.files:
        flash('No file selected.', 'danger')
        return redirect(url_for('admin.documents'))
    
    file = request.files['file']
    
    if file.filename == '':
        flash('No file selected.', 'danger')
        return redirect(url_for('admin.documents'))
    
    # Check file extension
    filename = file.filename or ""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    if ext not in config.ALLOWED_EXTENSIONS:
        flash(f'File type not allowed. Allowed: {", ".join(config.ALLOWED_EXTENSIONS)}', 'danger')
        return redirect(url_for('admin.documents'))
    
    # Get company_id from form
    company_id = request.form.get('company_id', '').strip() or None
    tenant_id = f"company_{company_id}" if company_id else "default_tenant"
    site_id = "default_site"
    bot_id = "default_bot"
    
    try:
        # Save file
        config.init_directories()
        filename_secure = secure_filename(filename)
        # Add timestamp to prevent duplicates
        unique_filename = f"{int(time.time())}_{filename_secure}"
        file_path = config.UPLOAD_FOLDER / unique_filename
        file.save(str(file_path))
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Add to database with company_id
        doc_id = database.add_document(
            filename=unique_filename,
            original_filename=filename,
            file_type=ext,
            file_size=file_size,
            company_id=company_id,
        )
        
        # Process document
        result = document_processor.process_file(str(file_path))
        
        # Add chunks to database
        database.add_document_chunks(doc_id, result['chunks'])
        
        # Add to knowledge base (vector index) with tenant context
        runtime = {"tenant_id": tenant_id, "site_id": site_id, "bot_id": bot_id}
        knowledge_base.add_documents(doc_id, result['chunks'], runtime=runtime)
        
        # Update document as indexed
        database.update_document_indexed(doc_id, result['chunk_count'])
        
        # Save automatically extracted Knowledge Graph
        if 'graph_data' in result:
            database.update_document_graph(doc_id, json.dumps(result['graph_data']))
            logger.info(f"Knowledge Graph automatically saved for {filename}")

        flash(f'Document uploaded successfully! {result["chunk_count"]} chunks indexed.', 'success')
        
    except Exception as e:
        flash(f'Error processing document: {str(e)}', 'danger')
    
    return redirect(url_for('admin.documents'))


@admin_bp.route('/documents/<doc_id>/delete', methods=['POST'])
@admin_required
def delete_document(doc_id):
    """Delete a document"""
    try:
        doc = database.get_document_by_id(doc_id)
        if doc:
            # Delete from file system
            file_path = config.UPLOAD_FOLDER / doc['filename']
            if file_path.exists():
                os.remove(file_path)
            
            # Delete from knowledge base
            knowledge_base.delete_document(doc_id)
            
            # Delete from database
            database.delete_document(doc_id)
            
            flash('Document deleted successfully.', 'success')
        else:
            flash('Document not found.', 'danger')
    except Exception as e:
        flash(f'Error deleting document: {str(e)}', 'danger')
    
    return redirect(url_for('admin.documents'))


@admin_bp.route('/documents/<doc_id>/graph')
@admin_required
def view_document_graph(doc_id):
    """View the extracted Knowledge Graph for a specific document"""
    doc = database.get_document_by_id(doc_id)
    if not doc:
        flash('Document not found.', 'danger')
        return redirect(url_for('admin.documents'))
    
    direction = request.args.get('direction', 'LR')
    try:
        graph_data = json.loads(doc['graph_json']) if doc.get('graph_json') else {"nodes": [], "edges": []}
    except Exception:
        graph_data = {"nodes": [], "edges": []}
        
    mermaid_code = graph_extractor.to_mermaid(graph_data, direction=direction)
    
    return render_template('document_graph.html', doc=doc, mermaid_code=mermaid_code, current_direction=direction)


@admin_bp.route('/documents/<doc_id>/generate_graph', methods=['POST'])
@admin_required
def generate_document_graph(doc_id):
    """Manually trigger Knowledge Graph extraction for an existing document"""
    try:
        doc = database.get_document_by_id(doc_id)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404
            
        # Get chunks to reconstruct text (or sample)
        chunks = database.get_document_chunks(doc_id)
        # Use first 10 chunks to avoid extreme timeouts on CPU
        text = "\n\n".join([c['content'] for c in chunks[:10]]) 
        
        graph_data = graph_extractor.extract_graph(text)
        database.update_document_graph(doc_id, json.dumps(graph_data))
        
        return jsonify({'success': True, 'message': 'Graph generated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/api-keys')
@admin_required
def api_keys():
    """API key management page"""
    keys = database.get_all_api_keys()
    companies = database.get_all_companies()
    return render_template('api_keys.html', api_keys=keys, companies=companies)


@admin_bp.route('/api-keys/create', methods=['POST'])
@admin_required
def create_api_key():
    """Create a new API key"""
    name = request.form.get('name', '').strip()
    rate_limit = int(request.form.get('rate_limit', 60))
    company_id = request.form.get('company_id', '').strip() or None
    
    if not name:
        flash('Please provide a name for the API key.', 'danger')
        return redirect(url_for('admin.api_keys'))
    
    try:
        result = database.create_api_key(name, rate_limit, company_id=company_id)
        # Store the key temporarily to show to user
        flash(f'API Key created! Key: {result["key"]} (Save this, it won\'t be shown again!)', 'success')
    except Exception as e:
        flash(f'Error creating API key: {str(e)}', 'danger')
    
    return redirect(url_for('admin.api_keys'))


@admin_bp.route('/api-keys/<key_id>/toggle', methods=['POST'])
@admin_required
def toggle_api_key(key_id):
    """Enable or disable an API key"""
    is_active = request.form.get('is_active') == 'true'
    database.toggle_api_key(key_id, is_active)
    flash('API key updated.', 'success')
    return redirect(url_for('admin.api_keys'))


@admin_bp.route('/api-keys/<key_id>/delete', methods=['POST'])
@admin_required
def delete_api_key(key_id):
    """Delete an API key"""
    database.delete_api_key(key_id)
    flash('API key deleted.', 'success')
    return redirect(url_for('admin.api_keys'))


@admin_bp.route('/models')
@admin_required
def models():
    """Model settings page"""
    ollama_status = ollama_service.check_connection()
    available_models = ollama_service.get_available_models() if ollama_status['connected'] else []
    model_settings = database.get_model_settings()
    
    return render_template('models.html',
                          ollama_status=ollama_status,
                          available_models=available_models,
                          model_settings=model_settings)


@admin_bp.route('/models/settings', methods=['POST'])
@admin_required
def update_model_settings():
    """Update model settings"""
    try:
        active_model = request.form.get('active_model')
        temperature = float(request.form.get('temperature', 0.7))
        context_length = int(request.form.get('context_length', 4096))
        top_p = float(request.form.get('top_p', 0.9))
        top_k = int(request.form.get('top_k', 40))
        fallback_model = request.form.get('fallback_model') or None
        system_prompt = request.form.get('system_prompt') or None
        
        database.update_model_settings(
            active_model=active_model,
            temperature=temperature,
            context_length=context_length,
            top_p=top_p,
            top_k=top_k,
            fallback_model=fallback_model,
            system_prompt=system_prompt
        )
        
        flash('Model settings updated successfully.', 'success')
    except Exception as e:
        flash(f'Error updating settings: {str(e)}', 'danger')
    
    return redirect(url_for('admin.models'))


@admin_bp.route('/chat')
@admin_required
def chat():
    """Chat testing page"""
    history = chat_service.get_chat_history(20)
    return render_template('chat.html', history=history)


@admin_bp.route('/chat/send', methods=['POST'])
@admin_required
def send_chat():
    """Send a chat message (admin testing), with optional image for Janus-Pro Vision."""
    from services.agent.schemas import BotRuntimeContext

    question = request.form.get('question', '').strip()
    use_rag = request.form.get('use_rag', 'true').lower() == 'true'
    company_id = request.form.get('company_id', '').strip() or None

    if not question:
        return jsonify({'error': 'Please enter a question'}), 400

    # Extract optional image (for Janus-Pro multimodal)
    image_b64 = None
    if 'image' in request.files:
        img_file = request.files['image']
        if img_file and img_file.filename:
            image_b64 = base64.b64encode(img_file.read()).decode('utf-8')

    # Build runtime context
    runtime = None
    if company_id:
        company = database.get_company_by_id(company_id)
        runtime = BotRuntimeContext(
            tenant_id=f"company_{company_id}",
            site_id="default_site",
            bot_id="default_bot",
            api_key_id="",
            session_id=f"admin-{session.get('user_id', 'unknown')}",
            user_id=session.get('user_id', ''),
            user_role="admin",
            enabled_modules=["chat", "rag"],
            language=company.get('language', 'ar') if company else 'ar',
            allowed_actions=["read", "ask"],
            company_name=company['name'] if company else "",
        )

    try:
        result = chat_service.process_question(
            question,
            use_rag=use_rag,
            image_b64=image_b64,
            runtime=runtime,
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/chat/clear-memory', methods=['POST'])
@admin_required
def clear_memory():
    """Clear conversation memory"""
    try:
        chat_service.clear_memory()
        return jsonify({'success': True, 'message': 'Memory cleared'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ----- Website Crawling Routes -----

@admin_bp.route('/websites')
@admin_required
def websites():
    """Website management page"""
    sources = database.get_all_web_sources()
    companies = database.get_all_companies()
    return render_template('websites.html', web_sources=sources, companies=companies)


@admin_bp.route('/websites/crawl', methods=['POST'])
@admin_required
def crawl_website():
    """Crawl a new website"""
    url = request.form.get('url', '').strip()
    max_depth = int(request.form.get('max_depth', config.MAX_CRAWL_DEPTH))
    max_pages = int(request.form.get('max_pages', config.MAX_CRAWL_PAGES))
    company_id = request.form.get('company_id', '').strip() or None
    
    if not url:
        flash('Please provide a URL to crawl.', 'danger')
        return redirect(url_for('admin.websites'))
    
    # Add http if missing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    tenant_id = f"company_{company_id}" if company_id else "default_tenant"
    
    try:
        # Add web source record
        source_id = database.add_web_source(url)
        database.update_web_source_status(source_id, 'crawling')
        
        # Perform crawl
        result = web_crawler.crawl_website(url, max_depth=max_depth, max_pages=max_pages)
        
        if result['total_chunks'] == 0:
            database.update_web_source_status(source_id, 'failed', 0, 0)
            flash(f'No content found at {url}', 'warning')
            return redirect(url_for('admin.websites'))
        
        # Save chunks to database
        database.add_web_source_chunks(source_id, result['chunks'])
        
        # Add to knowledge base (vector index) with tenant context
        runtime = {"tenant_id": tenant_id, "site_id": "default_site", "bot_id": "default_bot"}
        knowledge_base.add_documents(source_id, result['chunks'], runtime=runtime)
        
        # Update status
        database.update_web_source_status(
            source_id, 'indexed', 
            result['pages_crawled'], 
            result['total_chunks']
        )
        
        flash(f'Successfully crawled {result["pages_crawled"]} pages! {result["total_chunks"]} chunks indexed.', 'success')
        
    except Exception as e:
        flash(f'Error crawling website: {str(e)}', 'danger')
    
    return redirect(url_for('admin.websites'))


@admin_bp.route('/websites/<source_id>/delete', methods=['POST'])
@admin_required
def delete_website(source_id):
    """Delete a crawled website"""
    try:
        source = database.get_web_source_by_id(source_id)
        if source:
            # Delete from knowledge base
            knowledge_base.delete_document(source_id)
            
            # Delete from database
            database.delete_web_source(source_id)
            
            flash('Website deleted successfully.', 'success')
        else:
            flash('Website not found.', 'danger')
    except Exception as e:
        flash(f'Error deleting website: {str(e)}', 'danger')
    
    return redirect(url_for('admin.websites'))


@admin_bp.route('/websites/<source_id>/recrawl', methods=['POST'])
@admin_required
def recrawl_website(source_id):
    """Re-crawl an existing website"""
    try:
        source = database.get_web_source_by_id(source_id)
        if not source:
            flash('Website not found.', 'danger')
            return redirect(url_for('admin.websites'))
        
        # Delete old data from knowledge base
        knowledge_base.delete_document(source_id)
        
        # Delete old chunks
        database.delete_web_source(source_id)
        
        # Re-add and re-crawl
        new_source_id = database.add_web_source(source['base_url'])
        database.update_web_source_status(new_source_id, 'crawling')
        
        result = web_crawler.crawl_website(
            source['base_url'], 
            max_depth=source.get('crawl_depth', config.MAX_CRAWL_DEPTH)
        )
        
        if result['total_chunks'] > 0:
            database.add_web_source_chunks(new_source_id, result['chunks'])
            knowledge_base.add_documents(new_source_id, result['chunks'])
            database.update_web_source_status(
                new_source_id, 'indexed',
                result['pages_crawled'],
                result['total_chunks']
            )
            flash(f'Re-crawled successfully! {result["total_chunks"]} chunks indexed.', 'success')
        else:
            database.update_web_source_status(new_source_id, 'failed', 0, 0)
            flash('No content found during re-crawl.', 'warning')
            
    except Exception as e:
        flash(f'Error re-crawling website: {str(e)}', 'danger')
    
    return redirect(url_for('admin.websites'))


@admin_bp.route('/websites/<source_id>/chunks')
@admin_required
def inspect_source_chunks(source_id):
    """Inspect chunks for a specific web source"""
    source = database.get_web_source_by_id(source_id)
    if not source:
        flash('Website source not found.', 'danger')
        return redirect(url_for('admin.websites'))
        
    chunks = database.get_web_source_chunks(source_id)
    return render_template('source_chunks.html', source=source, chunks=chunks)


# ----- Debugging Routes -----

@admin_bp.route('/debug/search')
@admin_required
def debug_search():
    """Debug page for vector search"""
    query = request.args.get('q', '').strip()
    results = []
    
    if query:
        # Perform raw search
        results = knowledge_base.search(query, top_k=20)
        
    return render_template('debug_search.html', query=query, results=results)

@admin_bp.route('/tools/tables')
@admin_required
def extract_tables():
    """Tool to extract tables from any URL"""
    url = request.args.get('url', '').strip()
    tables = []
    
    if url:
        # Add http if missing
        if not url.startswith(('http://', 'https://')):
            url_to_fetch = 'https://' + url
        else:
            url_to_fetch = url
            
        tables = web_crawler.get_tables_html(url_to_fetch)
        
    return render_template('extract_tables.html', target_url=url, tables=tables)


# ----- Quiz Routes -----

@admin_bp.route('/quizzes')
@admin_required
def quizzes():
    """List all generated quizzes"""
    all_quizzes = database.get_all_quizzes()
    return render_template('quizzes_list.html', quizzes=all_quizzes)


@admin_bp.route('/quizzes/create', methods=['GET', 'POST'])
@admin_required
def create_quiz():
    """Create a new quiz manually"""
    if request.method == 'GET':
        documents = database.get_all_documents()
        return render_template('quiz_create.html', documents=documents)
        
    try:
        topic = request.form.get('topic', '').strip()
        difficulty = request.form.get('difficulty', 'Medium')
        num_questions = int(request.form.get('num_questions', 5))
        document_id = request.form.get('document_id', '').strip() or None
        
        # If document selected but no topic, use document name as topic hint
        if document_id and not topic:
            doc = database.get_document_by_id(document_id)
            if doc:
                topic = f"Content from {doc['original_filename']}"
        
        if not topic and not document_id:
            flash('Please enter a topic or select a document.', 'warning')
            return redirect(url_for('admin.create_quiz'))

        # ── Use Professional TeacherQuizService (5-stage pipeline) ──
        result = teacher_quiz_service.generate_quiz(
            topic=topic,
            doc_id=document_id,
            difficulty=difficulty,
            num_questions=num_questions,
            language='auto'
        )
        quiz_id = result.quiz_id
        
        flash('Quiz generated successfully with 5-stage methodology! 🎓', 'success')
        return redirect(url_for('admin.view_quiz', quiz_id=quiz_id))
        
    except ValueError as e:
        flash(f'⚠️ {str(e)}', 'warning')
        return redirect(url_for('admin.create_quiz'))
    except Exception as e:
        flash(f'Error generating quiz: {str(e)}', 'danger')
        return redirect(url_for('admin.create_quiz'))


@admin_bp.route('/quizzes/<quiz_id>')
@admin_required
def view_quiz(quiz_id):
    """View/Take a specific quiz"""
    quiz = database.get_quiz_by_id(quiz_id)
    if not quiz:
        flash('Quiz not found.', 'danger')
        return redirect(url_for('admin.quizzes'))
        
    try:
        raw = json.loads(quiz['content_json'])
    except Exception:
        raw = {}

    # ── Normalize to what quiz_view.html expects ──
    # Detect format: professional (TeacherQuizService) vs legacy (QuizService)
    quiz_type = quiz.get('quiz_type', 'standard')
    content = {}

    if quiz_type == 'professional':
        # TeacherQuizService format → normalize
        raw_questions = raw.get('questions', [])
        normalized_questions = []

        for q in raw_questions:
            q_type = q.get('question_type', 'MCQ')
            opts_raw = q.get('options', [])

            # Convert ["A. text", "B. text"] → {"A": "text", "B": "text"}
            if isinstance(opts_raw, list):
                opts = {}
                for opt in opts_raw:
                    if '. ' in str(opt):
                        key, val = str(opt).split('. ', 1)
                        opts[key.strip()] = val.strip()
                    else:
                        letter = chr(65 + len(opts))
                        opts[letter] = str(opt)
                # True/False fallback
                if q_type == 'TF' and not opts:
                    opts = {'A': 'True', 'B': 'False'}
            elif isinstance(opts_raw, dict):
                opts = opts_raw
            else:
                opts = {}

            normalized_questions.append({
                'question':    q.get('question_text', ''),
                'options':     opts,
                'answer':      q.get('correct_answer', '').replace('.', '').strip()[:1] or 'A',
                'explanation': q.get('explanation', ''),
                'bloom_level': q.get('bloom_level', ''),
                'difficulty':  q.get('difficulty', ''),
                'type':        q_type,
            })

        content = {
            'questions':          normalized_questions,
            'full_presentation':  raw.get('markdown_exam', ''),
            'answer_key':         raw.get('answer_key_markdown', ''),
            'blueprint':          raw.get('blueprint', {}),
            'metadata':           raw.get('metadata', {}),
            'is_professional':    True,
        }
    else:
        # Legacy QuizService format – pass through as-is
        content = raw
        content.setdefault('questions', [])
        content['is_professional'] = False

    return render_template('quiz_view.html', quiz=quiz, content=content)


# ----- Company Management Routes -----

@admin_bp.route('/companies')
@admin_required
def companies():
    """List all companies"""
    all_companies = database.get_all_companies()
    return render_template('companies.html', companies=all_companies)


@admin_bp.route('/companies/create', methods=['GET', 'POST'])
@admin_required
def create_company():
    """Create a new company"""
    if request.method == 'GET':
        return render_template('company_form.html', company=None)

    name = request.form.get('name', '').strip()
    slug = request.form.get('slug', '').strip()

    if not name or not slug:
        flash('Name and slug are required.', 'danger')
        return redirect(url_for('admin.companies'))

    # Auto-generate slug if empty
    if not slug:
        import re as _re
        slug = _re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

    try:
        company_id = database.create_company(
            name=name,
            slug=slug,
            description=request.form.get('description', ''),
            business_type=request.form.get('business_type', ''),
            platform_type=request.form.get('platform_type', ''),
            tone=request.form.get('tone', 'helpful, clear Arabic'),
            support_behavior=request.form.get('support_behavior', ''),
            fallback_message=request.form.get('fallback_message', ''),
            system_prompt=request.form.get('system_prompt', ''),
            language=request.form.get('language', 'ar'),
        )
        flash(f'Company "{name}" created successfully.', 'success')
        return redirect(url_for('admin.companies'))
    except Exception as e:
        flash(f'Error creating company: {e}', 'danger')
        return redirect(url_for('admin.companies'))


@admin_bp.route('/companies/<company_id>/edit', methods=['GET', 'POST'])
@admin_required
def edit_company(company_id):
    """Edit company settings"""
    company = database.get_company_by_id(company_id)
    if not company:
        flash('Company not found.', 'danger')
        return redirect(url_for('admin.companies'))

    if request.method == 'GET':
        stats = database.get_company_stats(company_id)
        return render_template('company_form.html', company=company, stats=stats)

    try:
        database.update_company(
            company_id,
            name=request.form.get('name', company['name']),
            slug=request.form.get('slug', company['slug']),
            description=request.form.get('description', ''),
            business_type=request.form.get('business_type', ''),
            platform_type=request.form.get('platform_type', ''),
            tone=request.form.get('tone', ''),
            support_behavior=request.form.get('support_behavior', ''),
            fallback_message=request.form.get('fallback_message', ''),
            system_prompt=request.form.get('system_prompt', ''),
            language=request.form.get('language', 'ar'),
            is_active=request.form.get('is_active') == 'on',
        )
        flash('Company updated successfully.', 'success')
    except Exception as e:
        flash(f'Error updating company: {e}', 'danger')

    return redirect(url_for('admin.edit_company', company_id=company_id))


@admin_bp.route('/companies/<company_id>/delete', methods=['POST'])
@admin_required
def delete_company(company_id):
    """Delete a company"""
    company = database.get_company_by_id(company_id)
    if company:
        database.delete_company(company_id)
        flash(f'Company "{company["name"]}" deleted.', 'success')
    else:
        flash('Company not found.', 'danger')
    return redirect(url_for('admin.companies'))


# ----- Admin Dashboard -----
