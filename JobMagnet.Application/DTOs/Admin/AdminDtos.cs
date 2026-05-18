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
}
