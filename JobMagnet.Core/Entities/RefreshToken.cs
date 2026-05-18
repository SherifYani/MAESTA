using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class RefreshToken
    {
        [Key]
        public int TokenId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "التوكن مطلوب")]
        [StringLength(500, ErrorMessage = "التوكن يجب ألا يتجاوز 500 حرف")]
        public string Token { get; set; }
        
        [Required(ErrorMessage = "تاريخ انتهاء الصلاحية مطلوب")]
        public DateTimeOffset ExpiresAt { get; set; }
        
        [Required(ErrorMessage = "تاريخ الإنشاء مطلوب")]
        public DateTimeOffset CreatedAt { get; set; }
        
        [StringLength(45, ErrorMessage = "عنوان IP يجب ألا يتجاوز 45 حرف")]
        [RegularExpression(@"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$", ErrorMessage = "صيغة عنوان IP غير صحيحة")]
        public string? CreatedByIp { get; set; }
        
        public DateTimeOffset? RevokedAt { get; set; }
        
        [StringLength(500, ErrorMessage = "التوكن البديل يجب ألا يتجاوز 500 حرف")]
        public string? ReplacedByToken { get; set; }
        
        [StringLength(200, ErrorMessage = "سبب الإبطال يجب ألا يتجاوز 200 حرف")]
        public string? ReasonRevoked { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
