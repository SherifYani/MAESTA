using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Freelancer
    {
        [Key]
        public int FreelancerId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ظ…ط·ظ„ظˆط¨")]
        public int UserId { get; set; }
        
        public int? FreelancerLevelId { get; set; }
        
        [Range(0.01, 100000, ErrorMessage = "ط§ظ„ط³ط¹ط± ط¨ط§ظ„ط³ط§ط¹ط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 0.01 ظˆ 100000")]
        public decimal? HourlyRate { get; set; }
        
        [StringLength(10, ErrorMessage = "ط§ظ„ط¹ظ…ظ„ط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 10 ط£ط­ط±ظپ")]
        [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "ط§ظ„ط¹ظ…ظ„ط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط±ظ…ط² ISO 4217 (ظ…ط«ظ„: USD, EGP, SAR)")]
        public string? Currency { get; set; }
        
        [Range(0, int.MaxValue, ErrorMessage = "ط¹ط¯ط¯ ط§ظ„ظ…ط´ط§ط±ظٹط¹ ط§ظ„ظ…ظƒطھظ…ظ„ط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ظ…ظˆط¬ط¨")]
        public int TotalCompletedProjects { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ظ…ط¹ط±ط¶ ط§ظ„ط£ط¹ظ…ط§ظ„ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ظ…ط¹ط±ط¶ ط§ظ„ط£ط¹ظ…ط§ظ„ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? PortfolioUrl { get; set; }
        
        [StringLength(2000, ErrorMessage = "ط§ظ„ظ†ط¨ط°ط© ط§ظ„طھط¹ط±ظٹظپظٹط© ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 2000 ط­ط±ظپ")]
        [MinLength(10, ErrorMessage = "ط§ظ„ظ†ط¨ط°ط© ط§ظ„طھط¹ط±ظٹظپظٹط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† 10 ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„")]
        public string? Bio { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ظˆط«ظٹظ‚ط© ط§ظ„طھط­ظ‚ظ‚ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ظˆط«ظٹظ‚ط© ط§ظ„طھط­ظ‚ظ‚ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? DocumentVerificationUrl { get; set; }
        
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
