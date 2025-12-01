using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class ActivityLog
    {
        [Key]
        public int ActivityId { get; set; }
        
        public int? UserId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Action { get; set; }
        
        [StringLength(2000)]
        public string? Details { get; set; }
        
        [StringLength(45)]
        [RegularExpression(@"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4})$")]
        public string? IpAddress { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
