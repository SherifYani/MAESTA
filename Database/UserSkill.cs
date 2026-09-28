using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class UserSkill
    {
        [Key]
        public int UserId { get; set; }
        [Key]
        public int SkillId { get; set; }
        
        [Range(0, 50, ErrorMessage = "ط³ظ†ظˆط§طھ ط§ظ„ط®ط¨ط±ط© ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† ط¨ظٹظ† 0 ظˆ 50")]
        public int? ProvenYears { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ط§ظ„ط´ظ‡ط§ط¯ط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ط§ظ„ط´ظ‡ط§ط¯ط© ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? CertificateUrl { get; set; }
        
        public int? VerifiedBy { get; set; }
        
        public DateTimeOffset? VerifiedAt { get; set; }
        
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
