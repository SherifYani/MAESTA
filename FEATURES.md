# 🏗️ MAESTA Chat Bot — التوثيق الكامل للميزات

> **منصة توظيف ذكية متعددة المستأجرين (Multi-Tenant)** مع محادثة RAG + توليد اختبارات + مقابلات مدعومة بالذكاء الاصطناعي + نظام تتبع للمرشحين.

---

## 🗂️ فهرس الملفات

```
main.py                          ← مدخل التطبيق (Flask App Factory)
config.py                        ← الإعدادات والثوابت
init_db.py                       ← تهيئة قاعدة بيانات AI STORAGE

controllers/
├── register.py                  ← تسجيل 8 Blueprints
├── auth.py                      ← تسجيل الدخول + decorators
├── admin.py                     ← لوحة التحكم (20+ route)
├── api.py                       ← Public API (v1/chat, health, stats)
├── quiz.py                      ← Quiz API (generate, list)
└── ats.py                       ← ATS (رفع CV, تحليل, عرض)

models/
└── database.py                  ← SQLite layer (كل CRUD لكل جدول)

core/
├── logger.py                    ← ColoredFormatter + ملف
├── sentry_init.py               ← Sentry SDK
└── exceptions.py                ← ServiceException hierarchy

services/
├── ollama_service.py            ← عميل Ollama (HTTP + OpenAI-compatible)
├── agent/                       ← LangGraph Supervisor + Sub-Agents
│   ├── state.py                 ← AgentState (Pydantic)
│   ├── supervisor.py            ← Router (Gemini → Local LLM → Keyword)
│   ├── tools_registry.py        ← الأدوات (calculator)
│   ├── tools/
│   │   └── web_crawler.py       ← زاحف ويب (Scrapling)
│   ├── agents/
│   │   ├── chat_agent.py        ← ReAct Agent (LangGraph)
│   │   ├── rag_graph.py         ← RAG Pipeline (6 Nodes)
│   │   ├── quiz_agent.py        ← Expert Teacher Agent
│   │   └── company_prompt.py    ← System Prompt Builder
│   ├── rag/
│   │   ├── knowledge_base.py    ← FAISS + BM25 Hybrid Search
│   │   ├── vector_backend.py    ← FaissVectorStore / PgVectorStore
│   │   ├── document_processor.py← PDF/DOCX/CSV/TXT/XLSX extraction
│   │   └── graph_extractor.py   ← Knowledge Graph من النصوص
│   ├── llm/
│   │   ├── provider_interface.py← واجهة كل LLM Provider
│   │   ├── openai_compatible_client.py ← HTTP client
│   │   ├── utility_llm.py       ← qwen3-coder (JSON/تحليل)
│   │   ├── answer_generator.py  ← qwen3-company-assistant (ردود)
│   │   ├── dual_llm_orchestrator.py ← Draft-and-Verify Architecture
│   │   ├── gemini_provider.py   ← Google Gemini (تصنيف + تدقيق)
│   │   ├── claude_provider.py   ← Claude via OpenRouter
│   │   ├── llama_provider.py    ← Ollama async (aiohttp)
│   │   ├── janus_provider.py    ← DeepSeek Janus-Pro Colab
│   │   └── prompts/prompts.py   ← القوالب النصية
│   ├── storage/
│   │   ├── ai_database.py       ← جداول AI STORAGE (15 جدول)
│   │   ├── ai_storage.py        ← AIStorage singleton (13 repository)
│   │   ├── schemas.py           ← Pydantic models للجداول
│   │   ├── repositories.py      ← CRUD لكل جدول
│   │   ├── tenant_guard.py      ← Security: tenant isolation
│   │   └── migrate_p8_1.py      ← ترحيل قاعدة البيانات
│   ├── skills/
│   │   ├── base_skill.py        ← BaseSkill (ABC)
│   │   ├── skill_router.py      ← توجيه الطلبات للمهارات
│   │   └── hiring/              ← مهارة التوظيف
│   │       ├── hiring_skill.py  ← المدخل الرئيسي (13 intent)
│   │       ├── schemas.py       ← CandidateProfile, JobPost, ...
│   │       ├── cv_parser.py     ← تحليل CV مع injection scan
│   │       ├── skill_normalizer.py ← تطبيع المهارات (65+ mapping)
│   │       ├── job_parser.py    ← تحليل Job Post
│   │       ├── scoring_engine.py← تسجيل منطقي (7 أبعاد)
│   │       ├── evidence_builder.py ← بناء الأدلة
│   │       ├── job_matcher.py   ← مطابقة CV مع الوظائف
│   │       ├── applicant_ranker.py ← ترتيب المتقدمين
│   │       ├── employer_assistant.py ← مساعد صاحب العمل
│   │       ├── interview_schemas.py  ← Interview schemas
│   │       ├── interview_safety.py   ← حماية المقابلات
│   │       ├── interview_rubric.py   ← معيار التقييم
│   │       ├── interview_runner.py   ← تشغيل المقابلة
│   │       ├── interview_consent_service.py ← الموافقة
│   │       ├── interview_question_generator.py ← توليد الأسئلة
│   │       ├── interview_report_builder.py ← بناء التقرير
│   │       └── transcript_privacy.py ← إخفاء البيانات الحساسة
│   └── actions/                 ← نظام الإجراءات (Phase 7)
│       ├── schemas.py           ← ActionExecutionRequest/Result
│       ├── validators.py        ← التحقق من صحة الإجراءات
│       ├── idempotency.py       ← منع التكرار
│       ├── connector_registry.py← تسجيل الموصّلات
│       ├── connector_onboarding.py ← إعداد الموصّل
│       ├── action_executor.py   ← تنفيذ الإجراءات المعتمدة
│       └── connectors/
│           ├── mock_connector.py← موصّل وهمي
│           ├── webhook_connector.py ← Webhook (HMAC, SSRF)
│           └── email_connector.py   ← إيميل (sandbox)
├── cvs/
│   └── ats_pipeline.py          ← FAISS + LLM Ranking
├── quiz/
│   ├── quizzes_pipeline.py      ← 5 مراحل أساسية
│   └── teacher_quizzes_pipeline.py← 5 مراحل احترافية
└── interview/                   ← نظام المقابلات LangGraph (25+ ملف)
    ├── interview_service.py     ← المدخل الرئيسي
    ├── cache/redis_cache.py     ← Redis + In-Memory fallback
    ├── schemas/
    │   ├── dto.py               ← StartInterview, SubmitAnswer, ...
    │   └── interview_models.py  ← Session, Question, Answer, ...
    ├── generators/
    │   ├── question_generator.py    ← توليد الأسئلة
    │   ├── followup_generator.py   ← أسئلة متابعة ديناميكية
    │   └── prompt_templates.py     ← القوالب النصية
    ├── evaluators/
    │   ├── answer_evaluator.py     ← تقييم الإجابات (Hybrid)
    │   ├── consistency_checker.py  ← 7 أنواع مخاطر
    │   ├── confidence_calculator.py← الثقة في التقييم
    │   └── skill_verifier.py       ← التحقق من المهارات
    ├── knowledge/
    │   ├── skill_rubrics.py        ← 8 مجالات مهارية
    │   ├── skill_knowledge_base.py ← قاعدة المعرفة المهارية
    │   └── concept_matcher.py      ← مطابقة المفاهيم
    ├── memory/
    │   ├── claim_tracker.py        ← استخراج الادعاءات
    │   ├── contradiction_detector.py← كشف التناقضات
    │   └── interview_memory.py     ← ذاكرة المقابلة
    ├── security/
    │   ├── behavior_analyzer.py    ← تحليل السلوك
    │   └── anti_cheat.py           ← كشف الغش
    ├── challenges/
    │   ├── challenge_models.py     ← Pydantic models
    │   ├── challenge_generator.py  ← توليد التحدي
    │   └── challenge_evaluator.py  ← تقييم (Correctness/Quality/Efficiency)
    ├── analytics/
    │   ├── benchmark_engine.py     ← Percentile comparison
    │   └── candidate_comparison.py ← مقارنة المرشحين
    ├── reports/
    │   ├── final_report.py         ← التقرير النهائي + Recruiter Copilot
    │   └── report_templates.py     ← قوالب Markdown/HTML
    └── graph/
        ├── interview_state.py      ← TypedDict state (35+ حقل)
        ├── interview_graph.py      ← 13 Node LangGraph workflow
        └── nodes/
            ├── load_candidate.py   ← تحميل بيانات المرشح
            ├── skill_extractor.py  ← استخراج المهارات
            ├── question_node.py    ← توليد السؤال
            ├── evaluator_node.py   ← تقييم الإجابة
            ├── consistency_node.py ← تحليل الاتساق
            ├── anti_cheat_node.py  ← كشف الغش
            ├── challenge_node.py   ← التحدي البرمجي
            ├── benchmark_node.py   ← المقارنة المعيارية
            └── final_report_node.py← التقرير النهائي

chatbot/
└── routes/
    ├── admin_ai.py               ← لوحة AI (20+ route)
    └── candidate_interview.py    ← مقابلة المرشح (UI)

templates/
├── base.html                     ← الهيكل الأساسي
├── interview_dashboard.html      ← لوحة المقابلات
├── interview_session.html        ← جلسة المقابلة (299 سطر)
├── interview_challenge_test.html ← اختبار التحدي
├── interview_analytics.html      ← التحليلات
└── candidate/interview.html      ← واجهة المرشح

tests/
└── interview/
    ├── test_interview_service.py ← 5 فئات اختبار
    └── test_interview_models.py  ← اختبارات الـ Pydantic models
```

