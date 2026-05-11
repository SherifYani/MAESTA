"""
NLP Service - Smart Intent Detection and Response Generation
"""
from typing import Dict, Optional
from services.agent.ollama_service import ollama_service
import config


class NLPService:
    """NLP service for smart intent detection and language-aware responses"""
    
    def __init__(self):
        self.ollama = ollama_service
        
        # Arabic greetings and keywords
        self.arabic_greetings = [
            'مرحبا', 'اهلا', 'السلام', 'صباح', 'مساء', 'هاي', 'هلو', 'اهلين',
            'السلام عليكم', 'صباح الخير', 'مساء الخير', 'كيفك', 'ازيك', 'عامل ايه'
        ]
        
        self.english_greetings = [
            'hi', 'hello', 'hey', 'good morning', 'good evening', 'howdy', 'yo', 'sup'
        ]
        
        # Quick responses for greetings (no AI needed)
        self.quick_arabic_greetings = [
            "أهلاً! كيف أقدر أساعدك؟",
            "مرحباً! إيش تحتاج؟", 
            "أهلاً وسهلاً! قولي شو تبي؟",
            "هلا! شلونك؟ كيف أقدر أخدمك؟",
            "أهلاً بيك! في إيه أقدر أساعدك فيه؟",
            "مرحبا! عندك سؤال أو محتاج مساعدة؟",
            "هلا والله! تفضل، أنا معاك",
            "أهلين! كيف ممكن أفيدك؟"
        ]
        
        self.quick_english_greetings = [
            "Hi! How can I help you?",
            "Hello! What do you need?",
            "Hey! How can I assist you?",
            "Hi there! What can I do for you?",
            "Hello! Feel free to ask me anything.",
            "Hey! I'm here to help."
        ]
    
    def detect_language(self, text: str) -> str:
        """Detect if text is Arabic or English"""
        arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06FF')
        total_chars = len(text.replace(' ', ''))
        
        if total_chars == 0:
            return 'english'
        
        arabic_ratio = arabic_chars / total_chars
        return 'arabic' if arabic_ratio > 0.3 else 'english'
    
    def detect_intent_fast(self, text: str, language: str) -> Dict:
        """Fast keyword-based intent detection (no AI call)"""
        text_lower = text.lower().strip()
        text_clean = text.strip()
        
        # Check for greeting
        greetings = self.arabic_greetings if language == 'arabic' else self.english_greetings
        for greeting in greetings:
            if greeting in text_lower or text_clean.startswith(greeting):
                return {
                    'intent': 'greeting',
                    'confidence': 'high',
                    'quick_response': True
                }
        
        # Check for question indicators
        arabic_q = ['ما', 'ماذا', 'لماذا', 'كيف', 'متى', 'أين', 'من', 'هل', 'ايه', 'ازاي', 'ليه', 'فين', 'مين', 'امتى', 'ايش', 'شو', 'وين', 'كم']
        english_q = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can', 'could', 'would', 'is', 'are', 'do', 'does']
        
        q_indicators = arabic_q if language == 'arabic' else english_q
        
        if text_clean.endswith('?') or text_clean.endswith('؟') or any(q in text_lower.split() for q in q_indicators):
            return {
                'intent': 'question',
                'confidence': 'high',
                'quick_response': False
            }
        
        # Check for thanks
        thanks_ar = ['شكرا', 'شكراً', 'مشكور', 'تسلم', 'يعطيك العافية']
        thanks_en = ['thanks', 'thank you', 'thx', 'appreciate']
        thanks = thanks_ar if language == 'arabic' else thanks_en
        
        if any(t in text_lower for t in thanks):
            return {
                'intent': 'thanks',
                'confidence': 'high',
                'quick_response': True
            }
        
        # Default to statement
        return {
            'intent': 'statement',
            'confidence': 'medium',
            'quick_response': False
        }
    
    def get_quick_response(self, intent: str, language: str) -> Optional[str]:
        """Get quick response for simple intents (no AI needed)"""
        import random
        
        if intent == 'greeting':
            responses = self.quick_arabic_greetings if language == 'arabic' else self.quick_english_greetings
            return random.choice(responses)
        
        if intent == 'thanks':
            if language == 'arabic':
                return random.choice(["العفو! أي خدمة تانية؟", "عفواً! تحتاج حاجة تانية؟", "على الرحب والسعة!"])
            else:
                return random.choice(["You're welcome!", "No problem! Anything else?", "Glad to help!"])
        
        return None
    
    def build_smart_prompt(self, text: str, intent: str, language: str) -> str:
        """Build natural, adaptive prompts based on intent and language"""
        
        if language == 'arabic':
            lang_instruction = config.SYSTEM_PERSONA_AR
        else:
            lang_instruction = config.SYSTEM_PERSONA
        
        if intent == 'question':
            if language == 'arabic':
                return f"""{lang_instruction}

السؤال: {text}

الجواب:"""
            else:
                return f"""{lang_instruction}

Question: {text}

Answer:"""
        
        elif intent == 'statement':
            if language == 'arabic':
                return f"""{lang_instruction}

المستخدم قال: {text}

رد مناسب:"""
            else:
                return f"""{lang_instruction}

User said: {text}

Response:"""
        
        else:
            return f"""{lang_instruction}

{text}

Response:"""
    
    def process_for_general_response(self, text: str) -> Dict:
        """
        Full NLP processing for general responses.
        Returns quick response or enhanced prompt.
        """
        # Step 1: Detect language
        language = self.detect_language(text)
        
        # Step 2: Fast intent detection
        intent_result = self.detect_intent_fast(text, language)
        
        # Step 3: Check for quick response (no AI needed)
        quick_response = None
        if intent_result.get('quick_response'):
            quick_response = self.get_quick_response(intent_result['intent'], language)
        
        # Step 4: Build smart prompt for AI
        enhanced_prompt = self.build_smart_prompt(text, intent_result['intent'], language)
        
        return {
            'original_text': text,
            'language': language,
            'intent': intent_result['intent'],
            'intent_confidence': intent_result['confidence'],
            'detection_method': 'keywords',
            'enhanced_prompt': enhanced_prompt,
            'quick_response': quick_response  # If not None, use this instead of AI
        }


# Singleton instance
nlp_service = NLPService()

