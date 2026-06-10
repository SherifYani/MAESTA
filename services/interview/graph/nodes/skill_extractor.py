"""
Nodes: Extract skills from CV and JD, prioritize them, select current skill.
"""
import re
from typing import List, Dict, Any
from core.logger import get_logger

logger = get_logger(__name__)

TECH_DOMAINS = {
    ".net": [".net", "c#", "asp.net", "entity framework", "linq", "wpf", "mvvm", "blazor", "signalr", "web api", "razor", "maui", "xamarin"],
    "python": ["python", "django", "flask", "fastapi", "pandas", "numpy", "scipy", "scikit-learn", "pytorch", "tensorflow", "celery", "asyncio", "sqlalchemy"],
    "ai/ml": ["machine learning", "deep learning", "nlp", "computer vision", "llm", "rag", "langchain", "langgraph", "genai", "ai agent", "transformer", "neural network", "xgboost"],
    "data_science": ["data science", "statistics", "data analysis", "data mining", "etl", "sql", "tableau", "power bi", "looker", "big data", "spark", "hadoop"],
    "frontend": ["javascript", "typescript", "react", "vue", "angular", "html", "css", "sass", "tailwind", "webpack", "next.js", "redux"],
    "backend": ["node.js", "express", "rest api", "graphql", "microservices", "docker", "kubernetes", "rabbitmq", "kafka", "redis", "mongodb", "postgresql", "api gateway"],
    "devops": ["devops", "ci/cd", "jenkins", "github actions", "gitlab ci", "terraform", "ansible", "chef", "puppet", "prometheus", "grafana", "elk", "linux"],
    "cloud": ["aws", "azure", "gcp", "cloudformation", "lambda", "ec2", "s3", "eks", "aks", "gke", "serverless"],
    "databases": ["sql", "mysql", "postgresql", "oracle", "sql server", "mongodb", "cassandra", "redis", "elasticsearch", "dynamodb", "cosmosdb", "mariadb"],
}
GENERAL_SKILLS = [
    "project management", "agile", "scrum", "leadership", "communication",
    "teamwork", "problem solving", "critical thinking", "time management",
    "presentation", "mentoring", "requirements analysis", "documentation",
]
DOMAIN_KEYWORDS = set()
for kw_list in TECH_DOMAINS.values():
    for kw in kw_list:
        DOMAIN_KEYWORDS.add(kw)
for s in GENERAL_SKILLS:
    DOMAIN_KEYWORDS.add(s)


def _extract_skills_from_text(text: str) -> Dict[str, float]:
    text_lower = text.lower()
    skills = {}
    for skill_name, keywords in TECH_DOMAINS.items():
        matches = sum(1 for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower))
        if matches > 0:
            skills[skill_name] = min(matches / len(keywords), 1.0)
    for skill in GENERAL_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            skills[skill] = 0.5
    return skills


def _compute_priority(skill: str, jd_score: float, cv_score: float, ats_sim: float) -> float:
    return (jd_score * 0.5) + (cv_score * 0.3) + (ats_sim * 0.2)


def extract_and_prioritize_skills(state: dict) -> dict:
    cv_text = state.get("cv_text", "")
    jd_text = state.get("jd_text", "")
    ats_results = state.get("ats_results", {})

    cv_skills = _extract_skills_from_text(cv_text)
    jd_skills = _extract_skills_from_text(jd_text)

    all_skill_names = set(cv_skills.keys()) | set(jd_skills.keys())

    matched = []
    missing = []
    for skill in all_skill_names:
        cv_score = cv_skills.get(skill, 0.0)
        jd_score = jd_skills.get(skill, 0.0)
        ats_sim = 0.5
        if skill in str(ats_results.get("strengths", [])).lower():
            ats_sim = 0.8

        priority = _compute_priority(skill, jd_score, cv_score, ats_sim)

        entry = {
            "name": skill,
            "category": "technical" if skill in TECH_DOMAINS else "general",
            "claimed_level": cv_score * 100,
            "jd_importance": jd_score * 100,
            "priority_score": priority * 100,
            "ats_similarity": ats_sim * 100,
        }
        if cv_score > 0 and jd_score > 0:
            matched.append(entry)
        elif jd_score > 0:
            missing.append(skill)
        else:
            matched.append(entry)

    matched.sort(key=lambda x: x["priority_score"], reverse=True)

    logger.info(f"Extracted {len(matched)} matched skills, {len(missing)} missing")

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "prioritized_skills": matched,
        "current_skill_index": 0,
        "message": f"Found {len(matched)} relevant skills to assess",
    }


def select_skill(state: dict) -> dict:
    prioritized = state.get("prioritized_skills", [])
    idx = state.get("current_skill_index", 0)

    if idx >= len(prioritized):
        return {"interview_status": "ready_for_consistency", "message": "All skills assessed"}

    skill_entry = prioritized[idx]
    logger.info(f"Selecting skill #{idx + 1}: {skill_entry['name']}")

    return {
        "current_skill": skill_entry["name"],
        "current_skill_index": idx,
        "skill_questions_asked": 0,
        "skill_followup_count": 0,
        "message": f"Assessing skill: {skill_entry['name']}",
    }
