using JobMagnet.Application.DTOs.Freelancer;

namespace JobMagnet.Application.Interfaces
{
    public interface IFreelancerService
    {
        Task<FreelancerDto> GetMyProfileAsync(int userId);
        Task<FreelancerDto> GetProfileByIdAsync(int userId);
        Task<FreelancerDto> UpdateProfileAsync(int userId, UpdateFreelancerRequest request);

        // Portfolio
        Task<PortfolioItemDto> AddPortfolioItemAsync(int userId, AddPortfolioItemRequest request);
        Task<PortfolioItemDto> UpdatePortfolioItemAsync(int userId, int portfolioId, AddPortfolioItemRequest request);
        Task DeletePortfolioItemAsync(int userId, int portfolioId);
        Task<IEnumerable<PortfolioItemDto>> GetPortfolioItemsAsync(int userId);

        Task<IEnumerable<object>> GetRatingsAsync(int userId);
        Task UpdateAvailabilityAsync(int userId, bool isAvailable);
    }
}
