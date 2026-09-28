using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Admin
    {
        [Key]
        public int AdminId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط³طھظˆظ‰ ط§ظ„طµظ„ط§ط­ظٹط§طھ ظ…ط·ظ„ظˆط¨")]
        [Range(1, 10, ErrorMessage = "ظ…ط³طھظˆظ‰ ط§ظ„طµظ„ط§ط­ظٹط§طھ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 1 ظˆ 10")]
        public byte AdminLevel { get; set; }
        
        [StringLength(5000, ErrorMessage = "طµظ„ط§ط­ظٹط§طھ JSON ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 5000 ط­ط±ظپ")]
        public string? PermissionsJson { get; set; }
        
        [StringLength(1000, ErrorMessage = "ط§ظ„ظ…ظ„ط§ط­ط¸ط§طھ ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 1000 ط­ط±ظپ")]
        public string? Notes { get; set; }
        
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
