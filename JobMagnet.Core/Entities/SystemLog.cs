using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class SystemLog
    {
        [Key]
        public int LogId { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Debug|Info|Warning|Error|Critical)$")]
        public string Level { get; set; }
        
        [Required]
        [StringLength(2000)]
        public string Message { get; set; }
        
        [StringLength(5000)]
        public string? Metadata { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
    }


}
