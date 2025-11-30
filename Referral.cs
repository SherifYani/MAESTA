using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Referral
    {
        [Key]
        public int ReferralId { get; set; }
        
        [Required]
        public int ReferrerId { get; set; }
        
        [Required]
        public int ReferredUserId { get; set; }
        
        [StringLength(50)]
        [RegularExpression(@"^(Pending|Completed|Rewarded|Expired)$")]
        public string? Status { get; set; }
        
        [Range(0, 1000000)]
        public decimal? RewardAmount { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }

        [ForeignKey("ReferredUserId")]
        public User? User { get; set; }

    }


}
