using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserCertification
    {
        [Key]
        public int CertificationId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string CertificationName { get; set; }
        
        [StringLength(200)]
        public string? IssuedBy { get; set; }
        
        public DateTimeOffset? IssuedDate { get; set; }
        
        public DateTimeOffset? ExpiryDate { get; set; }
        
        [StringLength(500)]
        [Url]
        public string? CertificateUrl { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
