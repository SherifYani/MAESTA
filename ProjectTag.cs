using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class ProjectTag
    {
        [Key]
        [Required]
        public int ProjectId { get; set; }
        
        [Key]
        [Required]
        public int TagId { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

    }


}