---

## 🏗️ 1. نظام المحادثة الأساسي (Chat/RAG)

### 1.1 Supervisor Agent — توجيه الطلبات
**الملف:** `services/agent/supervisor.py`

يستقبل كل رسالة من المستخدم ويقرر أي وكيل سيعالجها:
1. **Gemini Flash (Fast Path ~100ms):** إذا كان مفتاح Gemini API متاحًا، يُستخدم للتصنيف السريع
2. **Keyword Pre-filter (Very Fast):** فحص الكلمات المفتاحية العربية/الإنجليزية
3. **Local LLM (Slow Path):** استخدام موديل Ollama المحلي كحل أخير

**التوجيهات المتاحة:** `RAG` (أسئلة معلوماتية) / `CHAT` (ترحيب + حوار عام)

### 1.2 RAG Pipeline — 6 Nodes
**الملف:** `services/agent/agents/rag_graph.py`

```
Query Analyzer → Retriever → Relevance Grader → [Generator | Query Rewriter] → Hallucination Checker
```

1. **Query Analyzer:** كشف اللغة (عربي/إنجليزي)، كشف النية (اسم المشروع/نظرة عامة/عام)، توسيع الاستعلام
2. **Retriever:** بحث هجين (FAISS Vector + BM25 Keyword) مع دمج النتائج
3. **Relevance Grader:** تصفية قائمة على القواعد (بدون LLM) — تحقق من الكلمات المفتاحية
4. **Generator:** بناء السياق من المستندات الكاملة (بدل الـ chunks)، تحميل ملف الشركة، استدعاء LLM مع post-processing (إزالة <think>، استبدال "MAESTA" باسم الشركة، Sanitizer)
5. **Hallucination Checker:** يمر دائمًا (قاعدة بسيطة)
6. **Query Rewriter:** إعادة صياغة الاستعلام عند عدم وجود نتائج

