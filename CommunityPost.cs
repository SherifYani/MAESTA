using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class CommunityPost
    {
        [Key]
        public int CommunityPostId { get; set; }
        
        [Required]
        public int PostedByUserId { get; set; }
        [Required]
        [StringLength(300, MinimumLength = 5)]
        public string Title { get; set; }
        [Required]
        [StringLength(10000, MinimumLength = 10)]
        public string Content { get; set; }
        
        [StringLength(50)]
        [RegularExpression(@"^(Question|Discussion|Tip|News|Job|Other)$")]
        public string? PostType { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("PostedByUserId")]
        public User? User { get; set; }

    }


}
