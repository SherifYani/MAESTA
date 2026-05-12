using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Role
    {
        [Key]
        public int RoleId { get; set; }
        
        [Required(ErrorMessage = "اسم الدور مطلوب")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "اسم الدور يجب أن يكون بين 2 و 50 حرف")]
        public string RoleName { get; set; }
        
        [StringLength(500, ErrorMessage = "الوصف يجب ألا يتجاوز 500 حرف")]
        public string? Description { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
