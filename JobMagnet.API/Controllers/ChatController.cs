using JobMagnet.Application.DTOs.Chat;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversationsAsync()
        {
            var result = await _chatService.GetMyConversationsAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("messages/{otherUserId:int}")]
        public async Task<IActionResult> GetMessagesAsync(int otherUserId)
        {
            var result = await _chatService.GetChatMessagesAsync(GetUserId(), otherUserId);
            return Ok(result);
        }

        [HttpPost("messages")]
        public async Task<IActionResult> SendMessageAsync([FromBody] SendMessageRequest request)
        {
            try
            {
                var result = await _chatService.SendMessageAsync(GetUserId(), request);
                return Created("", result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("messages/{senderId:int}/read")]
        public async Task<IActionResult> MarkMessagesAsReadAsync(int senderId)
        {
            await _chatService.MarkMessagesAsReadAsync(GetUserId(), senderId);
            return Ok(new { message = "Messages marked as read" });
        }

        [HttpDelete("messages/{messageId:int}")]
        public async Task<IActionResult> DeleteMessageAsync(int messageId)
        {
            try
            {
                await _chatService.DeleteMessageAsync(GetUserId(), messageId);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPost("block")]
        public async Task<IActionResult> BlockUserAsync([FromBody] BlockUserRequest request)
        {
            await _chatService.BlockUserAsync(GetUserId(), request.UserId, request.Reason ?? "");
            return Ok(new { message = "User blocked successfully" });
        }

        [HttpPost("conversations/{otherUserId:int}/report")]
        public async Task<IActionResult> ReportConversationAsync(int otherUserId, [FromBody] ReportConversationRequest request)
        {
            await _chatService.ReportConversationAsync(GetUserId(), otherUserId, request.Reason, request.Details ?? "");
            return Ok(new { message = "Conversation reported successfully" });
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchMessagesAsync([FromQuery] string q)
        {
            var result = await _chatService.SearchMessagesAsync(GetUserId(), q);
            return Ok(result);
        }

        [HttpPost("conversations/{otherUserId:int}/archive")]
        public async Task<IActionResult> ArchiveConversationAsync(int otherUserId)
        {
            await _chatService.ArchiveConversationAsync(GetUserId(), otherUserId);
            return Ok(new { message = "Conversation archived" });
        }

        [HttpPost("conversations/{otherUserId:int}/unarchive")]
        public async Task<IActionResult> UnarchiveConversationAsync(int otherUserId)
        {
            await _chatService.UnarchiveConversationAsync(GetUserId(), otherUserId);
            return Ok(new { message = "Conversation unarchived" });
        }

        [HttpPost("conversations/{otherUserId:int}/typing")]
        public async Task<IActionResult> UpdateTypingStatusAsync(int otherUserId, [FromQuery] bool isTyping)
        {
            await _chatService.UpdateTypingStatusAsync(GetUserId(), otherUserId, isTyping);
            return Ok();
        }

        [HttpGet("blocked")]
        public async Task<IActionResult> GetBlockedUsersAsync()
        {
            var blocked = await _chatService.GetBlockedUsersAsync(GetUserId());
            return Ok(blocked);
        }
    }
}
