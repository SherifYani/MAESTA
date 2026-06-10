"""
Interview Service — orchestrates the full interview lifecycle.
Provides high-level API for starting, processing, and completing interviews.
"""
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from core.logger import get_logger
from models import database
from services.interview.graph.interview_graph import interview_graph, InterviewWorkflow
from services.interview.graph.interview_state import create_initial_state
from services.interview.schemas.dto import (
    StartInterviewRequest, SubmitAnswerRequest,
    InterviewStatusResponse, InterviewReportResponse, InterviewHistoryItem,
)
import config

logger = get_logger(__name__)


class InterviewService:
    def start_interview(self, req: StartInterviewRequest) -> Dict[str, Any]:
        session_id = database.create_interview_session(
            candidate_id=req.candidate_id,
            job_id=req.job_id,
            company_id=req.company_id,
            tenant_id=req.tenant_id,
            site_id=req.site_id,
            bot_id=req.bot_id,
        )

        database.update_interview_session(
            session_id, status="in_progress", started_at=datetime.now(),
        )

        initial = create_initial_state(
            session_id=session_id,
            candidate_id=req.candidate_id,
            job_id=req.job_id,
            tenant_id=req.tenant_id,
            company_id=req.company_id,
            company_name=req.company_name,
        )

        try:
            result = interview_graph.invoke(initial, config={"recursion_limit": 150})
            self._persist_state(session_id, result)
            return {
                "session_id": session_id,
                "status": "in_progress",
                "message": "Interview started",
                "first_question": result.get("current_question", {}),
            }
        except Exception as e:
            logger.error(f"Interview start failed: {e}")
            database.update_interview_session(session_id, status="error")
            return {"session_id": session_id, "status": "error", "message": str(e)}

    def submit_answer(self, req: SubmitAnswerRequest) -> Dict[str, Any]:
        session = database.get_interview_session(req.session_id)
        if not session:
            return {"error": "Session not found", "status": "error"}
        if session["status"] in ("completed", "cancelled", "error"):
            return {
                "error": f"Session already {session['status']}",
                "status": session["status"],
            }

        state = self._reconstruct_state(session)
        state["current_answer"] = req.answer

        try:
            result = interview_graph.invoke(state, config={"recursion_limit": 150})
            self._persist_state(req.session_id, result)
            return self._build_answer_response(result)
        except Exception as e:
            logger.error(f"Answer processing failed: {e}")
            return {"error": str(e), "status": "error"}

    def get_status(self, session_id: str) -> InterviewStatusResponse:
        session = database.get_interview_session(session_id)
        if not session:
            return InterviewStatusResponse(session_id=session_id, status="not_found", message="Session not found")

        matched = json.loads(session.get("matched_skills", "[]")) if session.get("matched_skills") else []
        assessed = []
        skill_scores = session.get("skill_scores", "")
        if skill_scores:
            try:
                assessed = list(json.loads(skill_scores).keys())
            except (json.JSONDecodeError, TypeError):
                assessed = []

        progress = (len(assessed) / max(len(matched), 1)) * 100
        questions = database.get_interview_questions(session_id)
        last_q = questions[-1] if questions else None
        last_q_dict = dict(last_q) if last_q else None
        if last_q_dict and last_q_dict.get("question"):
            import re
            q_text = last_q_dict["question"]
            if '</think>' in q_text:
                parts = q_text.split('</think>', 1)
                cleaned = parts[1].strip()
                if cleaned:
                    q_text = cleaned
            elif '</thinking>' in q_text:
                parts = q_text.split('</thinking>', 1)
                cleaned = parts[1].strip()
                if cleaned:
                    q_text = cleaned
            q_text = re.sub(r'<think>', '', q_text, flags=re.IGNORECASE)
            q_text = re.sub(r'</think>', '', q_text, flags=re.IGNORECASE)
            q_text = re.sub(r'<thinking>', '', q_text, flags=re.IGNORECASE)
            q_text = re.sub(r'</thinking>', '', q_text, flags=re.IGNORECASE)
            last_q_dict["question"] = q_text.strip()

        return InterviewStatusResponse(
            session_id=session_id,
            status=session.get("status", "unknown"),
            current_skill=session.get("current_skill", ""),
            total_skills=max(len(matched), 1),
            assessed_skills=len(assessed),
            progress_percent=round(progress, 1),
            current_question=last_q_dict,
            message="",
        )

    def get_report(self, session_id: str) -> Optional[Dict[str, Any]]:
        report = database.get_interview_report(session_id)
        if report:
            return self._format_report(report)
        session = database.get_interview_session(session_id)
        if session and session.get("report_json"):
            try:
                report_data = json.loads(session["report_json"])
                return report_data
            except (json.JSONDecodeError, TypeError):
                pass
        return None

    def get_history(self, company_id: str | None = None, limit: int = 50) -> List[Dict]:
        sessions = database.get_all_interview_sessions(company_id, limit)
        return [self._format_history_item(s) for s in sessions]

    def _persist_state(self, session_id: str, state: dict):
        q_asked = state.get("asked_questions", [])
        answers = state.get("candidate_answers", [])
        skill_assessments = state.get("skill_assessments", [])
        trust_gaps = state.get("trust_gaps", [])
        risk_flags = state.get("risk_flags", [])
        risk_flags_detailed = state.get("risk_flags_detailed", [])

        # Persist questions
        for q in q_asked:
            q_id = q.get("id", "")
            if q_id:
                # Check if question already exists by ID
                existing = database.get_interview_question(q_id)
                if not existing:
                    database.create_interview_question(
                        session_id=session_id,
                        skill=q.get("skill", ""),
                        question=q.get("question", ""),
                        question_type=q.get("question_type", "technical"),
                        difficulty_level=q.get("difficulty_level", 1),
                        is_followup=q.get("is_followup", False),
                        followup_count=q.get("followup_count", 0),
                        skill_index=0,
                        q_id=q_id,
                    )

        # Persist answers
        for a in answers:
            evaluation = a.get("evaluation", {})
            database.create_interview_answer(
                question_id=a.get("question_id", ""),
                session_id=session_id,
                candidate_answer=a.get("candidate_answer", ""),
                score=a.get("score", 0),
                strengths=json.dumps(evaluation.get("strengths", []), ensure_ascii=False),
                weaknesses=json.dumps(evaluation.get("weaknesses", []), ensure_ascii=False),
                missing_concepts=json.dumps(evaluation.get("missing_concepts", []), ensure_ascii=False),
                semantic_score=evaluation.get("semantic_score", 0),
                coverage_score=evaluation.get("coverage_score", 0),
                accuracy_score=evaluation.get("accuracy_score", 0),
                completeness_score=evaluation.get("completeness_score", 0),
                confidence=evaluation.get("confidence", 0),
            )

        # Persist skill assessments
        for sa in skill_assessments:
            existing = database.get_skill_assessments(session_id)
            if not any(e.get("skill") == sa.get("skill") for e in existing):
                database.create_skill_assessment(
                    session_id=session_id,
                    skill=sa.get("skill", ""),
                    claimed_level=sa.get("claimed_level", 0),
                    verified_level=sa.get("verified_level", 0),
                    confidence=sa.get("confidence", 0),
                    questions_asked=sa.get("questions_asked", 0),
                    average_score=sa.get("average_score", 0),
                    evidence=json.dumps(sa.get("evidence", []), ensure_ascii=False),
                )

        # Persist consistency analysis
        existing_ca = database.get_consistency_analysis(session_id)
        if not existing_ca and state.get("consistency_analysis"):
            ca = state["consistency_analysis"]
            database.create_consistency_analysis(
                session_id=session_id,
                trust_gaps=json.dumps(trust_gaps, ensure_ascii=False),
                consistency_score=ca.get("consistency_score", 0),
                trust_score=ca.get("trust_score", 0),
                risk_flags=json.dumps(risk_flags, ensure_ascii=False),
                evidence=json.dumps(ca.get("evidence", {}), ensure_ascii=False),
            )

        # Persist challenge
        challenge = state.get("challenge", {})
        challenge_eval = state.get("challenge_evaluation", {})
        if challenge and challenge.get("title"):
            database.create_interview_challenge(
                session_id=session_id,
                skill=challenge.get("skill", ""),
                challenge_type=challenge.get("type", "coding"),
                title=challenge.get("title", ""),
                description=challenge.get("description", ""),
                difficulty=challenge.get("difficulty", 1),
                evaluation=json.dumps(challenge_eval, ensure_ascii=False),
            )

        # Persist final report
        if state.get("report_generated"):
            report = state.get("report", {})
            existing_rep = database.get_interview_report(session_id)
            if not existing_rep:
                report_scores = report.get("scores", {})
                database.create_interview_report(
                    session_id=session_id,
                    candidate_name=report.get("candidate_name", ""),
                    job_title=report.get("job_title", ""),
                    cv_match=report.get("cv_match", 0),
                    technical_score=report_scores.get("technical", report.get("technical_score", 0)),
                    practical_score=report_scores.get("practical", 0),
                    experience_score=report_scores.get("experience", report.get("experience_score", 0)),
                    consistency_score=report_scores.get("consistency", report.get("consistency_score", 0)),
                    communication_score=report_scores.get("communication", report.get("communication_score", 0)),
                    trust_score=report_scores.get("trust", report.get("trust_score", 0)),
                    final_score=report.get("final_score", 0),
                    recommendation=report.get("recommendation", ""),
                    strengths=json.dumps(report.get("strengths", []), ensure_ascii=False),
                    weaknesses=json.dumps(report.get("weaknesses", []), ensure_ascii=False),
                    skill_breakdown=json.dumps(report.get("skill_breakdown", []), ensure_ascii=False),
                    trust_analysis=json.dumps(report.get("trust_analysis", {}), ensure_ascii=False),
                    evidence=json.dumps(report.get("evidence", {}), ensure_ascii=False),
                    recommended_actions=json.dumps(report.get("recommended_actions", []), ensure_ascii=False),
                    report_text=report.get("report_text", ""),
                )

            database.update_interview_session(
                session_id,
                status=state.get("interview_status", "completed"),
                current_skill=state.get("current_skill", ""),
                matched_skills=json.dumps(state.get("matched_skills", []), ensure_ascii=False),
                missing_skills=json.dumps(state.get("missing_skills", []), ensure_ascii=False),
                skill_scores=json.dumps(state.get("skill_scores", {}), ensure_ascii=False),
                confidence_scores=json.dumps({}, ensure_ascii=False),
                technical_score=state.get("technical_score", 0),
                practical_score=state.get("practical_score", 0),
                experience_score=state.get("experience_score", 0),
                communication_score=state.get("communication_score", 0),
                consistency_score=state.get("consistency_score", 0),
                trust_score=state.get("trust_score", 0),
                final_score=state.get("final_score", 0),
                cv_match=state.get("cv_match", 0),
                recommendation=state.get("recommendation", ""),
                report_json=json.dumps(state.get("report", {}), ensure_ascii=False),
                completed_at=datetime.now(),
            )

    def _reconstruct_state(self, session: dict) -> dict:
        state = create_initial_state(
            session_id=session["id"],
            candidate_id=session.get("candidate_id", ""),
            job_id=session.get("job_id", ""),
            tenant_id=session.get("tenant_id", "default_tenant"),
            company_id=session.get("company_id", ""),
        )
        state["interview_status"] = session.get("status", "in_progress")
        state["current_skill"] = session.get("current_skill", "")

        if session.get("matched_skills"):
            try:
                state["matched_skills"] = json.loads(session["matched_skills"])
            except (json.JSONDecodeError, TypeError):
                pass

        state["practical_score"] = session.get("practical_score", 0)
        state["asked_questions"] = [dict(q) for q in database.get_interview_questions(session["id"])]
        state["candidate_answers"] = [dict(a) for a in database.get_interview_answers(session["id"])]

        assessments = database.get_skill_assessments(session["id"])
        state["skill_assessments"] = [dict(a) for a in assessments]

        skill_scores = None
        if session.get("skill_scores"):
            try:
                skill_scores = json.loads(session["skill_scores"])
            except (json.JSONDecodeError, TypeError):
                pass
        if skill_scores:
            state["skill_scores"] = skill_scores

        return state

    def _build_answer_response(self, state: dict) -> Dict[str, Any]:
        status = state.get("interview_status", "in_progress")
        resp = {
            "session_id": state.get("session_id", ""),
            "status": status,
            "evaluation": state.get("current_answer_evaluation", {}),
        }

        if status == "completed":
            resp["report"] = state.get("report", {})
            resp["message"] = state.get("message", "Interview completed")
        else:
            next_q = state.get("current_question", {})
            if next_q:
                resp["next_question"] = next_q
                resp["skill"] = state.get("current_skill", "")
                resp["message"] = state.get("message", "")
            else:
                resp["message"] = "Awaiting next question..."

        return resp

    def _format_report(self, report: dict) -> Dict[str, Any]:
        def safe_json(val, default=None):
            if isinstance(val, str) and val:
                try:
                    return json.loads(val)
                except (json.JSONDecodeError, TypeError):
                    pass
            return val if val else default

        return {
            "session_id": report.get("session_id", ""),
            "candidate_name": report.get("candidate_name", ""),
            "job_title": report.get("job_title", ""),
            "cv_match": report.get("cv_match", 0),
            "technical_score": report.get("technical_score", 0),
            "practical_score": report.get("practical_score", 0),
            "experience_score": report.get("experience_score", 0),
            "consistency_score": report.get("consistency_score", 0),
            "communication_score": report.get("communication_score", 0),
            "trust_score": report.get("trust_score", 0),
            "final_score": report.get("final_score", 0),
            "recommendation": report.get("recommendation", ""),
            "strengths": safe_json(report.get("strengths", "[]"), []),
            "weaknesses": safe_json(report.get("weaknesses", "[]"), []),
            "skill_breakdown": safe_json(report.get("skill_breakdown", "[]"), []),
            "trust_analysis": safe_json(report.get("trust_analysis", "{}"), {}),
            "evidence": safe_json(report.get("evidence", "{}"), {}),
            "recommended_actions": safe_json(report.get("recommended_actions", "[]"), []),
            "report_text": report.get("report_text", ""),
            "generated_at": str(report.get("generated_at", "")),
        }

    def _format_history_item(self, session: dict) -> Dict[str, Any]:
        return {
            "session_id": session.get("id", ""),
            "candidate_id": session.get("candidate_id", ""),
            "job_id": session.get("job_id", ""),
            "status": session.get("status", ""),
            "final_score": session.get("final_score", 0),
            "recommendation": session.get("recommendation", ""),
            "created_at": str(session.get("created_at", "")),
            "completed_at": str(session.get("completed_at", "")),
        }


interview_service = InterviewService()
