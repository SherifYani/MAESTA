"""
Company System Prompt Builder — agent/agents/company_prompt.py
================================================================
يبني system prompt عامًا لأي شركة أو موقع بدلًا من persona ثابتة.
مستوحى من system_prompt.txt في data/fine_tuning/system_prompt.txt.

الاستخدام:
    from services.agent.agents.company_prompt import build_company_system_prompt
    prompt = build_company_system_prompt(company_id="xxx")

لو الموديل يعمل في COMPANY_ASSISTANT_MODE، استخدم هذا الـ prompt
بدلًا من SYSTEM_PERSONA الموجود في config.py.
"""


def get_company_profile(company_id: str | None = None) -> dict:
    """Load company profile from database. Falls back to DEFAULT_COMPANY_PROFILE."""
    if company_id:
        try:
            from models.database import get_company_by_id
            company = get_company_by_id(company_id)
            if company:
                return {
                    "company_name": company['name'],
                    "business_type": company.get('business_type', ''),
                    "platform_type": company.get('platform_type', ''),
                    "tone": company.get('tone', 'helpful, clear Arabic'),
                    "support_behavior": company.get('support_behavior', ''),
                    "fallback_message": company.get('fallback_message', 'المعلومة دي مش متاحة حاليًا في المعلومات المتوفرة لدينا.'),
                    "system_prompt": company.get('system_prompt', ''),
                    "language": company.get('language', 'ar'),
                }
        except Exception:
            pass
    return DEFAULT_COMPANY_PROFILE.copy()


def build_company_system_prompt(company_id: str | None = None, detected_language: str | None = None) -> str:
    """
    Return the company assistant system prompt.
    If company has a custom system_prompt, use it. Otherwise use default.
    detected_language: 'ar' or 'en' — detected from user message.
    """
    profile = get_company_profile(company_id)

    # If company has a custom system prompt, use it directly
    if profile.get("system_prompt"):
        return profile["system_prompt"]

    # Always include language instruction based on detected language
    if detected_language == "ar":
        lang_instruction = "رد دائمًا باللغة العربية الفصحى. حتى لو كان السؤال فيه إنجليزي، لازم يكون الرد بالعربي."
    elif detected_language == "en":
        lang_instruction = "Always respond in English. Even if the question contains Arabic words, respond in English."
    else:
        lang_instruction = "رد بنفس لغة المستخدم (عربي إذا كتب بالعربي، إنجليزي إذا كتب بالإنجليزي)."

    return (
        f"أنت مساعد {profile.get('company_name', 'الشركة')}. مهمتك الإجابة على أسئلة العملاء بناءً على المعلومات المتاحة أدناه.\n"
        "\n"
        "قواعد مهمة جداً:\n"
        "- أجب من المعلومات الموجودة في 'Available Information' فقط.\n"
        "- لا تقل 'المعلومة غير متاحة' إلا إذا لم تجد أي معلومة مرتبطة في السياق.\n"
        "- إذا وجدت معلومة حتى لو جزئية، أجب بها.\n"
        "- لا تذكر أسماء مشاريع أو شركات غير موجودة في السياق.\n"
        "- لا تستخدم علامة <think> أو أي وسوم تفكير داخلية.\n"
        f"- {lang_instruction}\n"
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
    بناء user message بسيط وفعال.
    """
    return (
        f"Company: {company_name}\n"
        f"---\n"
        f"Available Information (Full Documents):\n"
        f"{retrieved_context}\n"
        f"---\n"
        f"Customer Message:\n"
        f"{user_question}"
    )


# ── Default company profile (used when no company is configured) ─────────

DEFAULT_COMPANY_PROFILE = {
    "company_name": "",
    "business_type": "المجال المذكور في المستندات",
    "platform_type": "الموقع الرسمي",
    "tone": "helpful, clear Arabic",
    "support_behavior": "answer only from available information",
    "fallback_message": "لا أستطيع تحديد هذه المعلومة من البيانات المتاحة حالياً.",
}
