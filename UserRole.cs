using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserRole
    {
        [Key]
        [Required]
        public int UserId { get; set; }
        [Key]
        [Required]
        public int RoleId { get; set; }
        
        [Required]
        public DateTimeOffset AssignedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
