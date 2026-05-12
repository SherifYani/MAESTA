using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobMagnet.Infrastructure.Data;
using JobMagnet.Domain.Entities;
using System.Security.Claims;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly JobMagnetDbContext _context;

        public ReportsController(JobMagnetDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReportAsync([FromBody] CreateReportRequest request)
        {
            var userId = GetUserId();

            var report = new Report
            {
                ReportedBy = userId,
                EntityId = request.TargetId,
                EntityType = request.TargetType,
                Reason = request.Reason,
                Details = request.Description,
                Status = "Pending",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();

            return Created("", new { reportId = report.ReportId });
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdStr, out int userId)) return userId;
            return 0;
        }
    }

    public class CreateReportRequest
    {
        public int TargetId { get; set; }
        public string TargetType { get; set; } = string.Empty; // e.g., "Job", "User", "Post", "Conversation"
        public string Reason { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
