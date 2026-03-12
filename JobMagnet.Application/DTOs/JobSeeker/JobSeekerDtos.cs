namespace JobMagnet.Application.DTOs.JobSeeker
{
    // ─── Request DTOs ─────────────────────────────────────────────────────────
    public class UpdateJobSeekerRequest
    {
        public string? ProfessionalTitle { get; set; }
        public int? ExperienceYears { get; set; }
        public string? Bio { get; set; }
        public string? CVUrl { get; set; }
        public string? PreferredJobType { get; set; }
    }

    public class AddWorkExperienceRequest
    {
        public string JobTitle { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string? Description { get; set; }
    }

    public class AddEducationRequest
    {
        public string Degree { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string? FieldOfStudy { get; set; }
        public int? StartYear { get; set; }
        public int? EndYear { get; set; }
        public bool IsCurrent { get; set; }
    }

    public class UpdateSkillsRequest
    {
        public List<string> Skills { get; set; } = new();
    }

    public class AddPortfolioItemRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ProjectUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateOnly? CompletionDate { get; set; }
    }

    // ─── Response DTOs ────────────────────────────────────────────────────────
    public class JobSeekerDto
    {
        public int JobSeekerId { get; set; }
        public int UserId { get; set; }
        public string? ProfessionalTitle { get; set; }
        public int? ExperienceYears { get; set; }
        public string? Bio { get; set; }
        public string? CVUrl { get; set; }
        public string? PreferredJobType { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset? LastActiveAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class WorkExperienceDto
    {
        public int WorkExperienceId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        public string? Description { get; set; }
    }

    public class EducationDto
    {
        public int EducationId { get; set; }
        public string Degree { get; set; } = string.Empty;
        public string Institution { get; set; } = string.Empty;
        public string? FieldOfStudy { get; set; }
        public int? StartYear { get; set; }
        public int? EndYear { get; set; }
        public bool IsCurrent { get; set; }
    }

    public class PortfolioDto
    {
        public int PortfolioId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ProjectUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateOnly? CompletionDate { get; set; }
    }
}
