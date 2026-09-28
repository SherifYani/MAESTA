using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Message
    {
        [Key]
        public int MessageId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط­ط§ط¯ط«ط© ظ…ط·ظ„ظˆط¨")]
        public int ChatId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط±ط³ظ„ ظ…ط·ظ„ظˆط¨")]
        public int SenderId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط­طھظˆظ‰ ط§ظ„ط±ط³ط§ظ„ط© ظ…ط·ظ„ظˆط¨")]
        [StringLength(5000, MinimumLength = 1, ErrorMessage = "ظ…ط­طھظˆظ‰ ط§ظ„ط±ط³ط§ظ„ط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 1 ظˆ 5000 ط­ط±ظپ")]
        public string Content { get; set; }
        
        public bool IsRead { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset SentAt { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
