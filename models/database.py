"""
Database models for the Knowledge Base Chatbot
Uses SQLite with raw SQL for simplicity
"""
import sqlite3
import uuid
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
import config
from werkzeug.security import generate_password_hash, check_password_hash


def get_db_connection():
    """Get a database connection"""
    config.init_directories()
    conn = sqlite3.connect(config.DATABASE_PATH, timeout=20.0) # Add timeout for busy DBs
    # Enable Write-Ahead Logging for better concurrency
    conn.execute('PRAGMA journal_mode=WAL;')
    conn.execute('PRAGMA synchronous=NORMAL;')
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table (for admin authentication)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # API Keys table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_keys (
            id TEXT PRIMARY KEY,
            key_hash TEXT UNIQUE NOT NULL,
            key_prefix TEXT NOT NULL,
            name TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            usage_count INTEGER DEFAULT 0,
            rate_limit INTEGER DEFAULT 60,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used_at TIMESTAMP
        )
    ''')
    
    # Documents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            chunk_count INTEGER DEFAULT 0,
            is_indexed INTEGER DEFAULT 0,
            graph_json TEXT, -- Extracted Knowledge Graph
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Migration: Add graph_json to documents
    try:
        cursor.execute("ALTER TABLE documents ADD COLUMN graph_json TEXT")
    except sqlite3.OperationalError:
        pass # Already exists

    # Document chunks table (for text chunks)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            metadata TEXT,
            FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
        )
    ''')
    
    # Chat history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id TEXT PRIMARY KEY,
            api_key_id TEXT,
            session_id TEXT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_documents TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (api_key_id) REFERENCES api_keys (id)
        )
    ''')
    
    # Simple migration: Add session_id if it doesn't exist (SQLite doesn't support IF NOT EXISTS in ALTER)
    try:
        cursor.execute("ALTER TABLE chat_history ADD COLUMN session_id TEXT")
    except sqlite3.OperationalError:
        pass # Already exists
    
    # Model settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS model_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            active_model TEXT NOT NULL,
            temperature REAL DEFAULT 0.7,
            context_length INTEGER DEFAULT 4096,
            top_p REAL DEFAULT 0.9,
            top_k INTEGER DEFAULT 40,
            fallback_model TEXT,
            system_prompt TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Web sources table (for crawled websites)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS web_sources (
            id TEXT PRIMARY KEY,
            base_url TEXT NOT NULL,
            title TEXT,
            pages_crawled INTEGER DEFAULT 0,
            chunk_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            crawl_depth INTEGER DEFAULT 2,
            last_crawled_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Quizzes table (for generated quizzes)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY,
            topic TEXT NOT NULL,
            difficulty TEXT DEFAULT 'Medium',
            num_questions INTEGER DEFAULT 5,
            content_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Migration: add document_id and language to quizzes (safe — ignores if already exists)
    try:
        cursor.execute("ALTER TABLE quizzes ADD COLUMN document_id TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists

    try:
        cursor.execute("ALTER TABLE quizzes ADD COLUMN language TEXT DEFAULT 'auto'")
    except sqlite3.OperationalError:
        pass  # Column already exists

    try:
        cursor.execute("ALTER TABLE quizzes ADD COLUMN quiz_type TEXT DEFAULT 'standard'")
    except sqlite3.OperationalError:
        pass  # Column already exists

    # ATS: Job Descriptions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ats_job_descriptions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            top_n INTEGER DEFAULT 3,
            status TEXT DEFAULT 'pending',
            results_json TEXT,
            cv_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    
    # Insert default admin user if not exists
    admin_password_hash = generate_password_hash(config.ADMIN_PASSWORD)
    # Be careful here, since we are doing INSERT OR IGNORE, if admin exists, the hash isn't updated, which is fine normally.
    # We will also insert but check first if needed, though INSERT OR IGNORE is easiest for setup.
    cursor.execute('''
        INSERT OR IGNORE INTO users (id, username, password_hash, is_admin)
        VALUES (?, ?, ?, 1)
    ''', (str(uuid.uuid4()), config.ADMIN_USERNAME, admin_password_hash))
    
    # Insert default model settings if not exists
    cursor.execute('''
        INSERT OR IGNORE INTO model_settings (id, active_model, temperature, context_length, top_p, top_k)
        VALUES (1, ?, ?, ?, ?, ?)
    ''', (config.DEFAULT_MODEL, 
          config.DEFAULT_MODEL_PARAMS['temperature'],
          config.DEFAULT_MODEL_PARAMS['context_length'],
          config.DEFAULT_MODEL_PARAMS['top_p'],
          config.DEFAULT_MODEL_PARAMS['top_k']))
    
    conn.commit()
    conn.close()


# ----- User Functions -----

def verify_user(username: str, password: str) -> Optional[Dict]:
    """Verify user credentials"""
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ?',
        (username,)
    ).fetchone()
    conn.close()
    
    if user:
        # Check against new secure hash, but fallback to old sha256 method to preserve existing logins temporarily if needed
        old_hash = hashlib.sha256(password.encode()).hexdigest()
        stored_hash = user['password_hash']
        
        if stored_hash == old_hash:
            # Upgrade their hash automatically
            new_hash = generate_password_hash(password)
            conn = get_db_connection()
            conn.execute('UPDATE users SET password_hash = ? WHERE username = ?', (new_hash, username))
            conn.commit()
            conn.close()
            return dict(user)
        elif check_password_hash(stored_hash, password):
            return dict(user)
            
    return None


def get_user_by_id(user_id: str) -> Optional[Dict]:
    """Get user by ID"""
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None


# ----- API Key Functions -----

def generate_api_key() -> str:
    """Generate a new API key"""
    return str(uuid.uuid4()).replace('-', '') + str(uuid.uuid4()).replace('-', '')[:config.API_KEY_LENGTH - 32]


def create_api_key(name: str, rate_limit: int = 60) -> Dict:
    """Create a new API key"""
    key = generate_api_key()
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    key_prefix = key[:8]
    key_id = str(uuid.uuid4())
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO api_keys (id, key_hash, key_prefix, name, rate_limit)
        VALUES (?, ?, ?, ?, ?)
    ''', (key_id, key_hash, key_prefix, name, rate_limit))
    conn.commit()
    conn.close()
    
    return {
        'id': key_id,
        'key': key,  # Only returned once!
        'key_prefix': key_prefix,
        'name': name,
        'rate_limit': rate_limit
    }


