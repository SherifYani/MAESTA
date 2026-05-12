using JobMagnet.Application.Interfaces;
using JobMagnet.Application.Settings;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace JobMagnet.API.Services;

public class MinioStorageService : IStorageService
{
    private readonly IMinioClient _minio;
    private readonly MinioOptions _options;

    public MinioStorageService(IMinioClient minio, IOptions<MinioOptions> options)
    {
        _minio = minio;
        _options = options.Value;
    }

    // ─── Upload ──────────────────────────────────────────────────────────────
    public async Task<string> UploadAsync(
        string bucketName, string fileName, Stream stream, string contentType)
    {
        // تأكد إن الـ bucket موجودة
        var bucketExists = await _minio.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(bucketName));

        if (!bucketExists)
        {
            await _minio.MakeBucketAsync(
                new MakeBucketArgs().WithBucket(bucketName));
        }

        await _minio.PutObjectAsync(new PutObjectArgs()
            .WithBucket(bucketName)
            .WithObject(fileName)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(contentType));

        return GetPublicUrl(bucketName, fileName);
    }

    // ─── Delete ──────────────────────────────────────────────────────────────
    public async Task DeleteAsync(string bucketName, string fileName)
    {
        await _minio.RemoveObjectAsync(new RemoveObjectArgs()
            .WithBucket(bucketName)
            .WithObject(fileName));
    }

    // ─── Presigned URL (للملفات الخاصة مثل: السيرة الذاتية) ─────────────────
    public async Task<string> GetPresignedUrlAsync(
        string bucketName, string fileName, int expiryMinutes = 60)
    {
        var url = await _minio.PresignedGetObjectAsync(new PresignedGetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(fileName)
            .WithExpiry(expiryMinutes * 60));

        return url;
    }

    // ─── Public URL (للملفات العامة مثل: الصور والشعارات) ───────────────────
    public string GetPublicUrl(string bucketName, string fileName)
    {
        var protocol = _options.UseSSL ? "https" : "http";
        return $"{protocol}://{_options.PublicEndpoint}/{bucketName}/{fileName}";
    }
}
