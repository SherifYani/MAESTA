using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Badge
    {
        [Key]
        public int BadgeId { get; set; }
        
        [Required(ErrorMessage = "ط§ط³ظ… ط§ظ„ط´ط§ط±ط© ظ…ط·ظ„ظˆط¨")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "ط§ط³ظ… ط§ظ„ط´ط§ط±ط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 2 ظˆ 100 ط­ط±ظپ")]
        public string Name { get; set; }
        
        [StringLength(500, ErrorMessage = "ط§ظ„ظˆطµظپ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string? Description { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ط§ظ„ط£ظٹظ‚ظˆظ†ط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ط§ظ„ط£ظٹظ‚ظˆظ†ط© ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? IconUrl { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
