-- create_pgvector_schema.sql
-- إعداد ملحق pgvector وجدول البحث المتجهي الأصلي

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ai_storage.ai_vector_chunks (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL,
    tenant_id VARCHAR(100) NOT NULL,
    site_id VARCHAR(100) NOT NULL,
    bot_id VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    visibility VARCHAR(50) NOT NULL DEFAULT 'tenant_only',
    chunk_text TEXT NOT NULL,
    embedding vector(768), -- دقة 768 لموديل Nomic
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- الفهارس لضمان سرعة الفلترة الأصلية
CREATE INDEX idx_vector_tenant_site_bot ON ai_storage.ai_vector_chunks (tenant_id, site_id, bot_id);
CREATE INDEX idx_vector_source_type ON ai_storage.ai_vector_chunks (source_type);
CREATE INDEX idx_vector_visibility ON ai_storage.ai_vector_chunks (visibility);

-- فهرس HNSW للبحث المتجهي السريع
CREATE INDEX idx_vector_embedding ON ai_storage.ai_vector_chunks USING hnsw (embedding vector_cosine_ops);
