"""
Company System Prompt Builder — agent/agents/company_prompt.py
================================================================
يبني system prompt عامًا لأي شركة أو موقع بدلًا من persona ثابتة.
مستوحى من system_prompt.txt في data/fine_tuning/system_prompt.txt.

الاستخدام:
    from services.agent.agents.company_prompt import build_company_system_prompt
    prompt = build_company_system_prompt()

لو الموديل يعمل في COMPANY_ASSISTANT_MODE، استخدم هذا الـ prompt
بدلًا من SYSTEM_PERSONA الموجود في config.py.
"""


def build_company_system_prompt() -> str:
    """
    Return the universal company assistant system prompt.
    """
    return (
        "أنت المساعد الذكي الرسمي للشركة المذكورة في البيانات. مهمتك هي مساعدة العملاء بتقديم معلومات دقيقة بناءً على البيانات المتاحة فقط.\n"
        "\n"
        "القواعد الصارمة:\n"
        "- أجب مباشرة بناءً على 'المعلومات المتاحة للشركة' فقط.\n"
        "- استنتج اسم الشركة من البيانات وإذا سُئلت عن هويتك، قدم نفسك كممثل لها.\n"
        "- إذا كانت الإجابة موجودة، قدمها بوضوح ودقة.\n"
        "- حافظ على مسارات الروابط، الأسماء، الإيميلات، وأرقام الهواتف كما هي مكتوبة تماماً.\n"
        "- لا تخترع أسعاراً، عروضاً، سياسات، أو وعوداً غير موجودة في البيانات.\n"
        "- إذا كانت المعلومة غير متاحة، قل بوضوح: 'المعلومة دي مش متاحة حاليًا في المعلومات المتوفرة لدينا.'\n"
        "- ممنوع منعاً باتاً ذكر أي تفاصيل تقنية مثل (RAG، chunks، قاعدة بيانات، ملفات، سياق مسترجع).\n"
        "- استخدم لغة العميل (العربية الفصحى أو العامية حسب سؤاله).\n"
        "- كن موجزاً ومفيداً.\n"
        "- لا تستخدم علامة <think> أو أي وسوم تفكير داخلية.\n"
    )


def build_company_user_message(
    retrieved_context: str,
    user_question: str,
    company_name: str = "الشركة المذكورة في البيانات",
    business_type: str = "knowledge assistant",
    platform_type: str = "chatbot",
    tone: str = "helpful, clear Arabic",
    support_behavior: str = "answer only from available information",
    fallback_message: str = "المعلومة دي مش متاحة حاليًا في المعلومات المتوفرة لدينا.",
    conversation_history: str = "",
) -> str:
    """
    بناء user message بنفس شكل dataset التدريب.

    هذا الـ format ضروري لو الـ fine-tuned model شغّال،
    لأنه تدرّب على هذا الـ format تحديدًا.

    Args:
        retrieved_context:   نص الـ chunks المسترجعة من FAISS/BM25.
        user_question:       سؤال العميل الأصلي.
        company_name:        اسم الشركة (من company profile أو default).
        business_type:       نوع النشاط التجاري.
        platform_type:       نوع الموقع أو المنصة.
        tone:                أسلوب التواصل.
        support_behavior:    سلوك الدعم.
        fallback_message:    رسالة "المعلومة غير متاحة".
        conversation_history: سياق المحادثة السابقة (اختياري).

    Returns:
        user message string جاهز للـ tokenizer.
    """
    return (
        f"Company Data:\n"
        f"Company name: {company_name}\n"
        f"Business type: {business_type}\n"
        f"Website or platform type: {platform_type}\n"
        f"Tone: {tone}\n"
        f"Language preference: same as customer\n"
        f"Support behavior: {support_behavior}\n"
        f"Fallback message: {fallback_message}\n"
        f"\n"
        f"Available Company Information:\n"
        f"{retrieved_context}\n"
        f"\n"
        f"Conversation History:\n"
        f"{conversation_history}\n"
        f"\n"
        f"Customer Message:\n"
        f"{user_question}"
    )


# ── Default company profile (used when COMPANY_ASSISTANT_MODE=true
#    but no dynamic company profile is configured yet) ─────────────────

DEFAULT_COMPANY_PROFILE = {
    "company_name": "الشركة المذكورة في البيانات المتاحة",
    "business_type": "المجال المذكور في المستندات",
    "platform_type": "الموقع الرسمي",
    "tone": "helpful, clear Arabic",
    "support_behavior": "answer only from available information",
    "fallback_message": "المعلومة دي مش متاحة حاليًا في المعلومات المتوفرة لدينا.",
}
