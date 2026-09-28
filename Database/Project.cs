using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Project
    {
        [Key]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ظ…ط§ظ„ظƒ ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨")]
        public int OwnerUserId { get; set; }
        
        public int? AssignedFreelancerId { get; set; }
        
        [Required(ErrorMessage = "ط¹ظ†ظˆط§ظ† ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨")]
        [StringLength(200, MinimumLength = 5, ErrorMessage = "ط¹ظ†ظˆط§ظ† ط§ظ„ظ…ط´ط±ظˆط¹ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 5 ظˆ 200 ط­ط±ظپ")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "ظˆطµظپ ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨")]
        [StringLength(5000, MinimumLength = 20, ErrorMessage = "ظˆطµظپ ط§ظ„ظ…ط´ط±ظˆط¹ ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 20 ظˆ 5000 ط­ط±ظپ")]
        public string Description { get; set; }
        
        [Required(ErrorMessage = "ظ…ظٹط²ط§ظ†ظٹط© ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨ط©")]
        [Range(0.01, 10000000, ErrorMessage = "ظ…ظٹط²ط§ظ†ظٹط© ط§ظ„ظ…ط´ط±ظˆط¹ ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 0.01 ظˆ 10,000,000")]
        public decimal Budget { get; set; }
        
        [Required(ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(50, ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ظ…ط´ط±ظˆط¹ ظٹط¬ط¨ ط£ظ„ط§ طھطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(Draft|Open|InProgress|Completed|Cancelled|Disputed)$", ErrorMessage = "ط­ط§ظ„ط© ط§ظ„ظ…ط´ط±ظˆط¹ ط؛ظٹط± طµط§ظ„ط­ط©")]
        public string Status { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("OwnerUserId")]
        public User? User { get; set; }

        [ForeignKey("AssignedFreelancerId")]
        public Freelancer? Freelancer { get; set; }

    }


}
