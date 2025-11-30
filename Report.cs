using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Report
    {
        [Key]
        public int ReportId { get; set; }
        
        [Required]
        public int ReportedBy { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(User|Job|Project|Message|Post|Comment)$")]
        public string EntityType { get; set; }
        
        [Required]
        public int EntityId { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Reason { get; set; }
        
        [StringLength(2000)]
        public string? Details { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Pending|UnderReview|Resolved|Dismissed)$")]
        public string Status { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
    }


}