def verify_api_key(key: str) -> Optional[Dict]:
    """Verify an API key and return its details"""
    key_hash = hashlib.sha256(key.encode()).hexdigest()
    conn = get_db_connection()
    api_key = conn.execute(
        'SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1',
        (key_hash,)
    ).fetchone()
    
    if api_key:
        # Update usage count and last used
        conn.execute('''
            UPDATE api_keys SET usage_count = usage_count + 1, last_used_at = ?
            WHERE key_hash = ?
        ''', (datetime.now(), key_hash))
        conn.commit()
    
    conn.close()
    return dict(api_key) if api_key else None


def get_all_api_keys() -> List[Dict]:
    """Get all API keys (without the actual key)"""
    conn = get_db_connection()
    keys = conn.execute('SELECT * FROM api_keys ORDER BY created_at DESC').fetchall()
    conn.close()
    return [dict(key) for key in keys]


def toggle_api_key(key_id: str, is_active: bool) -> bool:
    """Enable or disable an API key"""
    conn = get_db_connection()
    conn.execute('UPDATE api_keys SET is_active = ? WHERE id = ?', (int(is_active), key_id))
    conn.commit()
    conn.close()
    return True


def delete_api_key(key_id: str) -> bool:
    """Delete an API key"""
    conn = get_db_connection()
    conn.execute('DELETE FROM api_keys WHERE id = ?', (key_id,))
    conn.commit()
    conn.close()
    return True


# ----- Document Functions -----

