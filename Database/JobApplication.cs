using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class JobApplication
    {
        [Key]
        public int JobApplicationId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظˆط¸ظٹظپط© ظ…ط·ظ„ظˆط¨")]
        public int JobId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ط¨ط§ط­ط« ط¹ظ† ط¹ظ…ظ„ ظ…ط·ظ„ظˆط¨")]
        public int JobSeekerId { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ط§ظ„ط³ظٹط±ط© ط§ظ„ط°ط§طھظٹط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ط§ظ„ط³ظٹط±ط© ط§ظ„ط°ط§طھظٹط© ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? ResumeUrl { get; set; }
        
        [StringLength(2000, ErrorMessage = "ط®ط·ط§ط¨ ط§ظ„طھط؛ط·ظٹط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 2000 ط­ط±ظپ")]
        public string? CoverLetter { get; set; }
        
        [Required(ErrorMessage = "ط­ط§ظ„ط© ط§ظ„طھظ‚ط¯ظٹظ… ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(50, ErrorMessage = "ط­ط§ظ„ط© ط§ظ„طھظ‚ط¯ظٹظ… ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Pending|Reviewed|Shortlisted|Interviewed|Accepted|Rejected|Withdrawn)$", ErrorMessage = "ط­ط§ظ„ط© ط§ظ„طھظ‚ط¯ظٹظ… ط؛ظٹط± طµط§ظ„ط­ط©")]
        public string Status { get; set; }
        
        public DateTimeOffset AppliedAt { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("JobId")]
        public Job? Job { get; set; }

    }


}
