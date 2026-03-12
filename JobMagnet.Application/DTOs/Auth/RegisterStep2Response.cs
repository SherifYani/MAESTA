namespace JobMagnet.Application.DTOs.Auth
{
    public class RegisterStep2Response
    {
        public string Message { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string? UserType { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty;
    }
}
