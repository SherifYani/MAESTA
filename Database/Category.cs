using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Category
    {
        [Key]
        public int CategoryId { get; set; }
        
        [Required(ErrorMessage = "ط§ط³ظ… ط§ظ„طھطµظ†ظٹظپ ظ…ط·ظ„ظˆط¨")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "ط§ط³ظ… ط§ظ„طھطµظ†ظٹظپ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 2 ظˆ 100 ط­ط±ظپ")]
        public string Name { get; set; }
        
        [StringLength(500, ErrorMessage = "ط§ظ„ظˆطµظپ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string? Description { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
