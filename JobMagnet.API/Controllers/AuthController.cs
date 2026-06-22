using JobMagnet.Application.DTOs.Auth;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ─── Step 1: Basic Info (Email, Password, Name, …) ───────────────────────
        /// <summary>
        /// المرحلة الأولى من التسجيل: البيانات الأساسية للمستخدم
        /// يُعيد Access Token مؤقت وRefresh Token لاستكمال المرحلة الثانية
        /// </summary>
        [HttpPost("register/step1")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterStep1([FromBody] RegisterStep1Request request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var response = await _authService.RegisterStep1Async(request, ipAddress);
                return Ok(response);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─── Step 2: User Type + Role-Specific Info ──────────────────────────────
        /// <summary>
        /// المرحلة الثانية من التسجيل: اختيار نوع المستخدم وبياناته الوظيفية
        /// يتطلب التوكن من المرحلة الأولى
        /// </summary>
        [HttpPost("register/step2")]
        [Authorize]
        public async Task<IActionResult> RegisterStep2([FromBody] RegisterStep2Request request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var response = await _authService.RegisterStep2Async(userId, request);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─── Email Verification ──────────────────────────────────────────────────
        [HttpPost("verify-email")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            try
            {
                await _authService.VerifyEmailAsync(request);
                return Ok(new { message = "Email verified successfully" });
            }
            catch (Exception ex) when (ex is ArgumentException || ex is InvalidOperationException || ex is KeyNotFoundException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("resend-verification")]
        [AllowAnonymous]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
        {
            try
            {
                await _authService.ResendVerificationAsync(request);
                return Ok(new { message = "Verification code sent if the email exists and is unverified" });
            }
            catch (Exception ex) when (ex is InvalidOperationException || ex is KeyNotFoundException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─── Password Reset ──────────────────────────────────────────────────────
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            await _authService.ForgotPasswordAsync(request);
            return Ok(new { message = "If the email is registered, a reset code has been sent." });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request);
                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex) when (ex is ArgumentException || ex is KeyNotFoundException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ─── Two-Factor Authentication ───────────────────────────────────────────
        [HttpPost("enable-2fa")]
        [Authorize]
        public async Task<IActionResult> Enable2fa()
        {
            try
            {
                var userId = GetCurrentUserId();
                var response = await _authService.Enable2faAsync(userId);
                return response.Success ? Ok(response) : BadRequest(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost("disable-2fa")]
        [Authorize]
        public async Task<IActionResult> Disable2fa()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _authService.Disable2faAsync(userId);
                return Ok(new { message = "2FA disabled successfully" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPost("verify-2fa")]
        [AllowAnonymous]
        public async Task<IActionResult> Verify2fa([FromBody] Verify2faRequest request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var response = await _authService.Verify2faAsync(request, ipAddress);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ─── Login ───────────────────────────────────────────────────────────────
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var response = await _authService.LoginAsync(request, ipAddress);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ─── Refresh Token ─────────────────────────────────────────────────────
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshRequest request)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var response = await _authService.RefreshTokenAsync(request, ipAddress);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ─── Logout (single device) ───────────────────────────────────────────
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _authService.LogoutAsync(userId, request.RefreshToken);
                return Ok(new { message = "Logged out successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        // ─── Logout All Devices ──────────────────────────────────────────────
        [HttpPost("logout-all")]
        [Authorize]
        public async Task<IActionResult> LogoutAll()
        {
            var userId = GetCurrentUserId();
            var revokedCount = await _authService.LogoutAllAsync(userId);
            return Ok(new { message = $"Logged out from {revokedCount} device(s)" });
        }

        // ─── Current User Profile ─────────────────────────────────────────────
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _authService.GetCurrentUserProfileAsync(userId);
                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ─── Helper ─────────────────────────────────────────────────────────
        [HttpPost("login-google")]
        [AllowAnonymous]
        public async Task<IActionResult> LoginGoogle([FromBody] string token)
        {
            try { var result = await _authService.LoginGoogleAsync(token, GetIpAddress()); return Ok(result); }
            catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
        }

        [HttpPost("login-linkedin")]
        [AllowAnonymous]
        public async Task<IActionResult> LoginLinkedIn([FromBody] string token)
        {
            try { var result = await _authService.LoginLinkedInAsync(token, GetIpAddress()); return Ok(result); }
            catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
        }

        [HttpGet("activate")]
        [AllowAnonymous]
        public async Task<IActionResult> Activate([FromQuery] string email, [FromQuery] string code)
        {
            try { await _authService.VerifyEmailAsync(new VerifyEmailRequest { Email = email, Code = code }); return Ok(new { message = "Account activated successfully" }); }
            catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
        }

        private string? GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For")) return Request.Headers["X-Forwarded-For"];
            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString();
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
