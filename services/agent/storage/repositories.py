import json
import sqlite3
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from .schemas import (
    AIDocument, AIChunk, AIMemory, AICandidateProfile, 
    AIJobDraft, AIApplicationDraft, AIRankingRun, 
    AIAuditEvent, AIApprovalDraft, AIConnectorConfig, AIDeliveryLog,
    AIInterviewSession, AIInterviewMessage, AIInterviewReport
)
from .ai_database import get_ai_db_connection
from .tenant_guard import assert_runtime_scope

class BaseRepository:
    def _get_paginated_results(self, table: str, tenant_id: str, site_id: str, bot_id: str, 
                                page: int = 1, page_size: int = 20, 
                                filters: Optional[Dict[str, Any]] = None, 
                                order_by: str = "created_at DESC") -> Tuple[List[Dict[str, Any]], int]:
        """Helper for paginated and filtered queries"""
        page_size = min(max(1, page_size), 100)
        offset = (page - 1) * page_size
        
        conn = get_ai_db_connection()
        try:
            sql = f"SELECT * FROM {table} WHERE tenant_id = ? AND site_id = ? AND bot_id = ?"
            params: List[Any] = [tenant_id, site_id, bot_id]
            
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        sql += f" AND {key} = ?"
                        params.append(value)
            
            # Get total count
            count_sql = f"SELECT COUNT(*) FROM ({sql})"
            total_count = conn.execute(count_sql, params).fetchone()[0]
            
            # Get data
            sql += f" ORDER BY {order_by} LIMIT ? OFFSET ?"
            params.extend([page_size, offset])
            
            rows = conn.execute(sql, params).fetchall()
            return [dict(r) for r in rows], total_count
        finally:
            conn.close()

