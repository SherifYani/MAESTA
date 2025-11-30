using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class PromoCode
    {
        [Key]
        public int PromoCodeId { get; set; }
        
        [Required(ErrorMessage = "كود الخصم مطلوب")]
        [StringLength(50, MinimumLength = 3, ErrorMessage = "كود الخصم يجب أن يكون بين 3 و 50 حرف")]
        [RegularExpression(@"^[A-Z0-9]+$", ErrorMessage = "كود الخصم يجب أن يحتوي على أحرف وأرقام كبيرة فقط")]
        public string Code { get; set; }
        
        [Range(0, 100, ErrorMessage = "نسبة الخصم يجب أن تكون بين 0 و 100")]
        public decimal? DiscountPercent { get; set; }
        
        public DateTimeOffset? ExpiryDate { get; set; }
        
        [Range(1, 10000, ErrorMessage = "حد الاستخدام يجب أن يكون بين 1 و 10000")]
        public int? UsageLimit { get; set; }
    }


}
