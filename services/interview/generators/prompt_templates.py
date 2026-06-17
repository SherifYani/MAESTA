"""
Prompt templates for interview question generation and evaluation.
"""
import json


class InterviewPromptTemplates:
    @staticmethod
    def question_generation(skill: str, difficulty: int, question_type: str,
                            context: str, previous_answers: list,
                            target_topic: str | None = None, asked_topics: list | None = None) -> str:
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

        return f"""You are a technical interviewer assessing the candidate's **{skill}** skills.

You asked a {skill} question. The candidate answered. Generate follow-up #{followup_count} to dig deeper.

CRITICAL RULES:
- The follow-up MUST stay focused on **{skill}** ONLY
- Do NOT ask about other technologies, deployment, cloud, or general topics
- Ask about a specific {skill} concept, API, pattern, or real scenario
- DIRECTION: {"increase" if score > 70 else "decrease"} difficulty (current score: {score}/100)
{weakness_hint}

Their last answer (focus on gaps in this): {last_answer[:400]}

Return ONLY the question text, nothing else."""

    @staticmethod
    def answer_evaluation(question: str, answer: str, skill: str,
                          difficulty: int, jd_context: str,
                          is_followup: bool = False) -> str:
        followup_context = ""
        if is_followup:
            followup_context = """
IMPORTANT: This is a FOLLOW-UP question requiring DEEP technical depth on a specific sub-topic.
- DO NOT penalize the candidate for not covering unrelated aspects of the skill
- Focus evaluation on: technical precision, depth of understanding, and correctness
- A focused, accurate answer to the specific question should score 65-85%
- Only score below 50% if the answer is technically incorrect or completely off-topic"""
        else:
            followup_context = """
This is a MAIN question assessing broad skill coverage.
- Evaluate how well the answer demonstrates overall knowledge of the skill
- Good breadth with some depth should score 55-75%
- Exceptional coverage with examples should score 75-90%"""

        difficulty_calibration = {
            1: "Entry level — basic understanding expected. Score 60+ if concepts are correct.",
            2: "Junior level — practical examples expected. Score 65+ if shows real experience.",
            3: "Mid level — architectural understanding expected. Score 70+ if covers trade-offs.",
            4: "Senior level — deep expertise expected. Score 75+ if shows advanced patterns.",
            5: "Expert level — mastery expected. Score 80+ if covers edge cases and internals.",
        }.get(difficulty, "Mid level evaluation expected.")

        return f"""You are a senior technical interviewer evaluating a candidate's answer for a {skill} interview question.

Question: {question}
Candidate Answer: {answer}
Job Context: {jd_context[:400]}

Difficulty Level: {difficulty}/5 — {difficulty_calibration}
{followup_context}

Evaluate on these dimensions (0-100):
1. accuracy_score: Is the answer technically correct? (most important)
2. coverage_score: Does it cover the key concepts asked in THIS question?
3. semantic_score: Does it demonstrate real understanding vs surface knowledge?
4. completeness_score: Is it sufficiently detailed for this difficulty level?

CALIBRATION GUIDE:
- 80-100: Excellent — detailed, accurate, demonstrates deep understanding
- 65-79: Good — correct answer with sufficient depth
- 50-64: Adequate — mostly correct but missing key details
- 35-49: Weak — partially correct, significant gaps
- 0-34: Poor — incorrect or completely off-topic

Return JSON only, no other text:
{{
    "score": <overall 0-100>,
    "semantic_score": <0-100>,
    "coverage_score": <0-100>,
    "accuracy_score": <0-100>,
    "completeness_score": <0-100>,
    "confidence": <0.0-1.0, your confidence in this evaluation>,
    "strengths": ["specific strength 1", "specific strength 2"],
    "weaknesses": ["specific gap 1", "specific gap 2"],
    "missing_concepts": ["concept not mentioned but expected"],
    "explanation": "2-3 sentences explaining the score"
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
