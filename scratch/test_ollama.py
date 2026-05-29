import requests
import json
import re

# Construct the prompt
system_prompt = (
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
    "- ممنوع إخراج placeholders مثل [اسم الشركة] أو [اسم الشركة المذكورة في البيانات].\n"
    "- ممنوع استخدام لغة غير لغة المستخدم. لا تستخدم كلمات أجنبية غير مألوفة مثل nhé.\n"
    "- إذا كان اسم الشركة غير موجود في سياق البيانات المتاحة، يجب أن تقول: 'لا أستطيع تحديد اسم الشركة من البيانات المتاحة حالياً.' ولا تخترع أي اسم شركة من خيالك.\n"
    "- استخدم لغة العميل (العربية الفصحى أو العامية حسب سؤاله).\n"
    "- كن موجزاً ومفيداً.\n"
    "- لا تستخدم علامة <think> أو أي وسوم تفكير داخلية.\n"
)

retrieved_context = """MAESTA — Project Documentation

Type: Graduation Project (Frontend Demo)
Authors: Mohamed Amin, Sherif Talaat, Shahd Mohay
Stack: React 18, React Router v6, Context API, CSS Modules
Status: Demo-ready (mock data, no live backend)"""

user_question = "مشروع ايه دي..."

user_msg = (
    f"Company Data:\n"
    f"Company name: \n"
    f"Business type: المجال المذكور في المستندات\n"
    f"Website or platform type: الموقع الرسمي\n"
    f"Tone: helpful, clear Arabic\n"
    f"Language preference: same as customer\n"
    f"Support behavior: answer only from available information\n"
    f"Fallback message: لا أستطيع تحديد هذه المعلومة من البيانات المتاحة حالياً.\n"
    f"\n"
    f"Available Company Information:\n"
    f"{retrieved_context}\n"
    f"\n"
    f"Conversation History:\n"
    f"\n"
    f"Customer Message:\n"
    f"{user_question}"
)

# Test with temperature 0
payload_temp_0 = {
    "model": "qwen3-company-assistant",
    "messages": [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_msg}
    ],
    "stream": False,
    "options": {
        "temperature": 0.0,
        "num_predict": 500
    }
}

# Test with temperature 0.2
payload_temp_02 = {
    "model": "qwen3-company-assistant",
    "messages": [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_msg}
    ],
    "stream": False,
    "options": {
        "temperature": 0.2,
        "num_predict": 500
    }
}

# Test with default qwen3:8b model (temp 0)
payload_default_0 = {
    "model": "qwen3:8b",
    "messages": [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_msg}
    ],
    "stream": False,
    "options": {
        "temperature": 0.0,
        "num_predict": 500
    }
}

base_url = "http://localhost:11434/api/chat"

print("--- Testing qwen3-company-assistant with Temp 0 ---")
try:
    response = requests.post(base_url, json=payload_temp_0, timeout=120)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        content = response.json().get("message", {}).get("content")
        print("Raw Content:")
        print(content)
        print("Sanitized Content:")
        print(re.sub(r"<think>[\s\S]*?</think>", "", content).strip())
except Exception as e:
    print(f"Error: {e}")

print("\n--- Testing qwen3-company-assistant with Temp 0.2 ---")
try:
    response = requests.post(base_url, json=payload_temp_02, timeout=120)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        content = response.json().get("message", {}).get("content")
        print("Raw Content:")
        print(content)
        print("Sanitized Content:")
        print(re.sub(r"<think>[\s\S]*?</think>", "", content).strip())
except Exception as e:
    print(f"Error: {e}")

