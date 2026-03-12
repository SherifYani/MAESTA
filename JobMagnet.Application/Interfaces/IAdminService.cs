using JobMagnet.Application.DTOs.Admin;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<AdminUserDto>> GetPendingApprovalsAsync();
        Task<ApprovalResponseDto> ApproveUserAsync(int userId);
        Task ToggleUserStatusAsync(int userId, bool isActive);
        Task DeleteUserAsync(int userId);
        Task<AdminDashboardMetricsDto> GetDashboardMetricsAsync();
        Task<IEnumerable<SystemReportDto>> GetPendingReportsAsync();
        Task ResolveReportAsync(int reportId, string action);
    }
}
