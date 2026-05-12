using JobMagnet.Application.DTOs.JobSeeker;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobSeekerController : ControllerBase
    {
        private readonly IJobSeekerService _jobSeekerService;

        public JobSeekerController(IJobSeekerService jobSeekerService)
        {
            _jobSeekerService = jobSeekerService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        // ─── Profile ──────────────────────────────────────────────────────────
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfileAsync()
        {
            try
            {
                var result = await _jobSeekerService.GetMyProfileAsync(GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetProfileByIdAsync(int userId)
        {
            try
            {
                var result = await _jobSeekerService.GetByUserIdAsync(userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfileAsync([FromBody] UpdateJobSeekerRequest request)
        {
            try
            {
                var result = await _jobSeekerService.UpdateProfileAsync(GetUserId(), request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // ─── Work Experience ──────────────────────────────────────────────────
        [HttpPost("experience")]
        public async Task<IActionResult> AddExperienceAsync([FromBody] AddWorkExperienceRequest request)
        {
            try
            {
                var result = await _jobSeekerService.AddWorkExperienceAsync(GetUserId(), request);
                return Created("", result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("experience/{id:int}")]
        public async Task<IActionResult> UpdateExperienceAsync(int id, [FromBody] AddWorkExperienceRequest request)
        {
            try
            {
                var result = await _jobSeekerService.UpdateWorkExperienceAsync(GetUserId(), id, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpDelete("experience/{id:int}")]
        public async Task<IActionResult> DeleteExperienceAsync(int id)
        {
            try
            {
                await _jobSeekerService.DeleteWorkExperienceAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("experience")]
        public async Task<IActionResult> GetExperiencesAsync()
        {
            try
            {
                var result = await _jobSeekerService.GetWorkExperiencesAsync(GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // ─── Education ────────────────────────────────────────────────────────
        [HttpPost("education")]
        public async Task<IActionResult> AddEducationAsync([FromBody] AddEducationRequest request)
        {
            try
            {
                var result = await _jobSeekerService.AddEducationAsync(GetUserId(), request);
                return Created("", result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("education/{id:int}")]
        public async Task<IActionResult> UpdateEducationAsync(int id, [FromBody] AddEducationRequest request)
        {
            try
            {
                var result = await _jobSeekerService.UpdateEducationAsync(GetUserId(), id, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpDelete("education/{id:int}")]
        public async Task<IActionResult> DeleteEducationAsync(int id)
        {
            try
            {
                await _jobSeekerService.DeleteEducationAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("education")]
        public async Task<IActionResult> GetEducationsAsync()
        {
            try
            {
                var result = await _jobSeekerService.GetEducationsAsync(GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // ─── Skills ───────────────────────────────────────────────────────────
        [HttpPut("skills")]
        public async Task<IActionResult> UpdateSkillsAsync([FromBody] UpdateSkillsRequest request)
        {
            try
            {
                await _jobSeekerService.UpdateSkillsAsync(GetUserId(), request);
                return Ok(new { message = "Skills updated successfully" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("skills")]
        public async Task<IActionResult> GetSkillsAsync()
        {
            try
            {
                var result = await _jobSeekerService.GetSkillsAsync(GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // ─── Portfolio ────────────────────────────────────────────────────────
        [HttpPost("portfolio")]
        public async Task<IActionResult> AddPortfolioItemAsync([FromBody] AddPortfolioItemRequest request)
        {
            try
            {
                var result = await _jobSeekerService.AddPortfolioItemAsync(GetUserId(), request);
                return Created("", result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("portfolio/{id:int}")]
        public async Task<IActionResult> UpdatePortfolioItemAsync(int id, [FromBody] AddPortfolioItemRequest request)
        {
            try
            {
                var result = await _jobSeekerService.UpdatePortfolioItemAsync(GetUserId(), id, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpDelete("portfolio/{id:int}")]
        public async Task<IActionResult> DeletePortfolioItemAsync(int id)
        {
            try
            {
                await _jobSeekerService.DeletePortfolioItemAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("portfolio")]
        public async Task<IActionResult> GetPortfolioAsync()
        {
            var result = await _jobSeekerService.GetPortfolioAsync(GetUserId());
            return Ok(result);
        }
    }
}