### 1.3 Chat Agent — ReAct Loop
**الملف:** `services/agent/agents/chat_agent.py`

- يستخدم LangGraph مع حلقة `agent → tools → agent`
- الأدوات المتاحة: `calculator` (تعبيرات رياضية آمنة)
- حد أقصى لعدد التكرارات `MAX_ITERATIONS` لمنع الحلقات اللانهائية مع الموديلات الصغيرة
- يستخدم Company Prompt الديناميكي إذا كان `COMPANY_ASSISTANT_MODE` مفعلًا

### 1.4 Knowledge Base — FAISS + BM25 Hybrid
**الملف:** `services/agent/rag/knowledge_base.py`

- **محركان للبحث:** FAISS (Vector) + BM25 (Keyword) في وقت واحد
- **الدمج الهجين:** وزن ديناميكي حسب نوع الاستعلام:
  - استعلام تقني (≥2 كلمة تقنية) ← `α = 0.4` (BM25 أغلب)
  - استعلام وصفي طويل ← `α = 0.7` (Vector أغلب)
  - عام ← `α = 0.5` (متوازن)
- **إعادة الترتيب:** تعزيز الـ chunks التي تحتوي على كلمات الاستعلام
- **إزالة التكرار:** منع الـ chunks المتماثلة
- **عزل المستأجرين (Multi-Tenant):** تصفية لاحقة حسب `tenant_id`/`site_id`/`bot_id`
- **تحميل خلفي:** تحميل موديل التضمين في Thread منفصل عند بدء التشغيل
- **إعادة الفهرسة:** في Thread خلفي عند بدء التشغيل إذا كانت قاعدة البيانات تحتوي على مستندات

### 1.5 Document Processor — معالجة الملفات
**الملف:** `services/agent/rag/document_processor.py`

- **الأنواع المدعومة:** PDF, DOCX, CSV, XLSX, TXT
- **PDF:** pdfminer.six أولاً (للغة العربية)، ثم PyPDF2 كاحتياطي
- **التقطيع (Chunking):** استراتيجيتان:
  1. **Semantic Chunking:** تقسيم حسب الرؤوس (Markdown headers, numbered items, ALL CAPS)
  2. **Paragraph-based:** تقليدي بحد أقصى للحجم وتداخل (overlap)

### 1.6 Graph Extractor — مستخرج المعرفة
**الملف:** `services/agent/rag/graph_extractor.py`

- يستخرج Knowledge Graph (عقد وعلاقات) من النصوص
- **Cloud Models:** تستخدم النص الكامل (Claude/Gemini)
- **Local Models:** أخذ عينات (بداية + وسط + نهاية) لتجنب استنزاف الرموز
- **Mermaid.js:** تحويل الرسم البياني إلى كود Mermaid

---

## 🤖 2. نظام LLM المتعدد

### 2.1 Dual-LLM Orchestrator — بنية Draft-and-Verify
**الملف:** `services/agent/llm/dual_llm_orchestrator.py`

```
Cloud Model (100ms) يصنف السؤال:
  ├─ GREETING → Local LLM فقط (بدون تدقيق)
  ├─ SIMPLE   → Local LLM ي draft ← Cloud Model يدقق ويحسن
  └─ COMPLEX  → Cloud Model مباشرة
```

- **دائرة القطع (Circuit Breaker):** 30 دقيقة تبريد بعد 3 أخطاء متتالية
- **خيارات السحابة:** Gemini (افتراضي)، Claude عبر OpenRouter، Janus-Pro (Colab)
- **التدقيق:** Gemini Flash يدقق الإجابات المحلية ويكتشف الهلوسات

### 2.2 Utility LLM — qwen3-coder
**الملف:** `services/agent/llm/utility_llm.py`

- يستخدم `qwen3-coder:480b-cloud` عبر Ollama
- للمهام الهيكلية فقط: تحليل، استخراج JSON، توليد بيانات منظمة
- يدعم `json_schema` لضمان خرج منظم

