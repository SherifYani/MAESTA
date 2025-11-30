using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserWorkExperience
    {
        [Key]
        public int WorkExperienceId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string JobTitle { get; set; }
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Company { get; set; }
        
        public DateTimeOffset? StartDate { get; set; }
        
        public DateTimeOffset? EndDate { get; set; }
        
        [StringLength(2000)]
        public string? Description { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
