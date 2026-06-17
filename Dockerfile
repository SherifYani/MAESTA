# Multi-stage build for smaller image
FROM python:3.11-slim as builder

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /home/app/.local

# Copy application code
COPY --chown=app:app . .

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R app:app /app/data

# Switch to non-root user
USER app

# Add local packages to PATH
ENV PATH=/home/app/.local/bin:$PATH
ENV PYTHONPATH=/app

# Environment variables
ENV FLASK_APP=main.py
ENV FLASK_ENV=production
ENV DATABASE_PATH=/app/data/chatbot.db
ENV OLLAMA_BASE_URL=http://ollama:11434
ENV REDIS_URL=redis://redis:6379

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "main:create_app()"]