using JobMagnet.Application.DTOs.Admin;
using JobMagnet.Application.Interfaces;
using JobMagnet.Domain.Entities;
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

        public async Task<AdminPagedResponse<AdminUserListItemDto>> GetUsersAsync(string? search, string? userType, string? status, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Users.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(u => u.Email.Contains(term) || u.FirstName.Contains(term) || u.LastName.Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(userType))
                query = query.Where(u => u.UserType == userType.Trim());

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim();
                query = normalizedStatus.ToLowerInvariant() switch
                {
                    "active" => query.Where(u => u.IsActive && !u.IsDeleted),
                    "inactive" => query.Where(u => !u.IsActive && !u.IsDeleted),
                    "deleted" => query.Where(u => u.IsDeleted),
                    _ => query.Where(u => u.RegistrationStatus == normalizedStatus && !u.IsDeleted)
                };
            }
            else
            {
                query = query.Where(u => !u.IsDeleted);
            }

            var totalItems = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserListItemDto
                {
                    UserId = u.UserId,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Phone = u.Phone,
                    UserType = u.UserType,
                    RegistrationStatus = u.RegistrationStatus,
                    IsActive = u.IsActive,
                    IsDeleted = u.IsDeleted,
                    IsEmailVerified = u.IsEmailVerified,
                    LastLoginAt = u.LastLoginAt,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            var userIds = users.Select(u => u.UserId).ToList();
            var roleMap = await (from ur in _context.UserRoles
                                 join r in _context.Roles on ur.RoleId equals r.RoleId
                                 where userIds.Contains(ur.UserId) && !r.IsDeleted
                                 group r.RoleName by ur.UserId into g
                                 select new { UserId = g.Key, Roles = g.ToList() })
                .ToDictionaryAsync(x => x.UserId, x => x.Roles.AsEnumerable());

            foreach (var user in users)
                user.Roles = roleMap.TryGetValue(user.UserId, out var roles) ? roles : Array.Empty<string>();

            return new AdminPagedResponse<AdminUserListItemDto>
            {
                Items = users,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
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
            await RecordActivityAsync(null, "AdminApprovedUser", $"Approved user {user.UserId} ({user.Email})");

            return new ApprovalResponseDto
            {
                Message = "User approved",
                UserId = user.UserId,
                RegistrationStatus = user.RegistrationStatus
            };
        }

        public async Task ToggleUserStatusAsync(int userId, bool isActive, int currentAdminUserId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            if (userId == currentAdminUserId && !isActive)
                throw new InvalidOperationException("Admins cannot deactivate their own account");

            user.IsActive = isActive;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            if (!isActive)
                await RevokeActiveRefreshTokensAsync(userId, "Deactivated by admin", currentAdminUserId);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Admin changed User {UserId} active state to {IsActive}", userId, isActive);
            await RecordActivityAsync(currentAdminUserId, "AdminChangedUserStatus", $"Changed user {userId} active state to {isActive}");
        }

        public async Task DeleteUserAsync(int userId, int currentAdminUserId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            if (userId == currentAdminUserId)
                throw new InvalidOperationException("Admins cannot delete their own account");

            user.IsDeleted = true;
            user.IsActive = false;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            await RevokeActiveRefreshTokensAsync(userId, "Deleted by admin", currentAdminUserId);

            await _context.SaveChangesAsync();

            _logger.LogWarning("Admin soft-deleted user {UserId}", userId);
            await RecordActivityAsync(currentAdminUserId, "AdminDeletedUser", $"Soft-deleted user {userId}");
        }

        public async Task<AdminRoleResponseDto> GrantAdminRoleAsync(int userId, int currentAdminUserId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");
            if (user.IsDeleted) throw new InvalidOperationException("User account is deleted");

            var adminRole = await EnsureAdminRoleAsync(currentAdminUserId);
            var hasAdminRole = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == adminRole.RoleId);
            if (!hasAdminRole)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = userId,
                    RoleId = adminRole.RoleId,
                    AssignedAt = DateTimeOffset.UtcNow,
                    CreatedAt = DateTimeOffset.UtcNow,
                    CreatedBy = currentAdminUserId
                });
            }

            user.UserType = "Admin";
            user.RegistrationStatus = "Approved";
            user.IsActive = true;
            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = currentAdminUserId;

            await _context.SaveChangesAsync();

            _logger.LogWarning("Admin {CurrentAdminUserId} granted Admin role to User {UserId}", currentAdminUserId, userId);
            await RecordActivityAsync(currentAdminUserId, "AdminGrantedRole", $"Granted Admin role to user {userId}");
            return await BuildAdminRoleResponseAsync(userId, "User is now an admin");
        }

        public async Task<AdminRoleResponseDto> RevokeAdminRoleAsync(int userId, int currentAdminUserId)
        {
            if (userId == currentAdminUserId)
                throw new InvalidOperationException("Admins cannot revoke their own admin role");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Admin" && !r.IsDeleted);
            if (adminRole != null)
            {
                var userAdminRoles = await _context.UserRoles
                    .Where(ur => ur.UserId == userId && ur.RoleId == adminRole.RoleId)
                    .ToListAsync();
                _context.UserRoles.RemoveRange(userAdminRoles);
            }

            if (user.UserType == "Admin")
                user.UserType = null;

            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = currentAdminUserId;
            await RevokeActiveRefreshTokensAsync(userId, "Admin role revoked", currentAdminUserId);

            await _context.SaveChangesAsync();

            _logger.LogWarning("Admin {CurrentAdminUserId} revoked Admin role from User {UserId}", currentAdminUserId, userId);
            await RecordActivityAsync(currentAdminUserId, "AdminRevokedRole", $"Revoked Admin role from user {userId}");
            return await BuildAdminRoleResponseAsync(userId, "Admin role revoked");
        }

        public async Task<IEnumerable<AdminRoleDto>> GetRolesAsync()
        {
            return await _context.Roles
                .AsNoTracking()
                .OrderBy(r => r.RoleName)
                .Select(r => new AdminRoleDto
                {
                    RoleId = r.RoleId,
                    RoleName = r.RoleName,
                    Description = r.Description,
                    IsDeleted = r.IsDeleted,
                    UserCount = _context.UserRoles.Count(ur => ur.RoleId == r.RoleId)
                })
                .ToListAsync();
        }

        public async Task<AdminRoleResponseDto> AssignRoleAsync(int userId, string roleName, int currentAdminUserId)
        {
            var normalizedRoleName = NormalizeRoleName(roleName);
            if (normalizedRoleName == "Admin")
                return await GrantAdminRoleAsync(userId, currentAdminUserId);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");
            if (user.IsDeleted) throw new InvalidOperationException("User account is deleted");

            var role = await EnsureRoleAsync(normalizedRoleName, currentAdminUserId);
            var hasRole = await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == role.RoleId);
            if (!hasRole)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = userId,
                    RoleId = role.RoleId,
                    AssignedAt = DateTimeOffset.UtcNow,
                    CreatedAt = DateTimeOffset.UtcNow,
                    CreatedBy = currentAdminUserId
                });
            }

            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = currentAdminUserId;
            await _context.SaveChangesAsync();
            return await BuildAdminRoleResponseAsync(userId, "Role assigned");
        }

        public async Task<AdminRoleResponseDto> RemoveRoleAsync(int userId, string roleName, int currentAdminUserId)
        {
            var normalizedRoleName = NormalizeRoleName(roleName);
            if (normalizedRoleName == "Admin")
                return await RevokeAdminRoleAsync(userId, currentAdminUserId);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == normalizedRoleName && !r.IsDeleted);
            if (role != null)
            {
                var userRoles = await _context.UserRoles
                    .Where(ur => ur.UserId == userId && ur.RoleId == role.RoleId)
                    .ToListAsync();
                _context.UserRoles.RemoveRange(userRoles);
            }

            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = currentAdminUserId;
            await RevokeActiveRefreshTokensAsync(userId, "Role removed by admin", currentAdminUserId);
            await _context.SaveChangesAsync();
            await RecordActivityAsync(currentAdminUserId, "AdminRemovedRole", $"Removed role {normalizedRoleName} from user {userId}");
            return await BuildAdminRoleResponseAsync(userId, "Role removed");
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

            report.Status = action.Equals("dismiss", StringComparison.OrdinalIgnoreCase) ? "Dismissed" : "Resolved";
            report.UpdatedAt = DateTimeOffset.UtcNow;

            await ModerateContentAsync(new AdminModerationRequest
            {
                EntityType = report.EntityType,
                EntityId = report.EntityId,
                Action = action,
                Reason = report.Reason
            }, report.UpdatedBy ?? 0);

            await _context.SaveChangesAsync();
            _logger.LogInformation("Admin resolved report {ReportId} with action {Action}", reportId, action);
            await RecordActivityAsync(report.UpdatedBy, "AdminResolvedReport", $"Resolved report {reportId} with action {action}");
        }

        public async Task<AdminPagedResponse<AdminJobDto>> GetJobsAsync(string? search, string? status, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Jobs.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(j => j.Title.Contains(term) || j.Description.Contains(term) || (j.Location != null && j.Location.Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = status.Trim().ToLowerInvariant() switch
                {
                    "active" => query.Where(j => j.IsActive && !j.IsDeleted),
                    "inactive" => query.Where(j => !j.IsActive && !j.IsDeleted),
                    "deleted" => query.Where(j => j.IsDeleted),
                    _ => query
                };
            }
            else
            {
                query = query.Where(j => !j.IsDeleted);
            }

            var totalItems = await query.CountAsync();
            var jobs = await query
                .OrderByDescending(j => j.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new AdminJobDto
                {
                    JobId = j.JobId,
                    Title = j.Title,
                    JobType = j.Type,
                    Location = j.Location,
                    MinSalary = j.MinSalary,
                    MaxSalary = j.MaxSalary,
                    IsActive = j.IsActive,
                    IsDeleted = j.IsDeleted,
                    CreatedAt = j.CreatedAt,
                    PostedByUserId = j.PostedByUserId,
                    PostedByEmail = j.User != null ? j.User.Email : string.Empty,
                    CompanyName = _context.Companies
                        .Where(c => c.Employer != null && c.Employer.UserId == j.PostedByUserId && !c.IsDeleted)
                        .Select(c => c.CompanyName)
                        .FirstOrDefault(),
                    ApplicationsCount = _context.JobApplications.Count(a => a.JobId == j.JobId && !a.IsDeleted),
                    ReportsCount = _context.Reports.Count(r => r.EntityType == "Job" && r.EntityId == j.JobId && !r.IsDeleted)
                })
                .ToListAsync();

            return new AdminPagedResponse<AdminJobDto>
            {
                Items = jobs,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        public async Task<AdminPagedResponse<AdminLogDto>> GetLogsAsync(string? type, string? level, int page, int pageSize)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var logType = string.IsNullOrWhiteSpace(type) ? "all" : type.Trim().ToLowerInvariant();

            var activityQuery = _context.ActivityLogs.AsNoTracking().Select(l => new AdminLogDto
            {
                Id = l.ActivityId,
                UserId = l.UserId,
                UserEmail = l.User != null ? l.User.Email : null,
                UserName = l.User != null ? l.User.FirstName + " " + l.User.LastName : null,
                UserType = l.User != null ? l.User.UserType : null,
                Type = "Activity",
                LevelOrAction = l.Action,
                Message = l.Details ?? l.Action,
                Metadata = l.Details,
                IpAddress = l.IpAddress,
                CreatedAt = l.CreatedAt
            });

            var systemQuery = _context.SystemLogs.AsNoTracking().Select(l => new AdminLogDto
            {
                Id = l.LogId,
                Type = "System",
                LevelOrAction = l.Level,
                Message = l.Message,
                Metadata = l.Metadata,
                CreatedAt = l.CreatedAt
            });

            IQueryable<AdminLogDto> query = logType switch
            {
                "activity" => activityQuery,
                "system" => systemQuery,
                _ => activityQuery.Concat(systemQuery)
            };

            if (!string.IsNullOrWhiteSpace(level))
                query = query.Where(l => l.LevelOrAction == level.Trim());

            var totalItems = await query.CountAsync();
            var items = await query.OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new AdminPagedResponse<AdminLogDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
            };
        }

        public async Task RecordActivityAsync(int? userId, string action, string details, string? ipAddress = null)
        {
            _context.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                Action = action,
                Details = details,
                IpAddress = ipAddress,
                CreatedAt = DateTimeOffset.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AdminPlatformSettingDto>> GetSettingsAsync(string? category)
        {
            var query = _context.PlatformSettings.AsNoTracking().Where(s => !s.IsDeleted);
            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(s => s.Category == category.Trim());

            return await query.OrderBy(s => s.Category).ThenBy(s => s.SettingKey)
                .Select(s => new AdminPlatformSettingDto
                {
                    SettingId = s.SettingId,
                    SettingKey = s.SettingKey,
                    SettingValue = s.SettingValue,
                    Category = s.Category,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<AdminPlatformSettingDto> UpsertSettingAsync(UpsertPlatformSettingRequest request, int currentAdminUserId)
        {
            if (string.IsNullOrWhiteSpace(request.SettingKey))
                throw new ArgumentException("Setting key is required");

            var key = request.SettingKey.Trim();
            var setting = await _context.PlatformSettings.FirstOrDefaultAsync(s => s.SettingKey == key);
            if (setting == null)
            {
                setting = new PlatformSetting
                {
                    SettingKey = key,
                    SettingValue = request.SettingValue,
                    Category = request.Category,
                    CreatedAt = DateTimeOffset.UtcNow,
                    CreatedBy = currentAdminUserId,
                    IsDeleted = false
                };
                _context.PlatformSettings.Add(setting);
            }
            else
            {
                setting.SettingValue = request.SettingValue;
                setting.Category = request.Category;
                setting.IsDeleted = false;
                setting.UpdatedAt = DateTimeOffset.UtcNow;
                setting.UpdatedBy = currentAdminUserId;
            }

            await _context.SaveChangesAsync();
            return new AdminPlatformSettingDto
            {
                SettingId = setting.SettingId,
                SettingKey = setting.SettingKey,
                SettingValue = setting.SettingValue,
                Category = setting.Category,
                UpdatedAt = setting.UpdatedAt
            };
        }

        public async Task<AdminFinanceSummaryDto> GetFinanceSummaryAsync()
        {
            return new AdminFinanceSummaryDto
            {
                TotalRevenue = await _context.Transactions.Where(t => t.Type == "Payment" && t.Status == "Completed" && !t.IsDeleted).SumAsync(t => t.Amount),
                PendingWithdrawals = await _context.WithdrawalRequests.Where(w => w.Status == "Pending" && !w.IsDeleted).SumAsync(w => w.Amount),
                PendingWithdrawalCount = await _context.WithdrawalRequests.CountAsync(w => w.Status == "Pending" && !w.IsDeleted),
                PendingRefundCount = await _context.RefundRequests.CountAsync(r => r.Status == "Pending" && !r.IsDeleted),
                ActiveSubscriptions = await _context.Subscriptions.CountAsync(s => s.IsActive)
            };
        }

        public async Task<IEnumerable<AdminWithdrawalDto>> GetWithdrawalsAsync(string? status)
        {
            var query = _context.WithdrawalRequests.AsNoTracking().Where(w => !w.IsDeleted);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(w => w.Status == status.Trim());

            return await query.OrderByDescending(w => w.RequestedAt)
                .Select(w => new AdminWithdrawalDto
                {
                    WithdrawalRequestId = w.WithdrawalRequestId,
                    UserId = w.UserId,
                    UserEmail = w.User != null ? w.User.Email : string.Empty,
                    Amount = w.Amount,
                    PaymentMethod = w.PaymentMethod,
                    Status = w.Status,
                    RequestedAt = w.RequestedAt,
                    ProcessedAt = w.ProcessedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<AdminRefundDto>> GetRefundsAsync(string? status)
        {
            var query = _context.RefundRequests.AsNoTracking().Where(r => !r.IsDeleted);
            if (!string.IsNullOrWhiteSpace(status)) query = query.Where(r => r.Status == status.Trim());

            return await query.OrderByDescending(r => r.RequestedAt)
                .Select(r => new AdminRefundDto
                {
                    RefundRequestId = r.RefundRequestId,
                    UserId = r.UserId,
                    UserEmail = r.User != null ? r.User.Email : string.Empty,
                    TransactionId = r.TransactionId,
                    Reason = r.Reason,
                    Status = r.Status,
                    RequestedAt = r.RequestedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<AdminSubscriptionDto>> GetSubscriptionsAsync(string? status)
        {
            var query = _context.Subscriptions.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim().ToLowerInvariant();
                query = normalizedStatus switch
                {
                    "active" => query.Where(s => s.IsActive),
                    "cancelled" or "inactive" => query.Where(s => !s.IsActive),
                    _ => query
                };
            }

            return await query.OrderByDescending(s => s.CreatedAt)
                .Select(s => new AdminSubscriptionDto
                {
                    SubscriptionId = s.SubscriptionId,
                    UserId = s.UserId,
                    UserEmail = s.User != null ? s.User.Email : string.Empty,
                    PlanName = s.PlanName,
                    Price = s.Price,
                    Currency = s.Currency,
                    StartDate = s.StartDate,
                    EndDate = s.EndDate,
                    IsActive = s.IsActive,
                    AutoRenew = s.AutoRenew,
                    RenewDate = s.RenewDate
                })
                .ToListAsync();
        }

        public async Task UpdateWithdrawalStatusAsync(int withdrawalRequestId, string status, int currentAdminUserId)
        {
            var allowed = new[] { "Pending", "Processing", "Approved", "Rejected", "Completed" };
            if (!allowed.Contains(status)) throw new ArgumentException("Invalid withdrawal status");

            var request = await _context.WithdrawalRequests.FirstOrDefaultAsync(w => w.WithdrawalRequestId == withdrawalRequestId && !w.IsDeleted);
            if (request == null) throw new KeyNotFoundException("Withdrawal request not found");

            request.Status = status;
            request.UpdatedAt = DateTimeOffset.UtcNow;
            request.UpdatedBy = currentAdminUserId;
            if (status is "Approved" or "Rejected" or "Completed") request.ProcessedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRefundStatusAsync(int refundRequestId, string status, int currentAdminUserId)
        {
            var allowed = new[] { "Pending", "Approved", "Rejected", "Processed" };
            if (!allowed.Contains(status)) throw new ArgumentException("Invalid refund status");

            var request = await _context.RefundRequests.FirstOrDefaultAsync(r => r.RefundRequestId == refundRequestId && !r.IsDeleted);
            if (request == null) throw new KeyNotFoundException("Refund request not found");

            request.Status = status;
            request.UpdatedAt = DateTimeOffset.UtcNow;
            request.UpdatedBy = currentAdminUserId;
            await _context.SaveChangesAsync();
        }

        public async Task ModerateContentAsync(AdminModerationRequest request, int currentAdminUserId)
        {
            var action = request.Action.Trim().ToLowerInvariant();
            var shouldDelete = action is "delete" or "remove" or "hide" or "suspend";
            var shouldRestore = action is "restore" or "approve";

            switch (request.EntityType.Trim().ToLowerInvariant())
            {
                case "user":
                    await ModerateUserAsync(request.EntityId, shouldDelete, shouldRestore, currentAdminUserId);
                    break;
                case "job":
                    await ModerateJobAsync(request.EntityId, shouldDelete, shouldRestore, currentAdminUserId);
                    break;
                case "post":
                    await ModeratePostAsync(request.EntityId, shouldDelete, shouldRestore, currentAdminUserId);
                    break;
                default:
                    throw new ArgumentException("Unsupported moderation entity type");
            }

            await _context.ActivityLogs.AddAsync(new ActivityLog
            {
                UserId = currentAdminUserId == 0 ? null : currentAdminUserId,
                Action = "AdminModeration",
                Details = $"{request.Action} {request.EntityType} #{request.EntityId}: {request.Reason}",
                CreatedAt = DateTimeOffset.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        public async Task<AdminHealthDto> GetHealthAsync()
        {
            var databaseStatus = "Unavailable";
            try
            {
                databaseStatus = await _context.Database.CanConnectAsync() ? "Operational" : "Unavailable";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin health check could not connect to the database");
            }

            return new AdminHealthDto
            {
                Api = "Operational",
                Database = databaseStatus,
                TotalUsers = await CountSafeAsync(() => _context.Users.CountAsync(u => !u.IsDeleted), "total users"),
                ActiveUsers = await CountSafeAsync(() => _context.Users.CountAsync(u => u.IsActive && !u.IsDeleted), "active users"),
                TotalJobs = await CountSafeAsync(() => _context.Jobs.CountAsync(j => !j.IsDeleted), "total jobs"),
                ActiveJobs = await CountSafeAsync(() => _context.Jobs.CountAsync(j => j.IsActive && !j.IsDeleted), "active jobs"),
                TotalProjects = await CountSafeAsync(() => _context.Projects.CountAsync(p => !p.IsDeleted), "total projects"),
                TotalRevenue = await DecimalSafeAsync(() => _context.Transactions
                    .Where(t => t.Type == "Payment" && t.Status == "Completed" && !t.IsDeleted)
                    .Select(t => (decimal?)t.Amount)
                    .SumAsync(), "total revenue"),
                PendingApprovals = await CountSafeAsync(() => _context.Users.CountAsync(u => u.RegistrationStatus == "PendingApproval" && !u.IsDeleted), "pending approvals"),
                PendingReports = await CountSafeAsync(() => _context.Reports.CountAsync(r => r.Status == "Pending" && !r.IsDeleted), "pending reports"),
                PendingWithdrawals = await CountSafeAsync(() => _context.WithdrawalRequests.CountAsync(w => w.Status == "Pending" && !w.IsDeleted), "pending withdrawals"),
                PendingRefunds = await CountSafeAsync(() => _context.RefundRequests.CountAsync(r => r.Status == "Pending" && !r.IsDeleted), "pending refunds"),
                CheckedAt = DateTimeOffset.UtcNow
            };
        }

        private async Task<int> CountSafeAsync(Func<Task<int>> query, string label)
        {
            try
            {
                return await query();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin health check failed while reading {Label}", label);
                return 0;
            }
        }

        private async Task<decimal> DecimalSafeAsync(Func<Task<decimal?>> query, string label)
        {
            try
            {
                return await query() ?? 0m;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Admin health check failed while reading {Label}", label);
                return 0m;
            }
        }

        public async Task<AdminMonthlyAnalyticsDto> GetMonthlyAnalyticsAsync(int months)
        {
            months = Math.Clamp(months, 1, 24);
            var now = DateTimeOffset.UtcNow;
            var start = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero).AddMonths(-(months - 1));

            var users = await _context.Users
                .AsNoTracking()
                .Where(u => u.CreatedAt >= start && !u.IsDeleted)
                .Select(u => new { u.CreatedAt })
                .ToListAsync();

            var totalUsersBeforeStart = await _context.Users.CountAsync(u => u.CreatedAt < start && !u.IsDeleted);

            var jobs = await _context.Jobs
                .AsNoTracking()
                .Where(j => j.CreatedAt >= start)
                .Select(j => new { j.CreatedAt, j.IsActive, j.IsDeleted })
                .ToListAsync();

            var transactions = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.CreatedAt >= start && !t.IsDeleted && (t.Type == "Payment" || t.Type == "Refund"))
                .Select(t => new { t.CreatedAt, t.Type, t.Status, t.Amount })
                .ToListAsync();

            var userGrowth = new List<AdminUserGrowthPointDto>();
            var revenue = new List<AdminRevenuePointDto>();
            var jobPostings = new List<AdminJobPostingPointDto>();
            var runningUsers = totalUsersBeforeStart;

            for (var i = 0; i < months; i++)
            {
                var monthStart = start.AddMonths(i);
                var monthEnd = monthStart.AddMonths(1);
                var label = monthStart.ToString("MMM yyyy");

                var newUsers = users.Count(u => u.CreatedAt >= monthStart && u.CreatedAt < monthEnd);
                runningUsers += newUsers;
                userGrowth.Add(new AdminUserGrowthPointDto
                {
                    Name = label,
                    Users = runningUsers,
                    NewUsers = newUsers
                });

                var monthPayments = transactions
                    .Where(t => t.CreatedAt >= monthStart && t.CreatedAt < monthEnd && t.Type == "Payment" && t.Status == "Completed")
                    .Sum(t => t.Amount);
                var monthRefunds = transactions
                    .Where(t => t.CreatedAt >= monthStart && t.CreatedAt < monthEnd && t.Type == "Refund" && t.Status == "Completed")
                    .Sum(t => t.Amount);
                revenue.Add(new AdminRevenuePointDto
                {
                    Name = label,
                    Revenue = monthPayments,
                    Refunds = monthRefunds,
                    NetRevenue = monthPayments - monthRefunds
                });

                var monthJobs = jobs.Where(j => j.CreatedAt >= monthStart && j.CreatedAt < monthEnd).ToList();
                jobPostings.Add(new AdminJobPostingPointDto
                {
                    Name = label,
                    Jobs = monthJobs.Count,
                    Active = monthJobs.Count(j => j.IsActive && !j.IsDeleted),
                    Deleted = monthJobs.Count(j => j.IsDeleted)
                });
            }

            return new AdminMonthlyAnalyticsDto
            {
                UserGrowth = userGrowth,
                Revenue = revenue,
                JobPostings = jobPostings
            };
        }

        private async Task<Role> EnsureAdminRoleAsync(int currentAdminUserId)
        {
            var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Admin");
            if (adminRole != null)
            {
                if (adminRole.IsDeleted)
                {
                    adminRole.IsDeleted = false;
                    adminRole.UpdatedAt = DateTimeOffset.UtcNow;
                    adminRole.UpdatedBy = currentAdminUserId;
                }

                return adminRole;
            }

            adminRole = new Role
            {
                RoleName = "Admin",
                Description = "System Administrator",
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = currentAdminUserId,
                IsDeleted = false
            };
            _context.Roles.Add(adminRole);
            await _context.SaveChangesAsync();
            return adminRole;
        }

        private async Task<Role> EnsureRoleAsync(string roleName, int currentAdminUserId)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            if (role != null)
            {
                if (role.IsDeleted)
                {
                    role.IsDeleted = false;
                    role.UpdatedAt = DateTimeOffset.UtcNow;
                    role.UpdatedBy = currentAdminUserId;
                }

                return role;
            }

            role = new Role
            {
                RoleName = roleName,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = currentAdminUserId,
                IsDeleted = false
            };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return role;
        }

        private static string NormalizeRoleName(string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                throw new ArgumentException("Role name is required");

            var normalized = roleName.Trim();
            return normalized.ToLowerInvariant() switch
            {
                "admin" => "Admin",
                "superadmin" => "SuperAdmin",
                "moderator" => "Moderator",
                "support" => "Support",
                "finance" => "Finance",
                "contentmanager" => "ContentManager",
                "freelancer" => "Freelancer",
                "employer" => "Employer",
                "jobseeker" => "JobSeeker",
                "client" => "Client",
                _ => normalized
            };
        }

        private async Task ModerateUserAsync(int userId, bool shouldDelete, bool shouldRestore, int currentAdminUserId)
        {
            if (userId == currentAdminUserId && shouldDelete)
                throw new InvalidOperationException("Admins cannot moderate their own account this way");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new KeyNotFoundException("User not found");

            if (shouldDelete)
            {
                user.IsActive = false;
                await RevokeActiveRefreshTokensAsync(userId, "Suspended by moderation", currentAdminUserId);
            }

            if (shouldRestore)
                user.IsActive = true;

            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = currentAdminUserId;
        }

        private async Task ModerateJobAsync(int jobId, bool shouldDelete, bool shouldRestore, int currentAdminUserId)
        {
            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId);
            if (job == null) throw new KeyNotFoundException("Job not found");

            if (shouldDelete)
            {
                job.IsDeleted = true;
                job.IsActive = false;
            }

            if (shouldRestore)
            {
                job.IsDeleted = false;
                job.IsActive = true;
            }

            job.UpdatedAt = DateTimeOffset.UtcNow;
            job.UpdatedBy = currentAdminUserId;
        }

        private async Task ModeratePostAsync(int postId, bool shouldDelete, bool shouldRestore, int currentAdminUserId)
        {
            var post = await _context.CommunityPosts.FirstOrDefaultAsync(p => p.CommunityPostId == postId);
            if (post == null) throw new KeyNotFoundException("Post not found");

            if (shouldDelete) post.IsDeleted = true;
            if (shouldRestore) post.IsDeleted = false;

            post.UpdatedAt = DateTimeOffset.UtcNow;
            post.UpdatedBy = currentAdminUserId;
        }

        private async Task RevokeActiveRefreshTokensAsync(int userId, string reason, int currentAdminUserId)
        {
            var tokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTimeOffset.UtcNow)
                .ToListAsync();

            foreach (var token in tokens)
            {
                token.RevokedAt = DateTimeOffset.UtcNow;
                token.ReasonRevoked = reason;
                token.UpdatedAt = DateTimeOffset.UtcNow;
                token.UpdatedBy = currentAdminUserId;
            }
        }

        private async Task<AdminRoleResponseDto> BuildAdminRoleResponseAsync(int userId, string message)
        {
            var user = await _context.Users.FirstAsync(u => u.UserId == userId);
            var roles = await (from ur in _context.UserRoles
                               join r in _context.Roles on ur.RoleId equals r.RoleId
                               where ur.UserId == userId && !r.IsDeleted
                               select r.RoleName)
                .ToListAsync();

            return new AdminRoleResponseDto
            {
                Message = message,
                UserId = user.UserId,
                Email = user.Email,
                UserType = user.UserType,
                IsAdmin = roles.Contains("Admin"),
                Roles = roles
            };
        }
    }
}
