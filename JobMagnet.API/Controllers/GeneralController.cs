using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class GeneralController : ControllerBase
    {
        private readonly IGeneralService _generalService;

        public GeneralController(IGeneralService generalService)
        {
            _generalService = generalService;
        }

        [HttpGet("stats/public")]
        public async Task<IActionResult> GetPublicStats()
        {
            var result = await _generalService.GetPublicStatsAsync();
            return Ok(result);
        }

        [HttpGet("companies/{id:int}/public")]
        public async Task<IActionResult> GetPublicCompany(int id)
        {
            try
            {
                var result = await _generalService.GetPublicCompanyProfileAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("skills/autocomplete")]
        public async Task<IActionResult> AutocompleteSkills([FromQuery] string term)
        {
            var result = await _generalService.AutocompleteSkillsAsync(term);
            return Ok(result);
        }

        [HttpGet("locations/autocomplete")]
        public async Task<IActionResult> AutocompleteLocations([FromQuery] string term)
        {
            var result = await _generalService.AutocompleteLocationsAsync(term);
            return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _generalService.GetCategoriesAsync();
            return Ok(result);
        }

        [HttpGet("health")]
        public async Task<IActionResult> HealthCheck()
        {
            var healthy = await _generalService.HealthCheckAsync();
            if (healthy) return Ok(new { status = "Healthy" });
            return StatusCode(503, new { status = "Unhealthy" });
        }
    }
}
