using JobMagnet.Application.DTOs.Auth;

namespace JobMagnet.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterStep1Async(RegisterStep1Request request, string? ipAddress = null);
        Task<RegisterStep2Response> RegisterStep2Async(int userId, RegisterStep2Request request);
        Task VerifyEmailAsync(VerifyEmailRequest request);
        Task ResendVerificationAsync(ResendVerificationRequest request);
        Task ForgotPasswordAsync(ForgotPasswordRequest request);
        Task ResetPasswordAsync(ResetPasswordRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress = null);
        Task<Enable2faResponse> Enable2faAsync(int userId);
        Task Disable2faAsync(int userId);
        Task<AuthResponse> Verify2faAsync(Verify2faRequest request, string? ipAddress = null);
        Task<AuthResponse> RefreshTokenAsync(RefreshRequest request, string? ipAddress = null);
        Task LogoutAsync(int userId, string refreshToken);
        Task<int> LogoutAllAsync(int userId);
        Task<CurrentUserResponse> GetCurrentUserProfileAsync(int userId);
        Task ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<List<SessionResponse>> GetActiveSessionsAsync(int userId, string currentToken);
        Task DeleteAccountAsync(int userId);

        // Social Login Placeholder
        Task<AuthResponse> LoginGoogleAsync(string token, string? ipAddress = null);
        Task<AuthResponse> LoginLinkedInAsync(string token, string? ipAddress = null);
    }
}
