using JobMagnet.Application.DTOs.Company;

namespace JobMagnet.Application.Interfaces
{
    public interface ICompanyService
    {
        Task<CompanyDto> GetMyCompanyAsync(int employerUserId);
        Task<CompanyDto> GetCompanyByIdAsync(int companyId);
        Task<IEnumerable<CompanyDto>> SearchCompaniesAsync(string query);
        Task<CompanyDto> UpdateCompanyAsync(int employerUserId, UpdateCompanyRequest request);
        Task<IEnumerable<object>> GetTeamAsync(int employerUserId);
        Task AddTeamMemberAsync(int ownerUserId, string memberEmail);
        Task RemoveTeamMemberAsync(int ownerUserId, int memberUserId);
        Task SubmitVerificationDocumentAsync(int employerUserId, string documentUrl);
        Task<CompanyMemberOnboardingResponse> SubmitMemberOnboardingAsync(int userId, CompanyMemberOnboardingRequest request);
        Task<CompanyMemberOnboardingDraftRequest?> GetMemberOnboardingDraftAsync(int userId);
        Task SaveMemberOnboardingDraftAsync(int userId, CompanyMemberOnboardingDraftRequest request);
        Task<object> GetAnalyticsAsync(int employerUserId);
    }
}
