using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "ط¹ظ†ظˆط§ظ† ط§ظ„ط¥ط´ط¹ط§ط± ظ…ط·ظ„ظˆط¨")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "ط¹ظ†ظˆط§ظ† ط§ظ„ط¥ط´ط¹ط§ط± ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 1 ظˆ 200 ط­ط±ظپ")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "ظ…ط­طھظˆظ‰ ط§ظ„ط¥ط´ط¹ط§ط± ظ…ط·ظ„ظˆط¨")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "ظ…ط­طھظˆظ‰ ط§ظ„ط¥ط´ط¹ط§ط± ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 1 ظˆ 1000 ط­ط±ظپ")]
        public string Message { get; set; }
        
        [StringLength(50, ErrorMessage = "ظ†ظˆط¹ ط§ظ„ط¥ط´ط¹ط§ط± ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Info|Warning|Error|Success|NewMessage|NewJob|NewProject|Payment|Review|System)$", ErrorMessage = "ظ†ظˆط¹ ط§ظ„ط¥ط´ط¹ط§ط± ط؛ظٹط± طµط§ظ„ط­")]
        public string? NotificationType { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ط§ظ„طھظˆط¬ظٹظ‡ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ط§ظ„طھظˆط¬ظٹظ‡ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? RedirectUrl { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ط§ظ„طµظˆط±ط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ط§ظ„طµظˆط±ط© ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? ImageUrl { get; set; }
        
        public bool IsRead { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
