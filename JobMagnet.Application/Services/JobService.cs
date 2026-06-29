using JobMagnet.Application.DTOs.Job;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class JobService : IJobService
    {
        private readonly JobMagnetDbContext _context;
        private readonly IPlatformSettingsService _platformSettingsService;

        public JobService(JobMagnetDbContext context, IPlatformSettingsService platformSettingsService)
        {
            _context = context;
            _platformSettingsService = platformSettingsService;
        }

        // ─── Jobs ─────────────────────────────────────────────────────────────
        public async Task<PagedJobsResponse> GetJobsAsync(JobSearchRequest request)
        {
            var query = _context.Jobs.AsNoTracking().Where(j => !j.IsDeleted && j.IsActive);

            if (!string.IsNullOrWhiteSpace(request.Keyword))
                query = query.Where(j => j.Title.Contains(request.Keyword) || j.Description.Contains(request.Keyword));
            
            if (!string.IsNullOrWhiteSpace(request.Location))
                query = query.Where(j => j.Location != null && j.Location.Contains(request.Location));

            if (!string.IsNullOrWhiteSpace(request.JobType))
                query = query.Where(j => j.Type == request.JobType);

            if (!string.IsNullOrWhiteSpace(request.ExperienceLevel))
                // TODO: Replace with a dedicated ExperienceLevel field on the Job entity when DB migration is possible
                // Currently filtering by Description as a temporary workaround
                query = query.Where(j => j.Description.Contains(request.ExperienceLevel));

            if (request.SalaryMin.HasValue)
                query = query.Where(j => j.MaxSalary >= request.SalaryMin.Value);

            if (request.SalaryMax.HasValue)
                query = query.Where(j => j.MinSalary <= request.SalaryMax.Value);

            // Filter by skills if provided - search in job title and description for skill keywords
            if (request.Skills != null && request.Skills.Any())
            {
                foreach (var skill in request.Skills.Where(s => !string.IsNullOrWhiteSpace(s)))
                {
                    var skillTerm = skill.Trim().ToLower();
                    query = query.Where(j => (j.Title != null && j.Title.ToLower().Contains(skillTerm)) 
                                          || (j.Description != null && j.Description.ToLower().Contains(skillTerm)));
                }
            }

            // Filter by date range
            if (request.DateFrom.HasValue)
                query = query.Where(j => j.CreatedAt >= request.DateFrom.Value);
            
            if (request.DateTo.HasValue)
                query = query.Where(j => j.CreatedAt <= request.DateTo.Value);

            var total = await query.CountAsync();
            var totalPages = request.Limit > 0 ? (int)Math.Ceiling(total / (double)request.Limit) : 0;
            
            // Apply sorting
            IOrderedQueryable<Domain.Entities.Job> orderedQuery;
            switch (request.SortBy?.ToLower())
            {
                case "date":
                    orderedQuery = query.OrderByDescending(j => j.CreatedAt);
                    break;
                case "salary":
                    orderedQuery = query.OrderByDescending(j => j.MaxSalary);
                    break;
                case "title":
                    orderedQuery = query.OrderBy(j => j.Title);
                    break;
                default: // "relevance" or no sort - default by created date
                    orderedQuery = query.OrderByDescending(j => j.CreatedAt);
                    break;
            }

            var jobs = await orderedQuery
                .Skip((request.Page - 1) * request.Limit)
                .Take(request.Limit)
                .Select(j => MapJob(j, null, null, null))
                .ToListAsync();

            return new PagedJobsResponse
            {
                Jobs = jobs,
                Total = total,
                Page = request.Page,
                TotalPages = totalPages
            };
        }

        public async Task<JobDto> GetJobByIdAsync(int jobId)
        {
            var job = await _context.Jobs
                .AsNoTracking()
                .Include(j => j.User) // Assuming we include user since Employer might be different now
                .FirstOrDefaultAsync(j => j.JobId == jobId && !j.IsDeleted && j.IsActive);

            if (job == null) throw new KeyNotFoundException("Job not found");

            var company = await _context.Companies
                .Where(c => c.Employer != null && c.Employer.UserId == job.PostedByUserId)
                .Select(c => new { c.CompanyId, c.CompanyName })
                .FirstOrDefaultAsync();

            return MapJob(job, company?.CompanyName, company?.CompanyId, null);
        }

        public async Task<JobDto> CreateJobAsync(int employerUserId, CreateJobRequest request)
        {
            if (!await _platformSettingsService.GetBoolAsync("allowJobPosting", true))
                throw new InvalidOperationException("Job posting is currently disabled.");

            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var job = new Domain.Entities.Job
            {
                PostedByUserId = employer.UserId, // Using the UserId as PostedByUserId
                Title = request.Title,
                Description = request.Description,
                Location = request.Location,
                Type = request.JobType, // Assuming request has JobType and entity has Type
                MinSalary = request.SalaryMin,
                MaxSalary = request.SalaryMax,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            // Handle Categories & Tags mapping if needed (Implementation depends on Many-to-Many setup)
            // For now, we return the basic job DTO

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId);
            return MapJob(job, company?.CompanyName, company?.CompanyId, null);
        }

        public async Task<JobDto> UpdateJobAsync(int employerUserId, int jobId, CreateJobRequest request)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId && j.PostedByUserId == employer.UserId && !j.IsDeleted);
            if (job == null) throw new KeyNotFoundException("Job not found or unauthorized");

            job.Title = request.Title;
            job.Description = request.Description;
            job.Location = request.Location;
            job.Type = request.JobType;
            job.MinSalary = request.SalaryMin;
            job.MaxSalary = request.SalaryMax;
            job.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId);
            return MapJob(job, company?.CompanyName, company?.CompanyId, null);
        }

        public async Task DeleteJobAsync(int employerId, int jobId)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId && j.PostedByUserId == employer.UserId && !j.IsDeleted);
            if (job == null) throw new KeyNotFoundException("Job not found or unauthorized");

            job.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<JobDto>> GetMyPostingsAsync(int employerUserId)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId);

            // Materialize before expression tree — ?. is not valid inside EF Core IQueryable.Select
            var companyName = company?.CompanyName;
            var companyId = company?.CompanyId;

            return await _context.Jobs
                .AsNoTracking()
                .Where(j => j.PostedByUserId == employer.UserId && !j.IsDeleted)
                .Select(j => MapJob(j, companyName, companyId, null))
                .ToListAsync();
        }

        public async Task ToggleJobStatusAsync(int employerUserId, int jobId, bool isPublished)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId && j.PostedByUserId == employer.UserId && !j.IsDeleted);
            if (job == null) throw new KeyNotFoundException("Job not found or unauthorized");

            job.IsActive = isPublished; // Using IsActive as IsPublished
            job.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        // ─── Applications ─────────────────────────────────────────────────────
        public async Task<JobApplicationDto> ApplyAsync(int userId, int jobId, ApplyToJobRequest request)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new UnauthorizedAccessException("Only jobseekers can apply");

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId && !j.IsDeleted && j.IsActive);
            if (job == null) throw new KeyNotFoundException("Job not found or not published");

            // Prevent duplicate applications
            var existingApp = await _context.JobApplications
                .FirstOrDefaultAsync(a => a.JobId == jobId && a.JobSeekerId == jobSeeker.JobSeekerId && !a.IsDeleted);
            if (existingApp != null) throw new InvalidOperationException("Already applied to this job");

            var app = new Domain.Entities.JobApplication
            {
                JobId = jobId,
                JobSeekerId = jobSeeker.JobSeekerId,
                CoverLetter = request.CoverLetter,
                ResumeUrl = request.CVUrl ?? jobSeeker.CVUrl,
                Status = "pending",
                AppliedAt = DateTimeOffset.UtcNow
            };

            _context.JobApplications.Add(app);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            return MapApplication(app, job.Title, $"{user?.FirstName} {user?.LastName}");
        }

        public async Task<IEnumerable<JobApplicationDto>> GetMyApplicationsAsync(int userId)
        {
            return await _context.JobApplications
                .AsNoTracking()
                .Include(a => a.Job)
                .Include(a => a.JobSeeker)
                .Where(a => a.JobSeekerId == userId && !a.IsDeleted)
                .Select(a => MapApplication(a, a.Job != null ? a.Job.Title : "", a.JobSeeker != null && a.JobSeeker.User != null ? $"{a.JobSeeker.User.FirstName} {a.JobSeeker.User.LastName}".Trim() : ""))
                .ToListAsync();
        }

        public async Task<IEnumerable<JobApplicationDto>> GetJobApplicationsAsync(int employerUserId, int jobId)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var job = await _context.Jobs.FirstOrDefaultAsync(j => j.JobId == jobId && j.PostedByUserId == employer.UserId && !j.IsDeleted);
            if (job == null) throw new KeyNotFoundException("Job not found or unauthorized");

            return await _context.JobApplications
                .AsNoTracking()
                .Include(a => a.JobSeeker)
                .ThenInclude(js => js!.User)
                .Where(a => a.JobId == jobId && !a.IsDeleted)
                .Select(a => MapApplication(a, job.Title, a.JobSeeker != null && a.JobSeeker.User != null ? $"{a.JobSeeker.User.FirstName} {a.JobSeeker.User.LastName}".Trim() : ""))
                .ToListAsync();
        }

        public async Task<IEnumerable<JobApplicationDto>> GetCompanyApplicationsAsync(int employerUserId)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            return await _context.JobApplications
                .AsNoTracking()
                .Include(a => a.Job)
                .Include(a => a.JobSeeker)
                .ThenInclude(js => js!.User)
                .Where(a => a.Job != null && a.Job.PostedByUserId == employerUserId && !a.IsDeleted)
                .Select(a => MapApplication(a, a.Job!.Title, a.JobSeeker != null && a.JobSeeker.User != null ? $"{a.JobSeeker.User.FirstName} {a.JobSeeker.User.LastName}".Trim() : ""))
                .ToListAsync();
        }

        public async Task UpdateApplicationStatusAsync(int employerUserId, int applicationId, string status)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var app = await _context.JobApplications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.JobApplicationId == applicationId && !a.IsDeleted);
            
            if (app == null || app.Job?.PostedByUserId != employer.UserId)
                throw new KeyNotFoundException("Application not found or unauthorized");

            app.Status = status;
            app.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task WithdrawApplicationAsync(int userId, int applicationId)
        {
            var app = await _context.JobApplications
                .FirstOrDefaultAsync(a => a.JobApplicationId == applicationId && a.JobSeekerId == userId && !a.IsDeleted);
            
            if (app == null) throw new KeyNotFoundException("Application not found or unauthorized");

            app.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        // ─── Saved Jobs ───────────────────────────────────────────────────────
        public async Task SaveJobAsync(int userId, int jobId)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null || job.IsDeleted) throw new KeyNotFoundException("Job not found");

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.IsDeleted) throw new UnauthorizedAccessException("Invalid user");

            var existing = await _context.SavedJobs.FirstOrDefaultAsync(s => s.UserId == userId && s.JobId == jobId);
            if (existing != null) return; // already saved

            _context.SavedJobs.Add(new Domain.Entities.SavedJob
            {
                UserId = userId,
                JobId = jobId,
                CreatedAt = DateTimeOffset.UtcNow
            });
            await _context.SaveChangesAsync();
        }

        public async Task UnsaveJobAsync(int userId, int jobId)
        {
            var existing = await _context.SavedJobs.FirstOrDefaultAsync(s => s.UserId == userId && s.JobId == jobId);
            if (existing == null) throw new KeyNotFoundException("Saved job not found");

            _context.SavedJobs.Remove(existing);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<JobDto>> GetSavedJobsAsync(int userId)
        {
            var savedJobs = await _context.SavedJobs
                .AsNoTracking()
                .Include(s => s.Job)
                .Where(s => s.UserId == userId && s.Job != null && !s.Job.IsDeleted)
                .ToListAsync();

            var userIds = savedJobs.Select(s => s.Job!.PostedByUserId).Distinct().ToList();

            var companies = await _context.Companies
                .Include(c => c.Employer)
                .Where(c => c.Employer != null && userIds.Contains(c.Employer.UserId))
                .ToDictionaryAsync(c => c.Employer!.UserId, c => new { c.CompanyId, c.CompanyName });

            return savedJobs.Select(s => {
                var co = companies.GetValueOrDefault(s.Job!.PostedByUserId);
                return MapJob(s.Job!, co?.CompanyName, co?.CompanyId, null);
            }).ToList();
        }

        public async Task<IEnumerable<JobDto>> GetRecommendedJobsAsync(int userId)
        {
            var userSkills = await _context.UserSkills
                .Include(us => us.Skill)
                .Where(us => us.UserId == userId)
                .Select(us => us.Skill!.Name.ToLower())
                .ToListAsync();

            if (!userSkills.Any()) return await GetJobsAsync(new JobSearchRequest { Limit = 5 }).ContinueWith(t => t.Result.Jobs);

            var jobs = await _context.Jobs
                .AsNoTracking()
                .Where(j => !j.IsDeleted && j.IsActive)
                .ToListAsync();

            var recommendations = jobs
                .Select(j => {
                    var title = j.Title?.ToLower() ?? "";
                    var desc = j.Description?.ToLower() ?? "";
                    var matchCount = userSkills.Where(s => !string.IsNullOrEmpty(s)).Count(s => title.Contains(s) || desc.Contains(s));
                    var validSkillsCount = userSkills.Count(s => !string.IsNullOrEmpty(s));
                    var score = validSkillsCount > 0 ? (double)matchCount / validSkillsCount * 100 : 0;
                    return new { Job = j, Score = score };
                })
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .Take(10)
                .Select(x => MapJob(x.Job, null, null, x.Score))
                .ToList();

            return recommendations;
        }

        // ─── Private Mappers ──────────────────────────────────────────────────
        private static JobDto MapJob(Domain.Entities.Job job, string? companyName, int? companyId, double? matchScore) => new()
        {
            JobId = job.JobId,
            Title = job.Title,
            Description = job.Description,
            Location = job.Location,
            JobType = job.Type,
            SalaryMin = job.MinSalary,
            SalaryMax = job.MaxSalary,
            Currency = "USD",
            IsPublished = job.IsActive,
            EmployerId = job.PostedByUserId,
            CompanyId = companyId,
            CompanyName = companyName,
            CreatedAt = job.CreatedAt,
            UpdatedAt = job.UpdatedAt,
            MatchScore = matchScore
        };

        private static JobApplicationDto MapApplication(Domain.Entities.JobApplication app, string jobTitle, string applicantName) => new()
        {
            ApplicationId = app.JobApplicationId,
            JobId = app.JobId,
            JobTitle = jobTitle,
            ApplicantId = app.JobSeekerId,
            ApplicantName = applicantName,
            CoverLetter = app.CoverLetter,
            CVUrl = app.ResumeUrl,
            Status = app.Status,
            AppliedAt = app.AppliedAt,
            MatchScore = app.MatchScore
        };
    }
}
