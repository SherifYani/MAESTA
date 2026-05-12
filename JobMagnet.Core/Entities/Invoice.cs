using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Invoice
    {
        [Key]
        public int InvoiceId { get; set; }
        
        [Required(ErrorMessage = "معرف المشروع مطلوب")]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "المبلغ مطلوب")]
        [Range(0.01, 10000000, ErrorMessage = "مبلغ الفاتورة يجب أن يكون بين 0.01 و 10,000,000")]
        public decimal Amount { get; set; }
        
        public DateTimeOffset? DueDate { get; set; }
        
        [Required(ErrorMessage = "حالة الفاتورة مطلوبة")]
        [StringLength(50, ErrorMessage = "حالة الفاتورة يجب ألا تتجاوز 50 حرف")]
        [RegularExpression(@"^(Draft|Sent|Paid|Overdue|Cancelled|Refunded)$", ErrorMessage = "حالة الفاتورة غير صالحة")]
        public string Status { get; set; }
        
        [StringLength(50, ErrorMessage = "رقم الفاتورة يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^[A-Z0-9\-]+$", ErrorMessage = "رقم الفاتورة يجب أن يحتوي على أحرف وأرقام فقط")]
        public string? InvoiceNumber { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

    }


}
