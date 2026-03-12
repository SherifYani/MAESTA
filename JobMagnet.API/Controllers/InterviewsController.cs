using JobMagnet.Application.DTOs.Interview;
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
    public class InterviewsController : ControllerBase
    {
        private readonly IInterviewService _interviewService;

        public InterviewsController(IInterviewService interviewService)
        {
            _interviewService = interviewService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        private string GetUserRole()
        {
            return User.FindFirst(ClaimTypes.Role)?.Value ?? "JobSeeker";
        }

        [HttpGet]
        public async Task<IActionResult> GetMyInterviewsAsync([FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            var result = await _interviewService.GetMyInterviewsAsync(GetUserId(), GetUserRole(), page, limit);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetInterviewByIdAsync(int id)
        {
            try
            {
                var result = await _interviewService.GetInterviewByIdAsync(GetUserId(), id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPost("schedule")]
        public async Task<IActionResult> ScheduleInterviewAsync([FromBody] ScheduleInterviewRequest request)
        {
            try
            {
                var result = await _interviewService.ScheduleInterviewAsync(GetUserId(), request);
                return CreatedAtAction(nameof(GetInterviewByIdAsync), new { id = result.InterviewId }, result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException) { return Forbid(); }
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatusAsync(int id, [FromBody] UpdateInterviewStatusRequest request)
        {
            try
            {
                var result = await _interviewService.UpdateStatusAsync(GetUserId(), id, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPut("{id:int}/reschedule")]
        public async Task<IActionResult> RescheduleAsync(int id, [FromBody] RescheduleInterviewRequest request)
        {
            try
            {
                var result = await _interviewService.RescheduleAsync(GetUserId(), id, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteInterviewAsync(int id)
        {
            try
            {
                await _interviewService.DeleteInterviewAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }
    }
}
