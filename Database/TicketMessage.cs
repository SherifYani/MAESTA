using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class TicketMessage
    {
        [Key]
        public int TicketMessageId { get; set; }
        
        [Required]
        public int TicketId { get; set; }
        
        [Required]
        public int SenderUserId { get; set; }
        
        [Required]
        [StringLength(5000, MinimumLength = 1)]
        public string Message { get; set; }
        
        [Required]
        public DateTimeOffset SentAt { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("SenderUserId")]
        public User? User { get; set; }

    }


}
