from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class EvidenceItem(BaseModel):
    claim: str
    source: str
    text: str

class CandidateProfile(BaseModel):
    candidate_id: str = ""
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    target_roles: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    years_experience: Optional[float] = None
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    portfolio_links: List[str] = Field(default_factory=list)
    expected_salary: Optional[float] = None
    availability: str = ""
    missing_fields: List[str] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)

class JobPost(BaseModel):
    job_id: str = ""
    tenant_id: str = ""
    site_id: str = ""
    bot_id: str = ""
    company_name: str = ""
    title: str = ""
    summary: str = ""
    responsibilities: List[str] = Field(default_factory=list)
    must_have_skills: List[str] = Field(default_factory=list)
    nice_to_have_skills: List[str] = Field(default_factory=list)
    years_experience_min: Optional[float] = None
    years_experience_max: Optional[float] = None
    education: str = ""
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: str = ""
    location: str = ""
    remote_policy: str = ""
    contract_type: str = ""
    status: str = "active"

class CVJobMatchResult(BaseModel):
    candidate_id: str = ""
    job_id: str = ""
    overall_score: float = 0.0
    required_skills_score: float = 0.0
    nice_to_have_score: float = 0.0
    experience_score: float = 0.0
    project_similarity_score: float = 0.0
    salary_fit_score: float = 0.0
    location_fit_score: float = 0.0
    availability_score: float = 0.0
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    recommendation: str = ""  # strong_match|possible_match|weak_match|not_recommended

class JobRecommendationResult(BaseModel):
    recommended_jobs: List[Dict[str, Any]] = Field(default_factory=list)
    limit: int = 5
    requires_approval: bool = False
    suggested_actions: List[Dict[str, Any]] = Field(default_factory=list)

class RankedCandidateItem(BaseModel):
    candidate_id: str = ""
    candidate_name: str = ""
    job_id: str = ""
    overall_score: float = 0.0
    recommendation: str = ""  # strong_match|possible_match|weak_match|not_recommended
    strengths: List[str] = Field(default_factory=list)
    gaps: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    evidence: List[EvidenceItem] = Field(default_factory=list)
    rank: int = 0

class ApplicantRankingResult(BaseModel):
    job_id: str = ""
    ranked_candidates: List[RankedCandidateItem] = Field(default_factory=list)
    limit: int = 10
    requires_human_review: bool = True
    suggested_actions: List[Dict[str, Any]] = Field(default_factory=list)

class ApplicantRankingRequest(BaseModel):
    job_post: JobPost
    candidate_profiles: List[CandidateProfile] = Field(default_factory=list)
    limit: int = 10
