using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Project
    {
        [Key]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "معرف مالك المشروع مطلوب")]
        public int OwnerUserId { get; set; }
        
        public int? AssignedFreelancerId { get; set; }
        
        [Required(ErrorMessage = "عنوان المشروع مطلوب")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "عنوان المشروع يجب أن يكون بين 5 و 200 حرف")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "وصف المشروع مطلوب")]
        [StringLength(5000, MinimumLength = 20, ErrorMessage = "وصف المشروع يجب أن يكون بين 20 و 5000 حرف")]
        public string Description { get; set; }
        
        [Required(ErrorMessage = "ميزانية المشروع مطلوبة")]
        [Range(0.01, 10000000, ErrorMessage = "ميزانية المشروع يجب أن تكون بين 0.01 و 10,000,000")]
        public decimal Budget { get; set; }
        
        [Required(ErrorMessage = "حالة المشروع مطلوبة")]
        [StringLength(50, ErrorMessage = "حالة المشروع يجب ألا تتجاوز 50 حرف")]
        [RegularExpression(@"^(Draft|Open|InProgress|Completed|Cancelled|Disputed)$", ErrorMessage = "حالة المشروع غير صالحة")]
        public string Status { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("OwnerUserId")]
        public User? User { get; set; }

        [ForeignKey("AssignedFreelancerId")]
        public Freelancer? Freelancer { get; set; }

    }


}
