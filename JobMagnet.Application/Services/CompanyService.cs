using JobMagnet.Application.DTOs.Company;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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

            return MapCompany(company);
        }

        public async Task<CompanyDto> GetCompanyByIdAsync(int companyId)
        {
            var company = await _context.Companies.AsNoTracking()
                .FirstOrDefaultAsync(c => c.CompanyId == companyId && !c.IsDeleted);

            if (company == null) throw new KeyNotFoundException("Company not found");

            return MapCompany(company);
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

            await _context.SaveChangesAsync();

            return MapCompany(company);
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
