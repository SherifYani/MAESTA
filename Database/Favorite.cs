using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Favorite
    {
        [Key]
        [Required]
        public int UserId { get; set; }
        
        [Key]
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Job|Project|Freelancer|User)$")]
        public string EntityType { get; set; }
        
        [Key]
        [Required]
        public int EntityId { get; set; }
        
        [Required]
        public DateTimeOffset SavedAt { get; set; }
        
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
