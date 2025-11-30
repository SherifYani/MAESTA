using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Chat
    {
        [Key]
        public int ChatId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم الأول مطلوب")]
        public int User1Id { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم الثاني مطلوب")]
        public int User2Id { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
