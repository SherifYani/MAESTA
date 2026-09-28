using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class RefreshToken
    {
        [Key]
        public int TokenId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„طھظˆظƒظ† ظ…ط·ظ„ظˆط¨")]
        [StringLength(500, ErrorMessage = "ط§ظ„طھظˆظƒظ† ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string Token { get; set; }
        
        [Required(ErrorMessage = "طھط§ط±ظٹط® ط§ظ†طھظ‡ط§ط، ط§ظ„طµظ„ط§ط­ظٹط© ظ…ط·ظ„ظˆط¨")]
        public DateTimeOffset ExpiresAt { get; set; }
        
        [Required(ErrorMessage = "طھط§ط±ظٹط® ط§ظ„ط¥ظ†ط´ط§ط، ظ…ط·ظ„ظˆط¨")]
        public DateTimeOffset CreatedAt { get; set; }
        
        [StringLength(45, ErrorMessage = "ط¹ظ†ظˆط§ظ† IP ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 45 ط­ط±ظپ")]
        [RegularExpression(@"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$", ErrorMessage = "طµظٹط؛ط© ط¹ظ†ظˆط§ظ† IP ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? CreatedByIp { get; set; }
        
        public DateTimeOffset? RevokedAt { get; set; }
        
        [StringLength(500, ErrorMessage = "ط§ظ„طھظˆظƒظ† ط§ظ„ط¨ط¯ظٹظ„ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string? ReplacedByToken { get; set; }
        
        [StringLength(200, ErrorMessage = "ط³ط¨ط¨ ط§ظ„ط¥ط¨ط·ط§ظ„ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 200 ط­ط±ظپ")]
        public string? ReasonRevoked { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
