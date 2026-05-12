using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        /// <summary>
        /// جلب قائمة المستخدمين المنتظرين الموافقة (RegistrationStatus = PendingApproval)
        /// </summary>
        [HttpGet("pending-approvals")]
        public async Task<IActionResult> GetPendingApprovals()
        {
            var result = await _adminService.GetPendingApprovalsAsync();
            return Ok(result);
        }

        /// <summary>
        /// قبول مستخدم وتغيير حالته إلى Approved
        /// </summary>
        [HttpPost("approve/{userId:int}")]
        public async Task<IActionResult> ApproveUser(int userId)
        {
            try
            {
                var result = await _adminService.ApproveUserAsync(userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("toggle-status/{userId:int}")]
        public async Task<IActionResult> ToggleUserStatus(int userId, [FromQuery] bool isActive)
        {
            try
            {
                await _adminService.ToggleUserStatusAsync(userId, isActive);
                return Ok(new { message = $"User status updated to {(isActive ? "Active" : "Inactive")}" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("user/{userId:int}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                await _adminService.DeleteUserAsync(userId);
                return Ok(new { message = "User deleted by admin" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("dashboard/metrics")]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            var result = await _adminService.GetDashboardMetricsAsync();
            return Ok(result);
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetPendingReports()
        {
            var result = await _adminService.GetPendingReportsAsync();
            return Ok(result);
        }

        [HttpPost("reports/{id:int}/resolve")]
        public async Task<IActionResult> ResolveReport(int id, [FromQuery] string action)
        {
            try
            {
                await _adminService.ResolveReportAsync(id, action);
                return Ok(new { message = $"Report {id} resolved with action: {action}" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
