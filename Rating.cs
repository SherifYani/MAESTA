using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Rating
    {
        [Key]
        public int RatingId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [Range(0, 5)]
        public double AverageRating { get; set; }
        
        [Required]
        [Range(0, 100000)]
        public int TotalReviews { get; set; }
        
        [Required]
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
