using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;

namespace JobMagnet.API.Services;

public class LocalStorageService : IStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly string _baseUrl;

    public LocalStorageService(
        IWebHostEnvironment env,
        IHttpContextAccessor httpContextAccessor,
        string baseUrl)
    {
        _env = env;
        _httpContextAccessor = httpContextAccessor;
        _baseUrl = baseUrl;
    }

    public async Task<string> UploadAsync(string bucketName, string fileName, Stream stream, string contentType)
    {
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var uploadsDir = Path.Combine(webRoot, "uploads", bucketName);
        if (!Directory.Exists(uploadsDir))
        {
            Directory.CreateDirectory(uploadsDir);
        }

        var filePath = Path.Combine(uploadsDir, fileName);
        using (var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, 4096, useAsync: true))
        {
            await stream.CopyToAsync(fileStream);
        }

        return GetPublicUrl(bucketName, fileName);
    }

    public Task DeleteAsync(string bucketName, string fileName)
    {
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrEmpty(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var filePath = Path.Combine(webRoot, "uploads", bucketName, fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }

    public Task<string> GetPresignedUrlAsync(string bucketName, string fileName, int expiryMinutes = 60)
    {
        // For local development storage, private files can be served directly or via the same public URL
        return Task.FromResult(GetPublicUrl(bucketName, fileName));
    }

    public string GetPublicUrl(string bucketName, string fileName)
    {
        var baseUrl = _baseUrl;
        if (string.IsNullOrEmpty(baseUrl) && _httpContextAccessor.HttpContext != null)
        {
            var request = _httpContextAccessor.HttpContext.Request;
            baseUrl = $"{request.Scheme}://{request.Host}";
        }

        if (string.IsNullOrEmpty(baseUrl))
        {
            baseUrl = "http://localhost:5024";
        }

        return $"{baseUrl.TrimEnd('/')}/uploads/{bucketName}/{fileName}";
    }
}
