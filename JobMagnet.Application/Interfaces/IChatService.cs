using JobMagnet.Application.DTOs.Chat;

namespace JobMagnet.Application.Interfaces
{
    public interface IChatService
    {
        Task<IEnumerable<ChatConversationDto>> GetMyConversationsAsync(int userId);
        Task<IEnumerable<ChatMessageDto>> GetChatMessagesAsync(int userId, int otherUserId);
        Task<ChatMessageDto> SendMessageAsync(int senderId, SendMessageRequest request);
        Task MarkMessagesAsReadAsync(int userId, int senderId);
        Task DeleteMessageAsync(int userId, int messageId);
        Task BlockUserAsync(int userId, int userToBlockId, string reason);
        Task ReportConversationAsync(int userId, int otherUserId, string reason, string details);
        Task<IEnumerable<ChatMessageDto>> SearchMessagesAsync(int userId, string query);
        Task ArchiveConversationAsync(int userId, int otherUserId);
        Task UnarchiveConversationAsync(int userId, int otherUserId);
        Task UpdateTypingStatusAsync(int userId, int otherUserId, bool isTyping);
    }
}
