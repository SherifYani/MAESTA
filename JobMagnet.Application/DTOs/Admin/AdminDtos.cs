using System;
using System.Collections.Generic;

namespace JobMagnet.Application.DTOs.Admin
{
    public class AdminUserDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? UserType { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class ApprovalResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty;
    }

    public class AdminRoleResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? UserType { get; set; }
        public bool IsAdmin { get; set; }
        public IEnumerable<string> Roles { get; set; } = Array.Empty<string>();
    }

    public class AdminDashboardMetricsDto
    {
        public int TotalUsers { get; set; }
        public int TotalJobs { get; set; }
        public int TotalProjects { get; set; }
        public int PendingReportsCount { get; set; }
        public int OngoingInterviewsCount { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class SystemReportDto
    {
        public int ReportId { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public int ReportedByUserId { get; set; }
        public string ReporterName { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class AdminPagedResponse<T>
    {
        public IEnumerable<T> Items { get; set; } = Array.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
    }

    public class AdminUserListItemDto : AdminUserDto
    {
        public string? Phone { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsEmailVerified { get; set; }
        public DateTimeOffset? LastLoginAt { get; set; }
        public IEnumerable<string> Roles { get; set; } = Array.Empty<string>();
    }

    public class AdminRoleDto
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int UserCount { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class AdminLogDto
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserEmail { get; set; }
        public string? UserName { get; set; }
        public string? UserType { get; set; }
        public string Type { get; set; } = string.Empty;
        public string LevelOrAction { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Metadata { get; set; }
        public string? IpAddress { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class AdminPlatformSettingDto
    {
        public int SettingId { get; set; }
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
        public string? Category { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class UpsertPlatformSettingRequest
    {
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
        public string? Category { get; set; }
    }

    public class AdminFinanceSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal PendingWithdrawals { get; set; }
        public int PendingWithdrawalCount { get; set; }
        public int PendingRefundCount { get; set; }
        public int ActiveSubscriptions { get; set; }
    }

    public class AdminWithdrawalDto
    {
        public int WithdrawalRequestId { get; set; }
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset RequestedAt { get; set; }
        public DateTimeOffset? ProcessedAt { get; set; }
    }

    public class AdminRefundDto
    {
        public int RefundRequestId { get; set; }
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public int? TransactionId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset RequestedAt { get; set; }
    }

    public class AdminSubscriptionDto
    {
        public int SubscriptionId { get; set; }
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string PlanName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = string.Empty;
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public bool IsActive { get; set; }
        public bool AutoRenew { get; set; }
        public DateTimeOffset? RenewDate { get; set; }
    }

    public class AdminJobDto
    {
        public int JobId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public string? JobType { get; set; }
        public string? Location { get; set; }
        public decimal? MinSalary { get; set; }
        public decimal? MaxSalary { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public int ApplicationsCount { get; set; }
        public int ReportsCount { get; set; }
        public int PostedByUserId { get; set; }
        public string PostedByEmail { get; set; } = string.Empty;
    }

    public class UpdateAdminStatusRequest
    {
        public string Status { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    public class AdminModerationRequest
    {
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    public class AdminHealthDto
    {
        public string Api { get; set; } = "Operational";
        public string Database { get; set; } = "Unknown";
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalJobs { get; set; }
        public int ActiveJobs { get; set; }
        public int TotalProjects { get; set; }
        public decimal TotalRevenue { get; set; }
        public int PendingApprovals { get; set; }
        public int PendingReports { get; set; }
        public int PendingWithdrawals { get; set; }
        public int PendingRefunds { get; set; }
        public DateTimeOffset CheckedAt { get; set; }
    }

    public class AdminMonthlyAnalyticsDto
    {
        public IEnumerable<AdminUserGrowthPointDto> UserGrowth { get; set; } = Array.Empty<AdminUserGrowthPointDto>();
        public IEnumerable<AdminRevenuePointDto> Revenue { get; set; } = Array.Empty<AdminRevenuePointDto>();
        public IEnumerable<AdminJobPostingPointDto> JobPostings { get; set; } = Array.Empty<AdminJobPostingPointDto>();
    }

    public class AdminUserGrowthPointDto
    {
        public string Name { get; set; } = string.Empty;
        public int Users { get; set; }
        public int NewUsers { get; set; }
    }

    public class AdminRevenuePointDto
    {
        public string Name { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public decimal Refunds { get; set; }
        public decimal NetRevenue { get; set; }
    }

    public class AdminJobPostingPointDto
    {
        public string Name { get; set; } = string.Empty;
        public int Jobs { get; set; }
        public int Active { get; set; }
        public int Deleted { get; set; }
    }
}
