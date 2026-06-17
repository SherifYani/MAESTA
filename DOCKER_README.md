# MAESTA Chatbot - Docker Deployment Guide

## 🐳 Quick Start

```bash
# Clone the repository
git clone https://github.com/SherifYani/MAESTA.git
cd MAESTA

# Copy environment template
cp .env.example .env

# Edit .env with your settings (at minimum change SECRET_KEY and passwords)
nano .env

# Start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f app
```

## 📋 Services Included

| Service | Port | Description |
|---------|------|-------------|
| **app** | 5000 | Flask main application |
| **ollama** | 11434 | Local LLM server (qwen3:1.7b + nomic-embed-text) |
| **redis** | 6379 | Cache (optional, falls back to in-memory) |

## 🔧 Configuration

Edit `.env` file with your settings:

```bash
# Minimum required changes:
SECRET_KEY=your-random-secret-key-here
ADMIN_PASSWORD=your-secure-password
```

### Important Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | **required** | Flask secret for sessions |
| `ADMIN_PASSWORD` | admin123 | Admin panel password |
| `OLLAMA_BASE_URL` | http://ollama:11434 | Ollama service URL |
| `REDIS_URL` | redis://redis:6379 | Redis connection |
| `DEFAULT_MODEL` | qwen3:1.7b | LLM model to use |

## 🚀 First Run (Pulls Models)

First run takes 5-10 minutes to pull Ollama models:

```bash
docker-compose up -d --build
docker-compose logs -f ollama  # Watch model downloads
```

Models downloaded automatically:
- `qwen3:1.7b` (~1.4GB) - Main LLM
- `nomic-embed-text:latest` (~274MB) - Embeddings

## 📊 Access Points

| Interface | URL |
|-----------|-----|
| Main App | http://localhost:5000 |
| Admin Panel | http://localhost:5000/admin |
| Interview Dashboard | http://localhost:5000/interview |
| ATS System | http://localhost:5000/ats |
| API Health | http://localhost:5000/api/v1/health |

## 🔄 Common Commands

```bash
# View logs
docker-compose logs -f app

# Restart single service
docker-compose restart app

# Rebuild after code changes
docker-compose up -d --build app

# Stop everything
docker-compose down

# Stop + remove volumes (fresh start)
docker-compose down -v

# Shell into app container
docker-compose exec app bash

# View Ollama models
docker-compose exec ollama ollama list
```

## 💾 Data Persistence

Volumes created automatically:
- `app_data` - SQLite database + uploads
- `ollama_data` - Pulled models
- `redis_data` - Cache data

Backup: `docker cp maesta-app:/app/data ./backup`

## 🔧 Troubleshooting

### Ollama Connection Refused
```bash
# Check Ollama status
docker-compose logs ollama

# Restart Ollama
docker-compose restart ollama

# Manual model pull
docker-compose exec ollama ollama pull qwen3:1.7b
```

### App Won't Start
```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. SECRET_KEY not set in .env
# 2. Database permission issues
# 3. Port 5000 already in use
```

### Model Not Found
```bash
# Pull manually
docker-compose exec ollama ollama pull qwen3:1.7b
docker-compose exec ollama ollama pull nomic-embed-text:latest
```

## 🏗️ Production Deployment

1. **Use strong secrets:**
   ```bash
   # Generate secure secret
   openssl rand -hex 32
   ```

2. **Use reverse proxy (nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Enable HTTPS** with Let's Encrypt / Certbot

4. **Monitor resources** - Ollama needs ~4GB RAM minimum

## 📦 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    Nginx    │────▶│    App      │
│  (Browser)  │     │  (Optional) │     │  (Flask)    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐             │
                    │   Ollama    │◀────────────┤
                    │  (LLM API)  │             │
                    └─────────────┘             │
                                               │
                    ┌─────────────┐             │
                    │   Redis     │◀────────────┘
                    │  (Cache)    │
                    └─────────────┘
```

## 📝 License

MIT License - See LICENSE file for details.