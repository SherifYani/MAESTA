using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Freelancer
    {
        [Key]
        public int FreelancerId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        public int? FreelancerLevelId { get; set; }
        
        [Range(0.01, 100000, ErrorMessage = "السعر بالساعة يجب أن يكون بين 0.01 و 100000")]
        public decimal? HourlyRate { get; set; }
        
        [StringLength(10, ErrorMessage = "العملة يجب ألا تتجاوز 10 أحرف")]
        [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "العملة يجب أن تكون رمز ISO 4217 (مثل: USD, EGP, SAR)")]
        public string? Currency { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "عدد المشاريع المكتملة يجب أن يكون موجب")]
        public int TotalCompletedProjects { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط معرض الأعمال يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط معرض الأعمال غير صحيحة")]
        public string? PortfolioUrl { get; set; }
        
        [StringLength(2000, ErrorMessage = "النبذة التعريفية يجب ألا تتجاوز 2000 حرف")]
        [MinLength(10, ErrorMessage = "النبذة التعريفية يجب أن تكون 10 أحرف على الأقل")]
        public string? Bio { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط وثيقة التحقق يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط وثيقة التحقق غير صحيحة")]
        public string? DocumentVerificationUrl { get; set; }
        
        public bool IsVerified { get; set; }
        
        public DateTimeOffset? LastActiveAt { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
