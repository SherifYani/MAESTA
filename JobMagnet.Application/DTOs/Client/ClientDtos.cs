using System;
using System.ComponentModel.DataAnnotations;

namespace JobMagnet.Application.DTOs.Client
{
    public class ClientProfileResponse
    {
        public int ClientId { get; set; }
        public int UserId { get; set; }
        public string? LegalName { get; set; }
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
        public string? Website { get; set; }
        public string? IdentityDocumentUrl { get; set; }
        public bool IsVerified { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class UpdateClientProfileRequest
    {
        [StringLength(200, ErrorMessage = "الاسم القانوني يجب ألا يتجاوز 200 حرف")]
        public string? LegalName { get; set; }
        
        [StringLength(20, ErrorMessage = "رقم الهاتف يجب ألا يتجاوز 20 حرف")]
        [RegularExpression(@"^\+?[0-9]{10,15}$", ErrorMessage = "صيغة رقم الهاتف غير صحيحة")]
        public string? ContactPhone { get; set; }
        
        [StringLength(500, ErrorMessage = "العنوان يجب ألا يتجاوز 500 حرف")]
        public string? Address { get; set; }

        [StringLength(200, ErrorMessage = "الموقع الإلكتروني يجب ألا يتجاوز 200 حرف")]
        [Url(ErrorMessage = "صيغة الموقع الإلكتروني غير صحيحة")]
        public string? Website { get; set; }

        [StringLength(500, ErrorMessage = "رابط وثيقة الهوية يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط وثيقة الهوية غير صحيحة")]
        public string? IdentityDocumentUrl { get; set; }
    }
}
