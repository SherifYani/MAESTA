namespace JobMagnet.Application.DTOs.Gig
{
    public class CreateGigRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public string Currency { get; set; } = string.Empty;
        public int ExpectedDurationDays { get; set; }
    }

    public class SubmitProposalRequest
    {
        public decimal BidAmount { get; set; }
        public int EstimatedDays { get; set; }
        public string CoverLetter { get; set; } = string.Empty;
    }

    public class GigDto
    {
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Budget { get; set; }
        public string Currency { get; set; } = string.Empty;
        public int ExpectedDurationDays { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class ProposalDto
    {
        public int ProposalId { get; set; }
        public int ProjectId { get; set; }
        public int FreelancerId { get; set; }
        public string FreelancerName { get; set; } = string.Empty;
        public decimal BidAmount { get; set; }
        public int EstimatedDays { get; set; }
        public string CoverLetter { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }
}
