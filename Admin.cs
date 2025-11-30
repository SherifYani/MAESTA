using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Admin
    {
        [Key]
        public int AdminId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "مستوى الصلاحيات مطلوب")]
        [Range(1, 10, ErrorMessage = "مستوى الصلاحيات يجب أن يكون بين 1 و 10")]
        public byte AdminLevel { get; set; }
        
        [StringLength(5000, ErrorMessage = "صلاحيات JSON يجب ألا تتجاوز 5000 حرف")]
        public string? PermissionsJson { get; set; }
        
        [StringLength(1000, ErrorMessage = "الملاحظات يجب ألا تتجاوز 1000 حرف")]
        public string? Notes { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
