using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Review
    {
        [Key]
        public int ReviewId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط±ط§ط¬ط¹ ظ…ط·ظ„ظˆط¨")]
        public int ReviewerId { get; set; }
        
        [StringLength(50, ErrorMessage = "ط¯ظˆط± ط§ظ„ظ…ط±ط§ط¬ط¹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Freelancer|Employer|Client|JobSeeker)$", ErrorMessage = "ط¯ظˆط± ط§ظ„ظ…ط±ط§ط¬ط¹ ط؛ظٹط± طµط§ظ„ط­")]
        public string? ReviewerRole { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھط®ط¯ظ… ط§ظ„ظ…ط³طھظ‡ط¯ظپ ظ…ط·ظ„ظˆط¨")]
        public int TargetUserId { get; set; }
        
        [StringLength(50, ErrorMessage = "ط¯ظˆط± ط§ظ„ظ…ط³طھظ‡ط¯ظپ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Freelancer|Employer|Client|JobSeeker)$", ErrorMessage = "ط¯ظˆط± ط§ظ„ظ…ط³طھظ‡ط¯ظپ ط؛ظٹط± طµط§ظ„ط­")]
        public string? TargetRole { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„طھط¹ظ„ظٹظ‚ ظ…ط·ظ„ظˆط¨")]
        [StringLength(2000, MinimumLength = 5, ErrorMessage = "ط§ظ„طھط¹ظ„ظٹظ‚ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 5 ظˆ 2000 ط­ط±ظپ")]
        public string Comment { get; set; }
        
        [Required(ErrorMessage = "ظ‚ظٹظ…ط© ط§ظ„طھظ‚ظٹظٹظ… ظ…ط·ظ„ظˆط¨ط©")]
        [Range(1, 5, ErrorMessage = "ظ‚ظٹظ…ط© ط§ظ„طھظ‚ظٹظٹظ… ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 1 ظˆ 5")]
        public byte RatingValue { get; set; }
        
        [StringLength(100, ErrorMessage = "ظ†ظˆط¹ ط§ظ„ط³ظٹط§ظ‚ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 100 ط­ط±ظپ")]
        [RegularExpression(@"^(Project|Job|Contract|Proposal)$", ErrorMessage = "ظ†ظˆط¹ ط§ظ„ط³ظٹط§ظ‚ ط؛ظٹط± طµط§ظ„ط­")]
        public string? ContextEntity { get; set; }
        
        public int? ContextEntityId { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("TargetUserId")]
        public User? User { get; set; }

    }


}
