using JobMagnet.Application.DTOs.General;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobMagnet.Application.Services
{
    public class GeneralService : IGeneralService
    {
        private readonly JobMagnetDbContext _context;

        public GeneralService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<PublicStatsDto> GetPublicStatsAsync()
        {
            return new PublicStatsDto
            {
                TotalUsers = await _context.Users.CountAsync(u => !u.IsDeleted),
                TotalJobs = await _context.Jobs.CountAsync(j => j.IsActive && !j.IsDeleted),
                TotalCompanies = await _context.Companies.CountAsync(c => !c.IsDeleted),
                SuccessfulPlacements = await _context.JobApplications.CountAsync(a => a.Status == "Hired")
            };
        }

        public async Task<PublicCompanyDto> GetPublicCompanyProfileAsync(int id)
        {
            var company = await _context.Companies
                .FirstOrDefaultAsync(c => c.CompanyId == id && !c.IsDeleted);

            if (company == null) throw new KeyNotFoundException("Company not found");

            return new PublicCompanyDto
            {
                CompanyId = company.CompanyId,
                CompanyName = company.CompanyName,
                Logo = company.LogoUrl,
                Description = company.Description,
                Website = company.Website,
                Industry = company.Industry,
                OpenJobsCount = await _context.Jobs.CountAsync(j => j.PostedByUserId == company.EmployerId && j.IsActive && !j.IsDeleted)
            };
        }

        public async Task<IEnumerable<AutocompleteDto>> AutocompleteSkillsAsync(string term)
        {
            if (string.IsNullOrWhiteSpace(term)) return Enumerable.Empty<AutocompleteDto>();

            return await _context.Skills
                .Where(s => s.Name.Contains(term))
                .Take(10)
                .Select(s => new AutocompleteDto
                {
                    Id = s.SkillId,
                    Name = s.Name
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<AutocompleteDto>> AutocompleteLocationsAsync(string term)
        {
            if (string.IsNullOrWhiteSpace(term)) return Enumerable.Empty<AutocompleteDto>();

            // For now, we search unique locations from Jobs table
            return await _context.Jobs
                .Where(j => j.Location != null && j.Location.Contains(term))
                .Select(j => j.Location)
                .Distinct()
                .Take(10)
                .Select((loc, index) => new AutocompleteDto
                {
                    Id = index,
                    Name = loc!
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDto
                {
                    CategoryId = c.CategoryId,
                    Name = c.Name,
                    Icon = null,
                    JobsCount = _context.Jobs.Count(j => j.IsActive && !j.IsDeleted) // This is a simplified count, ideally linked via JobCategory
                })
                .ToListAsync();
        }

        public async Task<bool> HealthCheckAsync()
        {
            try
            {
                return await _context.Database.CanConnectAsync();
            }
            catch
            {
                return false;
            }
        }
    }
}
