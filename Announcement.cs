using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Announcement
    {
        [Key]
        public int AnnouncementId { get; set; }
        
        [Required]
        [StringLength(200, MinimumLength = 5)]
        public string Title { get; set; }
        
        [Required]
        [StringLength(5000, MinimumLength = 10)]
        public string Content { get; set; }
        
        [StringLength(100)]
        [RegularExpression(@"^(All|Freelancers|Employers|Admins|JobSeekers)$")]
        public string? TargetUsers { get; set; }
        
        public DateTimeOffset? ExpiryDate { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
