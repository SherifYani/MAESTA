namespace JobMagnet.Application.DTOs.Auth
{
    public class AuthResponse
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? UserType { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty;
        public string? AccessToken { get; set; }
        public DateTimeOffset? AccessTokenExpiresAt { get; set; }
        public string? RefreshToken { get; set; }
        public DateTimeOffset? RefreshTokenExpiresAt { get; set; }
        public bool RequiresTwoFactor { get; set; } = false;
    }
}
