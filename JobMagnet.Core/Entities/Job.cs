using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Job
    {
        [Key]
        public int JobId { get; set; }
        
        [Required(ErrorMessage = "معرف الناشر مطلوب")]
        public int PostedByUserId { get; set; }
        
        [Required(ErrorMessage = "عنوان الوظيفة مطلوب")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "عنوان الوظيفة يجب أن يكون بين 5 و 200 حرف")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "وصف الوظيفة مطلوب")]
        [StringLength(5000, MinimumLength = 20, ErrorMessage = "وصف الوظيفة يجب أن يكون بين 20 و 5000 حرف")]
        public string Description { get; set; }
        
        [StringLength(200, ErrorMessage = "الموقع يجب ألا يتجاوز 200 حرف")]
        public string? Location { get; set; }
        
        [StringLength(50, ErrorMessage = "نوع الوظيفة يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^(FullTime|PartTime|Contract|Freelance|Internship|Temporary)$", ErrorMessage = "نوع الوظيفة غير صالح")]
        public string? Type { get; set; }
        
        [Range(0, 1000000000, ErrorMessage = "الحد الأدنى للراتب يجب أن يكون بين 0 و 1,000,000,000")]
        public decimal? MinSalary { get; set; }
        
        [Range(0, 1000000000, ErrorMessage = "الحد الأقصى للراتب يجب أن يكون بين 0 و 1,000,000,000")]
        public decimal? MaxSalary { get; set; }
        
        public bool IsActive { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("PostedByUserId")]
        public User? User { get; set; }

    }


}
