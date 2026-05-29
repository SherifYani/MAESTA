-- create_postgres_schema.sql
-- مخطط قاعدة بيانات AI لـ PostgreSQL

CREATE SCHEMA IF NOT EXISTS ai_storage;

SET search_path TO ai_storage;

-- AIDocuments
CREATE TABLE IF NOT EXISTS ai_documents (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    source_name TEXT,
    visibility VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_docs_tenant_site_bot ON ai_documents (tenant_id, site_id, bot_id);
CREATE INDEX idx_ai_docs_source_type ON ai_documents (source_type);

-- AIChunks
CREATE TABLE IF NOT EXISTS ai_chunks (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES ai_documents(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    chunk_text TEXT NOT NULL,
    embedding_id VARCHAR(255),
    visibility VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_chunks_tenant_site_bot ON ai_chunks (tenant_id, site_id, bot_id);

-- AIMemory
CREATE TABLE IF NOT EXISTS ai_memory (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    memory_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    visibility VARCHAR(50) NOT NULL,
    ttl_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ai_memory_session ON ai_memory (session_id);
CREATE INDEX idx_ai_memory_tenant_site_bot ON ai_memory (tenant_id, site_id, bot_id);

-- AICandidateProfiles
CREATE TABLE IF NOT EXISTS ai_candidate_profiles (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    candidate_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(255),
    profile JSONB NOT NULL,
    source TEXT NOT NULL,
    visibility VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_profiles_candidate ON ai_candidate_profiles (candidate_id);
CREATE INDEX idx_ai_profiles_tenant_site_bot ON ai_candidate_profiles (tenant_id, site_id, bot_id);

-- AIJobDrafts
CREATE TABLE IF NOT EXISTS ai_job_drafts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    job_id VARCHAR(100),
    title TEXT,
    job_post TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIApplicationDrafts
CREATE TABLE IF NOT EXISTS ai_application_drafts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    candidate_id VARCHAR(100) NOT NULL,
    job_ids TEXT NOT NULL,
    cover_letter_draft TEXT,
    status VARCHAR(50) NOT NULL,
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIRankingRuns
CREATE TABLE IF NOT EXISTS ai_ranking_runs (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    job_id VARCHAR(100) NOT NULL,
    ranked_candidates JSONB NOT NULL,
    "limit" INTEGER DEFAULT 10,
    requires_human_review BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIAuditEvents
CREATE TABLE IF NOT EXISTS ai_audit_events (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(255),
    event_type VARCHAR(100) NOT NULL,
    actor_type VARCHAR(50) NOT NULL,
    action TEXT NOT NULL,
    model_trace JSONB,
    safety_flags JSONB,
    approval_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_audit_created_at ON ai_audit_events (created_at);
CREATE INDEX idx_ai_audit_tenant_site_bot ON ai_audit_events (tenant_id, site_id, bot_id);

-- AIApprovalDrafts
CREATE TABLE IF NOT EXISTS ai_approval_drafts (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    draft_payload JSONB NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    executed_by VARCHAR(255),
    external_reference TEXT,
    error_message TEXT,
    idempotency_key VARCHAR(255),
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIConnectorConfigs
CREATE TABLE IF NOT EXISTS ai_connector_configs (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    connector_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    environment VARCHAR(50) DEFAULT 'sandbox',
    endpoint TEXT,
    allowed_host TEXT,
    auth_type VARCHAR(50) DEFAULT 'none',
    secret_ref TEXT,
    timeout_seconds INTEGER DEFAULT 10,
    max_retries INTEGER DEFAULT 2,
    rate_limit_per_minute INTEGER DEFAULT 30,
    dry_run BOOLEAN DEFAULT TRUE,
    onboarding_status VARCHAR(50) DEFAULT 'draft',
    last_test_result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIDeliveryLogs
CREATE TABLE IF NOT EXISTS ai_delivery_logs (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    approval_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    connector_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    external_reference TEXT,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIInterviewSessions
CREATE TABLE IF NOT EXISTS ai_interview_sessions (
    id UUID PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    job_id VARCHAR(100) NOT NULL,
    candidate_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    consent_status VARCHAR(50) NOT NULL,
    interview_plan JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE
);

-- AIInterviewMessages
CREATE TABLE IF NOT EXISTS ai_interview_messages (
    id UUID PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES ai_interview_sessions(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    sender VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AIInterviewReports
CREATE TABLE IF NOT EXISTS ai_interview_reports (
    id UUID PRIMARY KEY,
    interview_id UUID NOT NULL REFERENCES ai_interview_sessions(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    candidate_id VARCHAR(100) NOT NULL,
    job_id VARCHAR(100) NOT NULL,
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
    requires_human_review BOOLEAN DEFAULT TRUE,
    full_transcript_revealed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
