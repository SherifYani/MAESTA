using JobMagnet.Application.DTOs.JobSeeker;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class JobSeekerService : IJobSeekerService
    {
        private readonly JobMagnetDbContext _context;

        public JobSeekerService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<JobSeekerDto> GetMyProfileAsync(int userId)
            => await GetByIdHelperAsync(userId);

        public async Task<JobSeekerDto> GetByUserIdAsync(int userId)
            => await GetByIdHelperAsync(userId);

        public async Task<JobSeekerDto> UpdateProfileAsync(int userId, UpdateJobSeekerRequest request)
        {
            var jobSeeker = await _context.JobSeekers
                .FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker profile not found");

            if (request.ProfessionalTitle != null) jobSeeker.ProfessionalTitle = request.ProfessionalTitle;
            if (request.ExperienceYears.HasValue) jobSeeker.ExperienceYears = request.ExperienceYears.Value;
            if (request.Bio != null) jobSeeker.Bio = request.Bio;
            if (request.CVUrl != null) jobSeeker.CVUrl = request.CVUrl;
            if (request.PreferredJobType != null) jobSeeker.PreferredJobType = request.PreferredJobType;

            jobSeeker.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return await GetByIdHelperAsync(userId);
        }

        private async Task<JobSeekerDto> GetByIdHelperAsync(int userId)
        {
             var js = await _context.JobSeekers
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);

            if (js == null) throw new KeyNotFoundException("JobSeeker profile not found");

            return new JobSeekerDto
            {
                JobSeekerId = js.JobSeekerId,
                UserId = js.UserId,
                ProfessionalTitle = js.ProfessionalTitle,
                ExperienceYears = js.ExperienceYears,
                Bio = js.Bio,
                CVUrl = js.CVUrl,
                PreferredJobType = js.PreferredJobType,
                IsVerified = js.IsVerified,
                LastActiveAt = js.LastActiveAt,
                CreatedAt = js.CreatedAt,
                UpdatedAt = js.UpdatedAt
            };
        }

        // ─── Work Experience ──────────────────────────────────────────────────
        public async Task<WorkExperienceDto> AddWorkExperienceAsync(int userId, AddWorkExperienceRequest request)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            var exp = new Domain.Entities.UserWorkExperience
            {
                UserId = jobSeeker.UserId,
                JobTitle = request.JobTitle,
                Company = request.Company,
                StartDate = new DateTimeOffset(request.StartDate.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero),
                EndDate = request.EndDate.HasValue ? new DateTimeOffset(request.EndDate.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero) : null,
                Description = request.Description
            };

            _context.UserWorkExperiences.Add(exp);
            await _context.SaveChangesAsync();

            return MapWorkExperience(exp);
        }

        public async Task<WorkExperienceDto> UpdateWorkExperienceAsync(int userId, int experienceId, AddWorkExperienceRequest request)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            var exp = await _context.UserWorkExperiences.FirstOrDefaultAsync(e => e.WorkExperienceId == experienceId && e.UserId == jobSeeker.UserId);
            if (exp == null) throw new KeyNotFoundException("Work experience not found");

            exp.JobTitle = request.JobTitle;
            exp.Company = request.Company;
            exp.StartDate = new DateTimeOffset(request.StartDate.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            exp.EndDate = request.EndDate.HasValue ? new DateTimeOffset(request.EndDate.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero) : null;
            exp.Description = request.Description;

            await _context.SaveChangesAsync();
            return MapWorkExperience(exp);
        }

        public async Task DeleteWorkExperienceAsync(int userId, int experienceId)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            var exp = await _context.UserWorkExperiences.FirstOrDefaultAsync(e => e.WorkExperienceId == experienceId && e.UserId == jobSeeker.UserId);
            if (exp == null) throw new KeyNotFoundException("Work experience not found");

            _context.UserWorkExperiences.Remove(exp);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<WorkExperienceDto>> GetWorkExperiencesAsync(int userId)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            return await _context.UserWorkExperiences
                .AsNoTracking()
                .Where(e => e.UserId == jobSeeker.UserId)
                .Select(e => MapWorkExperience(e))
                .ToListAsync();
        }

        private static WorkExperienceDto MapWorkExperience(Domain.Entities.UserWorkExperience exp) => new()
        {
            WorkExperienceId = exp.WorkExperienceId,
            JobTitle = exp.JobTitle,
            Company = exp.Company,
            StartDate = exp.StartDate.HasValue ? DateOnly.FromDateTime(exp.StartDate.Value.DateTime) : DateOnly.MinValue,
            EndDate = exp.EndDate.HasValue ? DateOnly.FromDateTime(exp.EndDate.Value.DateTime) : null,
            IsCurrent = !exp.EndDate.HasValue,
            Description = exp.Description
        };

        // ─── Education ────────────────────────────────────────────────────────
        public async Task<EducationDto> AddEducationAsync(int userId, AddEducationRequest request)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            var edu = new Domain.Entities.UserEducation
            {
                UserId = jobSeeker.UserId,
                Degree = request.Degree,
                Institution = request.Institution,
                FieldOfStudy = request.FieldOfStudy,
                StartDate = request.StartYear.HasValue ? new DateTimeOffset(new DateTime(request.StartYear.Value, 1, 1), TimeSpan.Zero) : null,
                EndDate = request.EndYear.HasValue ? new DateTimeOffset(new DateTime(request.EndYear.Value, 1, 1), TimeSpan.Zero) : null
            };

            _context.UserEducations.Add(edu);
            await _context.SaveChangesAsync();
            return MapEducation(edu);
        }

        public async Task<EducationDto> UpdateEducationAsync(int userId, int educationId, AddEducationRequest request)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            var edu = await _context.UserEducations.FirstOrDefaultAsync(e => e.EducationId == educationId && e.UserId == jobSeeker.UserId);
            if (edu == null) throw new KeyNotFoundException("Education not found");

            edu.Degree = request.Degree;
            edu.Institution = request.Institution;
            edu.FieldOfStudy = request.FieldOfStudy;
            edu.StartDate = request.StartYear.HasValue ? new DateTimeOffset(new DateTime(request.StartYear.Value, 1, 1), TimeSpan.Zero) : null;
            edu.EndDate = request.EndYear.HasValue ? new DateTimeOffset(new DateTime(request.EndYear.Value, 1, 1), TimeSpan.Zero) : null;

            await _context.SaveChangesAsync();
            return MapEducation(edu);
        }

        public async Task DeleteEducationAsync(int userId, int educationId)
        {
             var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            var edu = await _context.UserEducations.FirstOrDefaultAsync(e => e.EducationId == educationId && e.UserId == jobSeeker.UserId);
            if (edu == null) throw new KeyNotFoundException("Education not found");

            _context.UserEducations.Remove(edu);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<EducationDto>> GetEducationsAsync(int userId)
        {
             var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            return await _context.UserEducations
                .AsNoTracking()
                .Where(e => e.UserId == jobSeeker.UserId)
                .Select(e => MapEducation(e))
                .ToListAsync();
        }

        private static EducationDto MapEducation(Domain.Entities.UserEducation edu) => new()
        {
            EducationId = edu.EducationId,
            Degree = edu.Degree,
            Institution = edu.Institution,
            FieldOfStudy = edu.FieldOfStudy,
            StartYear = edu.StartDate?.Year,
            EndYear = edu.EndDate?.Year,
            IsCurrent = !edu.EndDate.HasValue
        };

        // ─── Skills ───────────────────────────────────────────────────────────
        public async Task UpdateSkillsAsync(int userId, UpdateSkillsRequest request)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            var existingUserSkills = await _context.UserSkills.Where(s => s.UserId == jobSeeker.UserId).ToListAsync();
            var existingSkillIds = existingUserSkills.Select(s => s.SkillId).ToHashSet();

            var requestedSkillIds = new HashSet<int>();

            if (request.Skills != null && request.Skills.Any())
            {
                var uniqueRequestedSkills = request.Skills
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim())
                    .Distinct(StringComparer.OrdinalIgnoreCase);

                foreach (var skillName in uniqueRequestedSkills)
                {
                    var skill = await _context.Skills.FirstOrDefaultAsync(s => s.Name.ToLower() == skillName.ToLower());
                    if (skill == null)
                    {
                        skill = new Domain.Entities.Skill
                        {
                            Name = skillName,
                            CreatedAt = DateTimeOffset.UtcNow,
                            IsDeleted = false
                        };
                        _context.Skills.Add(skill);
                        await _context.SaveChangesAsync(); // Save to generate SkillId
                    }
                    else if (skill.IsDeleted)
                    {
                        skill.IsDeleted = false;
                        skill.UpdatedAt = DateTimeOffset.UtcNow;
                        _context.Skills.Update(skill);
                        await _context.SaveChangesAsync();
                    }
                    requestedSkillIds.Add(skill.SkillId);
                }
            }

            // Remove skills that are no longer requested
            var skillsToRemove = existingUserSkills.Where(s => !requestedSkillIds.Contains(s.SkillId)).ToList();
            if (skillsToRemove.Any())
            {
                _context.UserSkills.RemoveRange(skillsToRemove);
            }

            // Add new skills
            var newSkills = new List<Domain.Entities.UserSkill>();
            foreach (var skillId in requestedSkillIds)
            {
                if (!existingSkillIds.Contains(skillId))
                {
                    newSkills.Add(new Domain.Entities.UserSkill
                    {
                        UserId = jobSeeker.UserId,
                        SkillId = skillId,
                        CreatedAt = DateTimeOffset.UtcNow
                    });
                }
            }

            if (newSkills.Any())
            {
                await _context.UserSkills.AddRangeAsync(newSkills);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<string>> GetSkillsAsync(int userId)
        {
            var jobSeeker = await _context.JobSeekers.FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);
            if (jobSeeker == null) throw new KeyNotFoundException("JobSeeker not found");

            return await _context.UserSkills
                .AsNoTracking()
                .Include(s => s.Skill)
                .Where(s => s.UserId == jobSeeker.UserId && s.Skill != null)
                .Select(s => s.Skill!.Name)
                .ToListAsync();
        }

        // ─── Portfolio ────────────────────────────────────────────────────────
        public async Task<PortfolioDto> AddPortfolioItemAsync(int userId, AddPortfolioItemRequest request)
        {
            var freelancer = await _context.Freelancers.FirstOrDefaultAsync(f => f.UserId == userId && !f.IsDeleted);
            if (freelancer == null) throw new KeyNotFoundException("Freelancer profile not found for portfolio");

            var item = new Domain.Entities.FreelancerPortfolio
            {
                FreelancerId = freelancer.FreelancerId,
                ProjectTitle = request.Title,
                Description = request.Description,
                ProjectUrl = request.ProjectUrl,
                ImageUrlsJson = request.ThumbnailUrl, // Simple mapping for now
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.FreelancerPortfolios.Add(item);
            await _context.SaveChangesAsync();
            return MapPortfolio(item);
        }

        public async Task<PortfolioDto> UpdatePortfolioItemAsync(int userId, int portfolioId, AddPortfolioItemRequest request)
        {
            var item = await _context.FreelancerPortfolios
                .Include(p => p.Freelancer)
                .FirstOrDefaultAsync(p => p.PortfolioId == portfolioId && p.Freelancer != null && p.Freelancer.UserId == userId && !p.IsDeleted);

            if (item == null) throw new KeyNotFoundException("Portfolio item not found");

            item.ProjectTitle = request.Title;
            item.Description = request.Description;
            item.ProjectUrl = request.ProjectUrl;
            item.ImageUrlsJson = request.ThumbnailUrl;
            item.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return MapPortfolio(item);
        }

        public async Task DeletePortfolioItemAsync(int userId, int portfolioId)
        {
            var item = await _context.FreelancerPortfolios
                .Include(p => p.Freelancer)
                .FirstOrDefaultAsync(p => p.PortfolioId == portfolioId && p.Freelancer != null && p.Freelancer.UserId == userId && !p.IsDeleted);

            if (item == null) throw new KeyNotFoundException("Portfolio item not found");

            item.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<PortfolioDto>> GetPortfolioAsync(int userId)
        {
            var freelancer = await _context.Freelancers.FirstOrDefaultAsync(f => f.UserId == userId && !f.IsDeleted);
            if (freelancer == null) return Enumerable.Empty<PortfolioDto>();

            return await _context.FreelancerPortfolios
                .AsNoTracking()
                .Where(p => p.FreelancerId == freelancer.FreelancerId && !p.IsDeleted)
                .Select(p => MapPortfolio(p))
                .ToListAsync();
        }

        private static PortfolioDto MapPortfolio(Domain.Entities.FreelancerPortfolio p) => new()
        {
            PortfolioId = p.PortfolioId,
            Title = p.ProjectTitle,
            Description = p.Description,
            ProjectUrl = p.ProjectUrl,
            ThumbnailUrl = p.ImageUrlsJson // Using ImageUrlsJson as Thumbnail for now
        };
    }
}
