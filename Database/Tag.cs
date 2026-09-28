using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Tag
    {
        [Key]
        public int TagId { get; set; }
        
        [Required(ErrorMessage = "ط§ط³ظ… ط§ظ„ظˆط³ظ… ظ…ط·ظ„ظˆط¨")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "ط§ط³ظ… ط§ظ„ظˆط³ظ… ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 2 ظˆ 50 ط­ط±ظپ")]
        public string Name { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
