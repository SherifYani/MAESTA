using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class JobSeeker
    {
        [Key]
        public int JobSeekerId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ط§ظ„ط³ظٹط±ط© ط§ظ„ط°ط§طھظٹط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ط§ظ„ط³ظٹط±ط© ط§ظ„ط°ط§طھظٹط© ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? CVUrl { get; set; }
        
        [Range(0, 50, ErrorMessage = "ط³ظ†ظˆط§طھ ط§ظ„ط®ط¨ط±ط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 0 ظˆ 50")]
        public int? ExperienceYears { get; set; }
        
        [StringLength(50, ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظˆط¸ظٹظپط© ط§ظ„ظ…ظپط¶ظ„ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(FullTime|PartTime|Contract|Freelance|Internship|Temporary)$", ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظˆط¸ظٹظپط© ط؛ظٹط± طµط§ظ„ط­")]
        public string? PreferredJobType { get; set; }
        
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "ط§ظ„ظ†ط¨ط°ط© ط§ظ„طھط¹ط±ظٹظپظٹط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 10 ظˆ 2000 ط­ط±ظپ")]
        public string? Bio { get; set; }
        
        public bool IsVerified { get; set; }
        
        public DateTimeOffset? LastActiveAt { get; set; }
        
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
