"""
LangGraph Interview Workflow — Full adaptive interview pipeline with
anti-cheat, coding challenges, and benchmark integration.
"""
from typing import Literal
from langgraph.graph import StateGraph, END
from core.logger import get_logger
from services.interview.graph.interview_state import InterviewState, create_initial_state
from services.interview.graph.nodes import (
    load_candidate_data, extract_and_prioritize_skills, select_skill,
    generate_question, generate_followup, evaluate_answer,
    update_skill_score, run_consistency_analysis, generate_final_report,
    run_anti_cheat_analysis, generate_challenge, evaluate_challenge,
    run_benchmark_analysis,
)

def _save_answer(state: dict) -> dict:
    """Save the current answer with its question_id to candidate_answers."""
    question = state.get("current_question", {})
    answer = state.get("current_answer", "")
    evaluation = state.get("current_answer_evaluation", {})
    question_id = question.get("id", "")
    
    if question_id and answer:
        answer_record = {
            "question_id": question_id,
            "skill": state.get("current_skill", ""),
            "candidate_answer": answer,
            "score": evaluation.get("score", 0),
            "evaluation": evaluation,
        }
        return {
            "candidate_answers": [answer_record],
            "current_answer": "",  # Clear after saving
        }
    return {"current_answer": ""}

logger = get_logger(__name__)

MAX_FOLLOWUPS = 3


def _route_after_load(state: InterviewState) -> str:
    if state.get("error"):
        return END
    return "extract_skills"


def _route_after_select(state: InterviewState) -> str:
    if state.get("interview_status") == "ready_for_consistency":
        return "consistency_analysis"
    st = state.get("current_skill", "")
    return "generate_question" if st else "consistency_analysis"


def _route_after_evaluate(state: InterviewState) -> Literal["generate_followup", "next_skill", "consistency_analysis"]:
    evaluation = state.get("current_answer_evaluation", {})
    score = evaluation.get("score", 0)
    followup_count = state.get("skill_followup_count", 0)

    if followup_count >= MAX_FOLLOWUPS:
        return "next_skill"

    if score < 40:
        return "generate_followup"
    if score < 70 and followup_count < 2:
        return "generate_followup"

    return "next_skill"


def _route_after_question(state: InterviewState) -> Literal["evaluate_answer", "wait_human"]:
    """After generating a question, check if we have an answer to evaluate.
    If no answer yet (human-in-the-loop), pause the graph."""
    if state.get("current_answer"):
        return "evaluate_answer"
    return "wait_human"


def _route_after_followup(state: InterviewState) -> Literal["evaluate_answer", "wait_human"]:
    """After generating a follow-up, check if we have an answer for it.
    If no answer yet (human-in-the-loop), pause the graph."""
    if state.get("current_answer"):
        return "evaluate_answer"
    return "wait_human"


def _wait_human(state: InterviewState) -> dict:
    """Pause point for human input. Sets needs_human_input flag and returns state."""
    return {"needs_human_input": True, "message": "Waiting for candidate answer..."}


def _route_next_skill(state: InterviewState) -> str:
    prioritized = state.get("prioritized_skills", [])
    idx = state.get("current_skill_index", 0)

    if idx >= len(prioritized):
        return "consistency_analysis"
    return "select_skill"


def _build_interview_graph() -> StateGraph:
    graph = StateGraph(InterviewState)

    graph.add_node("load_candidate", load_candidate_data)
    graph.add_node("extract_skills", extract_and_prioritize_skills)
    graph.add_node("select_skill", select_skill)
    graph.add_node("generate_question", generate_question)
    graph.add_node("wait_human", _wait_human)
    graph.add_node("evaluate_answer", evaluate_answer)
    graph.add_node("save_answer", _save_answer)
    graph.add_node("update_skill_score", update_skill_score)
    graph.add_node("generate_followup", generate_followup)
    graph.add_node("anti_cheat_analysis", run_anti_cheat_analysis)
    graph.add_node("generate_challenge", generate_challenge)
    graph.add_node("evaluate_challenge", evaluate_challenge)
    graph.add_node("benchmark_analysis", run_benchmark_analysis)
    graph.add_node("consistency_analysis", run_consistency_analysis)
    graph.add_node("generate_report", generate_final_report)

    graph.set_entry_point("load_candidate")

    graph.add_edge("load_candidate", "extract_skills")
    graph.add_edge("extract_skills", "select_skill")

    graph.add_conditional_edges(
        "select_skill",
        _route_after_select,
        {"generate_question": "generate_question", "consistency_analysis": "consistency_analysis"},
    )

    graph.add_conditional_edges(
        "generate_question",
        _route_after_question,
        {"evaluate_answer": "evaluate_answer", "wait_human": "wait_human"},
    )

    graph.add_edge("wait_human", END)

    graph.add_edge("evaluate_answer", "save_answer")

    graph.add_edge("save_answer", "anti_cheat_analysis")

    graph.add_conditional_edges(
        "anti_cheat_analysis",
        _route_after_evaluate,
        {
            "generate_followup": "generate_followup",
            "next_skill": "update_skill_score",
            "consistency_analysis": "consistency_analysis",
        },
    )

    graph.add_conditional_edges(
        "generate_followup",
        _route_after_followup,
        {"evaluate_answer": "evaluate_answer", "wait_human": "wait_human"},
    )
    # Route to next skill or finish — replaces the fixed edge below
    graph.add_conditional_edges(
        "update_skill_score",
        _route_next_skill,
        {"select_skill": "select_skill", "consistency_analysis": "consistency_analysis"},
    )

    # New pipeline: consistency → challenge → benchmark → report
    graph.add_edge("consistency_analysis", "generate_challenge")
    graph.add_edge("generate_challenge", "evaluate_challenge")
    graph.add_edge("evaluate_challenge", "benchmark_analysis")
    graph.add_edge("benchmark_analysis", "generate_report")
    graph.add_edge("generate_report", END)

    return graph.compile()


interview_graph = _build_interview_graph()


class InterviewWorkflow:
    @staticmethod
    def start(session_id: str, candidate_id: str, job_id: str,
              tenant_id: str = "default_tenant", company_id: str = "",
              company_name: str = "") -> dict:
        initial = create_initial_state(session_id, candidate_id, job_id, tenant_id, company_id, company_name)
        result = interview_graph.invoke(initial, config={"recursion_limit": 150})
        return result

    @staticmethod
    def run_from_state(state: dict) -> dict:
        result = interview_graph.invoke(state, config={"recursion_limit": 150})
        return result
