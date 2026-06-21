#!/bin/bash
# ============================================================
# MAESTA - Docker Hub Push Script
# Usage: chmod +x push-to-dockerhub.sh && ./push-to-dockerhub.sh
# ============================================================

set -e

DOCKER_USER="sherifyani"
API_IMAGE="$DOCKER_USER/maesta-api"
FRONTEND_IMAGE="$DOCKER_USER/maesta-frontend"
TAG="latest"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║        MAESTA — Docker Hub Push Script              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Login ────────────────────────────────────────────
echo "📦  Step 1: Logging in to Docker Hub..."
docker login
echo ""

# ── Step 2: Build API ────────────────────────────────────────
echo "🔨  Step 2: Building API image..."
docker build \
  -t "$API_IMAGE:$TAG" \
  -f "$PROJECT_DIR/Dockerfile" \
  "$PROJECT_DIR"
echo "✅  API image built: $API_IMAGE:$TAG"
echo ""

# ── Step 3: Build Frontend ───────────────────────────────────
echo "🔨  Step 3: Building Frontend image..."
docker build \
  -t "$FRONTEND_IMAGE:$TAG" \
  -f "$PROJECT_DIR/Frontend/Dockerfile" \
  "$PROJECT_DIR/Frontend"
echo "✅  Frontend image built: $FRONTEND_IMAGE:$TAG"
echo ""

# ── Step 4: Push API ─────────────────────────────────────────
echo "🚀  Step 4: Pushing API image to Docker Hub..."
docker push "$API_IMAGE:$TAG"
echo "✅  Pushed: $API_IMAGE:$TAG"
echo ""

# ── Step 5: Push Frontend ────────────────────────────────────
echo "🚀  Step 5: Pushing Frontend image to Docker Hub..."
docker push "$FRONTEND_IMAGE:$TAG"
echo "✅  Pushed: $FRONTEND_IMAGE:$TAG"
echo ""

echo "╔══════════════════════════════════════════════════════╗"
echo "║            ✅  All images pushed!                   ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  API:      docker.io/$API_IMAGE:$TAG"
echo "║  Frontend: docker.io/$FRONTEND_IMAGE:$TAG"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "To run the full stack anywhere:"
echo "  docker compose up -d"
echo ""