def add_document(filename: str, original_filename: str, file_type: str, file_size: int) -> str:
    """Add a new document record"""
    doc_id = str(uuid.uuid4())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO documents (id, filename, original_filename, file_type, file_size)
        VALUES (?, ?, ?, ?, ?)
    ''', (doc_id, filename, original_filename, file_type, file_size))
    conn.commit()
    conn.close()
    return doc_id


def update_document_indexed(doc_id: str, chunk_count: int):
    """Mark document as indexed"""
    conn = get_db_connection()
    conn.execute('''
        UPDATE documents SET is_indexed = 1, chunk_count = ? WHERE id = ?
    ''', (chunk_count, doc_id))
    conn.commit()
    conn.close()


def update_document_graph(doc_id: str, graph_json: str):
    """Update document Knowledge Graph data"""
    conn = get_db_connection()
    conn.execute('''
        UPDATE documents SET graph_json = ? WHERE id = ?
    ''', (graph_json, doc_id))
    conn.commit()
    conn.close()


def get_all_documents() -> List[Dict]:
    """Get all documents"""
    conn = get_db_connection()
    docs = conn.execute('SELECT * FROM documents ORDER BY created_at DESC').fetchall()
    conn.close()
    return [dict(doc) for doc in docs]


def get_document_by_id(doc_id: str) -> Optional[Dict]:
    """Get document by ID"""
    conn = get_db_connection()
    doc = conn.execute('SELECT * FROM documents WHERE id = ?', (doc_id,)).fetchone()
    conn.close()
    return dict(doc) if doc else None


def delete_document(doc_id: str) -> bool:
    """Delete a document and its chunks"""
    conn = get_db_connection()
    conn.execute('DELETE FROM document_chunks WHERE document_id = ?', (doc_id,))
    conn.execute('DELETE FROM documents WHERE id = ?', (doc_id,))
    conn.commit()
    conn.close()
    return True


# ----- Web Source Functions -----

def add_web_source(base_url: str, title: str | None = None) -> str:
    """Add a new web source record"""
    source_id = str(uuid.uuid4())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO web_sources (id, base_url, title, status)
        VALUES (?, ?, ?, 'pending')
    ''', (source_id, base_url, title or base_url))
    conn.commit()
    conn.close()
    return source_id


def update_web_source_status(source_id: str, status: str, 
                              pages_crawled: int | None = None, 
                              chunk_count: int | None = None):
    """Update web source status after crawling"""
    conn = get_db_connection()
    if pages_crawled is not None and chunk_count is not None:
        conn.execute('''
            UPDATE web_sources 
            SET status = ?, pages_crawled = ?, chunk_count = ?, last_crawled_at = ?
            WHERE id = ?
        ''', (status, pages_crawled, chunk_count, datetime.now(), source_id))
    else:
        conn.execute('''
            UPDATE web_sources SET status = ? WHERE id = ?
        ''', (status, source_id))
    conn.commit()
    conn.close()


def get_all_web_sources() -> List[Dict]:
    """Get all web sources"""
    conn = get_db_connection()
    sources = conn.execute('SELECT * FROM web_sources ORDER BY created_at DESC').fetchall()
    conn.close()
    return [dict(source) for source in sources]


def get_web_source_by_id(source_id: str) -> Optional[Dict]:
    """Get web source by ID"""
    conn = get_db_connection()
    source = conn.execute('SELECT * FROM web_sources WHERE id = ?', (source_id,)).fetchone()
    conn.close()
    return dict(source) if source else None


def delete_web_source(source_id: str) -> bool:
    """Delete a web source and its chunks"""
    conn = get_db_connection()
    # Delete chunks associated with this web source
    conn.execute('DELETE FROM document_chunks WHERE document_id = ?', (source_id,))
    conn.execute('DELETE FROM web_sources WHERE id = ?', (source_id,))
    conn.commit()
    conn.close()
    return True


def add_web_source_chunks(source_id: str, chunks: List[Dict]):
    """Add chunks from a crawled web source"""
    conn = get_db_connection()
    for chunk in chunks:
        conn.execute('''
            INSERT INTO document_chunks (id, document_id, chunk_index, content, metadata)
            VALUES (?, ?, ?, ?, ?)
        ''', (str(uuid.uuid4()), source_id, chunk['index'], chunk['content'], chunk.get('metadata', '')))
    conn.commit()
    conn.close()


def get_web_source_chunks(source_id: str) -> List[Dict]:
    """Get all chunks for a web source"""
    conn = get_db_connection()
    chunks = conn.execute(
        'SELECT * FROM document_chunks WHERE document_id = ? ORDER BY chunk_index',
        (source_id,)
    ).fetchall()
    conn.close()
    return [dict(chunk) for chunk in chunks]


# ----- Document Chunk Functions -----

def add_document_chunks(doc_id: str, chunks: List[Dict]):
    """Add document chunks"""
    conn = get_db_connection()
    for chunk in chunks:
        conn.execute('''
            INSERT INTO document_chunks (id, document_id, chunk_index, content, metadata)
            VALUES (?, ?, ?, ?, ?)
        ''', (str(uuid.uuid4()), doc_id, chunk['index'], chunk['content'], chunk.get('metadata', '')))
    conn.commit()
    conn.close()


def get_document_chunks(doc_id: str) -> List[Dict]:
    """Get all chunks for a document"""
    conn = get_db_connection()
    chunks = conn.execute(
        'SELECT * FROM document_chunks WHERE document_id = ? ORDER BY chunk_index',
        (doc_id,)
    ).fetchall()
    conn.close()
    return [dict(chunk) for chunk in chunks]


