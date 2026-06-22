using JobMagnet.Application.DTOs.Admin;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] string? userType, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _adminService.GetUsersAsync(search, userType, status, page, pageSize);
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
                await _adminService.ToggleUserStatusAsync(userId, isActive, GetCurrentUserId());
                return Ok(new { message = $"User status updated to {(isActive ? "Active" : "Inactive")}" });
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

        [HttpDelete("user/{userId:int}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                await _adminService.DeleteUserAsync(userId, GetCurrentUserId());
                return Ok(new { message = "User deleted by admin" });
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

        [HttpPost("grant-admin/{userId:int}")]
        public async Task<IActionResult> GrantAdminRole(int userId)
        {
            try
            {
                var result = await _adminService.GrantAdminRoleAsync(userId, GetCurrentUserId());
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

        [HttpPost("revoke-admin/{userId:int}")]
        public async Task<IActionResult> RevokeAdminRole(int userId)
        {
            try
            {
                var result = await _adminService.RevokeAdminRoleAsync(userId, GetCurrentUserId());
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

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var result = await _adminService.GetRolesAsync();
            return Ok(result);
        }

        [HttpPost("users/{userId:int}/roles/{roleName}")]
        public async Task<IActionResult> AssignRole(int userId, string roleName)
        {
            try
            {
                var result = await _adminService.AssignRoleAsync(userId, roleName, GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex) when (ex is InvalidOperationException || ex is ArgumentException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("users/{userId:int}/roles/{roleName}")]
        public async Task<IActionResult> RemoveRole(int userId, string roleName)
        {
            try
            {
                var result = await _adminService.RemoveRoleAsync(userId, roleName, GetCurrentUserId());
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex) when (ex is InvalidOperationException || ex is ArgumentException)
            {
                return BadRequest(new { message = ex.Message });
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

        [HttpGet("jobs")]
        public async Task<IActionResult> GetJobs([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _adminService.GetJobsAsync(search, status, page, pageSize);
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] string? type, [FromQuery] string? level, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            await _adminService.RecordActivityAsync(GetCurrentUserId(), "ViewedActivityLog", $"Viewed admin logs type={type ?? "all"}, level={level ?? "all"}", GetIpAddress());
            var result = await _adminService.GetLogsAsync(type, level, page, pageSize);
            return Ok(result);
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings([FromQuery] string? category)
        {
            var result = await _adminService.GetSettingsAsync(category);
            return Ok(result);
        }

        [HttpPost("settings")]
        public async Task<IActionResult> UpsertSetting([FromBody] UpsertPlatformSettingRequest request)
        {
            try
            {
                var result = await _adminService.UpsertSettingAsync(request, GetCurrentUserId());
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("finance/summary")]
        public async Task<IActionResult> GetFinanceSummary()
        {
            var result = await _adminService.GetFinanceSummaryAsync();
            return Ok(result);
        }

        [HttpGet("finance/withdrawals")]
        public async Task<IActionResult> GetWithdrawals([FromQuery] string? status)
        {
            var result = await _adminService.GetWithdrawalsAsync(status);
            return Ok(result);
        }

        [HttpGet("finance/refunds")]
        public async Task<IActionResult> GetRefunds([FromQuery] string? status)
        {
            var result = await _adminService.GetRefundsAsync(status);
            return Ok(result);
        }

        [HttpGet("finance/subscriptions")]
        public async Task<IActionResult> GetSubscriptions([FromQuery] string? status)
        {
            var result = await _adminService.GetSubscriptionsAsync(status);
            return Ok(result);
        }

        [HttpPost("finance/withdrawals/{id:int}/status")]
        public async Task<IActionResult> UpdateWithdrawalStatus(int id, [FromBody] UpdateAdminStatusRequest request)
        {
            try
            {
                await _adminService.UpdateWithdrawalStatusAsync(id, request.Status, GetCurrentUserId());
                return Ok(new { message = "Withdrawal status updated" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("finance/refunds/{id:int}/status")]
        public async Task<IActionResult> UpdateRefundStatus(int id, [FromBody] UpdateAdminStatusRequest request)
        {
            try
            {
                await _adminService.UpdateRefundStatusAsync(id, request.Status, GetCurrentUserId());
                return Ok(new { message = "Refund status updated" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("moderation/action")]
        public async Task<IActionResult> ModerateContent([FromBody] AdminModerationRequest request)
        {
            try
            {
                await _adminService.ModerateContentAsync(request, GetCurrentUserId());
                return Ok(new { message = "Moderation action applied" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex) when (ex is InvalidOperationException || ex is ArgumentException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("health")]
        public async Task<IActionResult> GetHealth()
        {
            var result = await _adminService.GetHealthAsync();
            return Ok(result);
        }

        [HttpGet("analytics/monthly")]
        public async Task<IActionResult> GetMonthlyAnalytics([FromQuery] int months = 6)
        {
            var result = await _adminService.GetMonthlyAnalyticsAsync(months);
            return Ok(result);
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var id))
                throw new UnauthorizedAccessException("Invalid token");

            return id;
        }

        private string? GetIpAddress()
        {
            if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
                return forwardedFor.ToString().Split(',')[0].Trim();

            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
        }
    }
}
