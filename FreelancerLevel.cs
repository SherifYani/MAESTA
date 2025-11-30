using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class FreelancerLevel
    {
        [Key]
        public int LevelId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string LevelName { get; set; }
        
        [Range(0, 5)]
        public decimal? MinRating { get; set; }
        
        [Range(0, 10000)]
        public int? MinCompletedProjects { get; set; }
        
        [StringLength(500)]
        public string? Description { get; set; }
    }


}
