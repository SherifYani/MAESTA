from typing import Optional, List, Dict, Any
from flask import Blueprint, render_template, request, jsonify, session
from core.logger import get_logger
from services.agent.schemas import BotRuntimeContext

logger = get_logger(__name__)
from services.agent.skills.hiring.interview_consent_service import consent_service
from services.agent.skills.hiring.interview_runner import interview_runner
from services.agent.skills.hiring.interview_report_builder import report_builder
from services.agent.storage.ai_storage import ai_storage
from services.agent.storage.ai_database import get_ai_db_connection
from services.agent.storage.schemas import AIInterviewSession, AIInterviewMessage
from services.interview.generators.question_generator import question_generator as tech_question_generator
from services.interview.reports.final_report import final_report_generator
from services.interview.evaluators.answer_evaluator import answer_evaluator
from services.interview.security.anti_cheat import anti_cheat_engine
from services.interview.graph.nodes import run_consistency_analysis, generate_final_report, run_benchmark_analysis
from services.agent.storage.schemas import AIInterviewReport
from models import database
import json
import uuid
from datetime import datetime as dt

# === Enhanced Interview System Features ===
# Added comprehensive time tracking and skip functionality for improved candidate experience

candidate_interview_bp = Blueprint('candidate_interview', __name__, url_prefix='/candidate/interview')

def get_candidate_runtime(tenant_id: str, site_id: str, bot_id: str) -> BotRuntimeContext:
    """بناء سياق المرشح"""
    return BotRuntimeContext(
        tenant_id=tenant_id, site_id=site_id, bot_id=bot_id,
        api_key_id="candidate_api", session_id="candidate_session",
        user_id="candidate", user_role="candidate",
        enabled_modules=[], language="ar", allowed_actions=[]
    )


