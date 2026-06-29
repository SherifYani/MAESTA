using JobMagnet.Application.DTOs.Dashboard;
using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetUserDashboardSummaryAsync(int userId);
        Task<JobSeekerDashboardDto> GetJobSeekerDashboardAsync(int userId);
        Task<FreelancerDashboardDto> GetFreelancerDashboardAsync(int userId);
        Task<CompanyDashboardDto> GetCompanyDashboardAsync(int userId);
        Task<CompanyAnalyticsDto> GetCompanyAnalyticsAsync(int userId, string? period = null);
        Task<ClientDashboardDto> GetClientDashboardAsync(int userId);
    }
}
