using JobMagnet.Application.DTOs.Admin;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobMagnet.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly JobMagnetDbContext _context;
        private readonly ILogger<AdminService> _logger;

        public AdminService(JobMagnetDbContext context, ILogger<AdminService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<AdminUserDto>> GetPendingApprovalsAsync()
        {
            return await _context.Users
                .Where(u => u.RegistrationStatus == "PendingApproval" && !u.IsDeleted)
                .OrderBy(u => u.CreatedAt)
                .Select(u => new AdminUserDto
                {
                    UserId = u.UserId,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    UserType = u.UserType,
                    RegistrationStatus = u.RegistrationStatus,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ApprovalResponseDto> ApproveUserAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            if (user.IsDeleted)
                throw new InvalidOperationException("User account is deleted");

            if (user.RegistrationStatus != "PendingApproval")
                throw new InvalidOperationException("User is not pending approval");

            user.RegistrationStatus = "Approved";
            user.IsActive = true;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Approved user {UserId} ({Email})", user.UserId, user.Email);

            return new ApprovalResponseDto
            {
                Message = "User approved",
                UserId = user.UserId,
                RegistrationStatus = user.RegistrationStatus
            };
        }

        public async Task ToggleUserStatusAsync(int userId, bool isActive)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            user.IsActive = isActive;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin changed User {UserId} active state to {IsActive}", userId, isActive);
        }

        public async Task DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            user.IsDeleted = true;
            user.IsActive = false;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogWarning("Admin soft-deleted user {UserId}", userId);
        }

        public async Task<AdminDashboardMetricsDto> GetDashboardMetricsAsync()
        {
            return new AdminDashboardMetricsDto
            {
                TotalUsers = await _context.Users.CountAsync(u => !u.IsDeleted),
                TotalJobs = await _context.Jobs.CountAsync(j => !j.IsDeleted),
                TotalProjects = await _context.Projects.CountAsync(p => !p.IsDeleted),
                PendingReportsCount = await _context.Reports.CountAsync(r => r.Status == "Pending" && !r.IsDeleted),
                OngoingInterviewsCount = await _context.Interviews.CountAsync(i => (i.Status == "Scheduled" || i.Status == "Rescheduled") && !i.IsDeleted),
                TotalRevenue = await _context.Transactions
                    .Where(t => t.Type == "Payment" && t.Status == "Completed" && !t.IsDeleted)
                    .SumAsync(t => t.Amount)
            };
        }

        public async Task<IEnumerable<SystemReportDto>> GetPendingReportsAsync()
        {
            return await _context.Reports
                .Where(r => r.Status == "Pending" && !r.IsDeleted)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new SystemReportDto
                {
                    ReportId = r.ReportId,
                    EntityType = r.EntityType,
                    EntityId = r.EntityId,
                    ReportedByUserId = r.ReportedBy,
                    ReporterName = _context.Users.Where(u => u.UserId == r.ReportedBy).Select(u => u.FirstName + " " + u.LastName).FirstOrDefault() ?? "Unknown",
                    Reason = r.Reason,
                    Details = r.Details,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task ResolveReportAsync(int reportId, string action)
        {
            var report = await _context.Reports.FirstOrDefaultAsync(r => r.ReportId == reportId && !r.IsDeleted);
            if (report == null) throw new KeyNotFoundException("Report not found");

            report.Status = "Resolved";
            report.UpdatedAt = DateTimeOffset.UtcNow;
            
            // Note: In a real system, 'action' would trigger specific logic (e.g., DeletePostAsync, SuspendUserAsync)
            // For now, we just mark it resolved.

            await _context.SaveChangesAsync();
            _logger.LogInformation("Admin resolved report {ReportId} with action {Action}", reportId, action);
        }
    }
}
