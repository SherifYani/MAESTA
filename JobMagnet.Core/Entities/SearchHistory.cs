using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class SearchHistory
    {
        [Key]
        public int SearchId { get; set; }
        
        public int? UserId { get; set; }
        
        [Required]
        [StringLength(500)]
        public string QueryText { get; set; }
        
        [StringLength(2000)]
        public string? Filters { get; set; }
        
        [Range(0, 100000)]
        public int? ResultsCount { get; set; }
        
        [Required]
        public DateTimeOffset ExecutedAt { get; set; }
        
        [StringLength(45)]
        [RegularExpression(@"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4})$")]
        public string? IpAddress { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
