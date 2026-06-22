namespace JobMagnet.Application.DTOs.Company
{
    public class UpdateCompanyRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Description { get; set; }
        public int? FoundedYear { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public string? LogoUrl { get; set; }
        public List<CompanyMemberDto> Members { get; set; } = new();
        public List<CompanyJobDto> Jobs { get; set; } = new();
    }

    public class CompanyDto
    {
        public int CompanyId { get; set; }
        public int EmployerId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public string? Description { get; set; }
        public int? FoundedYear { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public string? LogoUrl { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        // Added for real data support
        public List<CompanyMemberDto> Members { get; set; } = new();
        public List<CompanyJobDto> Jobs { get; set; } = new();
        public CompanyStatsDto Stats { get; set; } = new();
    }

    public class CompanyMemberDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? Avatar { get; set; }
    }

    public class CompanyJobDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset PostedAt { get; set; }
        public int ApplicationsCount { get; set; }
    }

    public class CompanyStatsDto
    {
        public int TotalJobs { get; set; }
        public int ActiveJobs { get; set; }
        public int TotalHires { get; set; }
        public int AvgTimeToHire { get; set; }
    }

    public class CompanyMemberOnboardingRequest
    {
        public int CompanyId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
    }

    public class CompanyMemberOnboardingDraftRequest
    {
        public int? CompanyId { get; set; }
        public string? Role { get; set; }
        public string? Position { get; set; }
        public string? Department { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }

    public class CompanyMemberOnboardingResponse
    {
        public int UserId { get; set; }
        public int CompanyId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
