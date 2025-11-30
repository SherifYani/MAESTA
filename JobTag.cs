using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class JobTag
    {
        [Key]
        [Required]
        public int JobId { get; set; }
        [Key]
        [Required]
        public int TagId { get; set; }

        [ForeignKey("JobId")]
        public Job? Job { get; set; }

    }


}
