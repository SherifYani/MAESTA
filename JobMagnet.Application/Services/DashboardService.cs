using JobMagnet.Application.DTOs.Dashboard;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobMagnet.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly JobMagnetDbContext _context;

        public DashboardService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetUserDashboardSummaryAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);

            if (user == null)
                throw new KeyNotFoundException("User not found");

            var roles = await (from ur in _context.UserRoles
                               join r in _context.Roles on ur.RoleId equals r.RoleId
                               where ur.UserId == user.UserId
                               select r.RoleName)
                .ToListAsync();

            var jobSeeker = await _context.JobSeekers
                .AsNoTracking()
                .FirstOrDefaultAsync(js => js.UserId == user.UserId && !js.IsDeleted);

            var employer = await _context.Employers
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == user.UserId && !e.IsDeleted);

            Domain.Entities.Company? company = null;
            if (employer != null)
            {
                company = await _context.Companies
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId && !c.IsDeleted);
            }

            var profileCompleted = user.UserType switch
            {
                "JobSeeker" => jobSeeker != null,
                "Employer" => employer != null && company != null,
                _ => true
            };

            return new DashboardSummaryDto
            {
                UserId = user.UserId,
                DisplayName = $"{user.FirstName} {user.LastName}".Trim(),
                Email = user.Email,
                UserType = user.UserType,
                RegistrationStatus = user.RegistrationStatus,
                Roles = roles,
                ProfileCompleted = profileCompleted,
                JobSeekerSummary = jobSeeker == null ? null : new JobSeekerSummaryDto
                {
                    ProfessionalTitle = jobSeeker.ProfessionalTitle,
                    ExperienceYears = jobSeeker.ExperienceYears,
                    PreferredJobType = jobSeeker.PreferredJobType,
                    IsVerified = jobSeeker.IsVerified
                },
                EmployerSummary = employer == null ? null : new EmployerSummaryDto
                {
                    BusinessEmail = employer.BusinessEmail,
                    ContactPerson = employer.ContactPerson,
                    ContactPhone = employer.ContactPhone,
                    IsVerified = employer.IsVerified,
                    CompanyName = company?.CompanyName,
                    Industry = company?.Industry,
                    CompanySize = company?.CompanySize
                }
            };
        }
        public async Task<JobSeekerDashboardDto> GetJobSeekerDashboardAsync(int userId)
        {
            var jobSeekerId = await _context.JobSeekers
                .Where(js => js.UserId == userId)
                .Select(js => js.JobSeekerId)
                .FirstOrDefaultAsync();

            return new JobSeekerDashboardDto
            {
                AppliedJobsCount = await _context.JobApplications.CountAsync(a => a.JobSeekerId == jobSeekerId && !a.IsDeleted),
                SavedJobsCount = await _context.SavedJobs.CountAsync(s => s.UserId == userId),
                InterviewCount = await _context.Interviews.CountAsync(i => i.JobSeekerId == jobSeekerId && i.ScheduledAt >= DateTimeOffset.UtcNow),
                RecentApplications = await _context.JobApplications
                    .Where(a => a.JobSeekerId == jobSeekerId)
                    .OrderByDescending(a => a.AppliedAt)
                    .Take(5)
                    .Select(a => (object)new { a.JobId, a.Status, a.AppliedAt })
                    .ToListAsync()
            };
        }

        public async Task<FreelancerDashboardDto> GetFreelancerDashboardAsync(int userId)
        {
            var projectsCount = await _context.Contracts.CountAsync(c => c.FreelancerUserId == userId && c.SignedDate != null && !c.IsDeleted);
            var totalEarnings = await _context.Transactions
                .Where(t => t.UserId == userId && t.Type == "Deposit" && t.Status == "Completed")
                .SumAsync(t => (decimal?)t.Amount) ?? 0;
            
            var reviews = await _context.Reviews.Where(r => r.TargetUserId == userId).Select(r => (double)r.RatingValue).ToListAsync();
            var avgRating = reviews.Any() ? reviews.Average() : 0;

            return new FreelancerDashboardDto
            {
                ActiveProjectsCount = projectsCount,
                TotalEarnings = totalEarnings,
                AverageRating = avgRating,
                PendingProposalsCount = await _context.Proposals.CountAsync(p => p.FreelancerUserId == userId && p.Status == "Pending"),
                PendingPayments = await _context.EscrowTransactions
                    .Where(e => e.FreelancerUserId == userId && e.Status == "Held")
                    .SumAsync(e => (decimal?)e.Amount) ?? 0
            };
        }

        public async Task<CompanyDashboardDto> GetCompanyDashboardAsync(int userId)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
            var companyId = await _context.Companies
                .Where(c => c.EmployerId == (employer != null ? employer.EmployerId : 0))
                .Select(c => c.CompanyId)
                .FirstOrDefaultAsync();

            return new CompanyDashboardDto
            {
                ActiveJobsCount = await _context.Jobs.CountAsync(j => j.PostedByUserId == userId && j.IsActive && !j.IsDeleted),
                TotalApplicantsCount = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId),
                NewApplicationsToday = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId && a.AppliedAt >= DateTimeOffset.UtcNow.Date),
                HiredCount = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId && a.Status == "Accepted"),
                AvgTimeToHireDays = 14.5 // Simulated metric
            };
        }

        public async Task<CompanyAnalyticsDto> GetCompanyAnalyticsAsync(int userId, string? period = null)
        {
            var now = DateTimeOffset.UtcNow;
            DateTimeOffset startDate;
            switch (period?.ToLower())
            {
                case "weekly":
                    startDate = now.AddDays(-7);
                    break;
                case "monthly":
                    startDate = now.AddMonths(-1);
                    break;
                case "quarterly":
                    startDate = now.AddMonths(-3);
                    break;
                case "yearly":
                    startDate = now.AddYears(-1);
                    break;
                default:
                    startDate = now.AddMonths(-6);
                    break;
            }

            // 1. Monthly Trends
            var applicationsTrend = await _context.JobApplications
                .Where(a => a.Job != null && a.Job.PostedByUserId == userId && a.AppliedAt >= startDate)
                .GroupBy(a => new { a.AppliedAt.Year, a.AppliedAt.Month })
                .Select(g => new TrendItemDto
                {
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    Count = g.Count()
                })
                .ToListAsync();

            var hiresTrend = await _context.JobApplications
                .Where(a => a.Job != null && a.Job.PostedByUserId == userId && a.Status == "Accepted" && a.UpdatedAt >= startDate)
                .GroupBy(a => new { Year = a.UpdatedAt!.Value.Year, Month = a.UpdatedAt.Value.Month })
                .Select(g => new TrendItemDto
                {
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                    Count = g.Count()
                })
                .ToListAsync();

            // 2. Job Performance
            var jobPerformance = await _context.Jobs
                .Where(j => j.PostedByUserId == userId && !j.IsDeleted)
                .Select(j => new JobPerformanceDto
                {
                    Title = j.Title,
                    Applications = _context.JobApplications.Count(a => a.JobId == j.JobId),
                    Shortlisted = _context.JobApplications.Count(a => a.JobId == j.JobId && a.Status == "Shortlisted"),
                    Hired = _context.JobApplications.Count(a => a.JobId == j.JobId && a.Status == "Accepted"),
                    CompletionRate = 85.0 // Simulated completion rate
                })
                .OrderByDescending(jp => jp.Applications)
                .Take(10)
                .ToListAsync();

            // 3. Recruitment Funnel
            var funnel = new RecruitmentFunnelDto
            {
                Applications = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId),
                Screened = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId && a.Status != "Pending"),
                Shortlisted = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId && a.Status == "Shortlisted"),
                Interviewed = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId && a.Status == "Interviewed"),
                Hired = await _context.JobApplications.CountAsync(a => a.Job != null && a.Job.PostedByUserId == userId && a.Status == "Accepted")
            };

            // 4. Overview Stats
            var totalJobs = await _context.Jobs.CountAsync(j => j.PostedByUserId == userId && !j.IsDeleted);
            var activeJobs = await _context.Jobs.CountAsync(j => j.PostedByUserId == userId && j.IsActive && !j.IsDeleted);
            var totalApps = funnel.Applications;
            var totalHires = funnel.Hired;

            return new CompanyAnalyticsDto
            {
                MonthlyTrends = new MonthlyTrendsDto
                {
                    Applications = applicationsTrend,
                    Hires = hiresTrend,
                    TimeToHire = new List<TrendItemDto> { new TrendItemDto { Month = "Current", Days = 14.5 } }
                },
                ApplicationSources = new List<ApplicationSourceDto>
                {
                    new ApplicationSourceDto { Source = "Direct", Count = totalApps, Percentage = 100 }
                },
                JobPerformance = jobPerformance,
                RecruitmentFunnel = funnel,
                Overview = new AnalyticsOverviewDto
                {
                    TotalJobsPosted = totalJobs,
                    ActiveJobs = activeJobs,
                    TotalApplications = totalApps,
                    AvgApplicationsPerJob = totalJobs > 0 ? totalApps / totalJobs : 0,
                    TotalHires = totalHires,
                    HireRate = totalApps > 0 ? Math.Round((double)totalHires / totalApps * 100, 1) : 0,
                    AvgTimeToHire = "14.5 days",
                    ApplicationCompletionRate = 85.0
                }
            };
        }

        public async Task<ClientDashboardDto> GetClientDashboardAsync(int userId)
        {
            return new ClientDashboardDto
            {
                ActiveProjectsCount = await _context.Projects.CountAsync(p => p.OwnerUserId == userId && p.Status == "Active"),
                TotalSpent = await _context.Transactions
                    .Where(t => t.UserId == userId && (t.Type == "Payment" || t.Type == "Withdrawal") && t.Status == "Completed")
                    .SumAsync(t => (decimal?)Math.Abs(t.Amount)) ?? 0,
                HiredFreelancersCount = await _context.Contracts.CountAsync(c => c.ClientUserId == userId),
                OpenDisputesCount = await _context.Disputes.CountAsync(d => d.Project != null && d.Project.OwnerUserId == userId && d.Status == "Open")
            };
        }
    }
}
