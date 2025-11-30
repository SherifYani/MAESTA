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
        
        public DateTimeOffset? UpdatedAt { get; set; }
    }


}
