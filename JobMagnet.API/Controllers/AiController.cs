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
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                throw new UnauthorizedAccessException("Invalid token claims");
            return userId;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> ChatAsync([FromBody] string prompt)
        {
            var response = await _aiService.ChatWithAiAsync(GetUserId(), prompt);
            return Ok(new { response });
        }

        [HttpPost("generate-job-description")]
        public async Task<IActionResult> GenerateJobDescriptionAsync([FromBody] AiGenerationRequest request)
        {
            var description = await _aiService.GenerateJobDescriptionAsync(request.Title, request.Requirements);
            return Ok(new { description });
        }

        [HttpPost("analyze-resume")]
        public async Task<IActionResult> AnalyzeResumeAsync([FromBody] string resumeText)
        {
            var analysis = await _aiService.AnalyzeResumeAsync(resumeText);
            return Ok(new { analysis });
        }

        [HttpPost("parse-resume")]
        public async Task<IActionResult> ParseResumeAsync([FromBody] string fileUrl)
        {
            var data = await _aiService.ParseResumeAsync(fileUrl);
            return Ok(data);
        }

        [HttpPost("match-resume-job")]
        public async Task<IActionResult> MatchResumeJobAsync([FromBody] ResumeJobMatchRequest request)
        {
            var score = await _aiService.MatchResumeJobAsync(request.ResumeText, request.JobId);
            return Ok(new { matchScore = score });
        }

        [HttpGet("recommend-jobs")]
        public async Task<IActionResult> RecommendJobsAsync()
        {
            var recommendations = await _aiService.RecommendJobsAsync(GetUserId());
            return Ok(recommendations);
        }
    }

    public class ResumeJobMatchRequest
    {
        public string ResumeText { get; set; } = string.Empty;
        public int JobId { get; set; }
    }

    public class AiGenerationRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
    }
}
