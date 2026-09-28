using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Employer
    {
        [Key]
        public int EmployerId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [StringLength(100, ErrorMessage = "ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظ„ظ„ط´ط±ظƒط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 100 ط­ط±ظپ")]
        [EmailAddress(ErrorMessage = "طµظٹط؛ط© ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? BusinessEmail { get; set; }
        
        public bool IsVerified { get; set; }
        
        [StringLength(50, ErrorMessage = "ط§ظ„ط±ظ‚ظ… ط§ظ„ظ‚ظˆظ…ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^[0-9A-Za-z\-]+$", ErrorMessage = "ط§ظ„ط±ظ‚ظ… ط§ظ„ظ‚ظˆظ…ظٹ ظٹط¬ط¨ ط£ظ† ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ط£ط±ظ‚ط§ظ… ظˆط­ط±ظˆظپ ظپظ‚ط·")]
        public string? NationalId { get; set; }
        
        [StringLength(50, ErrorMessage = "ط§ظ„ط±ظ‚ظ… ط§ظ„ط¶ط±ظٹط¨ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^[0-9A-Za-z\-]+$", ErrorMessage = "ط§ظ„ط±ظ‚ظ… ط§ظ„ط¶ط±ظٹط¨ظٹ ظٹط¬ط¨ ط£ظ† ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ط£ط±ظ‚ط§ظ… ظˆط­ط±ظˆظپ ظپظ‚ط·")]
        public string? TaxNumber { get; set; }
        
        [StringLength(100, ErrorMessage = "ط§ط³ظ… ط¬ظ‡ط© ط§ظ„ط§طھطµط§ظ„ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 100 ط­ط±ظپ")]
        public string? ContactPerson { get; set; }
        
        [StringLength(20, ErrorMessage = "ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 20 ط­ط±ظپ")]
        [RegularExpression(@"^\+?[0-9]{10,15}$", ErrorMessage = "طµظٹط؛ط© ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? ContactPhone { get; set; }
        
        public DateTimeOffset? VerificationRequestedAt { get; set; }
        
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
