"""
Quiz Service - Orchestrates the 5-stage professional exam creation methodology
Based on Dr. Omar Farouk Al-Sayed's methodology.
"""
import json
import uuid
from typing import Dict, List, Optional
from models import database
from services.agent.ollama_service import ollama_service
from core.logger import get_logger
import config

logger = get_logger(__name__)

class QuizService:
    """Orchestrates professional exam generation using 5-stage methodology"""
    
    def __init__(self):
        self.ollama = ollama_service
        self.model = config.DEFAULT_MODEL
        
    def generate_quiz(self, content: str, topic: str = "General", 
                      difficulty: str = "Medium", num_questions: int = 5) -> Dict:
        """
        Executes the 5-stage methodology to generate a high-quality quiz.
        """
        logger.info(f"Starting 5-stage quiz generation for topic: {topic}")
        
        # Stage 1: Deep Material Analysis
        analysis = self._stage1_analysis(content)
        
        # Stage 2: Professional Exam Blueprint
        blueprint = self._stage2_blueprint(analysis, difficulty, num_questions)
        
        # Stage 3: Question Crafting
        raw_questions = self._stage3_crafting(content, blueprint)
        
        # Stage 4: Teacher Self-Review & Refinement
        refined_questions = self._stage4_review(raw_questions, analysis)
        
        # Stage 5: Professional Final Presentation
        final_output = self._stage5_presentation(refined_questions, blueprint, topic)
        
        # Save to database
        try:
            quiz_id = database.save_quiz(
                topic=topic,
                difficulty=difficulty,
                num_questions=num_questions,
                content_json=json.dumps(final_output)
            )
            final_output['quiz_id'] = quiz_id
        except Exception as e:
            logger.error(f"Failed to save quiz to database: {e}")
            
        return final_output

    def _stage1_analysis(self, content: str) -> str:
        """Stage 1: Deep Material Analysis"""
        prompt = f"""أنت د. عمر فاروق السيد، خبير التقييم التعليمي.
قم بتحليل المحتوى التالي تحليلاً عميقاً:
1. استخراج المواضيع الرئيسية والفرعية.
2. تحديد أهداف التعلم (Learning Objectives) بناءً على تصنيف بلوم.
3. رصد المفاهيم الخاطئة الشائعة المرتبطة بهذه المادة.

المحتوى:
{content[:8000]}  # Limit content for small models

التحليل:"""
        return self.ollama.generate(prompt=prompt, system_prompt="خبير تقييم أكاديمي")

    def _stage2_blueprint(self, analysis: str, difficulty: str, num_questions: int) -> str:
        """Stage 2: Professional Exam Blueprint"""
        prompt = f"""بناءً على التحليل التالي، صمم مخططاً (Blueprint) للامتحان:
- العدد الإجمالي للأسئلة: {num_questions}
- درجة الصعوبة: {difficulty}
- توزيع المستويات (تذكر، فهم، تطبيق، تحليل).
- أنواع الأسئلة (اختيار من متعدد، صح وخطأ).

التحليل:
{analysis}

المخطط:"""
        return self.ollama.generate(prompt=prompt, system_prompt="مصمم اختبارات أكاديمية")

    def _stage3_crafting(self, content: str, blueprint: str) -> str:
        """Stage 3: Question Crafting"""
        prompt = f"""بناءً على المحتوى والمخطط التاليين، قم بصياغة أسئلة الامتحان.
القواعد:
- الأسئلة واضحة وغير غامضة.
- الاختيارات في الـ MCQ جذابة ومنطقية (Distractors).
- التتبع المباشر للمحتوى المرفق.

المحتوى:
{content[:4000]}

المخطط:
{blueprint}

الأسئلة:"""
        return self.ollama.generate(prompt=prompt, system_prompt="معد أسئلة امتحانية")

    def _stage4_review(self, questions: str, analysis: str) -> str:
        """Stage 4: Teacher Self-Review & Refinement"""
        prompt = f"""قم بدور المراجع الصارم وراجع الأسئلة التالية:
1. تأكد من خلوها من التكرار أو الغموض.
2. حسن جودة المشتتات (Distractors) بناءً على المفاهيم الخاطئة المرصودة في التحليل.
3. تأكد من التدرج في الصعوبة.

الأسئلة الأصلية:
{questions}

تحليل المادة:
{analysis}

الأسئلة المنقحة:"""
        return self.ollama.generate(prompt=prompt, system_prompt="مراجع أكاديمي")

    def _stage5_presentation(self, refined_questions: str, blueprint: str, topic: str) -> Dict:
        """Stage 5: Professional Final Presentation"""
        prompt = f"""قم بصياغة النتيجة النهائية للامتحان بالهيكل التالي حرفياً:
1. عنوان الامتحان
2. تعليمات للطلاب
3. نص الامتحان (بتمسيق Markdown جميل)
4. مفتاح الإجابة مع الشرح
5. نسخة JSON كاملة للهيكل.

الأسئلة المنقحة:
{refined_questions}

المخطط:
{blueprint}

العنوان: {topic}

المخرج النهائي:"""
        response = self.ollama.generate(prompt=prompt, system_prompt="منسق محتوى أكاديمي")
        
        # Parse JSON part if exists
        questions = []
        try:
            import re
            json_match = re.search(r'```json\s*(.*?)\s*```', response, re.DOTALL)
            if json_match:
                json_data = json.loads(json_match.group(1))
            else:
                # Fallback to finding the first { and last }
                start = response.find('{')
                end = response.rfind('}')
                if start != -1 and end != -1:
                    json_data = json.loads(response[start:end+1])
                else:
                    json_data = {}
            
            # Normalize structure
            if isinstance(json_data, dict):
                questions = json_data.get('questions', [])
            elif isinstance(json_data, list):
                questions = json_data
        except Exception as e:
            logger.warning(f"Failed to extract JSON from stage 5 response: {e}")

        return {
            "title": topic,
            "full_presentation": response,
            "blueprint": blueprint,
            "questions": questions
        }

quiz_service = QuizService()

quizzes_pipeline = quiz_service
