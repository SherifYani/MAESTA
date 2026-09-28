using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Proposal
    {
        [Key]
        public int ProposalId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨")]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھظ‚ظ„ ظ…ط·ظ„ظˆط¨")]
        public int FreelancerUserId { get; set; }
        
        [Required(ErrorMessage = "ط§ظ„ظ…ط¨ظ„ط؛ ط§ظ„ظ…ظ‚طھط±ط­ ظ…ط·ظ„ظˆط¨")]
        [Range(0.01, 10000000, ErrorMessage = "ط§ظ„ظ…ط¨ظ„ط؛ ط§ظ„ظ…ظ‚طھط±ط­ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 0.01 ظˆ 10,000,000")]
        public decimal ProposedAmount { get; set; }
        
        [StringLength(5000, MinimumLength = 20, ErrorMessage = "ظ†طµ ط§ظ„ط¹ط±ط¶ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 20 ظˆ 5000 ط­ط±ظپ")]
        public string? ProposalText { get; set; }
        
        [Required(ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ط¹ط±ط¶ ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(50, ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ط¹ط±ط¶ ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Pending|Accepted|Rejected|Withdrawn)$", ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ط¹ط±ط¶ ط؛ظٹط± طµط§ظ„ط­ط©")]
        public string Status { get; set; }
        
        public DateTimeOffset SentAt { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        [ForeignKey("FreelancerUserId")]
        public User? User { get; set; }

    }


}
