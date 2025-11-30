using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class EscrowTransaction
    {
        [Key]
        public int EscrowTransactionId { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        public int FreelancerUserId { get; set; }
        
        [Required]
        [Range(0.01, 10000000)]
        public decimal Amount { get; set; }
        
        [Required]
        [Range(0, 1000000)]
        public decimal FeeAmount { get; set; }
        
        [Required]
        [StringLength(10)]
        [RegularExpression(@"^[A-Z]{3}$")]
        public string? Currency { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Pending|Held|Released|Refunded|Cancelled)$")]
        public string Status { get; set; }
        
        [StringLength(100)]
        public string? PaymentProvider { get; set; }
        
        [StringLength(5000)]
        public string? GatewayResponse { get; set; }
        
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

        [ForeignKey("FreelancerUserId")]
        public User? User { get; set; }

    }


}
