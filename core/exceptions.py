"""
Custom Exceptions for Services Layer
Provides specific exception types for better error handling
"""


class ServiceException(Exception):
    """Base exception for all service-related errors"""
    
    def __init__(self, message: str, details: dict | None = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)
    
    def __str__(self):
        if self.details:
            return f"{self.message} | Details: {self.details}"
        return self.message


# Ollama Service Exceptions
class OllamaException(ServiceException):
    """Base exception for Ollama-related errors"""
    pass


class OllamaConnectionError(OllamaException):
    """Raised when cannot connect to Ollama"""
    
    def __init__(self, url: str, reason: str):
        super().__init__(
            f"Cannot connect to Ollama at {url}",
            {"url": url, "reason": reason}
        )


class OllamaGenerationError(OllamaException):
    """Raised when text generation fails"""
    
    def __init__(self, model: str, reason: str):
        super().__init__(
            f"Generation failed with model {model}",
            {"model": model, "reason": reason}
        )


class OllamaModelNotFoundError(OllamaException):
    """Raised when requested model is not installed"""
    
    def __init__(self, model_name: str):
        super().__init__(
            f"Model '{model_name}' not found",
            {"model": model_name}
        )


# Knowledge Base Exceptions
class KnowledgeBaseException(ServiceException):
    """Base exception for knowledge base errors"""
    pass


class EmbeddingError(KnowledgeBaseException):
    """Raised when embedding generation fails"""
    
    def __init__(self, reason: str):
        super().__init__(f"Embedding generation failed: {reason}")


class IndexingError(KnowledgeBaseException):
    """Raised when document indexing fails"""
    
    def __init__(self, doc_id: str, reason: str):
        super().__init__(
            f"Failed to index document",
            {"doc_id": doc_id, "reason": reason}
        )


class SearchError(KnowledgeBaseException):
    """Raised when vector search fails"""
    
    def __init__(self, query: str, reason: str):
        super().__init__(
            f"Search failed for query",
            {"query": query[:50], "reason": reason}
        )


# Document Processing Exceptions
class DocumentProcessingException(ServiceException):
    """Base exception for document processing errors"""
    pass


class UnsupportedFileTypeError(DocumentProcessingException):
    """Raised when file type is not supported"""
    
    def __init__(self, file_type: str, supported_types: list):
        super().__init__(
            f"Unsupported file type: {file_type}",
            {"file_type": file_type, "supported": supported_types}
        )


class FileExtractionError(DocumentProcessingException):
    """Raised when text extraction from file fails"""
    
    def __init__(self, file_path: str, file_type: str, reason: str):
        super().__init__(
            f"Failed to extract text from {file_type} file",
            {"file_path": file_path, "file_type": file_type, "reason": reason}
        )


# AI Service Exceptions
class AIServiceException(ServiceException):
    """Base exception for AI service errors"""
    pass


class ModelConfigurationError(AIServiceException):
    """Raised when model configuration is invalid"""
    
    def __init__(self, reason: str):
        super().__init__(f"Invalid model configuration: {reason}")


class ResponseGenerationError(AIServiceException):
    """Raised when response generation fails"""
    
    def __init__(self, reason: str):
        super().__init__(f"Response generation failed: {reason}")


# NLP Service Exceptions
class NLPException(ServiceException):
    """Base exception for NLP service errors"""
    pass


class LanguageDetectionError(NLPException):
    """Raised when language detection fails"""
    pass


class IntentDetectionError(NLPException):
    """Raised when intent detection fails"""
    pass


# Memory Service Exceptions
class MemoryException(ServiceException):
    """Base exception for memory service errors"""
    pass


class SessionNotFoundError(MemoryException):
    """Raised when session is not found or expired"""
    
    def __init__(self, session_id: str):
        super().__init__(
            f"Session not found or expired",
            {"session_id": session_id}
        )


# Web Crawler Exceptions
class WebCrawlerException(ServiceException):
    """Base exception for web crawler errors"""
    pass


class WebCrawlerError(WebCrawlerException):
    """Raised when web crawling fails"""
    
    def __init__(self, url: str, reason: str):
        super().__init__(
            f"Failed to crawl URL: {url}",
            {"url": url, "reason": reason}
        )


class InvalidURLError(WebCrawlerException):
    """Raised when URL is invalid or inaccessible"""
    
    def __init__(self, url: str):
        super().__init__(
            f"Invalid or inaccessible URL: {url}",
            {"url": url}
        )

