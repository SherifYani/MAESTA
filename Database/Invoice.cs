using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Invoice
    {
        [Key]
        public int InvoiceId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨")]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„ظ…ط¨ظ„ط؛ ظ…ط·ظ„ظˆط¨")]
        [Range(0.01, 10000000, ErrorMessage = "ظ…ط¨ظ„ط؛ ط§ظ„ظپط§طھظˆط±ط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 0.01 ظˆ 10,000,000")]
        public decimal Amount { get; set; }
        
        public DateTimeOffset? DueDate { get; set; }
        
        [Required(ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ظپط§طھظˆط±ط© ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(50, ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ظپط§طھظˆط±ط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Draft|Sent|Paid|Overdue|Cancelled|Refunded)$", ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ظپط§طھظˆط±ط© ط؛ظٹط± طµط§ظ„ط­ط©")]
        public string Status { get; set; }
        
        [StringLength(50, ErrorMessage = "ط±ظ‚ظ… ط§ظ„ظپط§طھظˆط±ط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^[A-Z0-9\-]+$", ErrorMessage = "ط±ظ‚ظ… ط§ظ„ظپط§طھظˆط±ط© ظٹط¬ط¨ ط£ظ† ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ط£ط­ط±ظپ ظˆط£ط±ظ‚ط§ظ… ظپظ‚ط·")]
        public string? InvoiceNumber { get; set; }
        
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
