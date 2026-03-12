using JobMagnet.Application.DTOs.Notification;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotificationsAsync([FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            var result = await _notificationService.GetNotificationsAsync(GetUserId(), page, limit);
            return Ok(result);
        }

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadCountAsync()
        {
            var result = await _notificationService.GetUnreadCountAsync(GetUserId());
            return Ok(result);
        }

        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsReadAsync(int id)
        {
            await _notificationService.MarkAsReadAsync(GetUserId(), id);
            return Ok(new { message = "Marked as read" });
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsReadAsync()
        {
            await _notificationService.MarkAllAsReadAsync(GetUserId());
            return Ok(new { message = "All marked as read" });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteNotificationAsync(int id)
        {
            await _notificationService.DeleteNotificationAsync(GetUserId(), id);
            return NoContent();
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferencesAsync()
        {
            var result = await _notificationService.GetPreferencesAsync(GetUserId());
            return Ok(result);
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferencesAsync([FromBody] NotificationPreferencesDto preferences)
        {
            await _notificationService.UpdatePreferencesAsync(GetUserId(), preferences);
            return Ok(new { message = "Preferences updated successfully" });
        }

        [HttpPost("push/subscribe")]
        public async Task<IActionResult> SubscribePushAsync([FromBody] string deviceToken)
        {
            await _notificationService.SubscribePushAsync(GetUserId(), deviceToken);
            return Ok(new { message = "Push subscription successful" });
        }
    }
}
