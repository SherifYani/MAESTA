using System.ComponentModel.DataAnnotations;

namespace JobMagnet.Application.DTOs.Auth
{
    public class RegisterStep2Request
    {
        [Required]
        [RegularExpression(@"^(Freelancer|Employer|JobSeeker|Client)$", ErrorMessage = "UserType is invalid")]
        public string UserType { get; set; } = string.Empty;

        public string? ProfessionalTitle { get; set; }
        public int? ExperienceYears { get; set; }
        public decimal? HourlyRate { get; set; }
        public string? Currency { get; set; }
        public string? PortfolioUrl { get; set; }
        public string? Bio { get; set; }
        public string? DocumentVerificationUrl { get; set; }

        public string? BusinessEmail { get; set; }
        public string? NationalId { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }

        public string? CVUrl { get; set; }
        public string? PreferredJobType { get; set; }

        public string? LegalName { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public string? IdentityDocumentUrl { get; set; }

        public string? CompanyName { get; set; }
        public string? CompanyDescription { get; set; }
        public string? CompanyIndustry { get; set; }
        public string? CompanySize { get; set; }
        public int? FoundedYear { get; set; }
        public string? CompanyCountry { get; set; }
        public string? CompanyCity { get; set; }
        public string? CompanyAddress { get; set; }
        public string? CompanyWebsite { get; set; }
        public string? CommercialRegistrationNumber { get; set; }
        public string? CommercialRegistrationFileUrl { get; set; }
        public string? CompanyLogoUrl { get; set; }
    }
}
