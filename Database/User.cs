using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class User
    {
        [Key]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظ…ط·ظ„ظˆط¨")]
        [EmailAddress(ErrorMessage = "طµظٹط؛ط© ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط؛ظٹط± طµط­ظٹط­ط©")]
        [StringLength(100, ErrorMessage = "ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 100 ط­ط±ظپ")]
        public string Email { get; set; }
        
        [Required(ErrorMessage = "ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(500, ErrorMessage = "ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ظ…ط´ظپط±ط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string PasswordHash { get; set; }
        
        [StringLength(20, ErrorMessage = "ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 20 ط­ط±ظپ")]
        [RegularExpression(@"^\+?[0-9]{10,15}$", ErrorMessage = "طµظٹط؛ط© ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? Phone { get; set; }
        
        public bool IsPhoneVerified { get; set; }
        
        public bool IsEmailVerified { get; set; }
        
        [Range(0, 10, ErrorMessage = "ط¹ط¯ط¯ ظ…ط­ط§ظˆظ„ط§طھ طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط§ظ„ظپط§ط´ظ„ط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 0 ظˆ 10")]
        public int FailedLoginAttempts { get; set; }
        
        public DateTimeOffset? LockoutEndDate { get; set; }
        
        public bool TwoFactorEnabled { get; set; }
        
        [StringLength(200, ErrorMessage = "ظ…ظپطھط§ط­ ط§ظ„طھط­ظ‚ظ‚ ط§ظ„ط«ظ†ط§ط¦ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 200 ط­ط±ظپ")]
        public string? TwoFactorSecretKey { get; set; }
        
        [StringLength(30, ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظ…ط³طھط®ط¯ظ… ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 30 ط­ط±ظپ")]
        [RegularExpression(@"^(Admin|Freelancer|Employer|JobSeeker|Client)?$", ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظ…ط³طھط®ط¯ظ… ط؛ظٹط± طµط§ظ„ط­")]
        public string? UserType { get; set; } // nullable - ط§ط³طھط®ط¯ظ… IsFreelancer, IsJobSeeker, etc ط¨ط¯ظ„ط§ظ‹ ظ…ظ†ظ‡
        
        public DateTimeOffset? LastLoginAt { get; set; }
        
        public DateTimeOffset? LastSeenAt { get; set; }
        
        public bool IsActive { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        // ===== COMPUTED COLUMNS: Multi-Role Support =====
        // ظ‡ط°ظ‡ ط§ظ„ط­ظ‚ظˆظ„ ظ…ط­ط³ظˆط¨ط© طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ظ…ظ† ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ
        // طھط³ظ…ط­ ظ„ظ„ظ…ط³طھط®ط¯ظ… ط¨ط£ظ† ظٹظƒظˆظ† ظ„ظ‡ ط¹ط¯ط© ط£ط¯ظˆط§ط± ظپظٹ ظ†ظپط³ ط§ظ„ظˆظ‚طھ
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsFreelancer { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsJobSeeker { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsEmployer { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsClient { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsAdmin { get; private set; }
        
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
