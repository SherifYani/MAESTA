using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class SupportTicket
    {
        [Key]
        public int TicketId { get; set; }
        
        [Required]
        public int CreatedByUserId { get; set; }
        
        [Required(ErrorMessage = "عنوان التذكرة مطلوب")]
        [StringLength(200, MinimumLength = 5)]
        public string Subject { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Open|InProgress|Resolved|Closed)$")]
        public string Status { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("CreatedByUserId")]
        public User? User { get; set; }

    }


}
