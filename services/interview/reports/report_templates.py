"""
Markdown/HTML report templates for interview reports.
"""
from typing import List, Dict, Any


class ReportTemplates:
    @staticmethod
    def markdown_report(candidate_name: str, job_title: str,
                         cv_match: float, technical_score: float,
                         experience_score: float, consistency_score: float,
                         communication_score: float, trust_score: float,
                         final_score: float, recommendation: str,
                         strengths: List[str], weaknesses: List[str],
                         skill_breakdown: List[Dict],
                         trust_analysis: Dict[str, Any],
                         recommended_actions: List[str]) -> str:
        lines = []
        lines.append(f"# AI Interview Report: {candidate_name}")
        lines.append(f"**Position:** {job_title}")
        lines.append(f"**Recommendation:** {recommendation}")
        lines.append(f"**Final Score:** {final_score}%\n")

        lines.append("## Score Summary")
        lines.append(f"| Dimension | Score |")
        lines.append(f"|-----------|-------|")
        lines.append(f"| Technical | {technical_score}% |")
        lines.append(f"| Experience | {experience_score}% |")
        lines.append(f"| Consistency | {consistency_score}% |")
        lines.append(f"| Communication | {communication_score}% |")
        lines.append(f"| Trust | {trust_score}% |")
        lines.append(f"| CV Match | {cv_match}% |\n")

        lines.append("## Strengths")
        for s in strengths:
            lines.append(f"- {s}")

        lines.append("\n## Weaknesses")
        for w in weaknesses:
            lines.append(f"- {w}")

        lines.append("\n## Skill Breakdown")
        lines.append("| Skill | Claimed | Verified | Gap | Confidence |")
        lines.append("|-------|---------|----------|-----|------------|")
        for sb in skill_breakdown:
            gap = round(sb["claimed"] - sb["verified"], 1)
            lines.append(f"| {sb['skill']} | {sb['claimed']}% | {sb['verified']}% | {gap}% | {sb['confidence']} |")

        lines.append("\n## Trust Analysis")
        lines.append(f"- Trust Score: {trust_analysis.get('trust_score', 0)}%")
        lines.append(f"- Consistency Score: {trust_analysis.get('consistency_score', 0)}%")
        for tg in trust_analysis.get("trust_gaps", []):
            lines.append(f"- ⚠️ {tg['skill']}: gap of {tg['gap']}%")
        for flag in trust_analysis.get("risk_flags", []):
            lines.append(f"- 🚩 {flag}")

        lines.append("\n## Recommended Actions")
        for action in recommended_actions:
            lines.append(f"- {action}")

        return "\n".join(lines)
