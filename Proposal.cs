using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Proposal
    {
        [Key]
        public int ProposalId { get; set; }
        
        [Required(ErrorMessage = "معرف المشروع مطلوب")]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "معرف المستقل مطلوب")]
        public int FreelancerUserId { get; set; }
        
        [Required(ErrorMessage = "المبلغ المقترح مطلوب")]
        [Range(0.01, 10000000, ErrorMessage = "المبلغ المقترح يجب أن يكون بين 0.01 و 10,000,000")]
        public decimal ProposedAmount { get; set; }
        
        [StringLength(5000, MinimumLength = 20, ErrorMessage = "نص العرض يجب أن يكون بين 20 و 5000 حرف")]
        public string? ProposalText { get; set; }
        
        [Required(ErrorMessage = "حالة العرض مطلوبة")]
        [StringLength(50, ErrorMessage = "حالة العرض يجب ألا تتجاوز 50 حرف")]
        [RegularExpression(@"^(Pending|Accepted|Rejected|Withdrawn)$", ErrorMessage = "حالة العرض غير صالحة")]
        public string Status { get; set; }
        
        public DateTimeOffset SentAt { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        [ForeignKey("FreelancerUserId")]
        public User? User { get; set; }

    }


}
