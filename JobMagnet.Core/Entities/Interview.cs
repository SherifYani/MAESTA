using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{
    public class Interview
    {
        [Key]
        public int InterviewId { get; set; }

        [Required]
        public int JobApplicationId { get; set; }

        [Required]
        public int EmployerId { get; set; }

        [Required]
        public int JobSeekerId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        public DateTimeOffset ScheduledAt { get; set; }

        public int DurationMinutes { get; set; } = 30;

        [StringLength(500)]
        public string? MeetingLink { get; set; }

        [StringLength(500)]
        public string? Location { get; set; }

        [Required]
        [StringLength(50)]
        [RegularExpression(@"^(Scheduled|Rescheduled|Accepted|Rejected|Completed|Cancelled)$")]
        public string Status { get; set; } = "Scheduled";

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public int? CreatedBy { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public int? UpdatedBy { get; set; }

        public bool IsDeleted { get; set; }

        [ForeignKey("JobApplicationId")]
        public JobApplication? JobApplication { get; set; }

        [ForeignKey("EmployerId")]
        public Employer? Employer { get; set; }

        [ForeignKey("JobSeekerId")]
        public JobSeeker? JobSeeker { get; set; }
    }
}
