using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Employer
    {
        [Key]
        public int EmployerId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        [StringLength(100, ErrorMessage = "البريد الإلكتروني للشركة يجب ألا يتجاوز 100 حرف")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        public string? BusinessEmail { get; set; }
        
        public bool IsVerified { get; set; }
        
        [StringLength(50, ErrorMessage = "الرقم القومي يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^[0-9A-Za-z\-]+$", ErrorMessage = "الرقم القومي يجب أن يحتوي على أرقام وحروف فقط")]
        public string? NationalId { get; set; }
        
        [StringLength(50, ErrorMessage = "الرقم الضريبي يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^[0-9A-Za-z\-]+$", ErrorMessage = "الرقم الضريبي يجب أن يحتوي على أرقام وحروف فقط")]
        public string? TaxNumber { get; set; }
        
        [StringLength(100, ErrorMessage = "اسم جهة الاتصال يجب ألا يتجاوز 100 حرف")]
        public string? ContactPerson { get; set; }
        
        [StringLength(20, ErrorMessage = "رقم الهاتف يجب ألا يتجاوز 20 حرف")]
        [RegularExpression(@"^\+?[0-9]{10,15}$", ErrorMessage = "صيغة رقم الهاتف غير صحيحة")]
        public string? ContactPhone { get; set; }
        
        public DateTimeOffset? VerificationRequestedAt { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
