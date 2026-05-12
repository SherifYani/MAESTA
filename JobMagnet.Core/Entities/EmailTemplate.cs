using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class EmailTemplate
    {
        [Key]
        public int EmailTemplateId { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string TemplateName { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Subject { get; set; }
        
        [Required]
        [StringLength(50000, MinimumLength = 10)]
        public string Body { get; set; }
        
        [StringLength(2000)]
        public string? VariablesJson { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
