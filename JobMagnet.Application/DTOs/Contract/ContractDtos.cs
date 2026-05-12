using System.ComponentModel.DataAnnotations;

namespace JobMagnet.Application.DTOs.Contract
{
    public class ContractResponse
    {
        public int ContractId { get; set; }
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public int ClientUserId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public int FreelancerUserId { get; set; }
        public string FreelancerName { get; set; } = string.Empty;
        public string Terms { get; set; } = string.Empty;
        public DateTimeOffset? SignedDate { get; set; }
        public string? ContractFileUrl { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public List<MilestoneDto> Milestones { get; set; } = new();
    }

    public class CreateContractRequest
    {
        [Required]
        public int ProposalId { get; set; }

        [Required]
        [MinLength(20)]
        public string Terms { get; set; } = string.Empty;

        public List<CreateMilestoneRequest> Milestones { get; set; } = new();
    }

    public class MilestoneDto
    {
        public int MilestoneId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTimeOffset? DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateMilestoneRequest
    {
        [Required]
        [StringLength(200, MinimumLength = 5)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, 10000000)]
        public decimal Amount { get; set; }

        public DateTimeOffset? DueDate { get; set; }
    }

    public class SubmitDeliveryRequest
    {
        [Required]
        public string FileUrl { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Message { get; set; }
    }
}
