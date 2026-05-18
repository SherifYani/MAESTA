using JobMagnet.Application.DTOs.Contract;

namespace JobMagnet.Application.Interfaces
{
    public interface IContractService
    {
        Task<ContractResponse> CreateContractAsync(int clientId, CreateContractRequest request);
        Task<ContractResponse> GetContractByIdAsync(int contractId, int userId);
        Task<IEnumerable<ContractResponse>> GetMyContractsAsync(int userId);
        Task UpdateMilestoneStatusAsync(int userId, int milestoneId, string status);
        Task SubmitDeliveryAsync(int freelancerId, int contractId, SubmitDeliveryRequest request);
        Task ApproveDeliveryAsync(int clientId, int deliveryId);
    }
}
