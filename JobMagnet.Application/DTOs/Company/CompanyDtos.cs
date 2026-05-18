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
    }
}
