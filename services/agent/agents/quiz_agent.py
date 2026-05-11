from typing import List, Dict, Any, Optional
import json
import re
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from core.logger import get_logger
from services.quiz.teacher_quizzes_pipeline import TeacherQuizService
from models import database
import config

logger = get_logger(__name__)

# Initialize Expert Service
teacher_service = TeacherQuizService()

# Specialized LLM for design logic
design_llm = ChatOpenAI(model=config.DEFAULT_MODEL, temperature=0.2, base_url="http://localhost:8081/v1", api_key="no-key")

EXPERT_ADVISOR_PROMPT = """You are Dr. Omar, a senior academic advisor.
Your goal is to parse the user's feedback regarding a quiz proposal and extract the final design parameters.

PROPOSAL ANALYSIS:
{analysis}

USER FEEDBACK:
"{user_msg}"

Extract the following in JSON format:
{{
  "focus_topics": ["list", "of", "topics", "to", "include"],
  "difficulty": "Easy | Medium | Hard",
  "num_questions": integer,
  "language": "ar | en | auto"
}}

If the user didn't specify something, use the defaults from the proposal.
If the user is just saying "go ahead" or "start", use the proposal's full scope.
"""

def quiz_agent_node(state):
    """
    Expert Teacher Agent:
    1. If no active proposal in history -> Perform Stage 1 Analysis & Propose.
    2. If user is responding to a proposal -> Finalize Design & Generate.
    """
    logger.info("--- Expert Teacher Agent Activated ---")
    messages = state.get('messages', [])
    if not messages:
        return {"messages": [AIMessage(content="How can I help you with your quiz?")]}

    last_user_msg = messages[-1].content
    
    # ── Check Context (Did we just propose something?) ──────────────────
    # We look back at the last AI message in the state
    last_ai_msg = None
    for msg in reversed(messages[:-1]):
        if isinstance(msg, AIMessage):
            last_ai_msg = msg
            break
    
    is_responding_to_proposal = last_ai_msg and ("تقرير الخبير" in last_ai_msg.content or "Expert Analysis" in last_ai_msg.content)
    
    try:
        if is_responding_to_proposal and last_ai_msg:
            return _handle_design_finalization(state, last_user_msg, last_ai_msg.content)
        else:
            return _handle_initial_analysis(state, last_user_msg)
            
    except Exception as e:
        logger.error(f"Expert Teacher Error: {e}")
        return {"messages": [AIMessage(content="عذراً، حدث خطأ أثناء إعداد الامتحان. هل يمكنك المحاولة مرة أخرى؟")]}

def _handle_initial_analysis(state, user_msg):
    """Stage 1: Analyze material and propose a plan."""
    # 1. Identify Topic/Doc
    # Simple extraction for now
    topic = user_msg
    doc_id = None
    
    # Try to find a doc_id in recent history if not in msg
    # (Actually ChatService handles attachments, but we'll assume topic is enough for RAG)
    
    logger.info(f"Expert Teacher: Analyzing material for '{topic}'")
    
    try:
        # Resolve source (RAG)
        prospectus = teacher_service.analyze_material_interactive(topic=topic)
        
        analysis_text = prospectus['analysis']
        lang = prospectus['lang']
        
        if lang == "ar":
            reply = f"### 👨‍🏫 تقرير الخبير: تحليل المادة العلمية\n\n"
            reply += f"{analysis_text}\n\n"
            reply += "--- \n"
            reply += "📢 **جاهز أبدأ؟**\n"
            reply += "تحب أركز على مواضيع معينة من اللي فوق؟ ومحتاج كام سؤال؟ (الافتراضي 5 أسئلة بمستوى متوسط)."
        else:
            reply = f"### 👨‍🏫 Expert Analysis: Material Review\n\n"
            reply += f"{analysis_text}\n\n"
            reply += "--- \n"
            reply += "📢 **Ready to generate the exam?**\n"
            reply += "Should I focus on specific topics? How many questions do you need? (Default is 5 questions at Medium difficulty)."

        return {"messages": [AIMessage(content=reply)]}
        
    except ValueError as ve:
        return {"messages": [AIMessage(content=f"لم أجد محتوى كافٍ عن '{topic}'. يرجى التأكد من رفع الملف أو كتابة الموضوع بدقة.")]}

