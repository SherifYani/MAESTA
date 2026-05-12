namespace JobMagnet.Application.Settings;

public class MinioOptions
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public bool UseSSL { get; set; } = false;

    /// <summary>
    /// الـ URL الخارجي الذي سيُستخدم في الـ links المُعادَة للـ Frontend
    /// مثال: http://localhost:9000
    /// </summary>
    public string PublicEndpoint { get; set; } = string.Empty;

    public MinioBuckets Buckets { get; set; } = new();
}

public class MinioBuckets
{
    public string Avatars { get; set; } = "avatars";
    public string Resumes { get; set; } = "resumes";
    public string CompanyLogos { get; set; } = "company-logos";
    public string CompanyDocuments { get; set; } = "company-documents";
    public string Portfolio { get; set; } = "portfolio";
    public string ProjectFiles { get; set; } = "project-files";
    public string ChatAttachments { get; set; } = "chat-attachments";
}
