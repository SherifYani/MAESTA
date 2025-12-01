using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Message
    {
        [Key]
        public int MessageId { get; set; }
        
        [Required(ErrorMessage = "معرف المحادثة مطلوب")]
        public int ChatId { get; set; }
        
        [Required(ErrorMessage = "معرف المرسل مطلوب")]
        public int SenderId { get; set; }
        
        [Required(ErrorMessage = "محتوى الرسالة مطلوب")]
        [StringLength(5000, MinimumLength = 1, ErrorMessage = "محتوى الرسالة يجب أن يكون بين 1 و 5000 حرف")]
        public string Content { get; set; }
        
        public bool IsRead { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset SentAt { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
