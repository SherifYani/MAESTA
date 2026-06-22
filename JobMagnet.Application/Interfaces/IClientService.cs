using JobMagnet.Application.DTOs.Client;

namespace JobMagnet.Application.Interfaces
{
    public interface IClientService
    {
        Task<ClientProfileResponse> GetClientProfileAsync(int userId);
        Task<ClientProfileResponse> UpdateClientProfileAsync(int userId, UpdateClientProfileRequest request);
    }
}
