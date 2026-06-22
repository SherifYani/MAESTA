namespace JobMagnet.Application.DTOs.Job
{
    // ─── Request DTOs ─────────────────────────────────────────────────────────
    public class CreateJobRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? JobType { get; set; }
        public string? ExperienceLevel { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string? Currency { get; set; }
        public List<int> TagIds { get; set; } = new();
        public List<int> CategoryIds { get; set; } = new();
    }

    public class JobSearchRequest
    {
        public string? Keyword { get; set; }
        public string? Location { get; set; }
        public string? JobType { get; set; }
        public string? ExperienceLevel { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
    }

    public class ApplyToJobRequest
    {
        public string? CoverLetter { get; set; }
        public string? CVUrl { get; set; }
    }

    // ─── Response DTOs ────────────────────────────────────────────────────────
    public class JobDto
    {
        public int JobId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? JobType { get; set; }
        public string? ExperienceLevel { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public string? Currency { get; set; }
        public bool IsPublished { get; set; }
        public int? EmployerId { get; set; }
        public string? CompanyName { get; set; }
        public int? CompanyId { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public double? MatchScore { get; set; }
    }

    public class JobApplicationDto
    {
        public int ApplicationId { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public int ApplicantId { get; set; }
        public string ApplicantName { get; set; } = string.Empty;
        public string? CoverLetter { get; set; }
        public string? CVUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset AppliedAt { get; set; }
        public double? MatchScore { get; set; }
    }

    public class PagedJobsResponse
    {
        public List<JobDto> Jobs { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int TotalPages { get; set; }
    }
}
