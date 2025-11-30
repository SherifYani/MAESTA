using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Dispute
    {
        [Key]
        public int DisputeId { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        public int RaisedByUserId { get; set; }
        
        [Required]
        [StringLength(2000, MinimumLength = 10)]
        public string Reason { get; set; }
        
        [StringLength(500)]
        [Url]
        public string? EvidenceFileUrl { get; set; }
        
        [StringLength(2000)]
        public string? AdminNotes { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Open|UnderReview|Resolved|Closed)$")]
        public string Status { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public DateTimeOffset? ResolvedAt { get; set; }
        
        public bool IsDeleted { get; set; }
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        [ForeignKey("RaisedByUserId")]
        public User? User { get; set; }

    }


}
