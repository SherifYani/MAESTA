using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class SavedFreelancer
    {
        [Key]
        [Required]
        public int UserId { get; set; }
        
        [Key]
        [Required]
        public int FreelancerUserId { get; set; }
        
        [Required]
        public DateTimeOffset SavedAt { get; set; }

        [ForeignKey("UserId")]
        public User? SavedByUser { get; set; }

        [ForeignKey("FreelancerUserId")]
        public User? FreelancerUser { get; set; }

    }


}
