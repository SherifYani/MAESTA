using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class SavedJob
    {
        [Key]
        [Required]
        public int UserId { get; set; }
        
        [Key]
        [Required]
        public int JobId { get; set; }
        
        [Required]
        public DateTimeOffset SavedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("JobId")]
        public Job? Job { get; set; }

    }


}
