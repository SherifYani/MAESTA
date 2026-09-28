using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Job
    {
        [Key]
        public int JobId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ†ط§ط´ط± ظ…ط·ظ„ظˆط¨")]
        public int PostedByUserId { get; set; }
        
        [Required(ErrorMessage = "ط¹ظ†ظˆط§ظ† ط§ظ„ظˆط¸ظٹظپط© ظ…ط·ظ„ظˆط¨")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "ط¹ظ†ظˆط§ظ† ط§ظ„ظˆط¸ظٹظپط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 5 ظˆ 200 ط­ط±ظپ")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "ظˆطµظپ ط§ظ„ظˆط¸ظٹظپط© ظ…ط·ظ„ظˆط¨")]
        [StringLength(5000, MinimumLength = 20, ErrorMessage = "ظˆطµظپ ط§ظ„ظˆط¸ظٹظپط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 20 ظˆ 5000 ط­ط±ظپ")]
        public string Description { get; set; }
        
        [StringLength(200, ErrorMessage = "ط§ظ„ظ…ظˆظ‚ط¹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 200 ط­ط±ظپ")]
        public string? Location { get; set; }
        
        [StringLength(50, ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظˆط¸ظٹظپط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(FullTime|PartTime|Contract|Freelance|Internship|Temporary)$", ErrorMessage = "ظ†ظˆط¹ ط§ظ„ظˆط¸ظٹظپط© ط؛ظٹط± طµط§ظ„ط­")]
        public string? Type { get; set; }
        
        [Range(0, 1000000000, ErrorMessage = "ط§ظ„ط­ط¯ ط§ظ„ط£ط¯ظ†ظ‰ ظ„ظ„ط±ط§طھط¨ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 0 ظˆ 1,000,000,000")]
        public decimal? MinSalary { get; set; }
        
        [Range(0, 1000000000, ErrorMessage = "ط§ظ„ط­ط¯ ط§ظ„ط£ظ‚طµظ‰ ظ„ظ„ط±ط§طھط¨ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 0 ظˆ 1,000,000,000")]
        public decimal? MaxSalary { get; set; }
        
        public bool IsActive { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("PostedByUserId")]
        public User? User { get; set; }

    }


}
