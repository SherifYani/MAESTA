using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Review
    {
        [Key]
        public int ReviewId { get; set; }
        
        [Required(ErrorMessage = "معرف المراجع مطلوب")]
        public int ReviewerId { get; set; }
        
        [StringLength(50, ErrorMessage = "دور المراجع يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^(Freelancer|Employer|Client|JobSeeker)$", ErrorMessage = "دور المراجع غير صالح")]
        public string? ReviewerRole { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم المستهدف مطلوب")]
        public int TargetUserId { get; set; }
        
        [StringLength(50, ErrorMessage = "دور المستهدف يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^(Freelancer|Employer|Client|JobSeeker)$", ErrorMessage = "دور المستهدف غير صالح")]
        public string? TargetRole { get; set; }
        
        [Required(ErrorMessage = "التعليق مطلوب")]
        [StringLength(2000, MinimumLength = 5, ErrorMessage = "التعليق يجب أن يكون بين 5 و 2000 حرف")]
        public string Comment { get; set; }
        
        [Required(ErrorMessage = "قيمة التقييم مطلوبة")]
        [Range(1, 5, ErrorMessage = "قيمة التقييم يجب أن تكون بين 1 و 5")]
        public byte RatingValue { get; set; }
        
        [StringLength(100, ErrorMessage = "نوع السياق يجب ألا يتجاوز 100 حرف")]
        [RegularExpression(@"^(Project|Job|Contract|Proposal)$", ErrorMessage = "نوع السياق غير صالح")]
        public string? ContextEntity { get; set; }
        
        public int? ContextEntityId { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public bool IsDeleted { get; set; }
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("TargetUserId")]
        public User? User { get; set; }

    }


}
