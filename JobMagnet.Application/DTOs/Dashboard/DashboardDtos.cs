using System.Collections.Generic;

namespace JobMagnet.Application.DTOs.Dashboard
{
    public class DashboardSummaryDto
    {
        public int UserId { get; set; }
        public string? DisplayName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? UserType { get; set; }
        public string RegistrationStatus { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();
        public bool ProfileCompleted { get; set; }
        public JobSeekerSummaryDto? JobSeekerSummary { get; set; }
        public EmployerSummaryDto? EmployerSummary { get; set; }
    }

    public class JobSeekerSummaryDto
    {
        public string? ProfessionalTitle { get; set; }
        public int? ExperienceYears { get; set; }
        public string? PreferredJobType { get; set; }
        public bool IsVerified { get; set; }
    }

    public class EmployerSummaryDto
    {
        public string? BusinessEmail { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsVerified { get; set; }
        public string? CompanyName { get; set; }
        public string? Industry { get; set; }
        public string? CompanySize { get; set; }
    }
    public class JobSeekerDashboardDto
    {
        public int AppliedJobsCount { get; set; }
        public int SavedJobsCount { get; set; }
        public int InterviewCount { get; set; }
        public List<object> RecentApplications { get; set; } = new();
    }

    public class FreelancerDashboardDto
    {
        public int ActiveProjectsCount { get; set; }
        public decimal TotalEarnings { get; set; }
        public double AverageRating { get; set; }
        public int PendingProposalsCount { get; set; }
        public decimal PendingPayments { get; set; }
    }

    public class CompanyDashboardDto
    {
        public int ActiveJobsCount { get; set; }
        public int TotalApplicantsCount { get; set; }
        public int NewApplicationsToday { get; set; }
        public int HiredCount { get; set; }
        public double AvgTimeToHireDays { get; set; }
    }

    public class CompanyAnalyticsDto
    {
        public MonthlyTrendsDto MonthlyTrends { get; set; } = new();
        public List<ApplicationSourceDto> ApplicationSources { get; set; } = new();
        public List<JobPerformanceDto> JobPerformance { get; set; } = new();
        public RecruitmentFunnelDto RecruitmentFunnel { get; set; } = new();
        public AnalyticsOverviewDto Overview { get; set; } = new();
    }

    public class MonthlyTrendsDto
    {
        public List<TrendItemDto> Applications { get; set; } = new();
        public List<TrendItemDto> Hires { get; set; } = new();
        public List<TrendItemDto> TimeToHire { get; set; } = new();
    }

    public class TrendItemDto
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Days { get; set; }
    }

    public class ApplicationSourceDto
    {
        public string Source { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class JobPerformanceDto
    {
        public string Title { get; set; } = string.Empty;
        public int Applications { get; set; }
        public int Shortlisted { get; set; }
        public int Hired { get; set; }
        public double CompletionRate { get; set; }
    }

    public class RecruitmentFunnelDto
    {
        public int Applications { get; set; }
        public int Screened { get; set; }
        public int Shortlisted { get; set; }
        public int Interviewed { get; set; }
        public int Offered { get; set; }
        public int Hired { get; set; }
    }

    public class AnalyticsOverviewDto
    {
        public int TotalJobsPosted { get; set; }
        public int ActiveJobs { get; set; }
        public int TotalApplications { get; set; }
        public int AvgApplicationsPerJob { get; set; }
        public int TotalHires { get; set; }
        public double HireRate { get; set; }
        public string AvgTimeToHire { get; set; } = string.Empty;
        public double ApplicationCompletionRate { get; set; }
    }

    public class ClientDashboardDto
    {
        public int ActiveProjectsCount { get; set; }
        public decimal TotalSpent { get; set; }
        public int HiredFreelancersCount { get; set; }
        public int OpenDisputesCount { get; set; }
    }
}
