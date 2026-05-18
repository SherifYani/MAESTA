using JobMagnet.Application.DTOs.Gig;
using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GigsController : ControllerBase
    {
        private readonly IGigService _gigService;

        public GigsController(IGigService gigService)
        {
            _gigService = gigService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        // ─── Gigs ─────────────────────────────────────────────────────────────
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetGigsAsync([FromQuery] int page = 1, [FromQuery] int limit = 20)
        {
            var result = await _gigService.GetGigsAsync(page, limit);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetGigByIdAsync(int id)
        {
            try
            {
                var result = await _gigService.GetGigByIdAsync(id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        [HttpPost]
        public async Task<IActionResult> CreateGigAsync([FromBody] CreateGigRequest request)
        {
            try
            {
                var result = await _gigService.CreateGigAsync(GetUserId(), request);
                return Created($"/api/gigs/{result.ProjectId}", result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateGigAsync(int id, [FromBody] CreateGigRequest request)
        {
            try
            {
                var result = await _gigService.UpdateGigAsync(GetUserId(), id, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteGigAsync(int id)
        {
            try
            {
                await _gigService.DeleteGigAsync(GetUserId(), id);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpGet("my-gigs")]
        public async Task<IActionResult> GetMyGigsAsync()
        {
            try
            {
                var result = await _gigService.GetMyGigsAsync(GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        // ─── Proposals ────────────────────────────────────────────────────────
        [HttpPost("{id:int}/proposals")]
        public async Task<IActionResult> SubmitProposalAsync(int id, [FromBody] SubmitProposalRequest request)
        {
            try
            {
                var result = await _gigService.SubmitProposalAsync(GetUserId(), id, request);
                return Created("", result);
            }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpGet("proposals/my")]
        public async Task<IActionResult> GetMyProposalsAsync()
        {
            try
            {
                var result = await _gigService.GetMyProposalsAsync(GetUserId());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpGet("{id:int}/proposals")]
        public async Task<IActionResult> GetGigProposalsAsync(int id)
        {
            try
            {
                var result = await _gigService.GetGigProposalsAsync(GetUserId(), id);
                return Ok(result);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpPut("proposals/{proposalId:int}/status")]
        public async Task<IActionResult> UpdateProposalStatusAsync(int proposalId, [FromBody] string status)
        {
            try
            {
                await _gigService.UpdateProposalStatusAsync(GetUserId(), proposalId, status);
                return Ok(new { message = "Status updated successfully" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }

        [HttpDelete("proposals/{proposalId:int}")]
        public async Task<IActionResult> WithdrawProposalAsync(int proposalId)
        {
            try
            {
                await _gigService.WithdrawProposalAsync(GetUserId(), proposalId);
                return NoContent();
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (UnauthorizedAccessException ex) { return Forbid(ex.Message); }
        }
    }
}
