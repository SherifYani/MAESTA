using JobMagnet.Application.DTOs.Company;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CompaniesController : ControllerBase
    {
        private readonly ICompanyService _companyService;

        public CompaniesController(ICompanyService companyService)
        {
            _companyService = companyService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyCompanyAsync()
        {
            try
            {
                var result = await _companyService.GetMyCompanyAsync(GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [AllowAnonymous]
        [HttpGet("{companyId:int}")]
        public async Task<IActionResult> GetCompanyByIdAsync(int companyId)
        {
            try
            {
                var result = await _companyService.GetCompanyByIdAsync(companyId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateCompanyAsync([FromBody] UpdateCompanyRequest request)
        {
            try
            {
                var result = await _companyService.UpdateCompanyAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpGet("team")]
        public async Task<IActionResult> GetTeamAsync()
        {
            var result = await _companyService.GetTeamAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalyticsAsync()
        {
            try
            {
                var result = await _companyService.GetAnalyticsAsync(GetUserId());
                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("team")]
        public async Task<IActionResult> AddTeamMemberAsync([FromBody] AddTeamMemberRequest request)
        {
            try
            {
                await _companyService.AddTeamMemberAsync(GetUserId(), request.Email);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("team/{id:int}")]
        public async Task<IActionResult> RemoveTeamMemberAsync(int id)
        {
            try
            {
                await _companyService.RemoveTeamMemberAsync(GetUserId(), id);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("verify")]
        public async Task<IActionResult> SubmitVerificationAsync([FromBody] SubmitVerificationRequest request)
        {
            try
            {
                await _companyService.SubmitVerificationDocumentAsync(GetUserId(), request.DocumentUrl);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }
    }

    public class AddTeamMemberRequest { public string Email { get; set; } = string.Empty; }
    public class SubmitVerificationRequest { public string DocumentUrl { get; set; } = string.Empty; }
}
