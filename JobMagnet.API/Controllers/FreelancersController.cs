using JobMagnet.Application.DTOs.Freelancer;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FreelancersController : ControllerBase
    {
        private readonly IFreelancerService _freelancerService;

        public FreelancersController(IFreelancerService freelancerService)
        {
            _freelancerService = freelancerService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfileAsync()
        {
            try
            {
                var result = await _freelancerService.GetMyProfileAsync(GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [AllowAnonymous]
        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetProfileByIdAsync(int userId)
        {
            try
            {
                var result = await _freelancerService.GetProfileByIdAsync(userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfileAsync([FromBody] UpdateFreelancerRequest request)
        {
            try
            {
                var result = await _freelancerService.UpdateProfileAsync(GetUserId(), request);
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
                var result = await _freelancerService.AddPortfolioItemAsync(GetUserId(), request);
                return Created("", result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("portfolio/{portfolioId:int}")]
        public async Task<IActionResult> UpdatePortfolioItemAsync(int portfolioId, [FromBody] AddPortfolioItemRequest request)
        {
            try
            {
                var result = await _freelancerService.UpdatePortfolioItemAsync(GetUserId(), portfolioId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpDelete("portfolio/{portfolioId:int}")]
        public async Task<IActionResult> DeletePortfolioItemAsync(int portfolioId)
        {
            try
            {
                await _freelancerService.DeletePortfolioItemAsync(GetUserId(), portfolioId);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("portfolio")]
        public async Task<IActionResult> GetPortfolioItemsAsync()
        {
            try
            {
                var result = await _freelancerService.GetPortfolioItemsAsync(GetUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("ratings")]
        public async Task<IActionResult> GetRatingsAsync()
        {
            var result = await _freelancerService.GetRatingsAsync(GetUserId());
            return Ok(result);
        }

        [HttpPut("availability")]
        public async Task<IActionResult> UpdateAvailabilityAsync([FromBody] bool isAvailable)
        {
            try
            {
                await _freelancerService.UpdateAvailabilityAsync(GetUserId(), isAvailable);
                return Ok(new { message = $"Availability updated to {isAvailable}" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }
    }
}
