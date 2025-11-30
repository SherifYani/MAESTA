using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserSettings
    {
        [Key]
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(10)]
        [RegularExpression(@"^(en|ar|fr|es|de)$")]
        public string Language { get; set; }
        
        [StringLength(50)]
        public string? TimeZone { get; set; }
        
        public bool EmailNotifications { get; set; }
        
        public bool SmsNotifications { get; set; }
        
        public bool PushNotifications { get; set; }
        
        public bool DarkMode { get; set; }
        
        [StringLength(5000)]
        public string? Preferences { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
