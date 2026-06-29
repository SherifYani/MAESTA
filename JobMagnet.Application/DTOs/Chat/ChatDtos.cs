namespace JobMagnet.Application.DTOs.Chat
{
    // ─── Request DTOs ─────────────────────────────────────────────────────────
    public class SendMessageRequest
    {
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
    }

    public class BlockUserRequest
    {
        public int UserId { get; set; }
        public string? Reason { get; set; }
    }

    public class ReportConversationRequest
    {
        public string Reason { get; set; } = string.Empty;
        public string? Details { get; set; }
    }

    // ─── Response DTOs ────────────────────────────────────────────────────────
    public class ChatMessageDto
    {
        public int MessageId { get; set; }
        public int ChatId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public int ReceiverId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class ChatConversationDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserProfilePicture { get; set; }
        public ChatMessageDto? LastMessage { get; set; }
        public int UnreadCount { get; set; }
    }
}
