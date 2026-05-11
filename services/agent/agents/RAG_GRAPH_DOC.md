# MAESTA RAG Graph — Visual Documentation

هذا الرسم التوضيحي يشرح بالتفصيل كيف يتم معالجة السؤال داخل نظام الـ **RAG Graph** لضمان أعلى دقة وتجنب الإجابات الخاطئة.

## مخطط سير العمل (Mermaid Diagram)

```mermaid
graph TD
    %% Nodes
    Start((بداية)) 
    QA[محلل الاستعلام - Query Analyzer]
    R[المسترجع - Retriever]
    RG[مقيم الملاءمة - Relevance Grader]
    G[المولد - Generator]
    QR[مُعيد الصياغة - Query Rewriter]
    GF[المولد الاحتياطي - Fallback]
    HC[فاحص الهلوسة - Hallucination Checker]
    End((النهاية))

    %% Flow
    Start --> QA
    QA -- "توسيع السؤال" --> R
    R -- "جلب الفقرات" --> RG
    
    RG -- "وجد معلومات مفيدة" --> G
    RG -- "لم يجد (أقل من محاولتين)" --> QR
    RG -- "لم يجد (استنفذ المحاولات)" --> GF
    
    QR -- "صيغة جديدة" --> R
    
    G -- "إجابة مبدئية" --> HC
    
    HC -- "موثقة من المصادر" --> End
    HC -- "غير موثقة (أقل من محاولتين)" --> G
    HC -- "غير موثقة (استنفذ المحاولات)" --> End
    
    GF --> End

    %% Styling
    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style End fill:#f9f,stroke:#333,stroke-width:2px
    style RG fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style HC fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style G fill:#e1f5fe,stroke:#01579b,stroke-width:2px
```

## شرح المكونات (Nodes Breakdown)

1.  **Query Analyzer**: يقوم بتحليل سؤال المستخدم للكشف عن الـ **Intent**. إذا كان السؤال عن "اسم المشروع" أو "وصف المشروع"، يتم توجيهه مباشرة بكلمات مفتاحية دقيقة. بخلاف ذلك، يتم توسيع السؤال لصيغ مختلفة.
2.  **Retriever**: يقوم بالبحث الدلالي في قاعدة البيانات وجلب أكثر الفقرات صلة بناءً على الاستعلامات المحسنة.
3.  **Relevance Grader**: يعمل بنظام **هجين (Hybrid)**. للأسئلة عن المشروع، يستخدم قواعد برمجية (Rule-based) للتحقق من الكلمات المفتاحية لضمان عدم استبعاد المستندات الصحيحة. للأسئلة العامة، يستخدم الـ LLM للتقييم.
4.  **Query Rewriter**: في حال فشل البحث الأول، يقوم بإعادة كتابة السؤال بكلمات مفتاحية مختلفة تماماً لمحاولة جلب نتائج أفضل.
5.  **Generator**: يقوم بكتابة الإجابة النهائية بناءً على الفقرات "الموثوقة" فقط، مع الالتزام بشخصية MAESTA.
6.  **Hallucination Checker**: يتأكد أن الموديل لم يخترع معلومات من عنده (هلوسة) وأن الإجابة مدعومة بالكامل من المستندات المسترجعة.

---
*تم إنشاء هذا التوثيق لضمان شفافية عمل النظام.*