### 2.3 Answer Generator — qwen3-company-assistant
**الملف:** `services/agent/llm/answer_generator.py`

- يستخدم `qwen3-company-assistant` عبر Ollama
- **فقط** للردود الطبيعية النهائية (لا يستخدم للتحليل أو المنطق)

### 2.4 موديلات LLM Provider

| الموديل | الملف | الاستخدام |
|---------|------|-----------|
| Gemini Flash/Pro | `gemini_provider.py` | تصنيف + تدقيق + أسئلة معقدة |
| Claude (OpenRouter) | `claude_provider.py` | أسئلة معقدة (احتياطي) |
| Ollama/Llama.cpp | `llama_provider.py` | محلي: دردشة + توليد |
| Janus-Pro (Colab) | `janus_provider.py` | نص + صور |
| Utility (qwen3-coder) | `utility_llm.py` | استخراج JSON |
| Answer (q-assistant) | `answer_generator.py` | ردود طبيعية |

---

## 🎯 3. نظام الاختبارات (Quiz)

### 3.1 Quiz Pipeline — 5 مراحل أساسية
**الملف:** `services/quiz/quizzes_pipeline.py`

1. **Analysis** ← تحليل المحتوى
2. **Blueprint** ← تصميم هيكل الاختبار
3. **Crafting** ← صياغة الأسئلة
4. **Review** ← مراجعة
5. **Presentation** ← عرض النتيجة

### 3.2 Teacher Quiz Pipeline — 5 مراحل احترافية
**الملف:** `services/quiz/teacher_quizzes_pipeline.py` (~1000 سطر)

