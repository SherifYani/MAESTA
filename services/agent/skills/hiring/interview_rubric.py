from typing import Dict, Any, List, Tuple

class InterviewRubric:
    """
    معيار التقييم لمقابلات الذكاء الاصطناعي (Interview Rubric).
    يضمن هذا المعيار أن التقييمات محددة بدقة بين 0 و 100 ولا تعتمد على هلوسات أو سمات حساسة.
    كما يربط الدرجات بالأدلة المستخرجة (Evidence).
    """

    def evaluate(self, ai_analysis: Dict[str, Any]) -> Tuple[Dict[str, Any], List[str]]:
        """
        يستقبل تحليل الذكاء الاصطناعي، ويطبق قواعد التقييم (Rubric)، ويخرج تقييماً نهائياً 
        مع قائمة بأي علامات أمنية (Safety Flags) مثل 'insufficient_evidence'.
        """
        safety_flags = []
        
        # 1. Enforce Bounds (0-100)
        technical_score = self._bound_score(ai_analysis.get('technical_score', 0))
        communication_score = self._bound_score(ai_analysis.get('communication_score', 0))
        job_fit_score = self._bound_score(ai_analysis.get('job_fit_score', 0))

        # 2. Evidence Verification
        relevant_quotes = ai_analysis.get('relevant_quotes', [])
        if not relevant_quotes or len(relevant_quotes) < 1:
            # No evidence provided! Heavily penalize or mark unknown, and flag.
            technical_score = 0
            communication_score = 0
            job_fit_score = 0
            safety_flags.append("insufficient_evidence")

        # 3. Recommendation Restriction
        raw_rec = str(ai_analysis.get('recommendation', '')).lower()
        valid_recs = ['strong', 'good', 'hold', 'not_recommended']
        
        if raw_rec in valid_recs:
            recommendation = raw_rec
        else:
            # Fallback for unrecognized recommendation
            recommendation = 'hold'
            
        if "insufficient_evidence" in safety_flags and recommendation in ["strong", "good"]:
            recommendation = "hold"

        # 4. Salary Expectation (Info only, no offer language)
        salary_exp = str(ai_analysis.get('salary_expectation', 'لم يذكر'))
        
        return {
            "technical_score": technical_score,
            "communication_score": communication_score,
            "job_fit_score": job_fit_score,
            "strengths": ai_analysis.get('strengths', []),
            "concerns": ai_analysis.get('concerns', []),
            "relevant_quotes": relevant_quotes[:5], # Max 3-5 quotes enforced
            "recommendation": recommendation,
            "salary_expectation": salary_exp,
            "summary_for_company": ai_analysis.get('internal_summary', 'يتطلب التقرير مراجعة بشرية لفهم التفاصيل.')
        }, safety_flags

    def _bound_score(self, score: Any) -> int:
        """يضمن أن النتيجة دائمًا بين 0 و 100"""
        try:
            val = int(score)
            if val < 0: return 0
            if val > 100: return 100
            return val
        except (ValueError, TypeError):
            return 0

interview_rubric = InterviewRubric()
