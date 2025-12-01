using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class JobSeeker
    {
        [Key]
        public int JobSeekerId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط السيرة الذاتية يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط السيرة الذاتية غير صحيحة")]
        public string? CVUrl { get; set; }
        
        [Range(0, 50, ErrorMessage = "سنوات الخبرة يجب أن تكون بين 0 و 50")]
        public int? ExperienceYears { get; set; }
        
        [StringLength(50, ErrorMessage = "نوع الوظيفة المفضل يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^(FullTime|PartTime|Contract|Freelance|Internship|Temporary)$", ErrorMessage = "نوع الوظيفة غير صالح")]
        public string? PreferredJobType { get; set; }
        
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "النبذة التعريفية يجب أن تكون بين 10 و 2000 حرف")]
        public string? Bio { get; set; }
        
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
