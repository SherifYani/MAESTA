using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication to upload/delete files
    public class FilesController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly ILogger<FilesController> _logger;

        // Allowed buckets to prevent arbitrary bucket creation
        private readonly string[] _allowedBuckets = { "avatars", "resumes", "portfolios", "documents" };

        public FilesController(IStorageService storageService, ILogger<FilesController> logger)
        {
            _storageService = storageService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] string bucketName)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "File is empty or missing." });

            if (string.IsNullOrWhiteSpace(bucketName) || !_allowedBuckets.Contains(bucketName.ToLower()))
                return BadRequest(new { message = $"Invalid bucket name. Allowed buckets: {string.Join(", ", _allowedBuckets)}" });

            try
            {
                // Generate a unique filename to prevent overwriting
                var fileName = $"{Guid.NewGuid()}_{file.FileName}";
                
                using var stream = file.OpenReadStream();
                var url = await _storageService.UploadAsync(bucketName.ToLower(), fileName, stream, file.ContentType);

                return Ok(new { Url = url, FileName = fileName, BucketName = bucketName.ToLower() });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file.");
                return StatusCode(500, new { message = "An error occurred while uploading the file." });
            }
        }

        [HttpDelete("{bucketName}/{fileName}")]
        public async Task<IActionResult> DeleteFile(string bucketName, string fileName)
        {
            if (string.IsNullOrWhiteSpace(bucketName) || !_allowedBuckets.Contains(bucketName.ToLower()))
                return BadRequest(new { message = $"Invalid bucket name. Allowed buckets: {string.Join(", ", _allowedBuckets)}" });

            if (string.IsNullOrWhiteSpace(fileName))
                return BadRequest(new { message = "File name is missing." });

            try
            {
                await _storageService.DeleteAsync(bucketName.ToLower(), fileName);
                return Ok(new { message = "File deleted successfully or did not exist." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file.");
                return StatusCode(500, new { message = "An error occurred while deleting the file." });
            }
        }

        [HttpGet("presigned")]
        public async Task<IActionResult> GetPresignedUrl([FromQuery] string bucketName, [FromQuery] string fileName, [FromQuery] int expiryMinutes = 60)
        {
            if (string.IsNullOrWhiteSpace(bucketName) || !_allowedBuckets.Contains(bucketName.ToLower()))
                return BadRequest(new { message = $"Invalid bucket name. Allowed buckets: {string.Join(", ", _allowedBuckets)}" });

            if (string.IsNullOrWhiteSpace(fileName))
                return BadRequest(new { message = "File name is missing." });

            try
            {
                var url = await _storageService.GetPresignedUrlAsync(bucketName.ToLower(), fileName, expiryMinutes);
                return Ok(new { PresignedUrl = url, ExpiresInMinutes = expiryMinutes });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating presigned url.");
                return StatusCode(500, new { message = "An error occurred while generating the presigned url." });
            }
        }
    }
}
