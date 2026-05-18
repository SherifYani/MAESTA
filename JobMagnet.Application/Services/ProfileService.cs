using JobMagnet.Application.DTOs.Profile;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class ProfileService : IProfileService
    {
        private readonly JobMagnetDbContext _context;

        public ProfileService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDto> GetUserProfileAsync(int userId)
            => await BuildProfileAsync(userId);

        public async Task<UserProfileDto> GetProfileByIdAsync(int userId)
            => await BuildProfileAsync(userId);

        public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);
            if (user == null) throw new KeyNotFoundException("User not found");

            if (!string.IsNullOrWhiteSpace(request.FirstName))   user.FirstName       = request.FirstName.Trim();
            if (!string.IsNullOrWhiteSpace(request.LastName))    user.LastName        = request.LastName.Trim();
            if (request.Phone           != null) user.Phone              = request.Phone;
            if (request.ProfilePictureUrl != null) user.ProfilePictureUrl = request.ProfilePictureUrl;
            if (request.LinkedInUrl     != null) user.LinkedInUrl        = request.LinkedInUrl;
            if (request.Gender          != null) user.Gender             = request.Gender;
            if (request.Country         != null) user.Country            = request.Country;
            if (request.City            != null) user.City               = request.City;
            if (request.DateOfBirth.HasValue)
                user.DateOfBirth = new DateTimeOffset(request.DateOfBirth.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return await BuildProfileAsync(userId);
        }

        public async Task<UserSettingsDto> GetUserSettingsAsync(int userId)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(u => u.UserId == userId);
            if (settings == null)
            {
                // Create default settings if not exists
                settings = new Domain.Entities.UserSettings
                {
                    UserId = userId,
                    Language = "en",
                    EmailNotifications = true,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                _context.UserSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return MapSettings(settings);
        }

        public async Task<UserSettingsDto> UpdateUserSettingsAsync(int userId, UpdateUserSettingsRequest request)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(u => u.UserId == userId);
            if (settings == null) throw new KeyNotFoundException("Settings not found");

            if (request.Language != null) settings.Language = request.Language;
            if (request.TimeZone != null) settings.TimeZone = request.TimeZone;
            if (request.EmailNotifications.HasValue) settings.EmailNotifications = request.EmailNotifications.Value;
            if (request.SmsNotifications.HasValue) settings.SmsNotifications = request.SmsNotifications.Value;
            if (request.PushNotifications.HasValue) settings.PushNotifications = request.PushNotifications.Value;
            if (request.DarkMode.HasValue) settings.DarkMode = request.DarkMode.Value;
            if (request.Preferences != null) settings.Preferences = request.Preferences;

            settings.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return MapSettings(settings);
        }

        private static UserSettingsDto MapSettings(Domain.Entities.UserSettings s) => new()
        {
            Language = s.Language,
            TimeZone = s.TimeZone,
            EmailNotifications = s.EmailNotifications,
            SmsNotifications = s.SmsNotifications,
            PushNotifications = s.PushNotifications,
            DarkMode = s.DarkMode,
            Preferences = s.Preferences
        };

        // ─── Private Helper ──────────────────────────────────────────────────
        private async Task<UserProfileDto> BuildProfileAsync(int userId)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);

            if (user == null) throw new KeyNotFoundException("User not found");

            var jobSeeker = await _context.JobSeekers.AsNoTracking()
                .FirstOrDefaultAsync(js => js.UserId == userId && !js.IsDeleted);

            var employer = await _context.Employers.AsNoTracking()
                .FirstOrDefaultAsync(e => e.UserId == userId && !e.IsDeleted);

            Domain.Entities.Company? company = null;
            if (employer != null)
                company = await _context.Companies.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.EmployerId == employer.EmployerId && !c.IsDeleted);

            return new UserProfileDto
            {
                User = new UserDto
                {
                    UserId = user.UserId, Email = user.Email,
                    FirstName = user.FirstName, LastName = user.LastName,
                    Phone = user.Phone, ProfilePictureUrl = user.ProfilePictureUrl,
                    LinkedInUrl = user.LinkedInUrl, Gender = user.Gender,
                    DateOfBirth = user.DateOfBirth, Country = user.Country,
                    City = user.City, UserType = user.UserType,
                    RegistrationStatus = user.RegistrationStatus,
                    IsActive = user.IsActive, CreatedAt = user.CreatedAt, UpdatedAt = user.UpdatedAt
                },
                JobSeeker = jobSeeker == null ? null : new JobSeekerProfileDto
                {
                    JobSeekerId = jobSeeker.JobSeekerId, UserId = jobSeeker.UserId,
                    CVUrl = jobSeeker.CVUrl, ProfessionalTitle = jobSeeker.ProfessionalTitle,
                    ExperienceYears = jobSeeker.ExperienceYears, PreferredJobType = jobSeeker.PreferredJobType,
                    Bio = jobSeeker.Bio, IsVerified = jobSeeker.IsVerified,
                    LastActiveAt = jobSeeker.LastActiveAt,
                    CreatedAt = jobSeeker.CreatedAt, UpdatedAt = jobSeeker.UpdatedAt
                },
                Employer = employer == null ? null : new EmployerProfileDto
                {
                    EmployerId = employer.EmployerId, UserId = employer.UserId,
                    BusinessEmail = employer.BusinessEmail, NationalId = employer.NationalId,
                    TaxNumber = employer.TaxNumber, ContactPerson = employer.ContactPerson,
                    ContactPhone = employer.ContactPhone, IsVerified = employer.IsVerified,
                    VerificationRequestedAt = employer.VerificationRequestedAt,
                    CreatedAt = employer.CreatedAt, UpdatedAt = employer.UpdatedAt
                },
                Company = company == null ? null : new CompanyDto
                {
                    CompanyId = company.CompanyId, EmployerId = company.EmployerId,
                    CompanyName = company.CompanyName, Description = company.Description,
                    Industry = company.Industry, CompanySize = company.CompanySize,
                    FoundedYear = company.FoundedYear, Country = company.Country,
                    City = company.City, Address = company.Address, Website = company.Website,
                    CommercialRegistrationNumber = company.CommercialRegistrationNumber,
                    CommercialRegistrationFileUrl = company.CommercialRegistrationFileUrl,
                    LogoUrl = company.LogoUrl, IsVerified = company.IsVerified,
                    CreatedAt = company.CreatedAt, UpdatedAt = company.UpdatedAt
                }
            };
        }
    }
}
