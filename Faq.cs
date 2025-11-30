using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Faq
    {
        [Key]
        public int FaqId { get; set; }
        
        [Required]
        [StringLength(500, MinimumLength = 5)]
        public string Question { get; set; }
        
        [Required]
        [StringLength(5000, MinimumLength = 10)]
        public string Answer { get; set; }
        
        [StringLength(100)]
        public string? Category { get; set; }
    }


}
