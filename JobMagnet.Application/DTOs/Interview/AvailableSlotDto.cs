using System;

namespace JobMagnet.Application.DTOs.Interview
{
    public class AvailableSlotDto
    {
        public string Time { get; set; } = string.Empty;        // e.g., "09:00"
        public bool Available { get; set; }
        public DateTimeOffset DateTime { get; set; }
        public int DurationMinutes { get; set; } = 30;
    }
}