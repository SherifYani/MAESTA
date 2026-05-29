from .schemas import CandidateProfile, JobPost, CVJobMatchResult, EvidenceItem
from .evidence_builder import build_evidence

def is_job_scorable(job: JobPost) -> bool:
    """
    Job is scorable only if it has a title AND at least one of:
    must_have_skills, responsibilities, or summary.
    """
    if not job.title:
        return False
    if not job.must_have_skills and not job.responsibilities and not job.summary:
        return False
    return True

def score_candidate_for_job(candidate: CandidateProfile, job: JobPost) -> CVJobMatchResult:
    """
    Deterministically scores a candidate against a job post.
    No LLMs used for calculation. Max score is 100.
    """
    result = CVJobMatchResult(
        candidate_id=candidate.candidate_id,
        job_id=job.job_id
    )
    
    # 0. Quality Guard
    if not is_job_scorable(job):
        result.overall_score = 0.0
        result.recommendation = "not_recommended"
        result.gaps.append("Job post is missing enough requirements for reliable matching")
        result.risks.append("insufficient_job_data")
        return result

    # Clean inputs to avoid case sensitivity issues
    candidate_skills = [s.lower() for s in candidate.skills]
    
    # 1. Must Have Skills (40%)
    if job.must_have_skills:
        matches = 0
        for skill in job.must_have_skills:
            if skill.lower() in candidate_skills:
                matches += 1
                result.strengths.append(f"Has required skill: {skill}")
                result.evidence.append(build_evidence(f"Matches required skill {skill}", "cv.skills", skill))
            else:
                result.gaps.append(f"Missing required skill: {skill}")
        result.required_skills_score = (matches / len(job.must_have_skills)) * 40.0
    else:
        result.required_skills_score = 40.0 # Full points if no requirements
        
    # 2. Nice To Have Skills (15%)
    if job.nice_to_have_skills:
        matches = 0
        for skill in job.nice_to_have_skills:
            if skill.lower() in candidate_skills:
                matches += 1
                result.strengths.append(f"Has nice-to-have skill: {skill}")
        result.nice_to_have_score = (matches / len(job.nice_to_have_skills)) * 15.0
    else:
        result.nice_to_have_score = 15.0
        
    # 3. Experience (15%)
    if job.years_experience_min is not None and candidate.years_experience is not None:
        if candidate.years_experience >= job.years_experience_min:
            result.experience_score = 15.0
            result.strengths.append(f"Meets minimum experience ({candidate.years_experience} >= {job.years_experience_min} years)")
            result.evidence.append(build_evidence("Experience meets requirement", "cv.years_experience", f"{candidate.years_experience} years"))
        else:
            # Partial score if close
            ratio = candidate.years_experience / job.years_experience_min
            result.experience_score = ratio * 15.0
            result.gaps.append(f"Below minimum experience ({candidate.years_experience} < {job.years_experience_min} years)")
    else:
        result.experience_score = 15.0 # Full points if unspecified
        
    # 4. Project Similarity (10%)
    # Simple deterministic heuristic: if they have projects listed, grant proportional points, 
    # more points if target role matches job title.
    proj_score = 0.0
    if candidate.projects:
        proj_score += 5.0
        result.strengths.append("Has portfolio projects listed")
    if job.title.lower() in [r.lower() for r in candidate.target_roles]:
        proj_score += 5.0
        result.strengths.append(f"Target role matches job title: {job.title}")
    
    if not candidate.projects and not job.title.lower() in [r.lower() for r in candidate.target_roles]:
        result.gaps.append("No related projects or matching target roles found")
        
    result.project_similarity_score = proj_score if (candidate.projects or candidate.target_roles) else 0.0
        
    # 5. Location/Remote Fit (10%)
    loc_score = 10.0
    if job.location and candidate.location:
        if job.location.lower() != candidate.location.lower() and job.remote_policy.lower() not in ["remote", "fully remote", "anywhere"]:
            loc_score = 0.0
            result.gaps.append(f"Location mismatch: Candidate in {candidate.location}, Job in {job.location}")
            result.risks.append("Relocation may be required")
        else:
            result.strengths.append(f"Location matches or role is remote ({job.remote_policy})")
    result.location_fit_score = loc_score
    
    # 6. Salary Fit (5%)
    sal_score = 5.0
    if job.salary_max and candidate.expected_salary:
        if candidate.expected_salary > job.salary_max:
            sal_score = 0.0
            result.gaps.append(f"Expected salary ({candidate.expected_salary}) exceeds budget max ({job.salary_max})")
            result.risks.append("Salary expectations mismatch")
        else:
            result.strengths.append("Expected salary is within budget")
    result.salary_fit_score = sal_score
    
    # 7. Availability/Language (5%)
    lang_score = 5.0
    if job.languages:
        cand_langs = [l.lower() for l in candidate.languages]
        missing_langs = [l for l in job.languages if l.lower() not in cand_langs]
        if missing_langs:
            lang_score = 0.0
            result.gaps.append(f"Missing required languages: {', '.join(missing_langs)}")
        else:
            result.strengths.append("Meets language requirements")
    result.availability_score = lang_score

    # Overall Calculation
    result.overall_score = (
        result.required_skills_score +
        result.nice_to_have_score +
        result.experience_score +
        result.project_similarity_score +
        result.location_fit_score +
        result.salary_fit_score +
        result.availability_score
    )
    
    # Recommendation logic
    if result.overall_score >= 80:
        result.recommendation = "strong_match"
    elif result.overall_score >= 50:
        result.recommendation = "possible_match"
    elif result.overall_score >= 30:
        result.recommendation = "weak_match"
    else:
        result.recommendation = "not_recommended"
        
    return result
