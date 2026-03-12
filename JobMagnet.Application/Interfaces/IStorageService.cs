namespace JobMagnet.Application.Interfaces;

/// <summary>
/// خدمة رفع وتحميل الملفات (File Storage)
/// الـ Implementation: MinIO (S3-compatible)
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// رفع ملف إلى bucket معين
    /// </summary>
    /// <param name="bucketName">اسم الـ bucket (مثل: "avatars", "resumes")</param>
    /// <param name="fileName">الاسم الجديد للملف في الـ storage</param>
    /// <param name="stream">محتوى الملف</param>
    /// <param name="contentType">نوع الملف (مثل: "image/jpeg", "application/pdf")</param>
    /// <returns>الـ URL الكامل للملف بعد الرفع</returns>
    Task<string> UploadAsync(string bucketName, string fileName, Stream stream, string contentType);

    /// <summary>
    /// حذف ملف من الـ storage
    /// </summary>
    Task DeleteAsync(string bucketName, string fileName);

    /// <summary>
    /// الحصول على Presigned URL مؤقت لتحميل ملف خاص (مثل: السيرة الذاتية)
    /// </summary>
    Task<string> GetPresignedUrlAsync(string bucketName, string fileName, int expiryMinutes = 60);

    /// <summary>
    /// الحصول على الـ URL العام للملف (للـ buckets العامة مثل: avatars, logos)
    /// </summary>
    string GetPublicUrl(string bucketName, string fileName);
}
