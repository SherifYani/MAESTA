using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class ProjectMilestone
    {
        [Key]
        public int MilestoneId { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(200, MinimumLength = 5)]
        public string Title { get; set; }
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [Required]
        [Range(0.01, 10000000)]
        public decimal Amount { get; set; }
        
        public DateTimeOffset? DueDate { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Pending|InProgress|Completed|Cancelled)$")]
        public string Status { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

    }


}
