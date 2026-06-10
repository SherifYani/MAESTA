# 🏗️ MAESTA — الرسومات المعمارية

> استخدم أي عارض Mermaid (GitHub، VS Code مع إضافة Markdown Preview Mermaid Support)

---

## 1. 🏛️ العمارة العامة (Overall Architecture)

```mermaid
graph TB
    subgraph "🌐 Clients"
        USER[User / Browser]
        API[External API Client]
    end

    subgraph "🔥 Flask App Factory"
        MAIN[main.py]
        CONFIG[config.py]
        SENTRY[core/sentry_init.py]
        LOGGER[core/logger.py]
    end

    subgraph "🔐 Auth Layer"
        AUTH[controllers/auth.py]
        API_AUTH[API Key Verification]
    end

    subgraph "🧭 Request Router"
        REG[controllers/register.py]
        BP1["Blueprint: /admin"]
        BP2["Blueprint: /api/v1"]
        BP3["Blueprint: /quiz"]
        BP4["Blueprint: /ats"]
        BP5["Blueprint: /interview"]
        BP6["Blueprint: /admin/ai"]
    end

    subgraph "🧠 Agent System"
        SUP[services/agent/supervisor.py]
        RAG[services/agent/agents/rag_graph.py]
        CHAT[services/agent/agents/chat_agent.py]
        QUIZ_AGENT[services/agent/agents/quiz_agent.py]
        KB[services/agent/rag/knowledge_base.py]
    end

    subgraph "🤖 LLM Providers"
        OLLAMA[Ollama Service]
        DUAL[Dual-LLM Orchestrator]
        GEMINI[Gemini Provider]
        CLAUDE[Claude Provider]
        JANUS[Janus-Pro Provider]
        UTILITY[Utility LLM - qwen3-coder]
        ANSWER[Answer Gen - q-assistant]
    end

    subgraph "💾 Data Layer"
        DB[(SQLite Database)]
        AI_DB[(AI Storage DB)]
        REDIS[(Redis Cache)]
        FAISS[(FAISS Vector Index)]
    end

    subgraph "📦 Business Services"
        ATS[services/cvs/ats_pipeline.py]
        QUIZ[services/quiz/quizzes_pipeline.py]
        TEACHER_QUIZ[services/quiz/teacher_quizzes_pipeline.py]
        INTERVIEW[services/interview/]
    end

    USER --> MAIN
    API --> MAIN
    MAIN --> CONFIG
    MAIN --> SENTRY
    MAIN --> LOGGER
    MAIN --> AUTH
    MAIN --> REG

    REG --> BP1
    REG --> BP2
    REG --> BP3
    REG --> BP4
    REG --> BP5
    REG --> BP6

    BP1 --> AUTH
    BP2 --> API_AUTH

    BP2 --> SUP
    BP6 --> SUP

    SUP --> RAG
    SUP --> CHAT
    SUP -.-> QUIZ_AGENT

    RAG --> KB
    KB --> OLLAMA
    KB --> FAISS
    KB --> DB

    RAG --> DUAL
    CHAT --> DUAL
    DUAL --> OLLAMA
    DUAL --> GEMINI
    DUAL --> CLAUDE
    DUAL --> JANUS

    QUIZ_AGENT --> UTILITY
    QUIZ_AGENT --> ANSWER

    BP3 --> QUIZ
    BP3 --> TEACHER_QUIZ
    QUIZ --> UTILITY
    TEACHER_QUIZ --> UTILITY

    BP4 --> ATS
    ATS --> OLLAMA
    ATS --> FAISS

    BP5 --> INTERVIEW
    INTERVIEW --> OLLAMA
    INTERVIEW --> REDIS
    INTERVIEW --> DB
    INTERVIEW --> AI_DB

    BP6 --> AI_DB
```

---

## 2. 🧭 Supervisor Agent — توجيه الرسائل

```mermaid
flowchart LR
    START((User Message))
    START --> GEMINI{"Gemini API Key?"}
    GEMINI -->|Yes| FAST[Gemini Flash ~100ms]
    GEMINI -->|No| KEYWORD[Keyword Pre-filter]

    FAST --> DECIDE{Classification}
    KEYWORD --> DECIDE

    DECIDE -->|"RAG"| RAG_NODE[RAG Graph Node]
    DECIDE -->|"CHAT"| CHAT_NODE[Chat Agent Node]

    RAG_NODE --> END1((Response))
    CHAT_NODE --> END1

    KEYWORD -.->|"No match + USE_UTILITY_LLM"| LOCAL[Local LLM ~slow]
    LOCAL --> DECIDE
```

