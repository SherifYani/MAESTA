using JobMagnet.Application.DTOs.Freelancer;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class FreelancerService : IFreelancerService
    {
        private readonly JobMagnetDbContext _context;

        public FreelancerService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<FreelancerDto> GetMyProfileAsync(int userId)
            => await GetHelperAsync(userId);

        public async Task<FreelancerDto> GetProfileByIdAsync(int userId)
            => await GetHelperAsync(userId);

        public async Task<FreelancerDto> UpdateProfileAsync(int userId, UpdateFreelancerRequest request)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (f == null) throw new KeyNotFoundException("Freelancer profile not found");

            if (request.ProfessionalTitle != null) f.ProfessionalTitle = request.ProfessionalTitle;
            if (request.ExperienceYears.HasValue) f.ExperienceYears = request.ExperienceYears.Value;
            if (request.HourlyRate.HasValue) f.HourlyRate = request.HourlyRate;
            if (request.Currency != null) f.Currency = request.Currency;
            if (request.PortfolioUrl != null) f.PortfolioUrl = request.PortfolioUrl;
            if (request.Bio != null) f.Bio = request.Bio;

            f.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return await GetHelperAsync(userId);
        }

        private async Task<FreelancerDto> GetHelperAsync(int userId)
        {
            var f = await _context.Freelancers.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (f == null) throw new KeyNotFoundException("Freelancer profile not found");

            return new FreelancerDto
            {
                FreelancerId = f.FreelancerId,
                UserId = f.UserId,
                FreelancerLevelId = f.FreelancerLevelId,
                ProfessionalTitle = f.ProfessionalTitle,
                ExperienceYears = f.ExperienceYears,
                HourlyRate = f.HourlyRate,
                Currency = f.Currency,
                TotalCompletedProjects = f.TotalCompletedProjects,
                PortfolioUrl = f.PortfolioUrl,
                Bio = f.Bio,
                IsVerified = f.IsVerified,
                LastActiveAt = f.LastActiveAt,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            };
        }

        // ─── Portfolio ────────────────────────────────────────────────────────
        public async Task<PortfolioItemDto> AddPortfolioItemAsync(int userId, AddPortfolioItemRequest request)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (f == null) throw new KeyNotFoundException("Freelancer profile not found");

            var item = new Domain.Entities.FreelancerPortfolio
            {
                FreelancerId = f.FreelancerId,
                ProjectTitle = request.Title,
                Description = request.Description,
                ProjectUrl = request.ProjectUrl,
                ImageUrlsJson = request.ImageUrl,
            };
            _context.FreelancerPortfolios.Add(item);
            await _context.SaveChangesAsync();
            return MapPortfolio(item);
        }

        public async Task<PortfolioItemDto> UpdatePortfolioItemAsync(int userId, int portfolioId, AddPortfolioItemRequest request)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (f == null) throw new KeyNotFoundException("Freelancer profile not found");

            var item = await _context.FreelancerPortfolios.FirstOrDefaultAsync(p => p.PortfolioId == portfolioId && p.FreelancerId == f.FreelancerId && !p.IsDeleted);
            if (item == null) throw new KeyNotFoundException("Portfolio item not found");

            item.ProjectTitle = request.Title;
            item.Description = request.Description;
            item.ProjectUrl = request.ProjectUrl;
            item.ImageUrlsJson = request.ImageUrl;
            item.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return MapPortfolio(item);
        }

        public async Task DeletePortfolioItemAsync(int userId, int portfolioId)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (f == null) throw new KeyNotFoundException("Freelancer profile not found");

            var item = await _context.FreelancerPortfolios.FirstOrDefaultAsync(p => p.PortfolioId == portfolioId && p.FreelancerId == f.FreelancerId && !p.IsDeleted);
            if (item == null) throw new KeyNotFoundException("Portfolio item not found");

            item.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<PortfolioItemDto>> GetPortfolioItemsAsync(int userId)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (f == null) throw new KeyNotFoundException("Freelancer profile not found");

            return await _context.FreelancerPortfolios
                .AsNoTracking()
                .Where(p => p.FreelancerId == f.FreelancerId && !p.IsDeleted)
                .Select(p => MapPortfolio(p))
                .ToListAsync();
        }

        private static PortfolioItemDto MapPortfolio(Domain.Entities.FreelancerPortfolio p) => new()
        {
            PortfolioId = p.PortfolioId,
            Title = p.ProjectTitle,
            Description = p.Description,
            ProjectUrl = p.ProjectUrl,
            ImageUrl = p.ImageUrlsJson,
        };

        public async Task<IEnumerable<object>> GetRatingsAsync(int userId)
        {
            return await _context.Reviews
                .Where(r => r.TargetUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new { r.ReviewId, ReviewerId = r.ReviewerId, Rating = r.RatingValue, r.Comment, r.CreatedAt })
                .ToListAsync();
        }

        public async Task UpdateAvailabilityAsync(int userId, bool isAvailable)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == userId && !x.IsDeleted);
            if (f == null) throw new KeyNotFoundException("Freelancer profile not found");
            f.IsAvailable = isAvailable;
            f.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
