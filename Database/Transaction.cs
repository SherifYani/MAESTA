using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظ…ط¹ط§ظ…ظ„ط© ظ…ط·ظ„ظˆط¨")]
        [StringLength(50, ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظ…ط¹ط§ظ…ظ„ط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Deposit|Withdrawal|Payment|Refund|Commission|Bonus|Penalty|Transfer)$", ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظ…ط¹ط§ظ…ظ„ط© ط؛ظٹط± طµط§ظ„ط­")]
        public string Type { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„ظ…ط¨ظ„ط؛ ظ…ط·ظ„ظˆط¨")]
        public decimal Amount { get; set; }
        
        [StringLength(50, ErrorMessage = "ط§ظ„ط­ط§ظ„ط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Pending|Completed|Failed|Cancelled|Reversed)$", ErrorMessage = "ط§ظ„ط­ط§ظ„ط© ط؛ظٹط± طµط§ظ„ط­ط©")]
        public string? Status { get; set; }
        
        [StringLength(500, ErrorMessage = "ط§ظ„ظˆطµظپ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string? Description { get; set; }
        
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
