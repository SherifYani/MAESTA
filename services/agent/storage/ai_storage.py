from .repositories import (
    AIDocumentRepository, AIMemoryRepository, AICandidateProfileRepository,
    AIJobDraftRepository, AIApplicationDraftRepository, AIRankingRunRepository,
    AIAuditRepository, AIApprovalDraftRepository, AIConnectorConfigRepository,
    AIDeliveryLogRepository, AIInterviewSessionRepository, AIInterviewMessageRepository,
    AIInterviewReportRepository
)
from .ai_database import init_ai_db

class AIStorage:
    def __init__(self):
        self.documents = AIDocumentRepository()
        self.memory = AIMemoryRepository()
        self.candidates = AICandidateProfileRepository()
        self.job_drafts = AIJobDraftRepository()
        self.application_drafts = AIApplicationDraftRepository()
        self.ranking_runs = AIRankingRunRepository()
        self.audit = AIAuditRepository()
        self.approvals = AIApprovalDraftRepository()
        self.interviews = AIInterviewSessionRepository()
        self.messages = AIInterviewMessageRepository()
        self.reports = AIInterviewReportRepository()
        self.connectors = AIConnectorConfigRepository()
        self.delivery_logs = AIDeliveryLogRepository()

    @staticmethod
    def initialize():
        init_ai_db()

# Singleton instance
ai_storage = AIStorage()
