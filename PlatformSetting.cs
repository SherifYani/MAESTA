using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class PlatformSetting
    {
        [Key]
        public int SettingId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string SettingKey { get; set; }
        
        [Required]
        [StringLength(1000)]
        public string SettingValue { get; set; }
        
        [StringLength(100)]
        public string? Category { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
