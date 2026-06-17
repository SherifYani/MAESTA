#!/bin/bash
# Entrypoint script for MAESTA Chatbot Docker container
# Handles database initialization, waits for dependencies, and starts the app

set -e

echo "🚀 Starting MAESTA Chatbot..."

# Wait for Ollama
echo "⏳ Waiting for Ollama at $OLLAMA_BASE_URL..."
until curl -sf "$OLLAMA_BASE_URL/api/tags" > /dev/null; do
    echo "   Waiting for Ollama..."
    sleep 5
done
echo "✅ Ollama is ready!"

# Check if required models are available
echo "🔍 Checking Ollama models..."
MODELS=("qwen3:1.7b" "nomic-embed-text:latest")
for model in "${MODELS[@]}"; do
    if ! curl -sf "$OLLAMA_BASE_URL/api/show" -d "{\"name\":\"$model\"}" > /dev/null; then
        echo "   Pulling $model..."
        curl -s "$OLLAMA_BASE_URL/api/pull" -d "{\"name\":\"$model\"}" > /dev/null
        echo "   ✅ $model pulled"
    else
        echo "   ✅ $model already available"
    fi
done

# Wait for Redis (optional)
if [ -n "$REDIS_URL" ]; then
    REDIS_HOST=$(echo $REDIS_URL | sed -E 's|redis://([^:]+):.*|\1|')
    REDIS_PORT=$(echo $REDIS_URL | sed -E 's|redis://[^:]+:([0-9]+).*|\1|')
    echo "⏳ Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
    until nc -z "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; do
        echo "   Waiting for Redis..."
        sleep 3
    done
    echo "✅ Redis is ready!"
fi

# Initialize database
echo "🗄️ Initializing database..."
python -c "
from models import database
database.init_db()
print('✅ Database initialized')
"

# Create necessary directories
mkdir -p /app/data /app/uploads /app/static

echo "🎉 All checks passed! Starting Flask app..."
echo "🌐 Server will be available at http://0.0.0.0:5000"

# Start the application
exec gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 --access-logfile - --error-logfile - main:create_app()