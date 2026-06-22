using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class ErrorLog
    {
        [Key]
        public int ErrorId { get; set; }
        
        [Required]
        [StringLength(1000)]
        public string ExceptionMessage { get; set; }
        
        [StringLength(10000)]
        public string? StackTrace { get; set; }
        
        [StringLength(5000)]
        public string? RequestBody { get; set; }
        
        [StringLength(500)]
        [Url]
        public string? Url { get; set; }
        
        public int? UserId { get; set; }
        
        [Required]
        public DateTimeOffset LoggedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
