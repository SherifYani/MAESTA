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
        public DateTimeOffset UpdatedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