class AIDocumentRepository(BaseRepository):
    def create_document(self, doc: AIDocument) -> str:
        if not all([doc.tenant_id, doc.site_id, doc.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_documents (id, tenant_id, site_id, bot_id, source_type, source_id, source_name, visibility, text, metadata, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (doc.id, doc.tenant_id, doc.site_id, doc.bot_id, doc.source_type, doc.source_id, doc.source_name, doc.visibility, doc.text, json.dumps(doc.metadata), doc.created_at, doc.updated_at))
            conn.commit()
        finally:
            conn.close()
        return doc.id

    def create_chunks(self, chunks: List[AIChunk]):
        conn = get_ai_db_connection()
        try:
            for chunk in chunks:
                if not all([chunk.tenant_id, chunk.site_id, chunk.bot_id]):
                    raise ValueError("tenant_id, site_id, and bot_id are required for chunks")
                conn.execute('''
                    INSERT INTO ai_chunks (id, document_id, tenant_id, site_id, bot_id, source_type, source_id, chunk_text, embedding_id, visibility, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (chunk.id, chunk.document_id, chunk.tenant_id, chunk.site_id, chunk.bot_id, chunk.source_type, chunk.source_id, chunk.chunk_text, chunk.embedding_id, chunk.visibility, json.dumps(chunk.metadata), chunk.created_at))
            conn.commit()
        finally:
            conn.close()

    def get_document(self, doc_id: str) -> Optional[AIDocument]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('SELECT * FROM ai_documents WHERE id = ?', (doc_id,)).fetchone()
            if row:
                data = dict(row)
                data['metadata'] = json.loads(data['metadata'])
                return AIDocument(**data)
        finally:
            conn.close()
        return None

    def list_documents(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AIDocument], int]:
        rows, total = self._get_paginated_results("ai_documents", tenant_id, site_id, bot_id, page, page_size, filters)
        docs = []
        for r in rows:
            r['metadata'] = json.loads(r['metadata'])
            docs.append(AIDocument(**r))
        return docs, total

    def search_documents(self, tenant_id: str, site_id: str, bot_id: str, query: Optional[str] = None, source_type: Optional[str] = None) -> List[AIDocument]:
        conn = get_ai_db_connection()
        try:
            sql = 'SELECT * FROM ai_documents WHERE tenant_id = ? AND site_id = ? AND bot_id = ?'
            params = [tenant_id, site_id, bot_id]
            if query:
                sql += ' AND text LIKE ?'
                params.append(f'%{query}%')
            if source_type:
                sql += ' AND source_type = ?'
                params.append(source_type)
            
            rows = conn.execute(sql, params).fetchall()
            docs = []
            for row in rows:
                data = dict(row)
                data['metadata'] = json.loads(data['metadata'])
                docs.append(AIDocument(**data))
            return docs
        finally:
            conn.close()

class AIMemoryRepository(BaseRepository):
    def save_memory(self, memory: AIMemory):
        if not all([memory.tenant_id, memory.site_id, memory.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for memory")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_memory (id, tenant_id, site_id, bot_id, session_id, user_id, memory_type, content, visibility, ttl_seconds, created_at, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (memory.id, memory.tenant_id, memory.site_id, memory.bot_id, memory.session_id, memory.user_id, memory.memory_type, memory.content, memory.visibility, memory.ttl_seconds, memory.created_at, memory.expires_at))
            conn.commit()
        finally:
            conn.close()

    def get_session_memory(self, tenant_id: str, site_id: str, bot_id: str, session_id: str) -> List[AIMemory]:
        conn = get_ai_db_connection()
        try:
            rows = conn.execute('''
                SELECT * FROM ai_memory 
                WHERE tenant_id = ? AND site_id = ? AND bot_id = ? AND session_id = ?
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
            ''', (tenant_id, site_id, bot_id, session_id)).fetchall()
            return [AIMemory(**dict(r)) for r in rows]
        finally:
            conn.close()

    def list_memory_records(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AIMemory], int]:
        rows, total = self._get_paginated_results("ai_memory", tenant_id, site_id, bot_id, page, page_size, filters)
        return [AIMemory(**r) for r in rows], total

class AICandidateProfileRepository(BaseRepository):
    def save_candidate_profile(self, profile: AICandidateProfile):
        if not all([profile.tenant_id, profile.site_id, profile.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for candidate profile")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_candidate_profiles (id, tenant_id, site_id, bot_id, candidate_id, session_id, profile, source, visibility, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (profile.id, profile.tenant_id, profile.site_id, profile.bot_id, profile.candidate_id, profile.session_id, json.dumps(profile.profile), profile.source, profile.visibility, profile.created_at))
            conn.commit()
        finally:
            conn.close()

    def get_candidate_profile(self, tenant_id: str, site_id: str, bot_id: str, candidate_id: str) -> Optional[AICandidateProfile]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('''
                SELECT * FROM ai_candidate_profiles 
                WHERE tenant_id = ? AND site_id = ? AND bot_id = ? AND candidate_id = ?
            ''', (tenant_id, site_id, bot_id, candidate_id)).fetchone()
            if row:
                data = dict(row)
                data['profile'] = json.loads(data['profile'])
                return AICandidateProfile(**data)
        finally:
            conn.close()
        return None

    def get_candidate_profile_by_id(self, profile_id: str) -> Optional[AICandidateProfile]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('SELECT * FROM ai_candidate_profiles WHERE id = ?', (profile_id,)).fetchone()
            if row:
                data = dict(row)
                data['profile'] = json.loads(data['profile'])
                return AICandidateProfile(**data)
        finally:
            conn.close()
        return None

    def list_candidate_profiles(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AICandidateProfile], int]:
        rows, total = self._get_paginated_results("ai_candidate_profiles", tenant_id, site_id, bot_id, page, page_size, filters)
        profiles = []
        for r in rows:
            r['profile'] = json.loads(r['profile'])
            profiles.append(AICandidateProfile(**r))
        return profiles, total

class AIJobDraftRepository(BaseRepository):
    def save_job_draft(self, draft: AIJobDraft):
        if not all([draft.tenant_id, draft.site_id, draft.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for job draft")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_job_drafts (id, tenant_id, site_id, bot_id, job_id, title, job_post, status, created_by, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (draft.id, draft.tenant_id, draft.site_id, draft.bot_id, draft.job_id, draft.title, json.dumps(draft.job_post), draft.status, draft.created_by, draft.created_at))
            conn.commit()
        finally:
            conn.close()

    def get_job_draft_by_id(self, draft_id: str) -> Optional[AIJobDraft]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('SELECT * FROM ai_job_drafts WHERE id = ?', (draft_id,)).fetchone()
            if row:
                data = dict(row)
                data['job_post'] = json.loads(data['job_post'])
                return AIJobDraft(**data)
        finally:
            conn.close()
        return None

    def list_job_drafts(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AIJobDraft], int]:
        rows, total = self._get_paginated_results("ai_job_drafts", tenant_id, site_id, bot_id, page, page_size, filters)
        drafts = []
        for r in rows:
            r['job_post'] = json.loads(r['job_post'])
            drafts.append(AIJobDraft(**r))
        return drafts, total

    def update_status(self, draft_id: str, status: str):
        conn = get_ai_db_connection()
        try:
            conn.execute('UPDATE ai_job_drafts SET status = ? WHERE id = ?', (status, draft_id))
            conn.commit()
        finally:
            conn.close()

class AIApplicationDraftRepository(BaseRepository):
    def save_application_draft(self, draft: AIApplicationDraft):
        if not all([draft.tenant_id, draft.site_id, draft.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for application draft")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_application_drafts (id, tenant_id, site_id, bot_id, candidate_id, job_ids, cover_letter_draft, status, requires_approval, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (draft.id, draft.tenant_id, draft.site_id, draft.bot_id, draft.candidate_id, json.dumps(draft.job_ids), draft.cover_letter_draft, draft.status, 1 if draft.requires_approval else 0, draft.created_at))
            conn.commit()
        finally:
            conn.close()

    def get_application_draft_by_id(self, draft_id: str) -> Optional[AIApplicationDraft]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('SELECT * FROM ai_application_drafts WHERE id = ?', (draft_id,)).fetchone()
            if row:
                data = dict(row)
                data['job_ids'] = json.loads(data['job_ids'])
                data['requires_approval'] = bool(data['requires_approval'])
                return AIApplicationDraft(**data)
        finally:
            conn.close()
        return None

    def list_application_drafts(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AIApplicationDraft], int]:
        rows, total = self._get_paginated_results("ai_application_drafts", tenant_id, site_id, bot_id, page, page_size, filters)
        drafts = []
        for r in rows:
            r['job_ids'] = json.loads(r['job_ids'])
            r['requires_approval'] = bool(r['requires_approval'])
            drafts.append(AIApplicationDraft(**r))
        return drafts, total

    def update_status(self, draft_id: str, status: str):
        conn = get_ai_db_connection()
        try:
            conn.execute('UPDATE ai_application_drafts SET status = ? WHERE id = ?', (status, draft_id))
            conn.commit()
        finally:
            conn.close()

class AIRankingRunRepository(BaseRepository):
    def save_ranking_run(self, run: AIRankingRun):
        if not all([run.tenant_id, run.site_id, run.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for ranking run")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_ranking_runs (id, tenant_id, site_id, bot_id, job_id, ranked_candidates, "limit", requires_human_review, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (run.id, run.tenant_id, run.site_id, run.bot_id, run.job_id, json.dumps(run.ranked_candidates), run.limit, 1 if run.requires_human_review else 0, run.created_at))
            conn.commit()
        finally:
            conn.close()

    def get_ranking_run_by_id(self, run_id: str) -> Optional[AIRankingRun]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('SELECT * FROM ai_ranking_runs WHERE id = ?', (run_id,)).fetchone()
            if row:
                data = dict(row)
                data['ranked_candidates'] = json.loads(data['ranked_candidates'])
                data['requires_human_review'] = bool(data['requires_human_review'])
                return AIRankingRun(**data)
        finally:
            conn.close()
        return None

    def list_ranking_runs(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AIRankingRun], int]:
        rows, total = self._get_paginated_results("ai_ranking_runs", tenant_id, site_id, bot_id, page, page_size, filters)
        runs = []
        for r in rows:
            r['ranked_candidates'] = json.loads(r['ranked_candidates'])
            r['requires_human_review'] = bool(r['requires_human_review'])
            runs.append(AIRankingRun(**r))
        return runs, total

class AIAuditRepository(BaseRepository):
    def append_event(self, event: AIAuditEvent):
        if not all([event.tenant_id, event.site_id, event.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for audit event")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_audit_events (id, tenant_id, site_id, bot_id, session_id, event_type, actor_type, action, model_trace, safety_flags, approval_required, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (event.id, event.tenant_id, event.site_id, event.bot_id, event.session_id, event.event_type, event.actor_type, event.action, json.dumps(event.model_trace), json.dumps(event.safety_flags), 1 if event.approval_required else 0, event.created_at))
            conn.commit()
        finally:
            conn.close()

    def list_audit_events(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AIAuditEvent], int]:
        rows, total = self._get_paginated_results("ai_audit_events", tenant_id, site_id, bot_id, page, page_size, filters)
        events = []
        for r in rows:
            r['model_trace'] = json.loads(r['model_trace'])
            r['safety_flags'] = json.loads(r['safety_flags'])
            r['approval_required'] = bool(r['approval_required'])
            events.append(AIAuditEvent(**r))
        return events, total

class AIApprovalDraftRepository(BaseRepository):
    def save_approval_draft(self, draft: AIApprovalDraft):
        if not all([draft.tenant_id, draft.site_id, draft.bot_id]):
            raise ValueError("tenant_id, site_id, and bot_id are required for approval draft")
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT OR REPLACE INTO ai_approval_drafts (
                    id, tenant_id, site_id, bot_id, action_type, draft_payload, 
                    risk_level, status, executed_at, executed_by, external_reference, 
                    error_message, idempotency_key, retry_count, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                draft.id, draft.tenant_id, draft.site_id, draft.bot_id, 
                draft.action_type, json.dumps(draft.draft_payload), 
                draft.risk_level, draft.status, draft.executed_at, 
                draft.executed_by, draft.external_reference, 
                draft.error_message, draft.idempotency_key, 
                draft.retry_count, draft.created_at
            ))
            conn.commit()
        finally:
            conn.close()

    def get_approval_draft_by_id(self, draft_id: str) -> Optional[AIApprovalDraft]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('SELECT * FROM ai_approval_drafts WHERE id = ?', (draft_id,)).fetchone()
            if row:
                data = dict(row)
                data['draft_payload'] = json.loads(data['draft_payload'])
                return AIApprovalDraft(**data)
        finally:
            conn.close()
        return None

    def list_approval_drafts(self, tenant_id: str, site_id: str, bot_id: str, page: int = 1, page_size: int = 20, filters: Optional[Dict[str, Any]] = None) -> Tuple[List[AIApprovalDraft], int]:
        rows, total = self._get_paginated_results("ai_approval_drafts", tenant_id, site_id, bot_id, page, page_size, filters)
        drafts = []
        for r in rows:
            r['draft_payload'] = json.loads(r['draft_payload'])
            drafts.append(AIApprovalDraft(**r))
        return drafts, total

    def update_status(self, draft_id: str, status: str):
        conn = get_ai_db_connection()
        try:
            conn.execute('UPDATE ai_approval_drafts SET status = ? WHERE id = ?', (status, draft_id))
            conn.commit()
        finally:
            conn.close()

    def update_execution_status(self, draft_id: str, status: str, external_ref: Optional[str] = None, error: Optional[str] = None, executed_by: Optional[str] = None):
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                UPDATE ai_approval_drafts 
                SET status = ?, external_reference = ?, error_message = ?, executed_by = ?, executed_at = ?
                WHERE id = ?
            ''', (status, external_ref, error, executed_by, datetime.now(), draft_id))
            conn.commit()
        finally:
            conn.close()

    def increment_retry_count(self, draft_id: str):
        conn = get_ai_db_connection()
        try:
            conn.execute('UPDATE ai_approval_drafts SET retry_count = retry_count + 1 WHERE id = ?', (draft_id,))
            conn.commit()
        finally:
            conn.close()

from services.agent.actions.validators import validate_connector_config

class AIConnectorConfigRepository:
    def save_config(self, config: AIConnectorConfig):
        # Fail-closed validation (Phase 7.2.1)
        validate_connector_config(config)
        
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT OR REPLACE INTO ai_connector_configs (
                    id, tenant_id, site_id, bot_id, action_type, connector_type,
                    enabled, environment, endpoint, allowed_host, auth_type,
                    secret_ref, timeout_seconds, max_retries, rate_limit_per_minute,
                    dry_run, onboarding_status, last_test_result, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (
                config.id, config.tenant_id, config.site_id, config.bot_id, config.action_type,
                config.connector_type, 1 if config.enabled else 0, config.environment,
                config.endpoint, config.allowed_host, config.auth_type, config.secret_ref,
                config.timeout_seconds, config.max_retries, config.rate_limit_per_minute,
                1 if config.dry_run else 0, config.onboarding_status,
                json.dumps(config.last_test_result) if config.last_test_result else None
            ))
            conn.commit()
        finally:
            conn.close()

    def disable_connector(self, tenant_id: str, site_id: str, bot_id: str, action_type: str):
        """
        Emergency Disable Mechanism (Phase 7.2.1).
        Sets enabled=0 without deleting history or config.
        """
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                UPDATE ai_connector_configs 
                SET enabled = 0, onboarding_status = 'disabled', updated_at = CURRENT_TIMESTAMP 
                WHERE tenant_id = ? AND site_id = ? AND bot_id = ? AND action_type = ?
            ''', (tenant_id, site_id, bot_id, action_type))
            conn.commit()
            
            # Log Audit Event
            audit_repo = AIAuditRepository()
            audit_repo.append_event(AIAuditEvent(
                tenant_id=tenant_id, site_id=site_id, bot_id=bot_id,
                event_type="connector_disabled",
                actor_type="admin",
                action=f"Emergency Disable: {action_type}",
                model_trace={"reason": "emergency_cutoff", "onboarding_status": "disabled"}
            ))
        finally:
            conn.close()

    def get_config(self, action_type: str, tenant_id: str, site_id: str, bot_id: str) -> Optional[AIConnectorConfig]:
        conn = get_ai_db_connection()
        try:
            cursor = conn.execute('''
                SELECT * FROM ai_connector_configs 
                WHERE action_type = ? AND tenant_id = ? AND site_id = ? AND bot_id = ?
            ''', (action_type, tenant_id, site_id, bot_id))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                d['enabled'] = bool(d['enabled'])
                d['dry_run'] = bool(d['dry_run'])
                d['last_test_result'] = json.loads(d['last_test_result']) if d.get('last_test_result') else None
                return AIConnectorConfig(**d)
            return None
        finally:
            conn.close()

    def list_configs(self, tenant_id: str, site_id: str, bot_id: str) -> List[AIConnectorConfig]:
        conn = get_ai_db_connection()
        try:
            cursor = conn.execute('SELECT * FROM ai_connector_configs WHERE tenant_id = ? AND site_id = ? AND bot_id = ?', (tenant_id, site_id, bot_id))
            configs = []
            for row in cursor.fetchall():
                d = dict(row)
                d['enabled'] = bool(d['enabled'])
                d['dry_run'] = bool(d['dry_run'])
                d['last_test_result'] = json.loads(d['last_test_result']) if d.get('last_test_result') else None
                configs.append(AIConnectorConfig(**d))
            return configs
        finally:
            conn.close()

    def update_onboarding_status(self, config_id: str, status: str, test_result: Optional[Dict[str, Any]] = None):
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                UPDATE ai_connector_configs 
                SET onboarding_status = ?, last_test_result = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ''', (status, json.dumps(test_result) if test_result else None, config_id))
            conn.commit()
        finally:
            conn.close()

    def get_config_by_id(self, config_id: str) -> Optional[AIConnectorConfig]:
        conn = get_ai_db_connection()
        try:
            cursor = conn.execute('SELECT * FROM ai_connector_configs WHERE id = ?', (config_id,))
            row = cursor.fetchone()
            if row:
                d = dict(row)
                d['enabled'] = bool(d['enabled'])
                d['dry_run'] = bool(d['dry_run'])
                d['last_test_result'] = json.loads(d['last_test_result']) if d.get('last_test_result') else None
                return AIConnectorConfig(**d)
            return None
        finally:
            conn.close()

class AIDeliveryLogRepository:
    def create_log(self, log: AIDeliveryLog):
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_delivery_logs (
                    id, tenant_id, site_id, bot_id, approval_id, action_type,
                    connector_type, status, attempt_count, external_reference,
                    status_code, error_message
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                log.id, log.tenant_id, log.site_id, log.bot_id, log.approval_id,
                log.action_type, log.connector_type, log.status, log.attempt_count,
                log.external_reference, log.status_code, log.error_message
            ))
            conn.commit()
        finally:
            conn.close()

    def update_log(self, log_id: str, status: str, external_ref: Optional[str] = None, 
                   status_code: Optional[int] = None, error: Optional[str] = None):
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                UPDATE ai_delivery_logs 
                SET status = ?, external_reference = ?, status_code = ?, 
                    error_message = ?, attempt_count = attempt_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (status, external_ref, status_code, error, log_id))
            conn.commit()
        finally:
            conn.close()

    def get_log_by_id(self, log_id: str) -> Optional[AIDeliveryLog]:
        conn = get_ai_db_connection()
        try:
            cursor = conn.execute("SELECT * FROM ai_delivery_logs WHERE id = ?", (log_id,))
            row = cursor.fetchone()
            if row:
                return AIDeliveryLog(**dict(row))
            return None
        finally:
            conn.close()

    def list_logs_for_approval(self, approval_id: str):
        conn = get_ai_db_connection()
        try:
            cursor = conn.execute("SELECT * FROM ai_delivery_logs WHERE approval_id = ? ORDER BY created_at DESC", (approval_id,))
            rows = cursor.fetchall()
            return [AIDeliveryLog(**dict(row)) for row in rows]
        finally:
            conn.close()
    def list_logs_for_bot(self, tenant_id: str, site_id: str, bot_id: str, limit: int = 100) -> List[AIDeliveryLog]:
        conn = get_ai_db_connection()
        try:
            cursor = conn.execute('''
                SELECT * FROM ai_delivery_logs 
                WHERE tenant_id = ? AND site_id = ? AND bot_id = ?
                ORDER BY created_at DESC LIMIT ?
            ''', (tenant_id, site_id, bot_id, limit))
            logs = []
            for row in cursor.fetchall():
                logs.append(AIDeliveryLog(**dict(row)))
            return logs
        finally:
            conn.close()

