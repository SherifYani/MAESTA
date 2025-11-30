using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "نوع المعاملة مطلوب")]
        [StringLength(50, ErrorMessage = "نوع المعاملة يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^(Deposit|Withdrawal|Payment|Refund|Commission|Bonus|Penalty|Transfer)$", ErrorMessage = "نوع المعاملة غير صالح")]
        public string Type { get; set; }
        
        [Required(ErrorMessage = "المبلغ مطلوب")]
        public decimal Amount { get; set; }
        
        [StringLength(50, ErrorMessage = "الحالة يجب ألا تتجاوز 50 حرف")]
        [RegularExpression(@"^(Pending|Completed|Failed|Cancelled|Reversed)$", ErrorMessage = "الحالة غير صالحة")]
        public string? Status { get; set; }
        
        [StringLength(500, ErrorMessage = "الوصف يجب ألا يتجاوز 500 حرف")]
        public string? Description { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
