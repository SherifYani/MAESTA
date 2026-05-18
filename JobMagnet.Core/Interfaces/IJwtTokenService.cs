using JobMagnet.Domain.Entities;

namespace JobMagnet.Core.Interfaces
{
    public interface IJwtTokenService
    {
        (string Token, DateTimeOffset ExpiresAt) CreateAccessToken(User user, IEnumerable<string>? roles = null);
        string GenerateRefreshToken();
    }
}
