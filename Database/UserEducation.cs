using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserEducation
    {
        [Key]
        public int EducationId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "الدرجة العلمية مطلوبة")]
        [StringLength(100, MinimumLength = 2)]
        public string Degree { get; set; }
        
        [Required(ErrorMessage = "اسم المؤسسة مطلوب")]
        [StringLength(200, MinimumLength = 2)]
        public string Institution { get; set; }
        
        [StringLength(100)]
        public string? FieldOfStudy { get; set; }
        
        public DateTimeOffset? StartDate { get; set; }
        
        public DateTimeOffset? EndDate { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
