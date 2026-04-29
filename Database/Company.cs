using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Company
    {
        [Key]
        public int CompanyId { get; set; }
        
        [Required(ErrorMessage = "معرف صاحب العمل مطلوب")]
        public int EmployerId { get; set; }
        
        [Required(ErrorMessage = "اسم الشركة مطلوب")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "اسم الشركة يجب أن يكون بين 2 و 200 حرف")]
        public string CompanyName { get; set; }
        
        [StringLength(100, ErrorMessage = "المجال يجب ألا يتجاوز 100 حرف")]
        public string? Industry { get; set; }
        
        [StringLength(50, ErrorMessage = "حجم الشركة يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^(1-10|11-50|51-200|201-500|501-1000|1000\+|Freelance)$", ErrorMessage = "حجم الشركة غير صالح")]
        public string? CompanySize { get; set; }
        
        [StringLength(100, ErrorMessage = "رقم السجل التجاري يجب ألا يتجاوز 100 حرف")]
        [RegularExpression(@"^[0-9A-Za-z\-]+$", ErrorMessage = "رقم السجل التجاري يجب أن يحتوي على أرقام وحروف فقط")]
        public string? CommercialRegistrationNumber { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط ملف السجل التجاري يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط ملف السجل التجاري غير صحيحة")]
        public string? CommercialRegistrationFileUrl { get; set; }
        
        [StringLength(500, ErrorMessage = "العنوان يجب ألا يتجاوز 500 حرف")]
        public string? Address { get; set; }
        
        [StringLength(200, ErrorMessage = "الموقع الإلكتروني يجب ألا يتجاوز 200 حرف")]
        [Url(ErrorMessage = "صيغة الموقع الإلكتروني غير صحيحة")]
        public string? Website { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط الشعار يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط الشعار غير صحيحة")]
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