- توليد امتحانات على مستوى أستاذ جامعي
- **تصنيف بلوم (Bloom's Taxonomy):** مستويات معرفية متعددة
- **دعم ثنائي اللغة:** عربي + إنجليزي
- **MCQ مع مشتتات:** أسئلة اختيار من متعدد مع خيارات مضللة
- **خرجة Markdown JSON:** تنسيق احترافي

### 3.3 Quiz Agent — وكيل الخبير
**الملف:** `services/agent/agents/quiz_agent.py`

- مرحلتان: تحليل → اقتراح ← رد المستخدم → توليد نهائي
- يستخدم `TeacherQuizService` للتحليل والتوليد
- مستوحى من شخصية "دكتور عمر" كمستشار أكاديمي

---

## 📄 4. نظام تتبع المتقدمين (ATS)

### 4.1 ATS Pipeline — CV Indexing + LLM Ranking
**الملف:** `services/cvs/ats_pipeline.py` (~500 سطر)

1. **رفع CV:** استخراج النص (PyMuPDF أو textract)
2. **إخفاء البيانات:** spaCy NER لإخفاء الأسماء والأماكن
3. **الفهرسة:** FAISS منفصل (معزول عن Knowledge Base)
4. **البحث:** Embeddings + LLM Re-ranking

### 4.2 Hiring Skill — 13 Intent
**الملف:** `services/agent/skills/hiring/hiring_skill.py`

| Intent | الوظيفة |
|--------|---------|
| `analyze_cv` | تحليل السيرة الذاتية |
| `recommend_jobs` | توصية بوظائف |
| `apply_to_job` | تقديم على وظيفة |
| `rank_applicants` | ترتيب المتقدمين |
| `build_job_description` | بناء وصف وظيفي |
| `draft_interview_invite` | دعوة لمقابلة |

### 4.3 Scoring Engine — 7 أبعاد
**الملف:** `services/agent/skills/hiring/scoring_engine.py`

| البعد | الوزن | الوصف |
|-------|-------|-------|
| Required Skills | 40% | المهارات الأساسية المطلوبة |
| Nice-to-Have Skills | 15% | المهارات الإضافية |
| Experience | 15% | سنوات الخبرة |
| Project Similarity | 10% | تشابه المشاريع |
| Location/Remote | 10% | الموقع والبعد |
| Salary Fit | 5% | توافق الراتب |
| Availability/Language | 5% | التوفر واللغة |

**منطق التوصية:** ≥80 strong_match / ≥50 possible_match / ≥30 weak_match / <30 not_recommended

### 4.4 Skill Normalizer — 65+ تطابق
**الملف:** `services/agent/skills/hiring/skill_normalizer.py`

قاموس لتطبيع المسميات (مثال: "js" → "JavaScript"، "بايثون" → "Python")

### 4.5 CV Parser — مع تحليل أمني
**الملف:** `services/agent/skills/hiring/cv_parser.py`

1. **فحص حقن الأوامر (Prompt Injection)**
2. **استخراج JSON** عبر Utility LLM
3. **التحقق من الصحة** → CandidateProfile
4. **التحقق القطعي:** تأكيد أن المهارات موجودة فعلاً في النص
5. **تطبيع المهارات**
6. **توليد الرد النهائي** عبر Answer Generator
7. **حفظ** في AI Storage

---

## 🗄️ 5. AI Storage — نظام التخزين المتقدم

### 5.1 قاعدة البيانات — 15 جدول
**الملف:** `services/agent/storage/ai_database.py`

| الجدول | الوصف |
|--------|-------|
| `ai_documents` | المستندات المرفوعة |
| `ai_chunks` | قطع النصوص |
| `ai_memory` | ذاكرة الجلسات |
| `ai_candidate_profiles` | ملفات المرشحين |
| `ai_job_drafts` | مسودات الوظائف |
| `ai_application_drafts` | مسودات التقديم |
| `ai_ranking_runs` | جولات الترتيب |
| `ai_audit_events` | سجل التدقيق |
| `ai_approval_drafts` | مسودات الموافقة |
| `ai_connector_configs` | إعدادات الموصّلات |
| `ai_delivery_logs` | سجل التوصيل |
| `ai_interview_sessions` | جلسات المقابلة (AGiXT) |
| `ai_interview_messages` | رسائل المقابلة (AGiXT) |
| `ai_interview_reports` | تقارير المقابلة (AGiXT) |

**الخيارات:** SQLite (افتراضي) أو PostgreSQL (عبر متغير `AI_STORAGE_BACKEND`)

### 5.2 Tenant Guard — أمان متعدد المستأجرين
**الملف:** `services/agent/storage/tenant_guard.py`

- **`assert_runtime_scope`** — التأكد من وجود tenant_id/site_id/bot_id
- **`assert_record_scope`** — التأكد من أن السجل يخص المستأجر الحالي
- **`filter_records_for_runtime`** — تصفية السجلات حسب المستأجر
- **`reject_cross_tenant`** — رفض الوصول عبر المستأجرين

---

## 🔌 6. نظام الإجراءات (Actions/Connectors) — Phase 7

### 6.1 Action Executor — المنفذ الآمن
**الملف:** `services/agent/actions/action_executor.py`

1. تحميل المسودة والتحقق من وجودها
2. **التحقق من صحة الحمولة (Payload Validation)**
3. **التفرد (Idempotency):** منع التنفيذ المكرر
4. **التحقق الأمني:** عزل المستأجرين + RBAC
5. **التحقق من الحالة:** يجب أن تكون "approved" أو "failed"
6. **تحميل إعدادات الموصّل من DB**
7. **الحصول على تنفيذ الموصّل**
8. **تسجيل التوصيل (Delivery Log)**
9. **تنفيذ الموصّل مع إخفاء الأسرار**
10. **تحديث الحالة + التدقيق**

### 6.2 Connector Registry — سجل الموصّلات
**الملف:** `services/agent/actions/connector_registry.py`

- `MockConnector` — للاختبار (يدعم 4 أنواع إجراءات)
- `WebhookConnector` — مع HMAC signing + SSRF protection + HTTPS enforcement
- `EmailConnector` — مع sandbox + التحقق من البريد الإلكتروني

### 6.3 Connector Onboarding — إعداد الموصّل
**الملف:** `services/agent/actions/connector_onboarding.py`

حالة الإعداد: `draft → validated → sandbox_test_passed → enabled_staging`

- **Pre-check:** HTTPS، SSRF، Auth
- **Sandbox Test:** تنفيذ اختباري حقيقي في بيئة معزولة
- **Enable:** تفعيل للمرحلة التجريبية فقط (الإنتاج محظور حاليًا)

### 6.4 Validators — التحقق من صحة الإجراءات
**الملف:** `services/agent/actions/validators.py`

| الإجراء | الحقول المطلوبة |
|---------|-----------------|
| `submit_application` | candidate_id, job_ids, tenant_id, site_id, bot_id |
| `publish_job` | job_draft_id أو job_post, tenant_id, site_id, bot_id |
| `send_interview_invite` | job_id, candidate_ids, message_draft, ... |
| `send_candidate_message` | recipient_id, recipient_type, message, ... |
| `send_company_message` | recipient_id, recipient_type, message, ... |

---

## 🧠 7. نظام المقابلات LangGraph (الجديد)

### 7.1 Interview Graph — 13 عقدة
**الملف:** `services/interview/graph/interview_graph.py`

```
Start → load_candidate → extract_skills → select_skill
  → generate_question → evaluate_answer
  → [followup؟ نعم → generate_question | لا → next_skill؟ نعم → select_skill | لا → consistency]
  → anti_cheat → challenge → benchmark → final_report → End
```

**كل عقدة:**

| العقدة | الملف | الوظيفة |
|--------|-------|---------|
| `load_candidate` | `nodes/load_candidate.py` | تحميل بيانات المرشح من DB + CV |
| `extract_skills` | `nodes/skill_extractor.py` | استخراج المهارات من CV + Job Description |
| `select_skill` | — (في graph) | اختيار المهارة التالية حسب الأولوية |
| `generate_question` | `nodes/question_node.py` | توليد سؤال + متابعة |
| `evaluate_answer` | `nodes/evaluator_node.py` | تقييم الإجابة (Concept Matcher + LLM + Keywords) |
| `consistency` | `nodes/consistency_node.py` | تحليل الاتساق والثقة |
| `anti_cheat` | `nodes/anti_cheat_node.py` | كشف الغش وتحليل السلوك |
| `challenge` | `nodes/challenge_node.py` | توليد وتقييم التحدي البرمجي |
| `benchmark` | `nodes/benchmark_node.py` | المقارنة المعيارية |
| `final_report` | `nodes/final_report_node.py` | التقرير النهائي + Recruiter Copilot |

### 7.2 Answer Evaluator — 5 أبعاد للتقييم
**الملف:** `services/interview/evaluators/answer_evaluator.py`

| البعد | الطريقة |
|-------|---------|
| **المفاهيم (Concept Coverage)** | مطابقة مع `skill_rubrics.py` (مبتدئ/متوسط/متقدم) |
| **الدقة (LLM)** | استدعاء Ollama مع Structured Output |
| **الكلمات المفتاحية** | فحص المصطلحات التقنية في الإجابة |
| **الطول (Completeness)** | كلما زاد الطول ← درجة أعلى (مع حد أقصى) |
| **الهيكل (Structure)** | وجود كلمات انتقالية (First, For example, In summary) |

### 7.3 Consistency Checker — 7 أنواع مخاطر
**الملف:** `services/interview/evaluators/consistency_checker.py`

| نوع الخطر | الوصف |
|-----------|-------|
| Skill Inflation | تضخيم المهارات (فجوة ≥30 بين المدّعى والمثبّت) |
| Experience Contradiction | تناقض في سنوات الخبرة |
| Vague Answers | إجابات غامضة بشكل متكرر |
| Keyword Stuffing | حشو الكلمات المفتاحية |
| Claim Reversal | عكس الادعاءات بين الإجابات |
| Role Mismatch | عدم تناسب الدور الوظيفي |
| Salary Mismatch | عدم تناسب الراتب |

### 7.4 Anti-Cheat Engine — كشف الغش
**الملف:** `services/interview/security/anti_cheat.py`

- **BehaviorAnalyzer** (`behavior_analyzer.py`): يحلل سرعة الإجابة، التردد، الأنماط
- **عشرات الشك (Suspicion Scores):** كل إجابة تساهم في درجة الشك الإجمالية
- **التحذيرات:** يولد تحذيرات بدون رفض تلقائي (يحتاج مراجعة بشرية)

### 7.5 Coding Challenge Engine — التحدي البرمجي
**الملف:** `services/interview/challenges/`

- **التوليد:** LLM يولد تحديًا (وصف + هيكل + حالات اختبار)
- **التقييم:** 3 أبعاد:
  - **الصحة (Correctness):** تطابق مع المخرجات المتوقعة (0-100)
  - **الجودة (Quality):** كشف الكلمات المفتاحية (def, class, import, typing, try/except, docstrings)
  - **الكفاءة (Efficiency):** حلقات for/while صريحة (خصم) vs comprehensions/generators/map/filter (إضافة)

### 7.6 Benchmark Engine — المقارنة المعيارية
**الملف:** `services/interview/analytics/benchmark_engine.py`

- حساب **Percentile Rank** للمرشح الحالي مقابل جميع المرشحين السابقين
- **إحصائيات:** المتوسط، الوسيط، الانحراف المعياري لكل مهارة
- **التخزين:** حفظ نتائج الـ Benchmark لكل مرشح

### 7.7 Recruiter Copilot — مساعد مسؤول التوظيف
**الملف:** `services/interview/reports/final_report.py`

- **تحليل الثقة (Trust Analysis):** فجوات الثقة، أعلام المخاطر
- **الخطوة التالية (Next Step):** اقتراح ذكي (مقابلة بشرية، اختبار إضافي، الخ)
- **التوصية:** strong_hire / hire / maybe / weak_hire / no_recommendation
- **الأوزان:** Technical=35%, Practical=20%, Experience=15%, Consistency=15%, Communication=10%, Trust=5%

### 7.8 Interview Memory — الذاكرة
**الملف:** `services/interview/memory/`

- **Claim Tracker:** استخراج الادعاءات من النصوص (RegEx لأنماط عربية وإنجليزية)
- **Contradiction Detector:** كشف التناقضات عبر الإجابات (حقول المهارات، الخبرة الأدنى/الأقصى، الخ)
- **Interview Memory:** تخزين مؤقت في Redis + في الذاكرة

### 7.9 Skill Knowledge Base — المعرفة المهارية
**الملف:** `services/interview/knowledge/`

- **8 مجالات مهارية:** Python, JavaScript, SQL, Docker/K8s, AWS/GCP/Azure, System Design, Data Structures, Leadership
- **Concept Matcher:** مطابقة الإجابات مع المفاهيم المتوقعة باستخدام تشابه النصوص

### 7.10 Redis Cache — التخزين المؤقت
**الملف:** `services/interview/cache/redis_cache.py`

- يدعم **Redis** عند الاتصال
- **In-Memory Dictionary** كاحتياطي عندما Redis غير متاح
- آمن للخيوط (thread-safe) مع `threading.Lock`

---

## 🌐 8. الـ Routes

### 8.1 Auth — المصادقة
**الملف:** `controllers/auth.py`

- `/login`, `/logout`
- **Fast Path:** التحقق من الـ session flag مباشرة
- **Slow Path:** استعلام قاعدة البيانات كاحتياطي
- **Decorators:** `login_required`, `admin_required`

### 8.2 Admin — لوحة التحكم (~20 Route)
**الملف:** `controllers/admin.py` (~750 سطر)

| المجموعة | routes |
|----------|--------|
| Dashboard | `/admin/` |
| Documents | `/admin/documents/` (upload, delete, reindex, chunks) |
| Websites | `/admin/websites/` (crawl, sources) |
| API Keys | `/admin/api-keys/` (create, revoke) |
| Models | `/admin/models/` (settings) |
| Chat | `/admin/chat/` (مع context) |
| Companies | `/admin/companies/` (CRUD) |
| Quizzes | `/admin/quizzes/` |
| ATS | `/admin/ats/` (redirect) |

### 8.3 Public API
**الملف:** `controllers/api.py`

| المسار | الوظيفة |
|--------|---------|
| `POST /api/v1/chat` | المحادثة الرئيسية (مع RAG) |
| `GET /api/v1/health` | فحص الصحة |
| `GET /api/v1/stats` | إحصائيات |
| `GET /api/v1/documents` | قائمة المستندات |

**المصادقة:** API Key في header `X-API-Key`
**معدل الطلبات:** حد 60 ثانية

### 8.4 Admin AI — لوحة الذكاء الاصطناعي (~20 Route)
**الملف:** `chatbot/routes/admin_ai.py` (441 سطر)

| المسار | الوظيفة |
|--------|---------|
| `/admin/ai/candidates` | قائمة المرشحين (مع RBAC masking) |
| `/admin/ai/candidate/<id>` | تفاصيل المرشح |
| `/admin/ai/jobs` | مسودات الوظائف |
| `/admin/ai/ranking` | جولات الترتيب |
| `/admin/ai/interviews` | جلسات المقابلة |
| `/admin/ai/connectors` | الموصّلات |
| `/admin/ai/approvals` | طلبات الموافقة |
| `/admin/ai/audit` | سجل التدقيق |

### 8.5 Candidate Interview — مقابلة المرشح
**الملف:** `chatbot/routes/candidate_interview.py`

- `/interview/<id>/consent` — طلب الموافقة
- `/interview/<id>/start` — بدء المقابلة
- `/interview/<id>/question` — السؤال التالي
- `/interview/<id>/answer` — إرسال إجابة

### 8.6 Interview Routes — لوحة المقابلات (12 Route)
**الملف:** `services/interview/routes/interview_routes.py`

| المسار | الوظيفة |
|--------|---------|
| `GET /interview/dashboard` | عرض اللوحة |
| `POST /interview/start` | بدء مقابلة جديدة |
| `GET /interview/session/<id>` | عرض الجلسة |
| `POST /interview/session/<id>/submit` | إرسال إجابة |
| `GET /interview/session/<id>/report` | التقرير |
| `DELETE /interview/session/<id>` | حذف الجلسة |
| `POST /interview/challenge/test` | اختبار التحدي المباشر |
| `POST /interview/challenge/generate` | توليد تحدي |
| `POST /interview/challenge/evaluate` | تقييم تحدي |
| `GET /interview/analytics` | التحليلات |
| `GET /api/interview/status/<id>` | حالة الجلسة (API) |
| `GET /api/interview/report/<id>` | التقرير (API) |

---

## 🗄️ 9. قاعدة البيانات الرئيسية (SQLite)

**الملف:** `models/database.py` (1415 سطر)

### الجداول الرئيسية:

| الجدول | الوظيفة |
|--------|---------|
| `users` | المستخدمين (id, username, password_hash, role) |
| `companies` | الشركات (id, name, slug, api_key_prefix, business_type) |
| `api_keys` | مفاتيح API (key, name, company_id, rate_limit, is_active) |
| `documents` | المستندات المرفوعة (id, filename, file_type, status) |
| `chunks` | قطع النصوص (id, document_id, content, chunk_index) |
| `ats_jobs` | وظائف ATS (id, title, description, company_id) |
| `interview_sessions` | جلسات المقابلة (id, candidate_id, job_id, status, scores...) |
| `interview_questions` | الأسئلة (id, session_id, skill, question, type) |
| `interview_answers` | الإجابات (id, question_id, answer, scores...) |
| `interview_skill_assessments` | تقييم المهارات (id, session_id, skill, verified_level) |
| `interview_consistency` | تحليل الاتساق (id, session_id, score, trust_gaps) |
| `interview_challenges` | التحديات (id, session_id, description, submission, scores) |
| `interview_reports` | التقارير (id, session_id, final_score, recommendation) |

### دوال مهمة:
- `init_db()` — إنشاء جميع الجداول
- `create_user()`, `verify_user()`, `get_user_by_id()`
- `create_company()`, `get_company_by_id()`, `get_all_companies()`
- `create_api_key()`, `verify_api_key()`, `increment_api_key_usage()`
- `create_document()`, `get_all_documents()`, `delete_document()`
- `create_chunks()`, `get_all_chunks()`, `get_chunks_by_document()`
- `create_*` لكل جدول مقابلة + `get_*` + `update_*` لها

---

## ⚙️ 10. الإعدادات (Config)

**الملف:** `config.py`

### المجموعات الرئيسية:

```python
# المسارات
BASE_DIR / DATA_DIR / VECTOR_STORE_PATH / UPLOAD_FOLDER

# Ollama
OLLAMA_BASE_URL / DEFAULT_MODEL / EMBEDDING_MODEL / EMBEDDING_DIM

# Gemini
GEMINI_API_KEY / GEMINI_FLASH_MODEL / GEMINI_PRO_MODEL

# Claude (OpenRouter)
CLAUDE_API_KEY / CLAUDE_BASE_URL / CLAUDE_MODEL

# Dual LLM
ENABLE_DUAL_LLM / ENABLE_GEMINI_VERIFICATION / PRIORITIZE_LOCAL

# Utility LLM (qwen3-coder)
UTILITY_MODEL_NAME / UTILITY_MODEL_BASE_URL / UTILITY_MODEL_API_KEY

# Finetuned (qwen3-company-assistant)
FINETUNED_MODEL_NAME / FINETUNED_MODEL_BASE_URL / FINETUNED_MODEL_API_KEY

# Redis
REDIS_HOST / REDIS_PORT / REDIS_DB / REDIS_PASSWORD

# Sentry
SENTRY_DSN

# Document Processing
ALLOWED_EXTENSIONS / CHUNK_SIZE / CHUNK_OVERLAP / MAX_FILE_SIZE

# Crawler
MAX_CRAWL_DEPTH / MAX_CRAWL_PAGES / CRAWL_DELAY_SECONDS

# RAG
TOP_K_RESULTS / RAG_VECTOR_BACKEND

# Interview Weights (Phase 10)
# Technical=35%, Practical=20%, Experience=15%, Consistency=15%, Communication=10%, Trust=5%

# Anti-cheat / Challenge / Benchmark toggles
```

---

## 🔍 11. معمارية الأمان

### 11.1 Prompt Injection Detection
- **CV Parser:** فحص 4 عبارات خطيرة في الـ CV قبل المعالجة
- **Interview Safety Guard:** 11 نمط حقن (عربي + إنجليزي)
- **Answer Safety:** كشف الاختراق + الإساءة في إجابات المرشحين

### 11.2 Multi-Tenant Isolation
- Tenant Guard: `assert_runtime_scope` + `assert_record_scope`
- Post-filter في Knowledge Base حسب tenant_id/site_id/bot_id
- RBAC: admin, viewer, candidate (في Action Executor)

### 11.3 Connector Security
- **SSRF Protection:** حظر عناوين IP الخاصة
- **HTTPS Enforcement:** الموصلات التي لا تستخدم HTTPS تُرفض
- **HMAC Signing:** توقيع الطلبات للتحقق من السلامة
- **Secret Masking:** إخفاء المفاتيح والكلمات السرية في السجلات
- **Idempotency:** منع التنفيذ المكرر

### 11.4 Interview Safety
- **10 أنماط حساسة:** العمر، الدين، الجنس، الحالة الاجتماعية، الجنسية، الإعاقة، الصحة، السياسة، الحمل، العرق
- **5 أنماط قرار نهائي:** "تم قبولك"، "تم رفضك"، إلخ
- **كشف نوايا المرشح:** توقف، تخطي، توضيح
- **Transcript Privacy:** إخفاء الإيميلات وأرقام الهواتف في سجلات المحادثة

### 11.5 Data Masking
- إخفاء البيانات الحساسة في السجلات: `bearer_tokens`، `api_keys`، `passwords`، `tokens`
- إخفاء معلومات الاتصال في سجلات المقابلة عند الكشف للمسؤولين

---

## 🧪 12. الاختبارات

### 12.1 Interview Tests
**الملف:** `tests/interview/test_interview_service.py`

| فئة الاختبار | الوظيفة |
|-------------|---------|
| `TestConfidenceCalculator` | حساب الثقة (لا scores، ثبات عالٍ، ثبات منخفض) |
| `TestSkillVerifier` | التحقق من المهارات (لا تقييمات، تقييم واحد، متوسط متعدد) |
| `TestConsistencyChecker` | تحليل الاتساق (لا فجوة، فجوة 60 نقطة، متسق) |
| `TestInterviewReportGenerator` | توليد التقرير (strong_hire بدرجة 91، رفض بدرجة 28) |
| `TestAnswerEvaluator` | تقييم الإجابات (fallback، keyword، طول، هيكل) |
| `TestQuestionGenerator` | توليد الأسئلة الاحتياطية (python, .net, generic) |

**الملف:** `tests/interview/test_interview_models.py`

- اختبار جميع Pydantic models (14 موديل) مع القيم الافتراضية

---

## 📊 13. إحصائيات المشروع

| المقياس | القيمة |
|---------|--------|
| إجمالي ملفات Python | ~100+ |
| إجمالي سطور الكود | ~25,000+ |
| جداول SQLite | 20+ (رئيسية) + 15 (AI STORAGE) |
| موديلات LLM | 7 (Ollama, Gemini, Claude, Janus, Utility, Answer, Embedding) |
| LangGraph Workflows | 3 (Supervisor, RAG, Chat + Interview) |
| مراحل توليد الاختبارات | 5 |
| أبعاد تقييم المقابلة | 6 (Technical, Practical, Experience, Consistency, Communication, Trust) |
| أنواع مخاطر الاتساق | 7 |
| أنماط الأمان في المقابلة | 26 (حساسة + حقن + إساءة + قرارات) |
