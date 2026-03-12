using JobMagnet.Application.DTOs.Job;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobsController : ControllerBase
    {
        private readonly IJobService _jobService;

        public JobsController(IJobService jobService)
        {
            _jobService = jobService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        // ─── Common Job Read Endpoints ────────────────────────────────────────
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> SearchJobsAsync([FromQuery] JobSearchRequest request)
        {
            var result = await _jobService.GetJobsAsync(request);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetJobByIdAsync(int id)
        {
            try
            {
                var result = await _jobService.GetJobByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // ─── Employer Endpoints ───────────────────────────────────────────────
        [HttpPost]
        public async Task<IActionResult> CreateJobAsync([FromBody] CreateJobRequest request)
        {
            try
            {
                var result = await _jobService.CreateJobAsync(GetUserId(), request);
                return Created($"/api/jobs/{result.JobId}", result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateJobAsync(int id, [FromBody] CreateJobRequest request)
        {
            try
            {
                var result = await _jobService.UpdateJobAsync(GetUserId(), id, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteJobAsync(int id)
        {
            try
            {
                await _jobService.DeleteJobAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpGet("my-postings")]
        public async Task<IActionResult> GetMyPostingsAsync()
        {
            try
            {
                var result = await _jobService.GetMyPostingsAsync(GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> ToggleJobStatusAsync(int id, [FromBody] bool isPublished)
        {
            try
            {
                await _jobService.ToggleJobStatusAsync(GetUserId(), id, isPublished);
                return Ok(new { message = "Status updated successfully" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        // ─── Application Endpoints ────────────────────────────────────────────
        [HttpPost("{id:int}/apply")]
        public async Task<IActionResult> ApplyAsync(int id, [FromBody] ApplyToJobRequest request)
        {
            try
            {
                var result = await _jobService.ApplyAsync(GetUserId(), id, request);
                return Created("", result);
            }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpGet("applications/my")]
        public async Task<IActionResult> GetMyApplicationsAsync()
        {
            var result = await _jobService.GetMyApplicationsAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("{id:int}/applications")]
        public async Task<IActionResult> GetJobApplicationsAsync(int id)
        {
            try
            {
                var result = await _jobService.GetJobApplicationsAsync(GetUserId(), id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpPut("applications/{applicationId:int}/status")]
        public async Task<IActionResult> UpdateApplicationStatusAsync(int applicationId, [FromBody] string status)
        {
            try
            {
                await _jobService.UpdateApplicationStatusAsync(GetUserId(), applicationId, status);
                return Ok(new { message = "Status updated successfully" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpDelete("applications/{applicationId:int}")]
        public async Task<IActionResult> WithdrawApplicationAsync(int applicationId)
        {
            try
            {
                await _jobService.WithdrawApplicationAsync(GetUserId(), applicationId);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // ─── Saved Jobs Endpoints ─────────────────────────────────────────────
        [HttpPost("{id:int}/save")]
        public async Task<IActionResult> SaveJobAsync(int id)
        {
            try
            {
                await _jobService.SaveJobAsync(GetUserId(), id);
                return Ok(new { message = "Job saved successfully" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpDelete("{id:int}/save")]
        public async Task<IActionResult> UnsaveJobAsync(int id)
        {
            try
            {
                await _jobService.UnsaveJobAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpGet("saved")]
        public async Task<IActionResult> GetSavedJobsAsync()
        {
            var result = await _jobService.GetSavedJobsAsync(GetUserId());
            return Ok(result);
        }

        [HttpGet("recommended")]
        public async Task<IActionResult> GetRecommendedJobsAsync()
        {
            var result = await _jobService.GetRecommendedJobsAsync(GetUserId());
            return Ok(result);
        }
    }
}