class AIInterviewSessionRepository:
    def save_session(self, session: AIInterviewSession):
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT OR REPLACE INTO ai_interview_sessions 
                (id, tenant_id, site_id, bot_id, job_id, candidate_id, status, consent_status, interview_plan, created_at, started_at, completed_at, expired_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                session.id, session.tenant_id, session.site_id, session.bot_id, session.job_id, session.candidate_id,
                session.status, session.consent_status, json.dumps(session.interview_plan) if session.interview_plan else None,
                session.created_at, session.started_at, session.completed_at, session.expired_at
            ))
            conn.commit()
        finally:
            conn.close()

    def get_session_by_id(self, session_id: str, tenant_id: str, site_id: str, bot_id: str) -> Optional[AIInterviewSession]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('''
                SELECT * FROM ai_interview_sessions 
                WHERE id = ? AND tenant_id = ? AND site_id = ? AND bot_id = ?
            ''', (session_id, tenant_id, site_id, bot_id)).fetchone()
            if not row: return None
            data = dict(row)
            if data['interview_plan']: data['interview_plan'] = json.loads(data['interview_plan'])
            return AIInterviewSession(**data)
        finally:
            conn.close()

    def list_sessions_by_candidate(self, candidate_id: str, tenant_id: str, site_id: str, bot_id: str) -> List[AIInterviewSession]:
        conn = get_ai_db_connection()
        try:
            rows = conn.execute('''
                SELECT * FROM ai_interview_sessions 
                WHERE candidate_id = ? AND tenant_id = ? AND site_id = ? AND bot_id = ?
                ORDER BY created_at DESC
            ''', (candidate_id, tenant_id, site_id, bot_id)).fetchall()
            sessions = []
            for row in rows:
                data = dict(row)
                if data['interview_plan']: data['interview_plan'] = json.loads(data['interview_plan'])
                sessions.append(AIInterviewSession(**data))
            return sessions
        finally:
            conn.close()

