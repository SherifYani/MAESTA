using System;

namespace JobMagnet.Application.DTOs.Chat
{
    public class BlockedUserDto
    {
        public int BlockId { get; set; }
        public int BlockedUserId { get; set; }
        public string BlockedUserName { get; set; } = string.Empty;
        public string? BlockedUserProfilePicture { get; set; }
        public string? Reason { get; set; }
        public DateTimeOffset BlockedAt { get; set; }
    }
}