def _ensure_ai_interview_session(session_id: str) -> Optional[dict]:
    """تأكد من وجود الجلسة في AI DB، وإن لم تكن موجودة انسخها من Main DB"""
    # Try AI DB first
    conn = get_ai_db_connection()
    row = conn.execute("SELECT * FROM ai_interview_sessions WHERE id = ?", (session_id,)).fetchone()
    conn.close()
    if row:
        return dict(row)

    # Fall back to Main DB (interview_sessions table)
    main_session = database.get_interview_session(session_id)
    if not main_session:
        return None

    # Mirror to AI DB
    created = main_session.get("created_at")
    if created and isinstance(created, str):
        try:
            created = dt.fromisoformat(created)
        except:
            created = dt.now()
    elif not created:
        created = dt.now()

    ai_session = AIInterviewSession(
        id=main_session["id"],
        tenant_id=main_session.get("tenant_id") or "default",
        site_id=main_session.get("site_id") or "default",
        bot_id=main_session.get("bot_id") or "default",
        job_id=main_session.get("job_id", ""),
        candidate_id=main_session.get("candidate_id", ""),
        status="draft",
        consent_status="not_requested",
        created_at=created,
    )
    ai_storage.interviews.save_session(ai_session)

    # Return from AI DB now that it exists
    conn = get_ai_db_connection()
    row = conn.execute("SELECT * FROM ai_interview_sessions WHERE id = ?", (session_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_session_data(id: str):
    """جلب بيانات الجلسة مع المزامنة التلقائية من Main DB إلى AI DB"""
    return _ensure_ai_interview_session(id)


def _get_skills_for_session(session_id: str) -> list:
    """استخراج المهارات من جلسة Main DB أو من الأسئلة الموجودة"""
    main_session = database.get_interview_session(session_id)
    skills = []
    if main_session:
        matched = main_session.get("matched_skills")
        if matched:
            if isinstance(matched, str):
                try:
                    skills = json.loads(matched)
                except (json.JSONDecodeError, TypeError):
                    pass
            elif isinstance(matched, list):
                skills = matched
    # Fallback: extract skills from existing questions
    if not skills:
        existing_qs = database.get_interview_questions(session_id) or []
        seen = set()
        for q in existing_qs:
            skill_name = q.get("skill", "")
            if skill_name and skill_name not in seen and skill_name != "technical_skills":
                seen.add(skill_name)
                skills.append({"name": skill_name, "priority": 50})
    # Final fallback: common dev skills
    if not skills:
        logger.warning(f"No skills found for {session_id}, using defaults")
        skills = [
            {"name": ".net", "priority": 90},
            {"name": "c#", "priority": 85},
            {"name": "sql", "priority": 80},
            {"name": "asp.net core", "priority": 75},
            {"name": "entity framework", "priority": 70},
        ]
    result = [s for s in skills if isinstance(s, dict) and s.get("name")]
    logger.info(f"Skills for {session_id}: {[s['name'] for s in result]}")
    return result


def _get_asked_skills(session_id: str, tenant_id: str, site_id: str, bot_id: str) -> set:
    """المهارات التي تم طرح أسئلة عنها بالفعل"""
    msgs = ai_storage.messages.list_messages_by_interview(session_id, tenant_id, site_id, bot_id)
    asked = set()
    for m in msgs:
        if m.sender == "ai" and m.message_type == "question" and hasattr(m, 'topic') and m.topic:
            asked.add(m.topic)
    return asked


def _save_ai_question(session_id: str, tenant_id: str, site_id: str, bot_id: str, question_dict: dict):
    """حفظ السؤال في AI DB لعرضه في الشات"""
    msg = AIInterviewMessage(
        interview_id=session_id, tenant_id=tenant_id, site_id=site_id, bot_id=bot_id,
        sender="ai", message=question_dict.get("question", ""), message_type="question",
    )
    ai_storage.messages.save_message(msg)


def _save_main_answer(session_id: str, question_id: str, answer: str, skill: str,
                      score: float = 0, semantic_score: float = 0,
                      coverage_score: float = 0, accuracy_score: float = 0,
                      completeness_score: float = 0, confidence: float = 0,
                      strengths: str = '[]', weaknesses: str = '[]',
                      missing_concepts: str = '[]'):
    """حفظ الإجابة في Main DB مع نتائج التقييم"""
    database.create_interview_answer(
        question_id=question_id, session_id=session_id,
        candidate_answer=answer, score=score,
        strengths=strengths, weaknesses=weaknesses,
        missing_concepts=missing_concepts,
        semantic_score=semantic_score,
        coverage_score=coverage_score,
        accuracy_score=accuracy_score,
        completeness_score=completeness_score,
        confidence=confidence,
        skill=skill,
    )


def check_time_remaining(session_id: str) -> dict:
    """
    فحص الوقت المتبقي للجلسة - نظام التنبيه الزمني الجديد
    
    يوفر هذا النظام:
    - الوقت المتبقي بالدقائق والثواني
    - تنبيهات عند اقتراب الوقت من الانتهاء
    - تحذير عند انتهاء الوقت
    """
    tracking = database.get_time_tracking(session_id)
    if not tracking:
        return {"remaining_seconds": 0, "warning": False, "expired": True}
    
    started = dt.fromisoformat(tracking['started_at'])
    elapsed = int((dt.now() - started).total_seconds())
    time_limit = tracking.get('time_limit_minutes', 60) * 60
    remaining = time_limit - elapsed
    
    # إرسال تنبيه عند الاقتراب من الوقت المتبقي
    warnings = json.loads(tracking.get('warnings_sent_json', '[]'))
    should_warn = False
    next_warning = None
    
    for warn_min in [5, 10, 15, 30]:
        warn_sec = warn_min * 60
        if remaining <= warn_sec and warn_min not in warnings:
            should_warn = True
            next_warning = warn_min
            break
    
    return {
        "remaining_seconds": max(0, remaining),
        "elapsed_seconds": elapsed,
        "warning": should_warn,
        "warning_minutes": next_warning,
        "expired": remaining <= 0
    }


@candidate_interview_bp.route('/<id>')
def interview_page(id):
    data = _ensure_ai_interview_session(id)
    if not data:
        return "Interview not found", 404
    if data['status'] == 'cancelled':
        return "This interview has been cancelled.", 403
    return render_template('candidate/interview.html', interview=data)

@candidate_interview_bp.route('/<id>/consent', methods=['POST'])
def submit_consent(id):
    try:
        logger.info(f"Consent request for session {id}")
        data = get_session_data(id)
        if not data:
            logger.warning(f"Session {id} not found")
            return jsonify({"error": "Not found"}), 404
        runtime = get_candidate_runtime(data['tenant_id'], data['site_id'], data['bot_id'])
        
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        choice = request.json.get('choice')
        if not choice:
            return jsonify({"error": "Missing choice field"}), 400
        
        if choice == 'accepted':
            logger.info(f"Accepting consent for session {id}")
            consent_service.accept_consent(runtime, id, data['candidate_id'])
            logger.info(f"Starting interview for session {id}")
            interview_runner.start_interview(runtime, id)
            try:
                logger.info(f"Creating time tracking for session {id}")
                database.create_time_tracking(id, time_limit_minutes=60)
            except Exception as tt_err:
                logger.warning(f"Time tracking creation failed (non-fatal): {tt_err}")
            logger.info(f"Consent flow completed for session {id}")
            return jsonify({"status": "success", "message": "Consent accepted and interview started."})
        else:
            consent_service.decline_consent(runtime, id, data['candidate_id'])
            return jsonify({"status": "declined", "message": "Consent declined."})
    except Exception as e:
        logger.error(f"Consent error for session {id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 400

MAX_INTERVIEW_QUESTIONS = 10


def _generate_next_q(session_id: str, tenant_id: str, site_id: str, bot_id: str, runtime) -> dict:
    """توليد السؤال التالي بناءً على المهارات المتاحة"""
    skills = _get_skills_for_session(session_id)
    msgs = ai_storage.messages.list_messages_by_interview(session_id, tenant_id, site_id, bot_id)
    asked_qs = [m for m in msgs if m.sender == "ai" and m.message_type == "question"]
    asked = len(asked_qs)
    
    if asked >= MAX_INTERVIEW_QUESTIONS:
        interview_runner.complete_interview(runtime, session_id)
        return {"status": "completed", "message": "Interview finished. Thank you!"}

    # جمع المهارات اللي اتسألت قبل كده من Main DB عشان متتكررش
    asked_qs_db = database.get_interview_questions(session_id) or []
    asked_skills = set(q.get("skill", "") for q in asked_qs_db if q.get("skill"))


    # اختيار المهارة التالية (round-robin مع تجنب التكرار)
    if skills:
        remaining = [s for s in skills if s["name"] not in asked_skills]
        pool = remaining if remaining else skills
        idx = asked % len(pool)
        next_skill = pool[idx]["name"]
    else:
        next_skill = None

    # بناء سياق غني من Main DB
    main_session = database.get_interview_session(session_id)
    context_parts = []
    if main_session:
        ms = main_session.get("matched_skills", "")
        if ms:
            ms_str = json.dumps(ms, ensure_ascii=False) if isinstance(ms, (list, dict)) else str(ms)
            context_parts.append(f"Matched skills: {ms_str[:500]}")
        ss = main_session.get("skill_scores", "")
        if ss:
            ss_str = json.dumps(ss, ensure_ascii=False) if isinstance(ss, (list, dict)) else str(ss)
            context_parts.append(f"Skill scores: {ss_str[:500]}")
        jt = main_session.get("job_title", "") or main_session.get("job_requirements", "")
        if jt:
            context_parts.append(f"Job context: {jt}")
    context = "\n".join(context_parts) if context_parts else ""

    # الإجابات السابقة - عشان يسأل أسئلة متقدمة
    prev_answers = [m.message for m in msgs if m.sender == "candidate" and m.message_type == "answer"]

    q_data = tech_question_generator.generate(
        skill=next_skill or "technical_skills", difficulty_level=2,
        question_type="technical", context=context[:2000],
        target_topic="", asked_topics=list(asked_skills), language="ar",
        previous_answers=prev_answers[-2:],
    )
    q_text = q_data.get("question", "")

    # حفظ في AI DB (غير حرج — السؤال بيرجع حتى لو فشل الحفظ)
    q_id = q_data.get("id", str(uuid.uuid4()))
    try:
        msg = AIInterviewMessage(
            interview_id=session_id, tenant_id=tenant_id, site_id=site_id, bot_id=bot_id,
            sender="ai", message=q_text, message_type="question",
        )
        ai_storage.messages.save_message(msg)
    except Exception as save_err:
        logger.warning(f"AI DB save failed (non-fatal): {save_err}")

    # حفظ في Main DB للتوافق
    try:
        database.create_interview_question(
            session_id=session_id, skill=q_data.get("skill", ""),
            question=q_text, question_type="technical",
            difficulty_level=q_data.get("difficulty_level", 1),
            is_followup=False, followup_count=0, skill_index=0,
            q_id=q_id,
        )
    except Exception as save_err:
        logger.warning(f"Main DB save failed (non-fatal): {save_err}")
    return {"status": "question", "text": q_text, "q_id": q_id}


def _generate_report(session_id: str, tenant_id: str, site_id: str, bot_id: str):
    """توليد التقرير النهائي باستخدام LangGraph pipeline (Phases 4-8)"""
    answered_qs_db = database.get_interview_answers(session_id) or []
    all_qs_db = database.get_interview_questions(session_id) or []
    answered_ids = {a.get("question_id") for a in answered_qs_db if a.get("question_id")}
    skipped_count = sum(1 for q in all_qs_db if q.get("id") not in answered_ids)
    total_questions = len(all_qs_db)

    if not answered_qs_db:
        logger.warning("No evaluated answers found to generate report")
        return

    scores = [a.get("score", 0) for a in answered_qs_db]
    avg_score = sum(scores) / len(scores) if scores else 50

    # Build candidate_answers for LangGraph nodes
    candidate_answers = []
    skill_set = set()
    for ans in answered_qs_db:
        candidate_answers.append({
            "question_id": ans.get("question_id", ""),
            "skill": ans.get("skill", ""),
            "candidate_answer": ans.get("candidate_answer", ""),
            "score": ans.get("score", 0),
            "evaluation": {
                "score": ans.get("score", 0),
                "semantic_score": ans.get("semantic_score", 0),
                "coverage_score": ans.get("coverage_score", 0),
                "accuracy_score": ans.get("accuracy_score", 0),
                "completeness_score": ans.get("completeness_score", 0),
                "knowledge_score": ans.get("knowledge_score", 0),
                "confidence": ans.get("confidence", 0),
            }
        })
        skill_set.add(ans.get("skill", ""))
    # Build skill_assessments from per-skill averages for consistency node
    skill_assessments = []
    for sk in skill_set:
        if not sk: continue
        sk_scores = [a["score"] for a in candidate_answers if a["skill"] == sk]
        if sk_scores:
            skill_assessments.append({
                "skill": sk,
                "claimed_level": 50,
                "verified_level": sum(sk_scores) / len(sk_scores),
                "questions_asked": len(sk_scores),
                "average_score": sum(sk_scores) / len(sk_scores),
            })

    # Phase 8: Consistency analysis via LangGraph node
    consistency_result = {}
    try:
        consistency_result = run_consistency_analysis({
            "skill_assessments": skill_assessments,
            "candidate_answers": candidate_answers,
            "cv_text": "",
            "jd_text": "",
        })
    except Exception as c_err:
        logger.warning(f"Consistency analysis failed: {c_err}")

    # Phase 5: Anti-cheat full report
    anti_cheat_report = {}
    try:
        anti_cheat_report = anti_cheat_engine.get_full_report()
    except Exception as ac_err:
        logger.warning(f"Anti-cheat report failed: {ac_err}")

    # Phase 8: Benchmark analysis via LangGraph node
    benchmark_result = {}
    try:
        benchmark_result = run_benchmark_analysis({
            "session_id": session_id,
            "final_score": avg_score,
            "skill_scores": {},
            "job_id": "",
            "company_id": "",
        })
    except Exception as b_err:
        logger.warning(f"Benchmark analysis failed: {b_err}")

    # Phase 8: Final report via LangGraph node (weighted deterministic scoring)
    graph_state = {
        "candidate_answers": candidate_answers,
        "technical_score": avg_score,
        "practical_score": 0,
        "experience_score": avg_score * 0.5,
        "consistency_score": consistency_result.get("consistency_score", 0),
        "communication_score": avg_score * 0.8,
        "trust_score": consistency_result.get("trust_score", 0),
        "cv_match": 0,
        "trust_gaps": consistency_result.get("trust_gaps", []),
        "risk_flags": consistency_result.get("risk_flags", []),
        "risk_flags_detailed": consistency_result.get("risk_flags_detailed", []),
        "anti_cheat_report": anti_cheat_report,
        "challenge_evaluation": {},
        "benchmark": benchmark_result.get("benchmark", {}),
        "candidate_data": {},
        "job_description": {},
        "ats_results": {},
        "skill_assessments": [],
        "skipped_count": skipped_count,
        "total_questions": total_questions,
    }
    report_result = generate_final_report(graph_state)
    final_score = report_result.get("final_score", avg_score)
    recommendation = report_result.get("recommendation", "N/A")
    technical_score = report_result.get("technical_score", avg_score)
    communication_score = report_result.get("communication_score", avg_score * 0.8)
    consistency_score = report_result.get("consistency_score", 0)
    trust_score = report_result.get("trust_score", 0)

    # Phase 7: Save to AI DB
    recommendation_text = report_result.get("report", {}).get("recommendation_text", "")
    report = AIInterviewReport(
        interview_id=session_id, tenant_id=tenant_id, site_id=site_id, bot_id=bot_id,
        candidate_id="", job_id="",
        technical_score=int(technical_score),
        communication_score=int(communication_score),
        job_fit_score=int(final_score),
        strengths=[recommendation_text] if recommendation_text else [],
        concerns=report_result.get("risk_flags", []) or [],
        recommendation=recommendation,
        summary_for_company=json.dumps(report_result, ensure_ascii=False),
    )
    ai_storage.reports.save_report(report)

    # Phase 7: Save to Main DB for analytics dashboard (skip if exists)
    try:
        existing = database.get_interview_report(session_id)
        if existing:
            logger.info(f"Report already exists for {session_id}, skipping Main DB save")
        else:
            database.create_interview_report(
                session_id=session_id,
                technical_score=int(technical_score),
                communication_score=int(communication_score),
                consistency_score=int(consistency_score),
                trust_score=int(trust_score),
                experience_score=int(avg_score * 0.5),
                final_score=int(final_score),
                recommendation=recommendation,
                strengths=json.dumps(recommendation_text, ensure_ascii=False),
                weaknesses=json.dumps(anti_cheat_report.get("warnings", []), ensure_ascii=False),
                skill_breakdown=json.dumps(candidate_answers, ensure_ascii=False),
                trust_analysis=json.dumps(anti_cheat_report, ensure_ascii=False),
                evidence=json.dumps(consistency_result, ensure_ascii=False),
                report_text=json.dumps(report_result, ensure_ascii=False),
            )
    except Exception as db_err:
        logger.warning(f"Main DB report save failed (non-fatal): {db_err}")

    logger.info(f"Report: score={final_score:.1f}, rec={recommendation}, skipped={skipped_count}/{total_questions}")


@candidate_interview_bp.route('/<id>/next')
def next_question(id):
    try:
        data = get_session_data(id)
        if not data: return jsonify({"error": "Not found"}), 404
        runtime = get_candidate_runtime(data['tenant_id'], data['site_id'], data['bot_id'])
        result = _generate_next_q(id, data['tenant_id'], data['site_id'], data['bot_id'], runtime)
        # Generate report if interview just completed
        if result.get("status") == "completed":
            try:
                _generate_report(id, data['tenant_id'], data['site_id'], data['bot_id'])
            except Exception as r_err:
                logger.error(f"Report generation on complete failed: {r_err}")
        return jsonify(result)
    except Exception as e:
        logger.error(f"/next error for {id}: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 400


@candidate_interview_bp.route('/<id>/answer', methods=['POST'])
def submit_answer(id):
    try:
        data = get_session_data(id)
        if not data: return jsonify({"error": "Not found"}), 404
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        answer = request.json.get('answer')
        if not answer:
            return jsonify({"error": "Missing answer field"}), 400

        tenant_id, site_id, bot_id = data['tenant_id'], data['site_id'], data['bot_id']

        # Get last question for context and response time (Phase 4)
        msgs = ai_storage.messages.list_messages_by_interview(id, tenant_id, site_id, bot_id)
        last_qs = [m for m in msgs if m.sender == "ai" and m.message_type == "question"]
        last_q_msg = last_qs[-1] if last_qs else None
        question_text = last_q_msg.message if last_q_msg else ""

        # Calculate response time in seconds
        response_time = 0.0
        if last_q_msg and hasattr(last_q_msg, 'created_at') and last_q_msg.created_at:
            try:
                q_time = last_q_msg.created_at
                if isinstance(q_time, str):
                    q_time = dt.fromisoformat(q_time)
                response_time = (dt.now() - q_time).total_seconds()
            except Exception:
                response_time = 0.0

        # Save to AI DB
        msg = AIInterviewMessage(
            interview_id=id, tenant_id=tenant_id, site_id=site_id, bot_id=bot_id,
            sender="candidate", message=answer, message_type="answer",
        )
        ai_storage.messages.save_message(msg)

        # Get q_id from request or last question
        q_id = request.json.get('q_id')
        if not q_id:
            q_id = last_q_msg.id if last_q_msg else str(uuid.uuid4())

        # Detect skill from last question by matching against known skills
        skill = ""
        try:
            skills_list = _get_skills_for_session(id)
            for s in skills_list:
                sname = s.get("name", "").lower()
                if sname and sname in question_text.lower():
                    skill = s["name"]
                    break
            if not skill and skills_list:
                idx = len([m for m in msgs if m.sender == "candidate" and m.message_type == "answer"]) % len(skills_list)
                skill = skills_list[idx].get("name", "")
        except Exception:
            pass

        # Phase 4: Evaluate answer immediately
        eval_result: Dict[str, Any] = {}
        try:
            eval_result = answer_evaluator.evaluate(
                question_text=question_text, answer_text=answer,
                skill=skill, difficulty_level=2,
                jd_text="", cv_text="",
            )
            score = eval_result.get("score", 0)
            logger.info(f"Answer evaluated: score={score}, skill={skill}")
        except Exception as eval_err:
            logger.warning(f"Evaluation failed (non-fatal): {eval_err}")
            eval_result = {"score": 0, "semantic_score": 0, "coverage_score": 0,
                          "accuracy_score": 0, "completeness_score": 0, "confidence": 0,
                          "strengths": [], "weaknesses": [], "missing_concepts": []}

        # Save to Main DB with evaluation scores (Phase 4)
        _save_main_answer(
            id, q_id, answer, skill,
            score=float(eval_result.get("score", 0)),
            semantic_score=float(eval_result.get("semantic_score", 0)),
            coverage_score=float(eval_result.get("coverage_score", 0)),
            accuracy_score=float(eval_result.get("accuracy_score", 0)),
            completeness_score=float(eval_result.get("completeness_score", 0)),
            confidence=float(eval_result.get("confidence", 0)),
            strengths=json.dumps(eval_result.get("strengths", []), ensure_ascii=False),
            weaknesses=json.dumps(eval_result.get("weaknesses", []), ensure_ascii=False),
            missing_concepts=json.dumps(eval_result.get("missing_concepts", []), ensure_ascii=False),
        )

        # Phase 5: Anti-cheat detection
        try:
            anti_result = anti_cheat_engine.analyze_answer(
                answer_text=answer,
                score=eval_result.get("score", 0),
                skill=skill,
                response_time_seconds=response_time,
            )
            if anti_result.get("flags"):
                logger.warning(f"Anti-cheat flags for {id}: {anti_result['flags']}")
        except Exception as ac_err:
            logger.warning(f"Anti-cheat analysis failed (non-fatal): {ac_err}")

        # Re-fetch msgs after save for accurate counts (fix off-by-one)
        fresh_msgs = ai_storage.messages.list_messages_by_interview(id, tenant_id, site_id, bot_id)
        answered = len([m for m in fresh_msgs if m.sender == "candidate" and m.message_type == "answer"])
        total_qs = len([m for m in fresh_msgs if m.sender == "ai" and m.message_type == "question"])
        if answered >= total_qs and total_qs >= MAX_INTERVIEW_QUESTIONS:
            try:
                _generate_report(id, tenant_id, site_id, bot_id)
            except Exception as r_err:
                logger.error(f"Report generation failed: {r_err}")

        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@candidate_interview_bp.route('/<id>/time')
def get_time_status(id):
    """
    API endpoint للحصول على حالة الوقت المتبقي في المقابلة
    
    يعيد:
    - remaining_seconds: الوقت المتبقي بالثواني
    - elapsed_seconds: الوقت المنقضي بالثواني
    - warning: هل يجب إرسال تنبيه؟
    - warning_minutes: الدقائق المتبقية قبل التنبيه
    - expired: هل انتهى الوقت؟
    """
    data = get_session_data(id)
    if not data: return jsonify({"error": "Not found"}), 404
    
    time_info = check_time_remaining(id)
    
    if time_info["warning"]:
        database.add_time_warning(id, time_info["warning_minutes"])
    
    return jsonify({
        "remaining_seconds": time_info["remaining_seconds"],
        "elapsed_seconds": time_info["elapsed_seconds"],
        "warning": time_info["warning"],
        "warning_minutes": time_info["warning_minutes"],
        "expired": time_info["expired"]
    })


@candidate_interview_bp.route('/<id>/skip', methods=['POST'])
def skip_question(id):
    try:
        data = get_session_data(id)
        if not data: return jsonify({"error": "Not found"}), 404
        
        runtime = get_candidate_runtime(data['tenant_id'], data['site_id'], data['bot_id'])
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
        reason = request.json.get('reason', 'dont_know')
        reason_text = request.json.get('reason_text', '')
        
        # Record skip
        messages = ai_storage.messages.list_messages_by_interview(
            id, data['tenant_id'], data['site_id'], data['bot_id']
        )
        last_q = next((m for m in reversed(messages) if m.sender == 'ai' and m.message_type == 'question'), None)
        if last_q:
            database.create_skip_record(
                session_id=id,
                question_id=last_q.id if hasattr(last_q, 'id') else last_q.get('id', ''),
                skill=data.get('current_skill', ''),
                reason=reason, reason_text=reason_text,
                topic=last_q.get('topic', '') if isinstance(last_q, dict) else ''
            )
        
        result = _generate_next_q(id, data['tenant_id'], data['site_id'], data['bot_id'], runtime)
        result["skipped"] = True
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@candidate_interview_bp.route('/<id>/messages')
def get_interview_messages(id):
    data = get_session_data(id)
    if not data:
        return jsonify({"error": "Not found"}), 404
    msgs = ai_storage.messages.list_messages_by_interview(
        id, data['tenant_id'], data['site_id'], data['bot_id']
    )
    return jsonify([{
        "sender": m.sender,
        "message": m.message,
        "message_type": m.message_type,
        "created_at": m.created_at.isoformat() if hasattr(m.created_at, 'isoformat') else str(m.created_at)
    } for m in msgs])

@candidate_interview_bp.route('/<id>/status')
def get_interview_status(id):
    data = get_session_data(id)
    if not data: return jsonify({"error": "Not found"}), 404
    
    time_info = check_time_remaining(id)
    
    # Count questions answered
    messages = ai_storage.messages.list_messages_by_interview(
        id, data['tenant_id'], data['site_id'], data['bot_id']
    )
    q_count = len([m for m in messages if m.message_type == 'question'])
    a_count = len([m for m in messages if m.message_type == 'answer'])
    
    # جلب معلومات المهارات من Main DB
    main_session = database.get_interview_session(id)
    skills = _get_skills_for_session(id)
    skill_info = []
    for s in skills:
        skill_info.append({
            "name": s.get("name", ""),
            "priority": round(s.get("priority_score", 0) * 100, 1),
        })
    
    current_skill = ""
    if messages:
        last_q = next((m for m in reversed(messages) if m.sender == "ai" and m.message_type == "question"), None)
        if last_q:
            for s in skills:
                if s["name"].lower() in last_q.message.lower():
                    current_skill = s["name"]
                    break
    
    return jsonify({
        "status": data.get('status', 'unknown'),
        "current_skill": current_skill or data.get('current_skill', ''),
        "skills": skill_info,
        "questions_asked": q_count,
        "questions_answered": a_count,
        "time_remaining": time_info["remaining_seconds"],
        "time_minutes": time_info.get("remaining_seconds", 0) // 60,
        "time_seconds": time_info.get("remaining_seconds", 0) % 60,
        "time_expired": time_info["expired"],
        "consent_status": data.get('consent_status', 'not_requested')
    })
