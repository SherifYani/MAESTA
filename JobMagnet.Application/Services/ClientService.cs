using JobMagnet.Application.DTOs.Client;
using JobMagnet.Application.Interfaces;
using JobMagnet.Domain.Entities;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class ClientService : IClientService
    {
        private readonly JobMagnetDbContext _context;

        public ClientService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<ClientProfileResponse> GetClientProfileAsync(int userId)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

            if (client == null)
            {
                throw new KeyNotFoundException("Client profile not found.");
            }

            return MapToResponse(client);
        }

        public async Task<ClientProfileResponse> UpdateClientProfileAsync(int userId, UpdateClientProfileRequest request)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted);

            if (client == null)
            {
                // Auto create client profile if user is a client but profile doesn't exist
                var user = await _context.Users.FindAsync(userId);
                if (user == null || user.UserType != "Client")
                {
                   throw new KeyNotFoundException("User not found or not a client.");
                }

                client = new Client 
                { 
                    UserId = userId,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                await _context.Clients.AddAsync(client);
            }

            if (request.LegalName != null) client.LegalName = request.LegalName;
            if (request.ContactPhone != null) client.ContactPhone = request.ContactPhone;
            if (request.Address != null) client.Address = request.Address;
            if (request.Website != null) client.Website = request.Website;
            if (request.IdentityDocumentUrl != null) client.IdentityDocumentUrl = request.IdentityDocumentUrl;

            client.UpdatedAt = DateTimeOffset.UtcNow;
            client.UpdatedBy = userId;

            await _context.SaveChangesAsync();

            return MapToResponse(client);
        }

        private static ClientProfileResponse MapToResponse(Client client)
        {
            return new ClientProfileResponse
            {
                ClientId = client.ClientId,
                UserId = client.UserId,
                LegalName = client.LegalName,
                ContactPhone = client.ContactPhone,
                Address = client.Address,
                Website = client.Website,
                IdentityDocumentUrl = client.IdentityDocumentUrl,
                IsVerified = client.IsVerified,
                CreatedAt = client.CreatedAt
            };
        }
    }
}
