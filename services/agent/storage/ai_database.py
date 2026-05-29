import sqlite3
import uuid
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import config

def get_ai_db_connection() -> Any:
    """Get a connection to the AI-owned database (SQLite or PostgreSQL)"""
    backend = getattr(config, "AI_STORAGE_BACKEND", "sqlite").lower()
    
    import logging
    logger = logging.getLogger(__name__)
    
    if backend == "postgres":
        import psycopg2  # type: ignore
        from psycopg2.extras import RealDictCursor  # type: ignore
        db_url = getattr(config, "AI_STORAGE_DATABASE_URL", "postgresql://localhost/ai_storage")
        schema = getattr(config, "AI_STORAGE_SCHEMA", "ai_storage")
        conn = psycopg2.connect(db_url)
        logger.info(f"[AI_STORAGE] backend=postgres schema={schema}")
        # Enable RealDictCursor to maintain compatibility with sqlite3.Row behavior
        return conn
    else:
        # Default to SQLite
        db_path = getattr(config, "AI_DATABASE_PATH", "ai_storage.db")
        logger.info(f"[AI_STORAGE] backend=sqlite path={db_path}")
        conn = sqlite3.connect(db_path, timeout=20.0)
        conn.execute('PRAGMA journal_mode=WAL;')
        conn.execute('PRAGMA synchronous=NORMAL;')
        conn.row_factory = sqlite3.Row
        return conn

def init_ai_db():
    """Initialize AI storage tables"""
    conn = get_ai_db_connection()
    cursor = conn.cursor()
    
    # AIDocuments
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_documents (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_id TEXT,
            source_name TEXT,
            visibility TEXT NOT NULL,
            text TEXT NOT NULL,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # AIChunks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            source_type TEXT NOT NULL,
            source_id TEXT,
            chunk_text TEXT NOT NULL,
            embedding_id TEXT,
            visibility TEXT NOT NULL,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (document_id) REFERENCES ai_documents (id) ON DELETE CASCADE
        )
    ''')
    
    # AIMemory
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_memory (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            session_id TEXT NOT NULL,
            user_id TEXT,
            memory_type TEXT NOT NULL,
            content TEXT NOT NULL,
            visibility TEXT NOT NULL,
            ttl_seconds INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP
        )
    ''')
    
    # AICandidateProfiles
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_candidate_profiles (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            session_id TEXT,
            profile TEXT NOT NULL,
            source TEXT NOT NULL,
            visibility TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # AIJobDrafts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_job_drafts (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            job_id TEXT,
            title TEXT,
            job_post TEXT NOT NULL,
            status TEXT NOT NULL,
            created_by TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # AIApplicationDrafts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_application_drafts (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            job_ids TEXT NOT NULL,
            cover_letter_draft TEXT,
            status TEXT NOT NULL,
            requires_approval INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # AIRankingRuns
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_ranking_runs (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            job_id TEXT NOT NULL,
            ranked_candidates TEXT NOT NULL,
            "limit" INTEGER DEFAULT 10,
            requires_human_review INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # AIAuditEvents
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_audit_events (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            session_id TEXT,
            event_type TEXT NOT NULL,
            actor_type TEXT NOT NULL,
            action TEXT NOT NULL,
            model_trace TEXT,
            safety_flags TEXT,
            approval_required INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # AIApprovalDrafts
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_approval_drafts (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            draft_payload TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            status TEXT NOT NULL,
            executed_at TIMESTAMP,
            executed_by TEXT,
            external_reference TEXT,
            error_message TEXT,
            idempotency_key TEXT,
            retry_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # AIConnectorConfigs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_connector_configs (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            connector_type TEXT NOT NULL,
            enabled INTEGER DEFAULT 0,
            environment TEXT DEFAULT 'sandbox',
            endpoint TEXT,
            allowed_host TEXT,
            auth_type TEXT DEFAULT 'none',
            secret_ref TEXT,
            timeout_seconds INTEGER DEFAULT 10,
            max_retries INTEGER DEFAULT 2,
            rate_limit_per_minute INTEGER DEFAULT 30,
            dry_run INTEGER DEFAULT 1,
            onboarding_status TEXT DEFAULT 'draft',
            last_test_result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    for col_def in [
        "ADD COLUMN onboarding_status TEXT DEFAULT 'draft'",
        "ADD COLUMN last_test_result TEXT",
        "ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ]:
        try:
            cursor.execute(f"ALTER TABLE ai_connector_configs {col_def}")
        except sqlite3.OperationalError:
            pass


    # AIDeliveryLogs
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_delivery_logs (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            approval_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            connector_type TEXT NOT NULL,
            status TEXT NOT NULL,
            attempt_count INTEGER DEFAULT 0,
            external_reference TEXT,
            status_code INTEGER,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # AIInterviewSessions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_interview_sessions (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            job_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            status TEXT NOT NULL,
            consent_status TEXT NOT NULL,
            interview_plan TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            expired_at TIMESTAMP
        )
    ''')

    # AIInterviewMessages
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_interview_messages (
            id TEXT PRIMARY KEY,
            interview_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            message_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # AIInterviewReports
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_interview_reports (
            id TEXT PRIMARY KEY,
            interview_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            site_id TEXT NOT NULL,
            bot_id TEXT NOT NULL,
            candidate_id TEXT NOT NULL,
            job_id TEXT NOT NULL,
            technical_score INTEGER DEFAULT 0,
            communication_score INTEGER DEFAULT 0,
            job_fit_score INTEGER DEFAULT 0,
            strengths TEXT,
            concerns TEXT,
            salary_expectation TEXT,
            availability TEXT,
            candidate_questions TEXT,
            relevant_quotes TEXT,
            recommendation TEXT,
            summary_for_company TEXT,
            requires_human_review INTEGER DEFAULT 1,
            full_transcript_revealed INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
