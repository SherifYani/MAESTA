using System.ComponentModel.DataAnnotations;

namespace JobMagnet.Application.DTOs.Auth
{
    public class RegisterStep1Request
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? ProfilePictureUrl { get; set; }

        public DateTimeOffset? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string? Country { get; set; }

        public string? City { get; set; }

        public string? LinkedInUrl { get; set; }
    }
}
