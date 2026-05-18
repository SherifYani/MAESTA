using JobMagnet.Application.DTOs.Profile;

namespace JobMagnet.Application.Interfaces
{
    public interface IProfileService
    {
        Task<UserProfileDto> GetUserProfileAsync(int userId);
        Task<UserProfileDto> GetProfileByIdAsync(int userId);
        Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<UserSettingsDto> GetUserSettingsAsync(int userId);
        Task<UserSettingsDto> UpdateUserSettingsAsync(int userId, UpdateUserSettingsRequest request);
    }
}
