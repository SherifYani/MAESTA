"""
Advanced consistency analysis engine: detects CV exaggeration with severity,
evidence, and detailed risk flags per assessment dimension.
"""
import json
from typing import List, Dict, Any
from core.logger import get_logger
from services.agent.ollama_service import ollama_service
from services.interview.generators.prompt_templates import InterviewPromptTemplates
from services.interview.memory.interview_memory import interview_memory
import config

logger = get_logger(__name__)

RISK_TYPES = [
    "Skill Inflation",
    "Experience Inflation",
    "Project Knowledge Gap",
    "Tool Familiarity Gap",
    "Technology Mismatch",
    "Resume Overstatement",
    "Insufficient Evidence",
]


class ConsistencyChecker:
    def analyze(self, assessments: List[Dict], answers: List[Dict],
                cv_text: str, jd_text: str) -> Dict[str, Any]:
        trust_gaps = []
        risk_flags_detailed = []

        for assessment in assessments:
            claimed = assessment.get("claimed_level", 0)
            verified = assessment.get("verified_level", 0)
            gap = claimed - verified

            if gap > 20:
                entry = {
                    "skill": assessment["skill"],
                    "claimed": round(claimed, 1),
                    "verified": round(verified, 1),
                    "gap": round(gap, 1),
                }
                trust_gaps.append(entry)

                if gap > 40:
                    risk_flags_detailed.append(self._build_risk_flag(
                        "Skill Inflation", "high", assessment, gap,
                        f"Claimed {claimed:.0f}% but verified at {verified:.0f}% ({gap:.0f}% gap)"
                    ))
                elif gap > 30:
                    risk_flags_detailed.append(self._build_risk_flag(
                        "Experience Inflation", "medium", assessment, gap,
                        f"Significant gap between claimed ({claimed:.0f}%) and verified ({verified:.0f}%)"
                    ))

        # Check for tool familiarity gap
        if answers:
            # Find skills where candidate claimed tools but couldn't explain them
            for assessment in assessments:
                skill = assessment.get("skill", "")
                skill_answers = [a for a in answers if a.get("skill") == skill]
                if len(skill_answers) >= 2:
                    scores = [a.get("score", 0) for a in skill_answers]
                    if max(scores) - min(scores) > 50:
                        risk_flags_detailed.append(self._build_risk_flag(
                            "Tool Familiarity Gap", "medium", assessment, max(scores) - min(scores),
                            f"Inconsistent scores across {skill} questions: {scores}"
                        ))

        # Check technology mismatch
        tech_skills = [a for a in assessments if a.get("claimed_level", 0) > 70]
        for ts in tech_skills:
            if ts.get("verified_level", 0) < 30:
                risk_flags_detailed.append(self._build_risk_flag(
                    "Technology Mismatch", "high", ts, ts.get("claimed_level", 0) - ts.get("verified_level", 0),
                    f"Claims high proficiency in {ts['skill']} but cannot demonstrate basic knowledge"
                ))

        if not answers:
            risk_flags_detailed.append({
                "type": "Insufficient Evidence",
                "severity": "medium",
                "source": "consistency_checker",
                "evidence": "No answers provided for assessment",
                "explanation": "Cannot verify skill claims without sufficient responses",
                "skill": "all",
            })

        consistency_score = self._compute_consistency_score(assessments, trust_gaps)
        trust_score = self._compute_trust_score(consistency_score, risk_flags_detailed)

        # LLM-based analysis for additional nuance
        llm_analysis = self._llm_consistency_analysis(assessments, cv_text)

        # Merge memory contradictions
        memory_summary = interview_memory.get_memory_summary()
        for contradiction in memory_summary.get("contradictions", []):
            risk_flags_detailed.append({
                "type": contradiction.get("type", "Contradiction"),
                "severity": contradiction.get("severity", "medium"),
                "source": contradiction.get("source", "memory_engine"),
                "evidence": contradiction.get("evidence", ""),
                "explanation": contradiction.get("explanation", ""),
                "skill": contradiction.get("skill", "unknown"),
            })

        risk_flags = list(dict.fromkeys([rf["type"] for rf in risk_flags_detailed]))

        return {
            "trust_gaps": trust_gaps,
            "risk_flags": risk_flags,
            "risk_flags_detailed": risk_flags_detailed,
            "consistency_score": round(consistency_score, 1),
            "trust_score": round(trust_score, 1),
            "evidence": llm_analysis.get("evidence", {}),
            "memory_summary": {
                "total_claims": memory_summary.get("total_claims", 0),
                "total_contradictions": memory_summary.get("total_contradictions", 0),
                "net_trust_delta": memory_summary.get("net_trust_delta", 0),
            },
        }

    def _build_risk_flag(self, flag_type: str, severity: str,
                          assessment: Dict, gap: float, evidence: str) -> Dict:
        return {
            "type": flag_type,
            "severity": severity,
            "source": "consistency_checker",
            "skill": assessment.get("skill", "unknown"),
            "gap": round(gap, 1),
            "evidence": evidence,
            "explanation": f"{flag_type} detected for {assessment.get('skill', 'unknown')}: {evidence}",
        }

    def _compute_consistency_score(self, assessments: List[Dict],
                                    trust_gaps: List[Dict]) -> float:
        if not assessments:
            return 50.0
        gap_penalties = []
        for tg in trust_gaps:
            penalty = min(tg["gap"] / 100, 0.5)
            gap_penalties.append(penalty)
        avg_penalty = sum(gap_penalties) / len(gap_penalties) if gap_penalties else 0
        base = 100.0 - (avg_penalty * 100)
        return max(base, 0)

    def _compute_trust_score(self, consistency: float,
                               risk_flags_detailed: List[Dict]) -> float:
        penalty = len(risk_flags_detailed) * 5
        severity_penalty = sum(
            {"high": 10, "medium": 5, "low": 2}.get(rf.get("severity", "low"), 3)
            for rf in risk_flags_detailed
        )
        return max(0, min(100, consistency - penalty - severity_penalty))

    def _llm_consistency_analysis(self, assessments: List[Dict],
                                   cv_text: str) -> Dict:
        try:
            prompt = InterviewPromptTemplates.consistency_check(
                assessments_json=json.dumps(assessments, ensure_ascii=False),
                cv_text=cv_text,
            )
            resp = ollama_service.generate(
                prompt=prompt,
                model=config.INTERVIEW_DEFAULT_LLM_MODEL,
                temperature=0.3,
                max_tokens=512,
                json_mode=True,
            )
            return json.loads(resp)
        except Exception as e:
            logger.warning(f"LLM consistency analysis failed: {e}")
            return {"risk_flags": [], "evidence": {}}


consistency_checker = ConsistencyChecker()
