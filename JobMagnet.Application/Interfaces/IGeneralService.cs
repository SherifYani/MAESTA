using JobMagnet.Application.DTOs.General;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IGeneralService
    {
        Task<PublicStatsDto> GetPublicStatsAsync();
        Task<PublicCompanyDto> GetPublicCompanyProfileAsync(int id);
        Task<IEnumerable<AutocompleteDto>> AutocompleteSkillsAsync(string term);
        Task<IEnumerable<AutocompleteDto>> AutocompleteLocationsAsync(string term);
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
        Task<bool> HealthCheckAsync();
    }
}
