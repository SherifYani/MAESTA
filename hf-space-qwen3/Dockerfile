# ─────────────────────────────────────────────────────────────────────────────
# Hugging Face Docker Space — MAESTA Qwen3 1.7B API
# Port: 7860 (required by HF Spaces)
# Hardware: CPU Basic Free
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# ── System deps needed to compile llama-cpp-python on CPU ────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── Non-root user (HF Spaces requirement) ────────────────────────────────────
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# ── Install Python dependencies ───────────────────────────────────────────────
COPY --chown=user ./requirements.txt requirements.txt

# Force llama-cpp-python to build for CPU only (no CUDA/Metal)
ENV CMAKE_ARGS="-DGGML_BLAS=OFF -DGGML_CUDA=OFF -DGGML_METAL=OFF"
ENV FORCE_CMAKE=1

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# ── Copy application code ─────────────────────────────────────────────────────
COPY --chown=user . /app

# ── HF Spaces must listen on port 7860 ───────────────────────────────────────
ENV PORT=7860
EXPOSE 7860

# ── Start server ──────────────────────────────────────────────────────────────
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "1"]
