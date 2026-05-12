using JobMagnet.Application.DTOs.Company;

namespace JobMagnet.Application.Interfaces
{
    public interface ICompanyService
    {
        Task<CompanyDto> GetMyCompanyAsync(int employerUserId);
        Task<CompanyDto> GetCompanyByIdAsync(int companyId);
        Task<CompanyDto> UpdateCompanyAsync(int employerUserId, UpdateCompanyRequest request);
        Task<IEnumerable<object>> GetTeamAsync(int employerUserId);
        Task AddTeamMemberAsync(int ownerUserId, string memberEmail);
        Task RemoveTeamMemberAsync(int ownerUserId, int memberUserId);
        Task SubmitVerificationDocumentAsync(int employerUserId, string documentUrl);
        Task<object> GetAnalyticsAsync(int employerUserId);
    }
}
