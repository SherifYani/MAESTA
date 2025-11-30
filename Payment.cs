using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "المبلغ مطلوب")]
        [Range(0.01, 10000000, ErrorMessage = "المبلغ يجب أن يكون بين 0.01 و 10,000,000")]
        public decimal Amount { get; set; }
        
        [Required(ErrorMessage = "قيمة الرسوم مطلوبة")]
        [Range(0, 1000000, ErrorMessage = "قيمة الرسوم يجب أن تكون بين 0 و 1,000,000")]
        public decimal FeeAmount { get; set; }
        
        [Required(ErrorMessage = "العملة مطلوبة")]
        [StringLength(10, ErrorMessage = "العملة يجب ألا تتجاوز 10 أحرف")]
        [RegularExpression(@"^[A-Z]{3}$", ErrorMessage = "العملة يجب أن تكون رمز ISO 4217 (مثل: USD, EGP, SAR)")]
        public string Currency { get; set; }
        
        [Required(ErrorMessage = "حالة الدفع مطلوبة")]
        [StringLength(50, ErrorMessage = "حالة الدفع يجب ألا تتجاوز 50 حرف")]
        [RegularExpression(@"^(Pending|Processing|Completed|Failed|Refunded|Cancelled)$", ErrorMessage = "حالة الدفع غير صالحة")]
        public string Status { get; set; }
        
        [StringLength(200, ErrorMessage = "معرف المعاملة يجب ألا يتجاوز 200 حرف")]
        public string? TransactionId { get; set; }
        
        [StringLength(100, ErrorMessage = "مزود الدفع يجب ألا يتجاوز 100 حرف")]
        [RegularExpression(@"^(Stripe|PayPal|Fawry|Paymob|PayTabs|HyperPay|Checkout|Other)$", ErrorMessage = "مزود الدفع غير مدعوم")]
        public string? PaymentProvider { get; set; }
        
        [StringLength(5000, ErrorMessage = "استجابة البوابة يجب ألا تتجاوز 5000 حرف")]
        public string? GatewayResponse { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public DateTimeOffset? CompletedAt { get; set; }
        
        public bool IsDeleted { get; set; }
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
