using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class RefundRequest
    {
        [Key]
        public int RefundRequestId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        public int? TransactionId { get; set; }
        
        [Required]
        [StringLength(1000, MinimumLength = 10)]
        public string Reason { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Pending|Approved|Rejected|Processed)$")]
        public string Status { get; set; }
        
        [Required]
        public DateTimeOffset RequestedAt { get; set; }
        
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
