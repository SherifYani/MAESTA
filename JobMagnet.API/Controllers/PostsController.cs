using JobMagnet.Application.DTOs.Community;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostsController(IPostService postService)
        {
            _postService = postService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetFeedAsync([FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            var result = await _postService.GetFeedAsync(GetUserId(), page, limit);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPostDetailsAsync(int id)
        {
            try
            {
                var result = await _postService.GetPostDetailsAsync(GetUserId(), id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPost]
        public async Task<IActionResult> CreatePostAsync([FromBody] CreatePostRequest request)
        {
            var result = await _postService.CreatePostAsync(GetUserId(), request);
            return CreatedAtAction(nameof(GetPostDetailsAsync), new { id = result.CommunityPostId }, result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePostAsync(int id)
        {
            try
            {
                await _postService.DeletePostAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPost("{id:int}/like")]
        public async Task<IActionResult> ToggleLikePostAsync(int id)
        {
            var liked = await _postService.ToggleLikePostAsync(GetUserId(), id);
            return Ok(new { liked, message = liked ? "Post liked" : "Post unliked" });
        }

        [HttpGet("{id:int}/comments")]
        public async Task<IActionResult> GetCommentsAsync(int id)
        {
            var result = await _postService.GetPostCommentsAsync(id);
            return Ok(result);
        }

        [HttpPost("{id:int}/comments")]
        public async Task<IActionResult> AddCommentAsync(int id, [FromBody] CreateCommentRequest request)
        {
            var result = await _postService.AddCommentAsync(GetUserId(), id, request);
            return Ok(result);
        }

        [HttpPost("{id:int}/report")]
        public async Task<IActionResult> ReportPostAsync(int id, [FromBody] ReportPostRequest request)
        {
            await _postService.ReportPostAsync(GetUserId(), id, request.Reason, request.Details ?? "");
            return Ok(new { message = "Post reported successfully" });
        }
    }
}
