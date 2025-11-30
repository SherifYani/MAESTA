using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Badge
    {
        [Key]
        public int BadgeId { get; set; }
        
        [Required(ErrorMessage = "اسم الشارة مطلوب")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "اسم الشارة يجب أن يكون بين 2 و 100 حرف")]
        public string Name { get; set; }
        
        [StringLength(500, ErrorMessage = "الوصف يجب ألا يتجاوز 500 حرف")]
        public string? Description { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط الأيقونة يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط الأيقونة غير صحيحة")]
        public string? IconUrl { get; set; }
    }


}
