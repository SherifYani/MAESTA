using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserBadge
    {
        [Key]
        [Required]
        public int UserId { get; set; }
        
        [Key]
        [Required]
        public int BadgeId { get; set; }
        
        [Required]
        public DateTimeOffset AwardedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
