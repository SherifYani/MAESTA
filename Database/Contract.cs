using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Contract
    {
        [Key]
        public int ContractId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط´ط±ظˆط¹ ظ…ط·ظ„ظˆط¨")]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ط¹ظ…ظٹظ„ ظ…ط·ظ„ظˆط¨")]
        public int ClientUserId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ ط§ظ„ظ…ط³طھظ‚ظ„ ظ…ط·ظ„ظˆط¨")]
        public int FreelancerUserId { get; set; }
        
        [Required(ErrorMessage = "ط´ط±ظˆط· ط§ظ„ط¹ظ‚ط¯ ظ…ط·ظ„ظˆط¨ط©")]
        [StringLength(10000, MinimumLength = 20, ErrorMessage = "ط´ط±ظˆط· ط§ظ„ط¹ظ‚ط¯ ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 20 ظˆ 10000 ط­ط±ظپ")]
        public string Terms { get; set; }
        
        public DateTimeOffset? SignedDate { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ظ…ظ„ظپ ط§ظ„ط¹ظ‚ط¯ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ظ…ظ„ظپ ط§ظ„ط¹ظ‚ط¯ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? ContractFileUrl { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        [ForeignKey("ClientUserId")]
        public User? ClientUser { get; set; }

        [ForeignKey("FreelancerUserId")]
        public User? FreelancerUser { get; set; }

    }


}
