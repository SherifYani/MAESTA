using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserSkill
    {
        [Key]
        public int UserId { get; set; }
        [Key]
        public int SkillId { get; set; }
        
        [Range(0, 50, ErrorMessage = "سنوات الخبرة يجب أن تكون بين 0 و 50")]
        public int? ProvenYears { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط الشهادة يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط الشهادة غير صحيحة")]
        public string? CertificateUrl { get; set; }
        
        public int? VerifiedBy { get; set; }
        
        public DateTimeOffset? VerifiedAt { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("SkillId")]
        public Skill? Skill { get; set; }
    }


}
