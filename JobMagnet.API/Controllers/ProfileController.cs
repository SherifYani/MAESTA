using JobMagnet.Application.DTOs.Auth;
using JobMagnet.Application.DTOs.Profile;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly IAuthService _authService;

        public ProfileController(IProfileService profileService, IAuthService authService)
        {
            _profileService = profileService;
            _authService = authService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfileAsync()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(new { message = "Invalid token claims" });

            try
            {
                var result = await _profileService.GetUserProfileAsync(userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetProfileByIdAsync(int userId)
        {
            try
            {
                var result = await _profileService.GetProfileByIdAsync(userId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfileAsync([FromBody] UpdateProfileRequest request)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(new { message = "Invalid token claims" });

            try
            {
                var result = await _profileService.UpdateProfileAsync(userId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(new { message = "Invalid token claims" });

            try
            {
                await _authService.ChangePasswordAsync(userId, request);
                return Ok(new { message = "Password updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetActiveSessions()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(new { message = "Invalid token claims" });

            // We can't easily get the refresh token from here unless it was sent in a header or cookie.
            // For now, we return all active sessions. 
            var sessions = await _authService.GetActiveSessionsAsync(userId, ""); 
            return Ok(sessions);
        }

        [HttpDelete("me")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(new { message = "Invalid token claims" });

            try
            {
                await _authService.DeleteAccountAsync(userId);
                return Ok(new { message = "Account deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("me/settings")]
        public async Task<IActionResult> GetMySettingsAsync()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(new { message = "Invalid token claims" });

            return Ok(await _profileService.GetUserSettingsAsync(userId));
        }

        [HttpPut("me/settings")]
        public async Task<IActionResult> UpdateMySettingsAsync([FromBody] UpdateUserSettingsRequest request)
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized(new { message = "Invalid token claims" });

            return Ok(await _profileService.UpdateUserSettingsAsync(userId, request));
        }
    }
}
