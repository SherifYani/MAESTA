namespace JobMagnet.Application.DTOs.Profile
{
    public class UpdateProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? ProfilePictureUrl { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
    }
}
