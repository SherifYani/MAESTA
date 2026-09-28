using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„ظ…ط¨ظ„ط؛ ظ…ط·ظ„ظˆط¨")]
        [Range(0.01, 10000000, ErrorMessage = "ط§ظ„ظ…ط¨ظ„ط؛ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 0.01 ظˆ 10,000,000")]
        public decimal Amount { get; set; }
        
        [Required(ErrorMessage = "ظ‚ظٹظ…ط© ط§ظ„ط±ط³ظˆظ… ظ…ط·ظ„ظˆط¨ط©")]
        [Range(0, 1000000, ErrorMessage = "ظ‚ظٹظ…ط© ط§ظ„ط±ط³ظˆظ… ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 0 ظˆ 1,000,000")]
        public decimal FeeAmount { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„ط¹ظ…ظ„ط© ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(10, ErrorMessage = "ط§ظ„ط¹ظ…ظ„ط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 10 ط£ط­ط±ظپ")]
        [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "ط§ظ„ط¹ظ…ظ„ط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط±ظ…ط² ISO 4217 (ظ…ط«ظ„: USD, EGP, SAR)")]
        public string Currency { get; set; }
        
        [Required(ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ط¯ظپط¹ ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(50, ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ط¯ظپط¹ ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Pending|Processing|Completed|Failed|Refunded|Cancelled)$", ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ط¯ظپط¹ ط؛ظٹط± طµط§ظ„ط­ط©")]
        public string Status { get; set; }
        
        [StringLength(200, ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط¹ط§ظ…ظ„ط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 200 ط­ط±ظپ")]
        public string? TransactionId { get; set; }
        
        [StringLength(100, ErrorMessage = "ظ…ط²ظˆط¯ ط§ظ„ط¯ظپط¹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 100 ط­ط±ظپ")]
        [RegularExpression(@"^(Stripe|PayPal|Fawry|Paymob|PayTabs|HyperPay|Checkout|Other)$", ErrorMessage = "ظ…ط²ظˆط¯ ط§ظ„ط¯ظپط¹ ط؛ظٹط± ظ…ط¯ط¹ظˆظ…")]
        public string? PaymentProvider { get; set; }
        
        [StringLength(5000, ErrorMessage = "ط§ط³طھط¬ط§ط¨ط© ط§ظ„ط¨ظˆط§ط¨ط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 5000 ط­ط±ظپ")]
        public string? GatewayResponse { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public DateTimeOffset? CompletedAt { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
