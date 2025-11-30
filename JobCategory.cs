using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class JobCategory
    {
        [Key]
        [Required]
        public int JobId { get; set; }
        [Key]
        [Required]
        public int CategoryId { get; set; }

        [ForeignKey("JobId")]
        public Job? Job { get; set; }

    }


}