def get_all_chunks() -> List[Dict]:
    """Get all document chunks from all sources (Documents, Web Sources, ATS)"""
    conn = get_db_connection()
    chunks = conn.execute('''
        SELECT dc.*, 
               COALESCE(d.original_filename, ws.title, ajd.title, 'Unknown Source') as source_name
        FROM document_chunks dc
        LEFT JOIN documents d ON dc.document_id = d.id
        LEFT JOIN web_sources ws ON dc.document_id = ws.id
        LEFT JOIN ats_job_descriptions ajd ON dc.document_id = ajd.id
        ORDER BY dc.document_id, dc.chunk_index
    ''').fetchall()
    conn.close()
    return [dict(chunk) for chunk in chunks]


# ----- Chat History Functions -----

def add_chat_history(api_key_id: Optional[str], question: str, answer: str, 
                     source_type: str, source_documents: Optional[str] = None,
                     session_id: Optional[str] = None) -> str:
    """Add a chat history record"""
    chat_id = str(uuid.uuid4())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO chat_history (id, api_key_id, session_id, question, answer, source_type, source_documents)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (chat_id, api_key_id, session_id, question, answer, source_type, source_documents))
    conn.commit()
    conn.close()
    return chat_id


def get_session_history(session_id: str, limit: int = 10) -> List[Dict]:
    """Get history for a specific session"""
    conn = get_db_connection()
    chats = conn.execute('''
        SELECT question, answer, created_at FROM chat_history 
        WHERE session_id = ? 
        ORDER BY created_at DESC LIMIT ?
    ''', (session_id, limit)).fetchall()
    conn.close()
    return [dict(chat) for chat in chats]


def get_chat_history(limit: int = 100) -> List[Dict]:
    """Get recent chat history"""
    conn = get_db_connection()
    chats = conn.execute('''
        SELECT * FROM chat_history ORDER BY created_at DESC LIMIT ?
    ''', (limit,)).fetchall()
    conn.close()
    return [dict(chat) for chat in chats]


def get_chat_stats() -> Dict:
    """Get chat statistics"""
    conn = get_db_connection()
    total = conn.execute('SELECT COUNT(*) as count FROM chat_history').fetchone()['count']
    from_docs = conn.execute(
        "SELECT COUNT(*) as count FROM chat_history WHERE source_type = 'documents'"
    ).fetchone()['count']
    from_ai = conn.execute(
        "SELECT COUNT(*) as count FROM chat_history WHERE source_type = 'ai_model'"
    ).fetchone()['count']
    conn.close()
    return {
        'total': total,
        'from_documents': from_docs,
        'from_ai_model': from_ai
    }


# ----- Model Settings Functions -----

def get_model_settings() -> Dict:
    """Get current model settings"""
    conn = get_db_connection()
    settings = conn.execute('SELECT * FROM model_settings WHERE id = 1').fetchone()
    conn.close()
    return dict(settings) if settings else config.DEFAULT_MODEL_PARAMS


def update_model_settings(active_model: Optional[str] = None,
                          temperature: Optional[float] = None,
                          context_length: Optional[int] = None,
                          top_p: Optional[float] = None,
                          top_k: Optional[int] = None,
                          fallback_model: Optional[str] = None,
                          system_prompt: Optional[str] = None) -> bool:
    """Update model settings"""
    conn = get_db_connection()
    current = get_model_settings()
    
    conn.execute('''
        UPDATE model_settings SET
            active_model = ?,
            temperature = ?,
            context_length = ?,
            top_p = ?,
            top_k = ?,
            fallback_model = ?,
            system_prompt = ?,
            updated_at = ?
        WHERE id = 1
    ''', (
        active_model or current.get('active_model'),
        temperature if temperature is not None else current.get('temperature'),
        context_length if context_length is not None else current.get('context_length'),
        top_p if top_p is not None else current.get('top_p'),
        top_k if top_k is not None else current.get('top_k'),
        fallback_model if fallback_model is not None else current.get('fallback_model'),
        system_prompt if system_prompt is not None else current.get('system_prompt'),
        datetime.now()
    ))
    conn.commit()
    conn.close()
    return True


# ----- Quiz Functions -----

