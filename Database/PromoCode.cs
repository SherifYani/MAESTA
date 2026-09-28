using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class PromoCode
    {
        [Key]
        public int PromoCodeId { get; set; }
        
        [Required(ErrorMessage = "ظƒظˆط¯ ط§ظ„ط®طµظ… ظ…ط·ظ„ظˆط¨")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "ظƒظˆط¯ ط§ظ„ط®طµظ… ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 3 ظˆ 50 ط­ط±ظپ")]
        [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "ظƒظˆط¯ ط§ظ„ط®طµظ… ظٹط¬ط¨ ط£ظ† ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ط£ط­ط±ظپ ظˆط£ط±ظ‚ط§ظ… ظƒط¨ظٹط±ط© ظپظ‚ط·")]
        public string Code { get; set; }
        
        [Range(0, 100, ErrorMessage = "ظ†ط³ط¨ط© ط§ظ„ط®طµظ… ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 0 ظˆ 100")]
        public decimal? DiscountPercent { get; set; }
        
        public DateTimeOffset? ExpiryDate { get; set; }
        
        [Range(1, 10000, ErrorMessage = "ط­ط¯ ط§ظ„ط§ط³طھط®ط¯ط§ظ… ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 1 ظˆ 10000")]
        public int? UsageLimit { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
