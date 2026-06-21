using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// ملخص الداشبورد للمستخدم الحالي
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _dashboardService.GetUserDashboardSummaryAsync(userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("job-seeker")]
        public async Task<IActionResult> GetJobSeekerDashboard()
        {
            var result = await _dashboardService.GetJobSeekerDashboardAsync(GetCurrentUserId());
            return Ok(result);
        }

        [HttpGet("freelancer")]
        public async Task<IActionResult> GetFreelancerDashboard()
        {
            var result = await _dashboardService.GetFreelancerDashboardAsync(GetCurrentUserId());
            return Ok(result);
        }

        [HttpGet("company")]
        public async Task<IActionResult> GetCompanyDashboard()
        {
            var result = await _dashboardService.GetCompanyDashboardAsync(GetCurrentUserId());
            return Ok(result);
        }

        [HttpGet("company/analytics")]
        public async Task<IActionResult> GetCompanyAnalytics()
        {
            var result = await _dashboardService.GetCompanyAnalyticsAsync(GetCurrentUserId());
            return Ok(result);
        }

        [HttpGet("client")]
        public async Task<IActionResult> GetClientDashboard()
        {
            var result = await _dashboardService.GetClientDashboardAsync(GetCurrentUserId());
            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Invalid token");
            return id;
        }
    }
}
