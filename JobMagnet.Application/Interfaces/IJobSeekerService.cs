using JobMagnet.Application.DTOs.JobSeeker;

namespace JobMagnet.Application.Interfaces
{
    public interface IJobSeekerService
    {
        Task<JobSeekerDto> GetMyProfileAsync(int userId);
        Task<JobSeekerDto> GetByUserIdAsync(int userId);
        Task<JobSeekerDto> UpdateProfileAsync(int userId, UpdateJobSeekerRequest request);

        // Work Experience
        Task<WorkExperienceDto> AddWorkExperienceAsync(int userId, AddWorkExperienceRequest request);
        Task<WorkExperienceDto> UpdateWorkExperienceAsync(int userId, int experienceId, AddWorkExperienceRequest request);
        Task DeleteWorkExperienceAsync(int userId, int experienceId);
        Task<IEnumerable<WorkExperienceDto>> GetWorkExperiencesAsync(int userId);

        // Education
        Task<EducationDto> AddEducationAsync(int userId, AddEducationRequest request);
        Task<EducationDto> UpdateEducationAsync(int userId, int educationId, AddEducationRequest request);
        Task DeleteEducationAsync(int userId, int educationId);
        Task<IEnumerable<EducationDto>> GetEducationsAsync(int userId);

        // Skills
        Task UpdateSkillsAsync(int userId, UpdateSkillsRequest request);
        Task<IEnumerable<string>> GetSkillsAsync(int userId);

        // Portfolio
        Task<PortfolioDto> AddPortfolioItemAsync(int userId, AddPortfolioItemRequest request);
        Task<PortfolioDto> UpdatePortfolioItemAsync(int userId, int portfolioId, AddPortfolioItemRequest request);
        Task DeletePortfolioItemAsync(int userId, int portfolioId);
        Task<IEnumerable<PortfolioDto>> GetPortfolioAsync(int userId);
    }
}
