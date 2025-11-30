using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class FreelancerTag
    {
        [Key]
        [Required]
        public int FreelancerId { get; set; }
        [Key]
        [Required]
        public int TagId { get; set; }

        [ForeignKey("FreelancerId")]
        public Freelancer? Freelancer { get; set; }

    }


}