def _handle_design_finalization(state, user_feedback, last_ai_proposal):
    """Stage 2: Process user feedback and generate final quiz."""
    logger.info("Expert Teacher: Finalizing design based on feedback")
    
    # 1. Extract parameters from feedback via LLM
    extraction_prompt = EXPERT_ADVISOR_PROMPT.format(
        analysis=last_ai_proposal,
        user_msg=user_feedback
    )
    
    response = design_llm.invoke([SystemMessage(content=extraction_prompt)])
    
    # Ensure content is string for regex
    content_str = response.content if isinstance(response.content, str) else str(response.content)
    
    try:
        # Use regex to find JSON in case LLM adds fluff
        match = re.search(r'\{.*\}', content_str, re.DOTALL)
        if match:
            params = json.loads(match.group(0))
        else:
            # Fallback defaults
            params = {"focus_topics": [], "difficulty": "Medium", "num_questions": 5, "language": "auto"}
    except:
        params = {"focus_topics": [], "difficulty": "Medium", "num_questions": 5, "language": "auto"}

    # 2. Re-resolve topic
    # Ensure proposal is string
    proposal_str = last_ai_proposal if isinstance(last_ai_proposal, str) else str(last_ai_proposal)
    
    # We take the original topic from the proposal (it's usually in the first line or header)
    topic_match = re.search(r'تحليل المادة العلمية|Material Review', proposal_str)
    # For now, we'll just use the feedback topics if present
    focus_topics = params.get('focus_topics', [])
    if not isinstance(focus_topics, list):
        focus_topics = [str(focus_topics)] if focus_topics else []
    
    primary_topic = ", ".join(str(t) for t in focus_topics) or "General"
    
    # Extract and cast params safely
    difficulty = params.get('difficulty', 'Medium')
    if isinstance(difficulty, list):
        difficulty = str(difficulty[0]) if difficulty else 'Medium'
    else:
        difficulty = str(difficulty)
        
    num_questions_raw = params.get('num_questions', 5)
    if isinstance(num_questions_raw, list):
        num_questions = int(num_questions_raw[0]) if num_questions_raw else 5
    else:
        try:
            num_questions = int(num_questions_raw)
        except (ValueError, TypeError):
            num_questions = 5
            
    language = params.get('language', 'auto')
    if isinstance(language, list):
        language = str(language[0]) if language else 'auto'
    else:
        language = str(language)

    # 3. Generate Final Professional Quiz
    final_quiz = teacher_service.generate_quiz(
        topic=primary_topic,
        difficulty=difficulty,
        num_questions=num_questions,
        language=language
    )
    
    if final_quiz.language == "ar":
        msg = f"✅ **تم توليد الامتحان الاحترافي بنجاح!**\n\n"
        msg += f"الموضوع: **{final_quiz.topic}**\n"
        msg += f"عدد الأسئلة: {len(final_quiz.questions)}\n"
        msg += f"المستوى: {final_quiz.difficulty}\n\n"
        msg += f"👉 **[ابدأ الامتحان الآن](/admin/quizzes/{final_quiz.quiz_id})**"
    else:
        msg = f"✅ **Professional Exam Generated!**\n\n"
        msg += f"Topic: **{final_quiz.topic}**\n"
        msg += f"Questions: {len(final_quiz.questions)}\n"
        msg += f"Difficulty: {final_quiz.difficulty}\n\n"
        msg += f"👉 **[Take Exam Now](/admin/quizzes/{final_quiz.quiz_id})**"

    return {"messages": [AIMessage(content=msg)]}
