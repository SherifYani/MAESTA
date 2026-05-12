using System;

namespace JobMagnet.Application.DTOs.Profile
{
    public class UserProfileDto
    {
        public UserDto User { get; set; } = new();
        public JobSeekerProfileDto? JobSeeker { get; set; }
        public EmployerProfileDto? Employer { get; set; }
        public CompanyDto? Company { get; set; }
    }

    public class UserDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? Gender { get; set; }
        public DateTimeOffset? DateOfBirth { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? UserType { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class JobSeekerProfileDto
    {
        public int JobSeekerId { get; set; }
        public int UserId { get; set; }
        public string? CVUrl { get; set; }
        public string? ProfessionalTitle { get; set; }
        public int? ExperienceYears { get; set; }
        public string? PreferredJobType { get; set; }
        public string? Bio { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset? LastActiveAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class EmployerProfileDto
    {
        public int EmployerId { get; set; }
        public int UserId { get; set; }
        public string? BusinessEmail { get; set; }
        public string? NationalId { get; set; }
        public string? TaxNumber { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset? VerificationRequestedAt { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class CompanyDto
    {
        public int CompanyId { get; set; }
        public int EmployerId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
        public int? FoundedYear { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public string? CommercialRegistrationNumber { get; set; }
        public string? CommercialRegistrationFileUrl { get; set; }
        public string? LogoUrl { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }
}