---

## 3. 🔍 RAG Pipeline

```mermaid
flowchart TD
    START((User Question)) --> QA["Query Analyzer
    ⟐ Detect Language
    ⟐ Detect Intent
    ⟐ Query Expansion"]

    QA --> R["Retriever
    ⟐ FAISS Vector Search
    ⟐ BM25 Keyword Search
    ⟐ Hybrid Fusion α=0.4-0.7"]

    R --> RG["Relevance Grader
    ⟐ Rule-based (no LLM)
    ⟐ Keyword matching
    ⟐ Tech keyword boost"]

    RG --> COND{"Relevant Docs ≥ 1?"}

    COND -->|Yes| G["Generator
    ⟐ Full document context
    ⟐ Company Profile
    ⟐ LLM + Output Sanitizer"]

    COND -->|No| QR["Query Rewriter
    Retry < MaxAttempts"]

    QR --> R

    G --> HC["Hallucination Checker
    ⟐ Rule-based
    ⟐ Pass-through"]

    HC --> COND2{"Grounded?"}

    COND2 -->|Yes| END((END))
    COND2 -->|No + Retry < Max| G
    COND2 -->|No + Retry ≥ Max| END

    COND -->|No + Retry ≥ Max| GF["Generator Fallback
    ⟐ 'المعلومة مش متاحة'"]

    GF --> END
```

---

## 4. 🤖 Dual-LLM Orchestrator — بنية الكتابة والتدقيق

```mermaid
flowchart TD
    START((User Question))
    START --> CLASS{"Classify
    Gemini Flash
    ~100ms"}

    CLASS -->|GREETING| GREET["Greeting Path
    ⟐ Local LLM only
    ⟐ No verification
    ⟐ Temperature 0.8"]

    CLASS -->|SIMPLE| SIMPLE["Simple Path
    ⟐ Local LLM drafts
    ⟐ Gemini verifies
    ⟐ Corrects if hallucination"]

    CLASS -->|COMPLEX| COMPLEX{"Cloud Available?"}

    COMPLEX -->|Janus Available| JANUS["Janus-Pro 7B Colab"]
    COMPLEX -->|Claude Priority| CLAUDE["Claude via OpenRouter"]
    COMPLEX -->|Gemini| GEMINI["Gemini Pro"]

    JANUS -->|Fails| CLAUDE
    CLAUDE -->|Fails| GEMINI
    GEMINI -->|Fails| FALLBACK["Fallback: Simple Path"]

    GREET --> END((Response))
    SIMPLE --> END
    JANUS --> END
    CLAUDE --> END
    GEMINI --> END
    FALLBACK --> END
```

---

## 5. 🧠 LangGraph Interview System — 13 عقدة

```mermaid
flowchart TD
    START((Start)) --> LOAD["load_candidate
    ⟐ Get candidate from DB
    ⟐ Get job description
    ⟐ Get CV data"]

    LOAD --> EXTRACT["extract_skills
    ⟐ Parse CV skills
    ⟐ Match with JD
    ⟐ Calculate priority"]

    EXTRACT --> SELECT{"select_skill
    Next unassessed skill"}

    SELECT --> GENQ["generate_question
    ⟐ LLM question generation
    ⟐ Difficulty adaptation
    ⟐ Follow-up detection"]

    GENQ --> EVAL["evaluate_answer
    ⟐ Concept matching
    ⟐ LLM scoring
    ⟐ Keyword coverage
    ⟐ Length & structure"]

    EVAL --> FOLLOWUP{"Needs follow-up?
    < 3 followups?"}

    FOLLOWUP -->|Yes| GENQ
    FOLLOWUP -->|No| NEXT_SKILL{"More skills?"}

    NEXT_SKILL -->|Yes| SELECT
    NEXT_SKILL -->|No| CONS["consistency
    ⟐ Claim tracking
    ⟐ Contradiction detection
    ⟐ 7 risk flags
    ⟐ Trust score"]

    CONS --> ANTICHEAT["anti_cheat
    ⟐ Behavior analysis
    ⟐ Speed patterns
    ⟐ Suspicion scoring
    ⟐ Warnings (no auto-reject)"]

    ANTICHEAT --> CHALLENGE["challenge
    ⟐ Generate coding challenge
    ⟐ Candidate submits
    ⟐ Evaluate:
       • Correctness
       • Code Quality
       • Efficiency"]

    CHALLENGE --> BENCH["benchmark
    ⟐ Historical percentile
    ⟐ Per-skill stats
    ⟐ Candidate comparison"]

    BENCH --> REPORT["final_report
    ⟐ Weighted scoring
    ⟐ Recruiter Copilot
    ⟐ Trust analysis
    ⟐ Next step
    ⟐ Recommendation"]

    REPORT --> END((END))
```

