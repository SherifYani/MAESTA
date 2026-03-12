using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class FreelancerPortfolio
    {
        [Key]
        public int PortfolioId { get; set; }
        
        [Required]
        public int FreelancerId { get; set; }
        
        [Required]
        [StringLength(200, MinimumLength = 5)]
        public string ProjectTitle { get; set; }
        
        [StringLength(2000)]
        public string? Description { get; set; }
        
        [StringLength(5000)]
        public string? ImageUrlsJson { get; set; }
        
        [StringLength(500)]
        [Url]
        public string? ProjectUrl { get; set; }
        
        [StringLength(200)]
        public string? ClientName { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("FreelancerId")]
        public Freelancer? Freelancer { get; set; }

    }


}
