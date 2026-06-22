using JobMagnet.Application.DTOs.Gig;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class GigService : IGigService
    {
        private readonly JobMagnetDbContext _context;

        public GigService(JobMagnetDbContext context)
        {
            _context = context;
        }

        // ─── Gigs / Projects ──────────────────────────────────────────────────
        public async Task<IEnumerable<GigDto>> GetGigsAsync(int page = 1, int limit = 20)
        {
            return await _context.Projects
                .AsNoTracking()
                .Where(p => !p.IsDeleted && p.Status == "Open")
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(p => MapGig(p))
                .ToListAsync();
        }

        public async Task<GigDto> GetGigByIdAsync(int projectId)
        {
            var p = await _context.Projects.AsNoTracking().FirstOrDefaultAsync(x => x.ProjectId == projectId && !x.IsDeleted);
            if (p == null) throw new KeyNotFoundException("Gig not found");
            return MapGig(p);
        }

        public async Task<GigDto> CreateGigAsync(int clientId, CreateGigRequest request)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == clientId && !c.IsDeleted);
            if (client == null) throw new UnauthorizedAccessException("Only clients can post gigs");

            var project = new Domain.Entities.Project
            {
                OwnerUserId = client.ClientId,
                Title = request.Title,
                Description = request.Description,
                Budget = request.Budget,
                Status = "Open",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return MapGig(project);
        }

        public async Task<GigDto> UpdateGigAsync(int clientId, int projectId, CreateGigRequest request)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == clientId && !c.IsDeleted);
            if (client == null) throw new UnauthorizedAccessException("Not a client");

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId && p.OwnerUserId == client.ClientId && !p.IsDeleted);
            if (project == null) throw new KeyNotFoundException("Gig not found or unauthorized");

            project.Title = request.Title;
            project.Description = request.Description;
            project.Budget = request.Budget;
            project.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
            return MapGig(project);
        }

        public async Task DeleteGigAsync(int clientId, int projectId)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == clientId && !c.IsDeleted);
            if (client == null) throw new UnauthorizedAccessException("Not a client");

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId && p.OwnerUserId == client.ClientId && !p.IsDeleted);
            if (project == null) throw new KeyNotFoundException("Gig not found or unauthorized");

            project.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<GigDto>> GetMyGigsAsync(int clientId)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == clientId && !c.IsDeleted);
            if (client == null) throw new UnauthorizedAccessException("Not a client");

            return await _context.Projects
                .AsNoTracking()
                .Where(p => p.OwnerUserId == client.ClientId && !p.IsDeleted)
                .Select(p => MapGig(p))
                .ToListAsync();
        }

        // ─── Proposals ────────────────────────────────────────────────────────
        public async Task<ProposalDto> SubmitProposalAsync(int freelancerId, int projectId, SubmitProposalRequest request)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == freelancerId && !x.IsDeleted);
            if (f == null) throw new UnauthorizedAccessException("Only freelancers can bid");

            var p = await _context.Projects.FirstOrDefaultAsync(x => x.ProjectId == projectId && !x.IsDeleted && x.Status == "Open");
            if (p == null) throw new KeyNotFoundException("Gig not found or not open");

            var existing = await _context.Proposals.FirstOrDefaultAsync(x => x.ProjectId == projectId && x.FreelancerUserId == f.FreelancerId && !x.IsDeleted);
            if (existing != null) throw new InvalidOperationException("Already submitted a proposal");

            var proposal = new Domain.Entities.Proposal
            {
                ProjectId = projectId,
                FreelancerUserId = f.FreelancerId,
                ProposedAmount = request.BidAmount,
                ProposalText = request.CoverLetter,
                Status = "Pending",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Proposals.Add(proposal);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(freelancerId);
            return MapProposal(proposal, user != null ? $"{user.FirstName} {user.LastName}" : "Unknown");
        }

        public async Task<IEnumerable<ProposalDto>> GetMyProposalsAsync(int freelancerId)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == freelancerId && !x.IsDeleted);
            if (f == null) throw new UnauthorizedAccessException("Not a freelancer");

            return await _context.Proposals
                .AsNoTracking()
                .Include(p => p.User)
                .Where(p => p.FreelancerUserId == f.FreelancerId && !p.IsDeleted)
                .Select(p => MapProposal(p, p.User != null ? $"{p.User.FirstName} {p.User.LastName}" : ""))
                .ToListAsync();
        }

        public async Task<IEnumerable<ProposalDto>> GetGigProposalsAsync(int clientId, int projectId)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == clientId && !c.IsDeleted);
            if (client == null) throw new UnauthorizedAccessException("Not a client");

            var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectId == projectId && p.OwnerUserId == client.ClientId && !p.IsDeleted);
            if (project == null) throw new KeyNotFoundException("Gig not found or unauthorized");

            return await _context.Proposals
                .AsNoTracking()
                .Include(p => p.User)
                .Where(p => p.ProjectId == projectId && !p.IsDeleted)
                .Select(p => MapProposal(p, p.User != null ? $"{p.User.FirstName} {p.User.LastName}" : ""))
                .ToListAsync();
        }

        public async Task UpdateProposalStatusAsync(int clientId, int proposalId, string status)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == clientId && !c.IsDeleted);
            if (client == null) throw new UnauthorizedAccessException("Not a client");

            var proposal = await _context.Proposals
                .Include(p => p.Project)
                .FirstOrDefaultAsync(p => p.ProposalId == proposalId && !p.IsDeleted);

            if (proposal == null || proposal.Project?.OwnerUserId != client.ClientId)
                throw new KeyNotFoundException("Proposal not found or unauthorized");

            proposal.Status = status;
            proposal.UpdatedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task WithdrawProposalAsync(int freelancerId, int proposalId)
        {
            var f = await _context.Freelancers.FirstOrDefaultAsync(x => x.UserId == freelancerId && !x.IsDeleted);
            if (f == null) throw new UnauthorizedAccessException("Not a freelancer");

            var proposal = await _context.Proposals.FirstOrDefaultAsync(p => p.ProposalId == proposalId && p.FreelancerUserId == f.FreelancerId && !p.IsDeleted);
            if (proposal == null) throw new KeyNotFoundException("Proposal not found");

            proposal.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        // ─── Private Mappers ──────────────────────────────────────────────────
        private static GigDto MapGig(Domain.Entities.Project p) => new()
        {
            ProjectId = p.ProjectId,
            Title = p.Title,
            Description = p.Description,
            Budget = p.Budget,
            Status = p.Status,
            CreatedAt = p.CreatedAt
        };

        private static ProposalDto MapProposal(Domain.Entities.Proposal p, string freelancerName) => new()
        {
            ProposalId = p.ProposalId,
            ProjectId = p.ProjectId,
            FreelancerId = p.FreelancerUserId,
            FreelancerName = freelancerName,
            BidAmount = p.ProposedAmount,
            CoverLetter = p.ProposalText ?? "",
            Status = p.Status,
            CreatedAt = p.CreatedAt
        };
    }
}
