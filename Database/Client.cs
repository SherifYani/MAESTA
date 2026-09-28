using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Client
    {
        [Key]
        public int ClientId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [StringLength(200, ErrorMessage = "ط§ظ„ط§ط³ظ… ط§ظ„ظ‚ط§ظ†ظˆظ†ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 200 ط­ط±ظپ")]
        public string? LegalName { get; set; }
        
        [StringLength(20, ErrorMessage = "ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 20 ط­ط±ظپ")]
        [RegularExpression(@"^\+?[0-9]{10,15}$", ErrorMessage = "طµظٹط؛ط© ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? ContactPhone { get; set; }
        
        [StringLength(500, ErrorMessage = "ط§ظ„ط¹ظ†ظˆط§ظ† ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string? Address { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ظˆط«ظٹظ‚ط© ط§ظ„ظ‡ظˆظٹط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ظˆط«ظٹظ‚ط© ط§ظ„ظ‡ظˆظٹط© ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? IdentityDocumentUrl { get; set; }
        
        public bool IsVerified { get; set; }
        
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
