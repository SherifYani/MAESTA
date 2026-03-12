using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class BlockedUser
    {
        [Key]
        public int BlockId { get; set; }
        
        [Required]
        public int BlockedByUserId { get; set; }
        
        [Required]
        public int BlockedUserId { get; set; }
        
        [StringLength(500)]
        public string? Reason { get; set; }
        
        [Required]
        public DateTimeOffset BlockedAt { get; set; }

        [ForeignKey("BlockedByUserId")]
        public User? BlockerUser { get; set; }

        [ForeignKey("BlockedUserId")]
        public User? BlockedUserEntity { get; set; }

    }


}
