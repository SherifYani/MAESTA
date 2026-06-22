using JobMagnet.Application.DTOs.Company;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace JobMagnet.Application.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly JobMagnetDbContext _context;

        public CompanyService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<CompanyDto> GetMyCompanyAsync(int employerUserId)
        {
            var employer = await _context.Employers.AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);

            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var company = await _context.Companies.AsNoTracking()
                .FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId && !c.IsDeleted);

            if (company == null) throw new KeyNotFoundException("Company not found");

            var dto = MapCompany(company);

            // Fetch Members
            dto.Members = await _context.Employers
                .Include(e => e.User)
                .Where(e => (e.CompanyId == company.CompanyId || e.EmployerId == company.EmployerId) && !e.IsDeleted)
                .Select(e => new CompanyMemberDto
                {
                    Id = e.UserId,
                    Name = e.User != null ? $"{e.User.FirstName} {e.User.LastName}".Trim() : "Unknown",
                    Role = e.EmployerId == company.EmployerId ? "Admin" : "Member",
                    Avatar = e.User != null ? e.User.ProfilePictureUrl : null
                })
                .ToListAsync();

            // Fetch Jobs
            dto.Jobs = await _context.Jobs
                .Where(j => j.PostedByUserId == employer.UserId && !j.IsDeleted)
                .Select(j => new CompanyJobDto
                {
                    Id = j.JobId,
                    Title = j.Title,
                    Location = j.Location ?? string.Empty,
                    JobType = j.Type ?? string.Empty,
                    Status = j.IsActive ? "Open" : "Closed",
                    PostedAt = j.CreatedAt,
                    ApplicationsCount = _context.JobApplications.Count(a => a.JobId == j.JobId && !a.IsDeleted)
                })
                .ToListAsync();

            // Calculate Stats
            dto.Stats = new CompanyStatsDto
            {
                TotalJobs = dto.Jobs.Count,
                ActiveJobs = dto.Jobs.Count(j => j.Status == "Open"),
                TotalHires = _context.JobApplications.Count(a => a.JobId > 0 && a.Job!.PostedByUserId == employer.UserId && a.Status == "hired"),
                AvgTimeToHire = 15 // Mocked for now as we don't have hire date vs post date calculation logic here yet
            };

            return dto;
        }

        public async Task<CompanyDto> GetCompanyByIdAsync(int companyId)
        {
            var company = await _context.Companies.AsNoTracking()
                .FirstOrDefaultAsync(c => c.CompanyId == companyId && !c.IsDeleted);

            if (company == null) throw new KeyNotFoundException("Company not found");

            var dto = MapCompany(company);

            var employer = await _context.Employers.AsNoTracking()
                .FirstOrDefaultAsync(e => e.EmployerId == company.EmployerId && !e.IsDeleted);

            if (employer != null)
            {
                // Fetch Members
                dto.Members = await _context.Employers
                    .Include(e => e.User)
                    .Where(e => (e.CompanyId == company.CompanyId || e.EmployerId == company.EmployerId) && !e.IsDeleted)
                    .Select(e => new CompanyMemberDto
                    {
                        Id = e.UserId,
                        Name = e.User != null ? $"{e.User.FirstName} {e.User.LastName}".Trim() : "Unknown",
                        Role = e.EmployerId == company.EmployerId ? "Admin" : "Member",
                        Avatar = e.User != null ? e.User.ProfilePictureUrl : null
                    })
                    .ToListAsync();

                // Fetch Jobs
                dto.Jobs = await _context.Jobs
                    .Where(j => j.PostedByUserId == employer.UserId && !j.IsDeleted)
                    .Select(j => new CompanyJobDto
                    {
                        Id = j.JobId,
                        Title = j.Title,
                        Location = j.Location ?? string.Empty,
                        JobType = j.Type ?? string.Empty,
                        Status = j.IsActive ? "Open" : "Closed",
                        PostedAt = j.CreatedAt,
                        ApplicationsCount = _context.JobApplications.Count(a => a.JobId == j.JobId && !a.IsDeleted)
                    })
                    .ToListAsync();

                // Calculate Stats
                dto.Stats = new CompanyStatsDto
                {
                    TotalJobs = dto.Jobs.Count,
                    ActiveJobs = dto.Jobs.Count(j => j.Status == "Open"),
                    TotalHires = _context.JobApplications.Count(a => a.JobId > 0 && a.Job!.PostedByUserId == employer.UserId && a.Status == "hired"),
                    AvgTimeToHire = 15
                };
            }

            return dto;
        }

        public async Task<IEnumerable<CompanyDto>> SearchCompaniesAsync(string query)
        {
            query = (query ?? string.Empty).Trim();

            if (query.Length < 2)
                return Enumerable.Empty<CompanyDto>();

            var companies = await _context.Companies
                .AsNoTracking()
                .Where(c => !c.IsDeleted &&
                    ((c.CompanyName != null && c.CompanyName.Contains(query)) ||
                     (c.Industry != null && c.Industry.Contains(query)) ||
                     (c.City != null && c.City.Contains(query)) ||
                     (c.Country != null && c.Country.Contains(query))))
                .OrderBy(c => c.CompanyName)
                .Take(20)
                .ToListAsync();

            return companies.Select(MapCompany);
        }

        public async Task<CompanyDto> UpdateCompanyAsync(int employerUserId, UpdateCompanyRequest request)
        {
            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId && !c.IsDeleted);
            if (company == null) throw new KeyNotFoundException("Company not found");

            company.CompanyName = request.CompanyName;
            company.Industry = request.Industry ?? company.Industry;
            company.CompanySize = request.CompanySize ?? company.CompanySize;
            company.Description = request.Description ?? company.Description;
            company.FoundedYear = request.FoundedYear ?? company.FoundedYear;
            company.Country = request.Country ?? company.Country;
            company.City = request.City ?? company.City;
            company.Address = request.Address ?? company.Address;
            company.Website = request.Website ?? company.Website;
            company.LogoUrl = request.LogoUrl ?? company.LogoUrl;
            company.UpdatedAt = DateTimeOffset.UtcNow;

            // Sync Members
            if (request.Members != null)
            {
                var existingMembers = await _context.Employers
                    .Where(e => e.CompanyId == company.CompanyId && !e.IsDeleted)
                    .ToListAsync();

                var submittedMemberIds = new HashSet<int>();
                foreach (var memberDto in request.Members)
                {
                    if (memberDto.Id > 0)
                    {
                        // Update existing member
                        var existing = existingMembers.FirstOrDefault(e => e.UserId == memberDto.Id);
                        if (existing != null)
                        {
                            // Member exists, could update role if needed
                            submittedMemberIds.Add(memberDto.Id);
                        }
                    }
                    else
                    {
                        // New member - but we can't add by name only, need email
                        // For now, skip - use separate /team endpoint
                    }
                }

                // Remove members not in submitted list
                foreach (var existing in existingMembers)
                {
                    if (!submittedMemberIds.Contains(existing.UserId) && existing.EmployerId != company.EmployerId)
                    {
                        existing.CompanyId = null;
                        existing.IsDeleted = true;
                    }
                }
            }

            await _context.SaveChangesAsync();

            return await GetMyCompanyAsync(employerUserId);
        }

        private static CompanyDto MapCompany(Domain.Entities.Company c) => new()
        {
            CompanyId = c.CompanyId,
            EmployerId = c.EmployerId,
            CompanyName = c.CompanyName,
            Industry = c.Industry,
            CompanySize = c.CompanySize,
            Description = c.Description,
            FoundedYear = c.FoundedYear,
            Country = c.Country,
            City = c.City,
            Address = c.Address,
            Website = c.Website,
            LogoUrl = c.LogoUrl,
            IsVerified = c.IsVerified,
            CreatedAt = c.CreatedAt
        };

        public async Task<IEnumerable<object>> GetTeamAsync(int employerUserId)
        {
            var myEmployer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (myEmployer == null) throw new UnauthorizedAccessException("Not an employer");

            // If CompanyId is missing, assume this user is the owner and their company record has their EmployerId
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == myEmployer.EmployerId && !c.IsDeleted);
            if (company == null) return new[] { new { myEmployer.UserId, Role = "Owner" } }; // Fallback

            var members = await _context.Employers
                .Include(e => e.User)
                .Where(e => (e.CompanyId == company.CompanyId || e.EmployerId == company.EmployerId) && !e.IsDeleted)
                .Select(e => new 
                { 
                    e.UserId, 
                    FirstName = e.User != null ? e.User.FirstName : "", 
                    LastName = e.User != null ? e.User.LastName : "", 
                    Role = e.EmployerId == company.EmployerId ? "Owner" : "Member",
                    e.BusinessEmail
                })
                .ToListAsync();

            return members;
        }

        public async Task AddTeamMemberAsync(int ownerUserId, string memberEmail)
        {
            var owner = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == ownerUserId && !e.IsDeleted);
            if (owner == null) throw new UnauthorizedAccessException("Not an employer");

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == owner.EmployerId && !c.IsDeleted);
            if (company == null) throw new KeyNotFoundException("Company not found");

            var userToAdd = await _context.Users.FirstOrDefaultAsync(u => u.Email == memberEmail && !u.IsDeleted);
            if (userToAdd == null) throw new KeyNotFoundException("User not found with this email");

            var employerRecord = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userToAdd.UserId);
            if (employerRecord == null)
            {
                employerRecord = new Domain.Entities.Employer
                {
                    UserId = userToAdd.UserId,
                    CompanyId = company.CompanyId,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                _context.Employers.Add(employerRecord);
            }
            else
            {
                employerRecord.CompanyId = company.CompanyId;
                employerRecord.IsDeleted = false;
                employerRecord.UpdatedAt = DateTimeOffset.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveTeamMemberAsync(int ownerUserId, int memberUserId)
        {
             var owner = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == ownerUserId && !e.IsDeleted);
            if (owner == null) throw new UnauthorizedAccessException("Not an employer");

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == owner.EmployerId && !c.IsDeleted);
            if (company == null) throw new KeyNotFoundException("Company not found");

            var member = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == memberUserId && e.CompanyId == company.CompanyId);
            if (member == null) throw new KeyNotFoundException("Team member not found");

            member.CompanyId = null;
            member.IsDeleted = true; // Or just remove from company
            await _context.SaveChangesAsync();
        }

        public async Task SubmitVerificationDocumentAsync(int employerUserId, string documentUrl)
        {
             var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == employerUserId && !e.IsDeleted);
            if (employer == null) throw new UnauthorizedAccessException("Not an employer");

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId && !c.IsDeleted);
            if (company == null) throw new KeyNotFoundException("Company not found");

            company.CommercialRegistrationFileUrl = documentUrl;
            company.UpdatedAt = DateTimeOffset.UtcNow;

            employer.VerificationRequestedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<CompanyMemberOnboardingResponse> SubmitMemberOnboardingAsync(int userId, CompanyMemberOnboardingRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);
            if (user == null) throw new KeyNotFoundException("User not found");

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.CompanyId == request.CompanyId && !c.IsDeleted);
            if (company == null) throw new KeyNotFoundException("Company not found");

            var employer = await _context.Employers.FirstOrDefaultAsync(e => e.UserId == userId);
            if (employer == null)
            {
                employer = new Domain.Entities.Employer
                {
                    UserId = userId,
                    CompanyId = company.CompanyId,
                    ContactPerson = request.Position,
                    CreatedAt = DateTimeOffset.UtcNow,
                    CreatedBy = userId
                };
                _context.Employers.Add(employer);
            }
            else
            {
                employer.CompanyId = company.CompanyId;
                employer.ContactPerson = request.Position;
                employer.IsDeleted = false;
                employer.UpdatedAt = DateTimeOffset.UtcNow;
                employer.UpdatedBy = userId;
            }

            if (!string.IsNullOrWhiteSpace(request.ProfilePictureUrl))
                user.ProfilePictureUrl = request.ProfilePictureUrl;

            user.UserType = "Employer";
            user.RegistrationStatus = "PendingApproval";
            user.UpdatedAt = DateTimeOffset.UtcNow;
            user.UpdatedBy = userId;

            await SaveMemberOnboardingDraftAsync(userId, new CompanyMemberOnboardingDraftRequest
            {
                CompanyId = request.CompanyId,
                Role = request.Role,
                Position = request.Position,
                Department = request.Department,
                ProfilePictureUrl = request.ProfilePictureUrl
            });

            await _context.SaveChangesAsync();

            return new CompanyMemberOnboardingResponse
            {
                UserId = userId,
                CompanyId = company.CompanyId,
                CompanyName = company.CompanyName,
                Role = request.Role,
                Position = request.Position,
                Department = request.Department,
                Status = user.RegistrationStatus,
                UpdatedAt = user.UpdatedAt ?? DateTimeOffset.UtcNow
            };
        }

        public async Task<CompanyMemberOnboardingDraftRequest?> GetMemberOnboardingDraftAsync(int userId)
        {
            var settings = await _context.UserSettings.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId && !s.IsDeleted);
            if (settings?.Preferences == null) return null;

            using var document = JsonDocument.Parse(settings.Preferences);
            if (!document.RootElement.TryGetProperty("companyMemberOnboardingDraft", out var draft)) return null;

            return draft.Deserialize<CompanyMemberOnboardingDraftRequest>();
        }

        public async Task SaveMemberOnboardingDraftAsync(int userId, CompanyMemberOnboardingDraftRequest request)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            var preferences = new Dictionary<string, object?>();

            if (!string.IsNullOrWhiteSpace(settings?.Preferences))
            {
                preferences = JsonSerializer.Deserialize<Dictionary<string, object?>>(settings.Preferences) ?? new Dictionary<string, object?>();
            }

            preferences["companyMemberOnboardingDraft"] = request;
            var serializedPreferences = JsonSerializer.Serialize(preferences);

            if (settings == null)
            {
                settings = new Domain.Entities.UserSettings
                {
                    UserId = userId,
                    Language = "en",
                    EmailNotifications = true,
                    SmsNotifications = false,
                    PushNotifications = true,
                    DarkMode = false,
                    Preferences = serializedPreferences,
                    CreatedAt = DateTimeOffset.UtcNow,
                    CreatedBy = userId
                };
                _context.UserSettings.Add(settings);
            }
            else
            {
                settings.Preferences = serializedPreferences;
                settings.UpdatedAt = DateTimeOffset.UtcNow;
                settings.UpdatedBy = userId;
                settings.IsDeleted = false;
            }

            await _context.SaveChangesAsync();
        }

        public Task<object> GetAnalyticsAsync(int employerUserId)
        {
            return Task.FromResult<object>(new
            {
                TotalViews = 1250,
                ApplicantGrowth = 15.5,
                EngagementRate = 4.2
            });
        }
    }
}
