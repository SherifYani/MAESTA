using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Subscription
    {
        [Key]
        public int SubscriptionId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string PlanName { get; set; }
        
        [Required]
        [Range(0, 100000)]
        public decimal Price { get; set; }
        
        [Required]
        [StringLength(10)]
        [RegularExpression(@"^[A-Z]{3}$")]
        public string Currency { get; set; }
        
        [Required]
        public DateTimeOffset StartDate { get; set; }
        
        [Required]
        public DateTimeOffset EndDate { get; set; }
        
        public bool IsActive { get; set; }
        
        public bool AutoRenew { get; set; }
        
        public DateTimeOffset? RenewDate { get; set; }
        
        [Range(1, 10000)]
        public int? MaxJobs { get; set; }
        
        [Range(1, 10000)]
        public int? MaxProposals { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
