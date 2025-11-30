using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class ProjectDelivery
    {
        [Key]
        public int ProjectDeliveryId { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        [Required]
        [StringLength(500)]
        [Url]
        public string FileUrl { get; set; }
        
        [StringLength(2000)]
        public string? Message { get; set; }
        
        public bool IsApproved { get; set; }
        
        [Required]
        public DateTimeOffset DeliveredAt { get; set; }
        
        public bool IsDeleted { get; set; }
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

    }


}