---

## 6. 📊 Interview Scoring Model

```mermaid
graph TD
    subgraph "📥 Inputs"
        CV[CV Data]
        JD[Job Description]
        ANSWERS[Candidate Answers]
        CHALLENGE_RES[Challenge Submission]
    end

    subgraph "🧮 Scoring Dimensions"
        TECH["Technical 35%
        ⟐ Skill rubrics
        ⟐ Concept coverage
        ⟐ Answer accuracy"]

        PRACT["Practical 20%
        ⟐ Challenge correctness
        ⟐ Code quality
        ⟐ Efficiency"]

        EXP["Experience 15%
        ⟐ Years matching
        ⟐ Project relevance
        ⟐ Role alignment"]

        CONS["Consistency 15%
        ⟐ Cross-answer coherence
        ⟐ Claim verification
        ⟐ Contradiction score"]

        COMM["Communication 10%
        ⟐ Answer structure
        ⟐ Clarity
        ⟐ Completeness"]

        TRUST["Trust 5%
        ⟐ Anti-cheat score
        ⟐ Skill inflation gap
        ⟐ Behavior patterns"]
    end

    CV --> TECH
    CV --> EXP
    JD --> TECH
    JD --> EXP
    ANSWERS --> TECH
    ANSWERS --> CONS
    ANSWERS --> COMM
    ANSWERS --> TRUST
    CHALLENGE_RES --> PRACT

    TECH --> FINAL[Final Score]
    PRACT --> FINAL
    EXP --> FINAL
    CONS --> FINAL
    COMM --> FINAL
    TRUST --> FINAL

    FINAL --> REC{"Recommendation"}
    REC -->|≥ 90| STRONG[Strong Hire]
    REC -->|≥ 80| HIRE[Hire]
    REC -->|≥ 65| MAYBE[Maybe]
    REC -->|≥ 50| WEAK[Weak Hire]
    REC -->|< 50| REJECT[No Recommendation]
```

---

## 7. 🎯 Quiz Generation Pipeline — 5 مراحل

```mermaid
flowchart LR
    START((Topic)) --> A["Stage 1: Analysis
    ⟐ Analyze material
    ⟐ Identify key topics
    ⟐ Detect language"]

    A --> B["Stage 2: Blueprint
    ⟐ Bloom's taxonomy
    ⟐ Question distribution
    ⟐ Difficulty levels"]

    B --> C["Stage 3: Crafting
    ⟐ MCQ with distractors
    ⟐ True/False
    ⟐ Essay questions"]

    C --> D["Stage 4: Review
    ⟐ Answer key generation
    ⟐ Plausible distractors
    ⟐ Bilingual support"]

    D --> E["Stage 5: Presentation
    ⟐ JSON Markdown format
    ⟐ Professional layout
    ⟐ Ready for export"]

    E --> END((Final Quiz))
```

---

## 8. 🔌 Connector System — Phase 7