class AIInterviewMessageRepository:
    def save_message(self, message: AIInterviewMessage):
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT INTO ai_interview_messages 
                (id, interview_id, tenant_id, site_id, bot_id, sender, message, message_type, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                message.id, message.interview_id, message.tenant_id, message.site_id, message.bot_id,
                message.sender, message.message, message.message_type, message.created_at
            ))
            conn.commit()
        finally:
            conn.close()

    def list_messages_by_interview(self, interview_id: str, tenant_id: str, site_id: str, bot_id: str) -> List[AIInterviewMessage]:
        conn = get_ai_db_connection()
        try:
            rows = conn.execute('''
                SELECT * FROM ai_interview_messages 
                WHERE interview_id = ? AND tenant_id = ? AND site_id = ? AND bot_id = ?
                ORDER BY created_at ASC
            ''', (interview_id, tenant_id, site_id, bot_id)).fetchall()
            return [AIInterviewMessage(**dict(row)) for row in rows]
        finally:
            conn.close()

class AIInterviewReportRepository:
    def save_report(self, report: AIInterviewReport):
        conn = get_ai_db_connection()
        try:
            conn.execute('''
                INSERT OR REPLACE INTO ai_interview_reports 
                (id, interview_id, tenant_id, site_id, bot_id, candidate_id, job_id, 
                 technical_score, communication_score, job_fit_score, strengths, concerns, 
                 salary_expectation, availability, candidate_questions, relevant_quotes, 
                 recommendation, summary_for_company, requires_human_review, full_transcript_revealed, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                report.id, report.interview_id, report.tenant_id, report.site_id, report.bot_id, 
                report.candidate_id, report.job_id, report.technical_score, report.communication_score, 
                report.job_fit_score, json.dumps(report.strengths), json.dumps(report.concerns),
                report.salary_expectation, report.availability, json.dumps(report.candidate_questions),
                json.dumps(report.relevant_quotes), report.recommendation, report.summary_for_company,
                1 if report.requires_human_review else 0, 1 if report.full_transcript_revealed else 0, report.created_at
            ))
            conn.commit()
        finally:
            conn.close()

    def get_report_by_interview(self, interview_id: str, tenant_id: str, site_id: str, bot_id: str) -> Optional[AIInterviewReport]:
        conn = get_ai_db_connection()
        try:
            row = conn.execute('''
                SELECT * FROM ai_interview_reports 
                WHERE interview_id = ? AND tenant_id = ? AND site_id = ? AND bot_id = ?
            ''', (interview_id, tenant_id, site_id, bot_id)).fetchone()
            if not row: return None
            data = dict(row)
            data['strengths'] = json.loads(data['strengths'])
            data['concerns'] = json.loads(data['concerns'])
            data['candidate_questions'] = json.loads(data['candidate_questions'])
            data['relevant_quotes'] = json.loads(data['relevant_quotes'])
            data['requires_human_review'] = bool(data['requires_human_review'])
            return AIInterviewReport(**data)
        finally:
            conn.close()
