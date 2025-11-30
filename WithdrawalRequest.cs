using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class WithdrawalRequest
    {
        [Key]
        public int WithdrawalRequestId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [Range(0.01, 10000000)]
        public decimal Amount { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(BankTransfer|PayPal|Stripe|Fawry|Paymob|Other)$")]
        public string PaymentMethod { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Pending|Processing|Approved|Rejected|Completed)$")]
        public string Status { get; set; }
        
        [Required]
        public DateTimeOffset RequestedAt { get; set; }
        
        public DateTimeOffset? ProcessedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
