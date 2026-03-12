namespace JobMagnet.Application.DTOs.Freelancer
{
    // ─── Request DTOs ─────────────────────────────────────────────────────────
    public class UpdateFreelancerRequest
    {
        public string? ProfessionalTitle { get; set; }
        public int? ExperienceYears { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Currency { get; set; }
        public string? PortfolioUrl { get; set; }
        public string? Bio { get; set; }
    }

    public class AddPortfolioItemRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ProjectUrl { get; set; }
        public string? ImageUrl { get; set; }
        public DateOnly? CompletionDate { get; set; }
    }

    // ─── Response DTOs ────────────────────────────────────────────────────────
    public class FreelancerDto
    {
        public int FreelancerId { get; set; }
        public int UserId { get; set; }
        public int? FreelancerLevelId { get; set; }
        public string? ProfessionalTitle { get; set; }
        public int? ExperienceYears { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Currency { get; set; }
        public int TotalCompletedProjects { get; set; }
        public string? PortfolioUrl { get; set; }
        public string? Bio { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset? LastActiveAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class PortfolioItemDto
    {
        public int PortfolioId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ProjectUrl { get; set; }
        public string? ImageUrl { get; set; }
        public DateOnly? CompletionDate { get; set; }
    }
}
