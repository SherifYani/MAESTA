using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserDocument
    {
        [Key]
        public int DocumentId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(100)]
        [RegularExpression(@"^(NationalID|Passport|DriversLicense|Certificate|Contract|Other)$")]
        public string DocumentType { get; set; }
        
        [Required]
        [StringLength(500)]
        [Url]
        public string FileUrl { get; set; }
        
        [StringLength(2000)]
        public string? Metadata { get; set; }
        
        public bool IsVerified { get; set; }
        
        [Required]
        public DateTimeOffset UploadedAt { get; set; }
        
        public DateTimeOffset? VerifiedAt { get; set; }
        
        public int? VerifiedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
