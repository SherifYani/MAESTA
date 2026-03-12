using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class CommunityReply
    {
        [Key]
        public int CommunityReplyId { get; set; }
        
        [Required]
        public int PostId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(5000, MinimumLength = 1)]
        public string Content { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
