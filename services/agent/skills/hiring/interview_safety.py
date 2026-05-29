import re
from typing import List, Tuple, Optional
from services.agent.storage.schemas import AIAuditEvent

class InterviewSafetyGuard:
    """
    نظام حماية المقابلات (v2): يكتشف الأسئلة الحساسة بتنويعات دقيقة، ومحاولات الاختراق، 
    والمحتوى المسيء، وتوجهات المرشح للإيقاف أو التخطي.
    """
    # Expanded sensitive keywords with Arabic variants
    SENSITIVE_KEYWORDS = [
        r"(age|عمرك|سنك|عمر|سن)", 
        r"(religion|دين|ديانة|ديانتك)", 
        r"(gender|sex|جنس|جنسك|ذكر|أنثى)",
        r"(marital|marriage|زواج|متزوج|متزوجة|أعزب|عزباء)", 
        r"(nationality|جنسية|جنسيتك|أصل|أصلك)",
        r"(disability|إعاقة|احتياجات خاصة)", 
        r"(health|صحة|مرض|حالتك الصحية)",
        r"(political|سياسة|حزب|انتماء سياسي)", 
        r"(pregnant|pregnancy|حمل|حامل|حوامل)",
        r"(race|ethnicity|عرق|عنصرية|لون|بشرة)",
        r"(sect|sectarian|طائفة|مذهب|طائفي)"
    ]

    INJECTION_PATTERNS = [
        r"ignore previous instructions", r"reveal system prompt",
        r"act as admin", r"change scores", r"accept me automatically",
        r"you are now", r"system instruction",
        r"أهمل التعليمات السابقة", r"كشف التعليمات", r"اقبلني تلقائيا",
        r"تجاهل التوجيهات", r"تجاهل كل ما سبق", r"أنت الآن"
    ]

    ABUSIVE_PATTERNS = [
        r"fuck", r"shit", r"bitch", r"idiot", r"stupid", r"asshole",
        r"غبي", r"حقير", r"تافه", r"كلب", r"حمار"
    ]

    FINAL_DECISION_LANGUAGE = [
        r"you are hired", r"you are rejected", r"you failed", r"you passed",
        r"offer you the job", r"we will not proceed",
        r"تم قبولك", r"تم رفضك", r"فشلت في المقابلة", r"نجحت في المقابلة",
        r"نعرض عليك الوظيفة", r"لن نستمر معك"
    ]

    CANDIDATE_INTENTS = {
        "pause_or_stop": [r"stop interview", r"pause interview", r"end interview", r"quit", r"أوقف المقابلة", r"إنهاء المقابلة", r"توقف", r"انسحاب"],
        "skip_question": [r"skip question", r"next question", r"i decline to answer", r"don't want to answer", r"تخطي السؤال", r"تخطي", r"السؤال التالي", r"أرفض الإجابة", r"لا أريد الإجابة"],
        "ask_clarification": [r"what do you mean", r"can you clarify", r"please explain", r"don't understand", r"ماذا تقصد", r"ممكن توضيح", r"لم أفهم", r"يرجى الشرح"]
    }

    def check_question_safety(self, question: str) -> Tuple[bool, Optional[str]]:
        """التحقق من خلو السؤال (من الذكاء الاصطناعي) من أي تلميحات لسمات حساسة أو قرارات نهائية"""
        q_lower = question.lower()
        
        # Check Sensitive
        for pattern in self.SENSITIVE_KEYWORDS:
            if re.search(pattern, q_lower):
                return False, "sensitive_question_blocked"
        
        # Check Final Decision Language
        for pattern in self.FINAL_DECISION_LANGUAGE:
            if re.search(pattern, q_lower):
                return False, "final_decision_language_blocked"
                
        return True, None

    def check_answer_safety(self, answer: str) -> List[str]:
        """اكتشاف محاولات الاختراق أو الإساءة في إجابات المرشحين"""
        flags = []
        a_lower = answer.lower()
        
        for pattern in self.INJECTION_PATTERNS:
            if re.search(pattern, a_lower):
                flags.append("candidate_prompt_injection_detected")
                break
                
        for pattern in self.ABUSIVE_PATTERNS:
            if re.search(pattern, a_lower):
                flags.append("abusive_content_detected")
                break
                
        return flags

    def detect_candidate_intent(self, answer: str) -> Optional[str]:
        """اكتشاف توجه المرشح (تخطي، إيقاف، توضيح)"""
        a_lower = answer.lower()
        for intent, patterns in self.CANDIDATE_INTENTS.items():
            for pattern in patterns:
                if re.search(pattern, a_lower):
                    return intent
        return None

interview_safety = InterviewSafetyGuard()