def save_quiz(topic: str, difficulty: str, num_questions: int, content_json: str) -> str:
    """Save a generated quiz (legacy, backward-compatible)."""
    quiz_id = str(uuid.uuid4())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO quizzes (id, topic, difficulty, num_questions, content_json, quiz_type)
        VALUES (?, ?, ?, ?, ?, 'standard')
    ''', (quiz_id, topic, difficulty, num_questions, content_json))
    conn.commit()
    conn.close()
    return quiz_id


def save_professional_quiz(
    topic: str,
    difficulty: str,
    num_questions: int,
    content_json: str,
    doc_id: Optional[str] = None,
    language: str = 'auto'
) -> str:
    """
    Save a professionally generated quiz (TeacherQuizService output).
    Stores the document_id and language alongside the standard fields.
    """
    quiz_id = str(uuid.uuid4())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO quizzes
            (id, topic, difficulty, num_questions, content_json, document_id, language, quiz_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'professional')
    ''', (quiz_id, topic, difficulty, num_questions, content_json, doc_id, language))
    conn.commit()
    conn.close()
    return quiz_id


def get_all_quizzes() -> List[Dict]:
    """Get all quizzes, newest first."""
    conn = get_db_connection()
    quizzes = conn.execute('SELECT * FROM quizzes ORDER BY created_at DESC').fetchall()
    conn.close()
    return [dict(q) for q in quizzes]


def get_quiz_by_id(quiz_id: str) -> Optional[Dict]:
    """Get quiz by ID."""
    conn = get_db_connection()
    quiz = conn.execute('SELECT * FROM quizzes WHERE id = ?', (quiz_id,)).fetchone()
    conn.close()
    return dict(quiz) if quiz else None


# ----- Dashboard Stats -----

def get_dashboard_stats() -> Dict:
    """Get statistics for the dashboard"""
    conn = get_db_connection()
    
    total_documents = conn.execute('SELECT COUNT(*) as count FROM documents').fetchone()['count']
    total_chunks = conn.execute('SELECT COUNT(*) as count FROM document_chunks').fetchone()['count']
    total_api_keys = conn.execute('SELECT COUNT(*) as count FROM api_keys').fetchone()['count']
    active_api_keys = conn.execute(
        'SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1'
    ).fetchone()['count']
    total_chats = conn.execute('SELECT COUNT(*) as count FROM chat_history').fetchone()['count']
    # Check if quizzes table exists
    quizzes_exist = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='quizzes'"
    ).fetchone()
    
    total_quizzes = 0
    if quizzes_exist:
        total_quizzes = conn.execute('SELECT COUNT(*) as count FROM quizzes').fetchone()['count']
    
    # Recent chats (last 24 hours)
    recent_chats = conn.execute('''
        SELECT COUNT(*) as count FROM chat_history 
        WHERE created_at >= datetime('now', '-1 day')
    ''').fetchone()['count']

    
    conn.close()
    
    return {
        'total_documents': total_documents,
        'total_chunks': total_chunks,
        'total_api_keys': total_api_keys,
        'active_api_keys': active_api_keys,
        'total_chats': total_chats,
        'recent_chats': recent_chats,
        'total_quizzes': total_quizzes
    }


# ----- ATS Functions -----

def create_ats_job(title: str, description: str, top_n: int = 3) -> str:
    """Create a new ATS job description record"""
    job_id = str(uuid.uuid4())
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO ats_job_descriptions (id, title, description, top_n, status)
        VALUES (?, ?, ?, ?, 'pending')
    ''', (job_id, title, description, top_n))
    conn.commit()
    conn.close()
    return job_id


def update_ats_job_results(job_id: str, results_json: str, cv_count: int):
    """Save final ATS ranking results"""
    conn = get_db_connection()
    conn.execute('''
        UPDATE ats_job_descriptions
        SET status = 'completed', results_json = ?, cv_count = ?
        WHERE id = ?
    ''', (results_json, cv_count, job_id))
    conn.commit()
    conn.close()


def get_all_ats_jobs() -> List[Dict]:
    """Get all ATS job descriptions"""
    conn = get_db_connection()
    jobs = conn.execute(
        'SELECT * FROM ats_job_descriptions ORDER BY created_at DESC'
    ).fetchall()
    conn.close()
    return [dict(j) for j in jobs]


def get_ats_job_by_id(job_id: str) -> Optional[Dict]:
    """Get ATS job by ID"""
    conn = get_db_connection()
    job = conn.execute(
        'SELECT * FROM ats_job_descriptions WHERE id = ?', (job_id,)
    ).fetchone()
    conn.close()
    return dict(job) if job else None


def delete_ats_job(job_id: str) -> bool:
    """Delete an ATS job"""
    conn = get_db_connection()
    conn.execute('DELETE FROM ats_job_descriptions WHERE id = ?', (job_id,))
    conn.commit()
    conn.close()
    return True
