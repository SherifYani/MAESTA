"""
Prompt templates for interview question generation and evaluation.
"""
import json


class InterviewPromptTemplates:
    @staticmethod
    def question_generation(skill: str, difficulty: int, question_type: str,
                            context: str, previous_answers: list,
                            target_topic: str = None, asked_topics: list = None) -> str:
        prev = ""
        if previous_answers:
            prev = "\nPrevious answers by candidate:\n" + "\n".join(
                f"- {a[:200]}" for a in previous_answers[-3:]
            )

        topic_guidance = ""
        if target_topic:
            topic_guidance = f"""
TARGET TOPIC: {target_topic}
IMPORTANT: The question MUST specifically test the candidate's knowledge of "{target_topic}".
Focus deeply on this specific area. Do NOT ask generic {skill} questions."""

        prev_guidance = ""
        if asked_topics:
            asked_str = ", ".join(asked_topics[-5:])
            prev_guidance = f"\nALREADY ASKED TOPICS (avoid repeating): {asked_str}"

        return f"""You are a technical interviewer assessing a candidate's {skill} skills.

DIFFICULTY LEVEL: {difficulty}/5
QUESTION TYPE: {question_type}
SKILL: {skill}
{topic_guidance}
{prev_guidance}

Generate ONE precise interview question that:
1. Tests actual {skill} knowledge at difficulty level {difficulty}
2. Requires demonstration of real experience, not theoretical recall
3. Is specific enough that a weak candidate cannot bluff through it
4. Fits the candidate's background based on their CV context
5. FOCUSES ON: {target_topic or "the skill broadly"}

CV Context: {context[:1500]}
{prev}

Return ONLY the question text. Do NOT add labels or explanations."""

    @staticmethod
    def followup_generation(skill: str, last_answer: str, evaluation: dict,
                            followup_count: int, language: str) -> str:
        score = evaluation.get("score", 0)
        weaknesses = evaluation.get("weaknesses", [])
        missing = evaluation.get("missing_concepts", [])

        direction = "increase" if score > 70 else "decrease"
        weakness_hint = ""
        if weaknesses:
            weakness_hint = f"\nThe candidate showed weakness in: {', '.join(weaknesses[:2])}"
        if missing:
            weakness_hint += f"\nConcepts not covered: {', '.join(missing[:2])}"

        return f"""You are a technical interviewer. You asked about {skill}.

The candidate answered. Based on their answer (score: {score}/100), you need to ask a follow-up question.

FOLLOW-UP #{followup_count}
DIRECTION: {direction} difficulty
PURPOSE: {"Push deeper into their expertise" if direction == "increase" else "Clarify their basic understanding"}

Their last answer: {last_answer[:500]}
{weakness_hint}

Generate a single concise follow-up question that builds on their last answer. Return ONLY the question text."""

    @staticmethod
    def answer_evaluation(question: str, answer: str, skill: str,
                          difficulty: int, jd_context: str) -> str:
        return f"""Evaluate this candidate's answer for a {skill} interview question.

Question: {question}
Candidate Answer: {answer}
Job Context: {jd_context[:500]}

Evaluate on these dimensions (0-100):
1. Technical Accuracy: Is the answer technically correct?
2. Skill Coverage: Does it demonstrate knowledge of {skill}?
3. Completeness: Does it fully address the question?
4. Clarity: Is it well-structured and clear?

Also identify:
- Strengths (specific things done well)
- Weaknesses (specific gaps or errors)
- Missing concepts (important concepts not mentioned)

Return JSON only, no other text:
{{
    "score": <overall 0-100>,
    "semantic_score": <0-100>,
    "coverage_score": <0-100>,
    "accuracy_score": <0-100>,
    "completeness_score": <0-100>,
    "confidence": <0.0-1.0>,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "missing_concepts": ["..."],
    "explanation": "brief why this score"
}}"""

    @staticmethod
    def consistency_check(assessments_json: str, cv_text: str) -> str:
        return f"""Analyze consistency between claimed skills and verified skills.

Skill Assessments: {assessments_json}
CV Claims: {cv_text[:1000]}

Identify trust gaps where claimed_level >> verified_level.
Flag any inconsistencies.

Return JSON:
{{
    "trust_gaps": [{{"skill": "...", "claimed": 0, "verified": 0, "gap": 0}}],
    "risk_flags": ["Skill Inflation", "Experience Mismatch", ...],
    "consistency_score": <0-100>,
    "trust_score": <0-100>,
    "evidence": {{"skill": "evidence text"}}
}}"""
