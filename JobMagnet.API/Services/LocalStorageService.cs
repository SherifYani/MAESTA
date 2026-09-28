using JobMagnet.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace JobMagnet.API.Services;

/// <summary>
/// خدمة تخزين الملفات محلياً في مجلد "secret"
/// بديل للـ MinIO للتطوير المحلي بدون Docker
/// </summary>
public class LocalStorageService : IStorageService
{
    private readonly string _baseDirectory;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public LocalStorageService(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor)
    {
        _baseDirectory = Path.Combine(env.ContentRootPath, "secret");
        if (!Directory.Exists(_baseDirectory))
            Directory.CreateDirectory(_baseDirectory);

        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<string> UploadAsync(string bucketName, string fileName, Stream stream, string contentType)
    {
        var bucketPath = Path.Combine(_baseDirectory, bucketName);
        if (!Directory.Exists(bucketPath))
            Directory.CreateDirectory(bucketPath);

        var filePath = Path.Combine(bucketPath, fileName);
        using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await stream.CopyToAsync(fileStream);

        return GetPublicUrl(bucketName, fileName);
    }

    public Task DeleteAsync(string bucketName, string fileName)
    {
        var filePath = Path.Combine(_baseDirectory, bucketName, fileName);
        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }

    public Task<string> GetPresignedUrlAsync(string bucketName, string fileName, int expiryMinutes = 60)
    {
        // Local storage لا يدعم presigned URLs — نرجع الـ public URL
        return Task.FromResult(GetPublicUrl(bucketName, fileName));
    }

    public string GetPublicUrl(string bucketName, string fileName)
    {
        var request = _httpContextAccessor.HttpContext?.Request;
        if (request is not null)
        {
            var baseUrl = $"{request.Scheme}://{request.Host}";
            return $"{baseUrl}/secret/{bucketName}/{fileName}";
        }
        return $"/secret/{bucketName}/{fileName}";
    }
}
