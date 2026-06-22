using JobMagnet.Application.DTOs.Job;

namespace JobMagnet.Application.Interfaces
{
    public interface IJobService
    {
        // Jobs
        Task<PagedJobsResponse> GetJobsAsync(JobSearchRequest request);
        Task<JobDto> GetJobByIdAsync(int jobId);
        Task<JobDto> CreateJobAsync(int employerUserId, CreateJobRequest request);
        Task<JobDto> UpdateJobAsync(int employerUserId, int jobId, CreateJobRequest request);
        Task DeleteJobAsync(int employerUserId, int jobId);

        // Applications
        Task<JobApplicationDto> ApplyAsync(int userId, int jobId, ApplyToJobRequest request);
        Task<IEnumerable<JobApplicationDto>> GetMyApplicationsAsync(int userId);
        Task<IEnumerable<JobApplicationDto>> GetJobApplicationsAsync(int employerUserId, int jobId);
        Task<IEnumerable<JobApplicationDto>> GetCompanyApplicationsAsync(int employerUserId);
        Task UpdateApplicationStatusAsync(int employerUserId, int applicationId, string status);
        Task WithdrawApplicationAsync(int userId, int applicationId);

        // Saved Jobs
        Task SaveJobAsync(int userId, int jobId);
        Task UnsaveJobAsync(int userId, int jobId);
        Task<IEnumerable<JobDto>> GetSavedJobsAsync(int userId);

        // Company Jobs
        Task<IEnumerable<JobDto>> GetMyPostingsAsync(int employerUserId);
        Task ToggleJobStatusAsync(int employerUserId, int jobId, bool isPublished);
        Task<IEnumerable<JobDto>> GetRecommendedJobsAsync(int userId);
    }
}
