---
title: MAESTA Qwen3 1.7B API
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# MAESTA Qwen3 1.7B API

> ⚠️ هذا الـ Space مخصص لـ MAESTA demo فقط — ليس production deployment.

يشغّل هذا الـ Space موديل **Qwen3-1.7B** (GGUF format) كـ OpenAI-compatible REST API
على CPU Basic Free hardware.

---

## 🚀 Base URL

```
https://aboamin27-maesta-qwen3-1-7b-api.hf.space
```

---

## ⚙️ إعداد الـ Space (مطلوب قبل التشغيل)

بعد رفع الملفات، اذهب إلى **Settings → Secrets and Variables** واضبط:

### 🔐 Secrets (مخفية — لا تظهر في الكود أبدًا)

| Key | Value |
|-----|-------|
| `LLM_API_TOKEN` | توكن قوي وطويل من اختيارك |

### 🔧 Variables (ظاهرة — قيم افتراضية)

| Key | Default Value |
|-----|---------------|
| `MODEL_REPO` | `Qwen/Qwen3-1.7B-GGUF` |
| `MODEL_FILE` | `Qwen3-1.7B-Q8_0.gguf` |
| `N_CTX` | `2048` |
| `N_THREADS` | `2` |
| `MAX_TOKENS_DEFAULT` | `300` |

---

## 📡 Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | ❌ |
| GET | `/health` | ❌ |
| GET | `/v1/models` | ❌ |
| POST | `/v1/chat/completions` | ✅ Bearer Token |

---

## 🧪 أمثلة cURL

### Health Check
```bash
curl https://aboamin27-maesta-qwen3-1-7b-api.hf.space/health
```

### قائمة الموديلات
```bash
curl https://aboamin27-maesta-qwen3-1-7b-api.hf.space/v1/models
```

### Chat — بدون توكن (يرجع 401)
```bash
curl -X POST https://aboamin27-maesta-qwen3-1-7b-api.hf.space/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

### Chat — مع توكن
```bash
curl -X POST https://aboamin27-maesta-qwen3-1-7b-api.hf.space/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "model": "qwen3-1.7b",
    "messages": [
      {"role": "system", "content": "رد باللغة العربية فقط وباختصار."},
      {"role": "user", "content": "اسمك ايه؟"}
    ],
    "max_tokens": 80,
    "temperature": 0.3
  }'
```

---

## 🔗 إعدادات مشروع MAESTA الأساسي

أضف المتغيرات التالية في `.env` الخاص بمشروع MAESTA:

```env
# Fine-tuned Model (Qwen3 via HF Space)
FINETUNED_MODEL_BASE_URL=https://aboamin27-maesta-qwen3-1-7b-api.hf.space/v1
FINETUNED_MODEL_NAME=qwen3-1.7b
FINETUNED_MODEL_API_KEY=YOUR_TOKEN

# Utility Model (نفس الـ Space)
UTILITY_MODEL_BASE_URL=https://aboamin27-maesta-qwen3-1-7b-api.hf.space/v1
UTILITY_MODEL_NAME=qwen3-1.7b
UTILITY_MODEL_API_KEY=YOUR_TOKEN
```

---

## ✅ Response Format (OpenAI-compatible)

```json
{
  "id": "chatcmpl-maesta",
  "object": "chat.completion",
  "model": "qwen3-1.7b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  },
  "maesta": {
    "latency_seconds": 1.23
  }
}
```

---

## ⚠️ تحذيرات مهمة

- **لا** تضع `LLM_API_TOKEN` داخل الكود — استخدم Secrets فقط.
- هذا الـ Space يشغّل **موديل واحد فقط** — لا قاعدة بيانات، لا RAG، لا tenants.
- وقت الاستجابة على CPU قد يصل إلى **30-60 ثانية** حسب طول الرد.
- إذا فشل الـ build بسبب `llama-cpp-python`، راجع Build Logs وتأكد من `CMAKE_ARGS`.
