using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Core.Entities
{

    public class Company
    {
        [Key]
        public int CompanyId { get; set; }
        
        [Required(ErrorMessage = "ظ…ط¹ط±ظپ طµط§ط­ط¨ ط§ظ„ط¹ظ…ظ„ ظ…ط·ظ„ظˆط¨")]
        public int EmployerId { get; set; }
        
        [Required(ErrorMessage = "ط§ط³ظ… ط§ظ„ط´ط±ظƒط© ظ…ط·ظ„ظˆط¨")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "ط§ط³ظ… ط§ظ„ط´ط±ظƒط© ظٹط¬ط¨ ط£ظ† ظٹظƒظˆظ† ط¨ظٹظ† 2 ظˆ 200 ط­ط±ظپ")]
        public string CompanyName { get; set; }
        
        [StringLength(100, ErrorMessage = "ط§ظ„ظ…ط¬ط§ظ„ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 100 ط­ط±ظپ")]
        public string? Industry { get; set; }
        
        [StringLength(50, ErrorMessage = "ط­ط¬ظ… ط§ظ„ط´ط±ظƒط© ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 50 ط­ط±ظپ")]
        [RegularExpression(@"^(1-10|11-50|51-200|201-500|501-1000|1000\+|Freelance)$", ErrorMessage = "ط­ط¬ظ… ط§ظ„ط´ط±ظƒط© ط؛ظٹط± طµط§ظ„ط­")]
        public string? CompanySize { get; set; }
        
        [StringLength(100, ErrorMessage = "ط±ظ‚ظ… ط§ظ„ط³ط¬ظ„ ط§ظ„طھط¬ط§ط±ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 100 ط­ط±ظپ")]
        [RegularExpression(@"^[0-9A-Za-z\-]+$", ErrorMessage = "ط±ظ‚ظ… ط§ظ„ط³ط¬ظ„ ط§ظ„طھط¬ط§ط±ظٹ ظٹط¬ط¨ ط£ظ† ظٹط­طھظˆظٹ ط¹ظ„ظ‰ ط£ط±ظ‚ط§ظ… ظˆط­ط±ظˆظپ ظپظ‚ط·")]
        public string? CommercialRegistrationNumber { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ظ…ظ„ظپ ط§ظ„ط³ط¬ظ„ ط§ظ„طھط¬ط§ط±ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ظ…ظ„ظپ ط§ظ„ط³ط¬ظ„ ط§ظ„طھط¬ط§ط±ظٹ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? CommercialRegistrationFileUrl { get; set; }
        
        [StringLength(500, ErrorMessage = "ط§ظ„ط¹ظ†ظˆط§ظ† ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        public string? Address { get; set; }
        
        [StringLength(200, ErrorMessage = "ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 200 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? Website { get; set; }
        
        [StringLength(500, ErrorMessage = "ط±ط§ط¨ط· ط§ظ„ط´ط¹ط§ط± ظٹط¬ط¨ ط£ظ„ط§ ظٹطھط¬ط§ظˆط² 500 ط­ط±ظپ")]
        [Url(ErrorMessage = "طµظٹط؛ط© ط±ط§ط¨ط· ط§ظ„ط´ط¹ط§ط± ط؛ظٹط± طµط­ظٹط­ط©")]
        public string? LogoUrl { get; set; }
        
        public bool IsVerified { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("EmployerId")]
        public Employer? Employer { get; set; }

    }


}
