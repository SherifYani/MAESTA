using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Tag
    {
        [Key]
        public int TagId { get; set; }
        
        [Required(ErrorMessage = "اسم الوسم مطلوب")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "اسم الوسم يجب أن يكون بين 2 و 50 حرف")]
        public string Name { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
