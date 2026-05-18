using JobMagnet.Application.DTOs.Contract;
using JobMagnet.Application.Interfaces;
using JobMagnet.Domain.Entities;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JobMagnet.Application.Services
{
    public class ContractService : IContractService
    {
        private readonly JobMagnetDbContext _context;
        private readonly ILogger<ContractService> _logger;

        public ContractService(JobMagnetDbContext context, ILogger<ContractService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ContractResponse> CreateContractAsync(int clientId, CreateContractRequest request)
        {
            // 1. Verify client existence
            var client = await _context.Clients.FirstOrDefaultAsync(c => c.UserId == clientId && !c.IsDeleted);
            if (client == null) throw new UnauthorizedAccessException("Unauthorized: User is not a registered Client");

            // 2. Load proposal and verify ownership/status
            var proposal = await _context.Proposals
                .Include(p => p.Project!)
                    .ThenInclude(proj => proj.User)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.ProposalId == request.ProposalId && !p.IsDeleted);

            if (proposal == null) throw new KeyNotFoundException("Proposal not found");
            if (proposal.Project == null) throw new InvalidOperationException("Project data missing for this proposal");
            if (proposal.Project.OwnerUserId != client.ClientId) throw new UnauthorizedAccessException("Unauthorized: You do not own this project");
            if (proposal.Status != "Pending") throw new InvalidOperationException("Contract can only be created for Pending proposals");

            // 3. Create Contract
            var contract = new Contract
            {
                ProjectId = proposal.ProjectId,
                ClientUserId = proposal.Project.OwnerUserId,
                FreelancerUserId = proposal.FreelancerUserId,
                Terms = request.Terms,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = clientId
            };
            
            _context.Contracts.Add(contract);

            // 4. Update Proposal and Project status
            proposal.Status = "Accepted";
            proposal.Project.Status = "InProgress";
            proposal.Project.AssignedFreelancerId = proposal.FreelancerUserId;

            // 5. Create Milestones if provided
            if (request.Milestones != null && request.Milestones.Any())
            {
                foreach (var mReq in request.Milestones)
                {
                    var milestone = new ProjectMilestone
                    {
                        ProjectId = proposal.ProjectId,
                        Title = mReq.Title,
                        Description = mReq.Description,
                        Amount = mReq.Amount,
                        DueDate = mReq.DueDate,
                        Status = "Pending",
                        CreatedAt = DateTimeOffset.UtcNow,
                        CreatedBy = clientId
                    };
                    _context.ProjectMilestones.Add(milestone);
                }
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Contract {contract.ContractId} created for Project {proposal.ProjectId}");

            return await MapContractResponse(contract.ContractId);
        }

        public async Task SubmitDeliveryAsync(int freelancerId, int contractId, SubmitDeliveryRequest request)
        {
            var contract = await _context.Contracts
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.ContractId == contractId && !c.IsDeleted);

            if (contract == null) throw new KeyNotFoundException("Contract not found");
            if (contract.FreelancerUserId != freelancerId) throw new UnauthorizedAccessException("Only the assigned freelancer can submit delivery");

            var delivery = new ProjectDelivery
            {
                ProjectId = contract.ProjectId,
                FileUrl = request.FileUrl,
                Message = request.Message,
                DeliveredAt = DateTimeOffset.UtcNow,
                CreatedAt = DateTimeOffset.UtcNow,
                CreatedBy = freelancerId,
                IsApproved = false
            };

            _context.ProjectDeliveries.Add(delivery);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Delivery submitted for Project {contract.ProjectId} by User {freelancerId}");
        }

        public async Task ApproveDeliveryAsync(int clientId, int deliveryId)
        {
            var delivery = await _context.ProjectDeliveries
                .Include(d => d.Project)
                .FirstOrDefaultAsync(d => d.ProjectDeliveryId == deliveryId && !d.IsDeleted);

            if (delivery == null) throw new KeyNotFoundException("Delivery not found");
            if (delivery.Project?.OwnerUserId != clientId) throw new UnauthorizedAccessException("Only the project owner can approve delivery");

            delivery.IsApproved = true;
            delivery.UpdatedAt = DateTimeOffset.UtcNow;
            delivery.UpdatedBy = clientId;

            // Optional: If this is the final delivery, mark project as completed
            // For now, we just approve it.

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Delivery {deliveryId} approved by User {clientId}");
        }

        public async Task<ContractResponse> GetContractByIdAsync(int contractId, int userId)
        {
            var contract = await _context.Contracts
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.ContractId == contractId && !c.IsDeleted);

            if (contract == null) throw new KeyNotFoundException("Contract not found");

            // Authorization check: User must be either the client or the freelancer
            // Note: contract.ClientUserId might be client.ClientId, depends on how it's stored.
            // Based on Core definitions, it links to User entities.
            if (contract.ClientUserId != userId && contract.FreelancerUserId != userId)
                throw new UnauthorizedAccessException("Unauthorized access to contract");

            return await MapContractResponse(contractId);
        }

        public async Task<IEnumerable<ContractResponse>> GetMyContractsAsync(int userId)
        {
            var contractIds = await _context.Contracts
                .Where(c => !c.IsDeleted && (c.ClientUserId == userId || c.FreelancerUserId == userId))
                .Select(c => c.ContractId)
                .ToListAsync();

            var responses = new List<ContractResponse>();
            foreach (var id in contractIds)
            {
                responses.Add(await MapContractResponse(id));
            }
            return responses;
        }

        public async Task UpdateMilestoneStatusAsync(int userId, int milestoneId, string status)
        {
            var milestone = await _context.ProjectMilestones
                .Include(m => m.Project)
                .FirstOrDefaultAsync(m => m.MilestoneId == milestoneId && !m.IsDeleted);

            if (milestone == null) throw new KeyNotFoundException("Milestone not found");

            // Authorization: Client or Assigned Freelancer
            if (milestone.Project?.OwnerUserId != userId && milestone.Project?.AssignedFreelancerId != userId)
                throw new UnauthorizedAccessException("Unauthorized update of milestone");

            milestone.Status = status;
            milestone.UpdatedAt = DateTimeOffset.UtcNow;
            milestone.UpdatedBy = userId;

            await _context.SaveChangesAsync();
        }

        private async Task<ContractResponse> MapContractResponse(int contractId)
        {
            var c = await _context.Contracts
                .Include(x => x.Project)
                .Include(x => x.ClientUser)
                .Include(x => x.FreelancerUser)
                .FirstOrDefaultAsync(x => x.ContractId == contractId);

            if (c == null) throw new KeyNotFoundException();

            var milestones = await _context.ProjectMilestones
                .Where(m => m.ProjectId == c.ProjectId && !m.IsDeleted)
                .OrderBy(m => m.CreatedAt)
                .Select(m => new MilestoneDto
                {
                    MilestoneId = m.MilestoneId,
                    Title = m.Title,
                    Description = m.Description,
                    Amount = m.Amount,
                    DueDate = m.DueDate,
                    Status = m.Status
                })
                .ToListAsync();

            return new ContractResponse
            {
                ContractId = c.ContractId,
                ProjectId = c.ProjectId,
                ProjectTitle = c.Project?.Title ?? "Unknown",
                ClientUserId = c.ClientUserId,
                ClientName = c.ClientUser != null ? $"{c.ClientUser.FirstName} {c.ClientUser.LastName}" : "Unknown",
                FreelancerUserId = c.FreelancerUserId,
                FreelancerName = c.FreelancerUser != null ? $"{c.FreelancerUser.FirstName} {c.FreelancerUser.LastName}" : "Unknown",
                Terms = c.Terms,
                SignedDate = c.SignedDate,
                ContractFileUrl = c.ContractFileUrl,
                CreatedAt = c.CreatedAt,
                Milestones = milestones
            };
        }
    }
}
