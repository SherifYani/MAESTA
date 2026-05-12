using System;

namespace JobMagnet.Application.DTOs.Interview
{
    public class InterviewDto
    {
        public int InterviewId { get; set; }
        public int JobApplicationId { get; set; }
        public int EmployerId { get; set; }
        public string EmployerName { get; set; } = string.Empty;
        public int JobSeekerId { get; set; }
        public string JobSeekerName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTimeOffset ScheduledAt { get; set; }
        public int DurationMinutes { get; set; }
        public string? MeetingLink { get; set; }
        public string? Location { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class ScheduleInterviewRequest
    {
        public int JobApplicationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTimeOffset ScheduledAt { get; set; }
        public int DurationMinutes { get; set; } = 30;
        public string? MeetingLink { get; set; }
        public string? Location { get; set; }
    }

    public class UpdateInterviewStatusRequest
    {
        public string Status { get; set; } = string.Empty; // Accepted, Rejected, Completed, Cancelled
        public string? Reason { get; set; }
    }

    public class RescheduleInterviewRequest
    {
        public DateTimeOffset NewScheduledAt { get; set; }
        public string? Reason { get; set; }
    }
}
