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

    public class ClientDashboardDto
    {
        public int ActiveProjectsCount { get; set; }
        public decimal TotalSpent { get; set; }
        public int HiredFreelancersCount { get; set; }
        public int OpenDisputesCount { get; set; }
    }
}
