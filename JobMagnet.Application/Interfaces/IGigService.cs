using JobMagnet.Application.DTOs.Gig;

namespace JobMagnet.Application.Interfaces
{
    public interface IGigService
    {
        // Gigs / Projects
        Task<IEnumerable<GigDto>> GetGigsAsync(int page, int limit);
        Task<GigDto> GetGigByIdAsync(int projectId);
        Task<GigDto> CreateGigAsync(int clientId, CreateGigRequest request);
        Task<GigDto> UpdateGigAsync(int clientId, int projectId, CreateGigRequest request);
        Task DeleteGigAsync(int clientId, int projectId);
        Task<IEnumerable<GigDto>> GetMyGigsAsync(int clientId);

        // Proposals
        Task<ProposalDto> SubmitProposalAsync(int freelancerId, int projectId, SubmitProposalRequest request);
        Task<IEnumerable<ProposalDto>> GetMyProposalsAsync(int freelancerId);
        Task<IEnumerable<ProposalDto>> GetGigProposalsAsync(int clientId, int projectId);
        Task UpdateProposalStatusAsync(int clientId, int proposalId, string status);
        Task WithdrawProposalAsync(int freelancerId, int proposalId);
    }
}
