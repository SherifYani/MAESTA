using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class JobApplication
    {
        [Key]
        public int JobApplicationId { get; set; }
        
        [Required(ErrorMessage = "معرف الوظيفة مطلوب")]
        public int JobId { get; set; }
        
        [Required(ErrorMessage = "معرف الباحث عن عمل مطلوب")]
        public int JobSeekerId { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط السيرة الذاتية يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط السيرة الذاتية غير صحيحة")]
        public string? ResumeUrl { get; set; }
        
        [StringLength(2000, ErrorMessage = "خطاب التغطية يجب ألا يتجاوز 2000 حرف")]
        public string? CoverLetter { get; set; }
        
        [Required(ErrorMessage = "حالة التقديم مطلوبة")]
        [StringLength(50, ErrorMessage = "حالة التقديم يجب ألا تتجاوز 50 حرف")]
        [RegularExpression(@"^(Pending|Reviewed|Shortlisted|Interviewed|Accepted|Rejected|Withdrawn)$", ErrorMessage = "حالة التقديم غير صالحة")]
        public string Status { get; set; }
        
        public DateTimeOffset AppliedAt { get; set; }
        
        public bool IsDeleted { get; set; }
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("JobId")]
        public Job? Job { get; set; }

    }


}
