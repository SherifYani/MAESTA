using JobMagnet.Application.DTOs.Admin;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<AdminUserDto>> GetPendingApprovalsAsync();
        Task<AdminPagedResponse<AdminUserListItemDto>> GetUsersAsync(string? search, string? userType, string? status, int page, int pageSize);
        Task<ApprovalResponseDto> ApproveUserAsync(int userId);
        Task ToggleUserStatusAsync(int userId, bool isActive, int currentAdminUserId);
        Task DeleteUserAsync(int userId, int currentAdminUserId);
        Task<AdminRoleResponseDto> GrantAdminRoleAsync(int userId, int currentAdminUserId);
        Task<AdminRoleResponseDto> RevokeAdminRoleAsync(int userId, int currentAdminUserId);
        Task<IEnumerable<AdminRoleDto>> GetRolesAsync();
        Task<AdminRoleResponseDto> AssignRoleAsync(int userId, string roleName, int currentAdminUserId);
        Task<AdminRoleResponseDto> RemoveRoleAsync(int userId, string roleName, int currentAdminUserId);
        Task<AdminDashboardMetricsDto> GetDashboardMetricsAsync();
        Task<IEnumerable<SystemReportDto>> GetPendingReportsAsync();
        Task ResolveReportAsync(int reportId, string action);
        Task<AdminPagedResponse<AdminJobDto>> GetJobsAsync(string? search, string? status, int page, int pageSize);
        Task<AdminPagedResponse<AdminLogDto>> GetLogsAsync(string? type, string? level, int page, int pageSize);
        Task RecordActivityAsync(int? userId, string action, string details, string? ipAddress = null);
        Task<IEnumerable<AdminPlatformSettingDto>> GetSettingsAsync(string? category);
        Task<AdminPlatformSettingDto> UpsertSettingAsync(UpsertPlatformSettingRequest request, int currentAdminUserId);
        Task<AdminFinanceSummaryDto> GetFinanceSummaryAsync();
        Task<IEnumerable<AdminWithdrawalDto>> GetWithdrawalsAsync(string? status);
        Task<IEnumerable<AdminRefundDto>> GetRefundsAsync(string? status);
        Task<IEnumerable<AdminSubscriptionDto>> GetSubscriptionsAsync(string? status);
        Task UpdateWithdrawalStatusAsync(int withdrawalRequestId, string status, int currentAdminUserId);
        Task UpdateRefundStatusAsync(int refundRequestId, string status, int currentAdminUserId);
        Task ModerateContentAsync(AdminModerationRequest request, int currentAdminUserId);
        Task<AdminHealthDto> GetHealthAsync();
        Task<AdminMonthlyAnalyticsDto> GetMonthlyAnalyticsAsync(int months);
    }
}
