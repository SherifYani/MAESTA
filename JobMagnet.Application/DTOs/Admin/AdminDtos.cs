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
        public int ActiveJobs { get; set; }
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int TotalProjects { get; set; }
        public int PendingReportsCount { get; set; }
        public int OngoingInterviewsCount { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class AdminJobDto
    {
        public int JobId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? JobType { get; set; }
        public decimal? SalaryMin { get; set; }
        public decimal? SalaryMax { get; set; }
        public bool IsPublished { get; set; }
        public int PostedByUserId { get; set; }
        public string PostedByName { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
        public int ApplicationsCount { get; set; }
        public int ReportsCount { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
    }

    public class AdminApplicationDto
    {
        public int ApplicationId { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public int JobSeekerId { get; set; }
        public string ApplicantName { get; set; } = string.Empty;
        public string? CoverLetter { get; set; }
        public string? CVUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset AppliedAt { get; set; }
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