```mermaid
flowchart TD
    START((Approved Action))
    START --> LOAD_DRAFT["Load approval draft from DB"]

    LOAD_DRAFT --> VALIDATE["Validate Payload
    ⟐ Required fields check
    ⟐ Schema validation"]

    VALIDATE --> IDEM{"Idempotency Check"}

    IDEM -->|Already executed| SKIP["Skip - already done"]
    IDEM -->|New| SEC["Security Check
    ⟐ Tenant isolation
    ⟐ RBAC role check"]

    SEC --> CONFIG["Load Connector Config
    ⟐ From DB config table
    ⟐ Fail-closed if missing"]

    CONFIG --> GET_CONN["Get Connector Implementation
    ⟐ Mock / Webhook / Email"]

    GET_CONN --> GATE{"Security Gates"}

    GATE -->|Mock ✓| LOG[Create Delivery Log]
    GATE -->|Real + ENABLED ✓| LOG
    GATE -->|Real + DISABLED ✗| REJECT[Reject - Disabled]

    LOG --> EXEC["Execute Connector
    ⟐ HMAC signing
    ⟐ HTTPS enforcement
    ⟐ SSRF protection"]

    EXEC --> RESULT{Success?}

    RESULT -->|Yes| SUCCESS["Status: executed
    ⟐ Update draft
    ⟐ Log delivery"]
    RESULT -->|No| FAIL["Status: failed
    ⟐ Mask secrets in error
    ⟐ Allow retry if configured"]

    SUCCESS --> END((END))
    FAIL --> END
    SKIP --> END
    REJECT --> END
```

---

## 9. 💾 Multi-Tenant Data Isolation

```mermaid
flowchart TD
    subgraph "🔑 Tenant A"
        A_USER[User A]
        A_KB[(FAISS Index A)]
        A_DB[(DB: tenant=A)]
    end

    subgraph "🔑 Tenant B"
        B_USER[User B]
        B_KB[(FAISS Index B)]
        B_DB[(DB: tenant=B)]
    end

    subgraph "🛡️ Isolation Layers"
        L1["Layer 1: tenant_guard.py
        ⟐ assert_runtime_scope
        ⟐ assert_record_scope"]
        L2["Layer 2: KB Post-filter
        ⟐ tenant_id/site_id/bot_id
        ⟐ Fail-closed rejection"]
        L3["Layer 3: Action Executor
        ⟐ Cross-tenant blocked
        ⟐ RBAC enforcement"]
        L4["Layer 4: AI Storage
        ⟐ All tables have tenant_id
        ⟐ Every query WHERE tenant_id=?"]
    end

    A_USER --> L1
    A_USER --> L2
    A_USER --> L3
    A_USER --> L4
    A_KB --> L2
    A_DB --> L4

    B_USER --> L1
    B_USER --> L2
    B_USER --> L3
    B_USER --> L4
    B_KB --> L2
    B_DB --> L4
```

---

## 10. 📂 File Dependency Map

```mermaid
graph TD
    MAIN[main.py] --> CONFIG[config.py]
    MAIN --> DB[models/database.py]
    MAIN --> REG[controllers/register.py]

    REG --> AUTH[controllers/auth.py]
    REG --> ADMIN[controllers/admin.py]
    REG --> API[controllers/api.py]
    REG --> QUIZ_R[controllers/quiz.py]
    REG --> ATS_R[controllers/ats.py]

    ADMIN --> KB[services/agent/rag/knowledge_base.py]
    ADMIN --> WP[services/agent/tools/web_crawler.py]
    ADMIN --> OLLAMA[services/agent/ollama_service.py]

    API --> SUP[services/agent/supervisor.py]
    SUP --> STATE[services/agent/state.py]
    SUP --> RAG_G[services/agent/agents/rag_graph.py]
    SUP --> CHAT_G[services/agent/agents/chat_agent.py]

    RAG_G --> KB
    RAG_G --> CP[services/agent/agents/company_prompt.py]
    RAG_G --> DB
    RAG_G --> OLLAMA

    CHAT_G --> STATE
    CHAT_G --> TOOLS[services/agent/tools_registry.py]
    CHAT_G --> CP

    KB --> VB[services/agent/rag/vector_backend.py]
    KB --> OLLAMA

    ATS_R --> ATS_S[services/cvs/ats_pipeline.py]
    ATS_S --> OLLAMA

    QUIZ_R --> QUIZ_S[services/quiz/quizzes_pipeline.py]
    QUIZ_R --> TQ[services/quiz/teacher_quizzes_pipeline.py]

    ADMIN_API[chatbot/routes/admin_ai.py] --> AI_DB[services/agent/storage/]
    ADMIN_API --> HIRING[services/agent/skills/hiring/]

    CAND_INT[chatbot/routes/candidate_interview.py] --> AI_DB
    CAND_INT --> HIRING

    INT_SRV[services/interview/] --> DB
    INT_SRV --> REDIS[services/interview/cache/redis_cache.py]
    INT_SRV --> OLLAMA
```
