using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Timesheet
    {
        [Key]
        public int TimesheetId { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        public int FreelancerUserId { get; set; }
        
        [Required]
        [Range(0.1, 24)]
        public decimal Hours { get; set; }
        
        [Required]
        public DateTimeOffset Date { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        [ForeignKey("FreelancerUserId")]
        public User? User { get; set; }

    }


}
