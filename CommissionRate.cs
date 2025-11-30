using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class CommissionRate
    {
        [Key]
        public int CommissionRateId { get; set; }
        
        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Freelancer|Employer|JobSeeker|Client)$")]
        public string UserType { get; set; }
        
        [Required]
        [Range(0, 100)]
        public decimal RatePercent { get; set; }
        
        [Required]
        public DateTimeOffset EffectiveDate { get; set; }
    }


}
