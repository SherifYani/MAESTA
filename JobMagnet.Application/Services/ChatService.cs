using JobMagnet.Domain.Entities;
using JobMagnet.Application.DTOs.Chat;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace JobMagnet.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly JobMagnetDbContext _context;
        private readonly IRealTimeService _realTimeService;

        public ChatService(JobMagnetDbContext context, IRealTimeService realTimeService)
        {
            _context = context;
            _realTimeService = realTimeService;
        }

        public async Task<IEnumerable<ChatConversationDto>> GetMyConversationsAsync(int userId)
        {
            var chats = await _context.Chats
                .Where(c => (c.User1Id == userId && !c.IsArchivedByUser1) || (c.User2Id == userId && !c.IsArchivedByUser2))
                .ToListAsync();

            var conversations = new List<ChatConversationDto>();

            foreach(var chat in chats)
            {
                var otherUserId = chat.User1Id == userId ? chat.User2Id : chat.User1Id;
                var otherUser = await _context.Users.FindAsync(otherUserId);
                
                var lastMessage = await _context.Messages
                    .Where(m => m.ChatId == chat.ChatId && !m.IsDeleted)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                var unreadCount = await _context.Messages
                    .Where(m => m.ChatId == chat.ChatId && m.SenderId == otherUserId && !m.IsRead)
                    .CountAsync();

                conversations.Add(new ChatConversationDto
                {
                    UserId = otherUserId,
                    UserName = otherUser != null ? $"{otherUser.FirstName} {otherUser.LastName}" : "Unknown",
                    UserProfilePicture = otherUser?.ProfilePictureUrl,
                    LastMessage = lastMessage != null ? MapMessage(lastMessage, otherUser?.FirstName, "You", otherUserId) : null,
                    UnreadCount = unreadCount
                });
            }
            return conversations.OrderByDescending(c => c.LastMessage?.CreatedAt).ToList();
        }

        public async Task<IEnumerable<ChatMessageDto>> GetChatMessagesAsync(int userId, int otherUserId)
        {
            var chat = await _context.Chats.FirstOrDefaultAsync(c => 
                (c.User1Id == userId && c.User2Id == otherUserId) || 
                (c.User1Id == otherUserId && c.User2Id == userId));

            if (chat == null) return new List<ChatMessageDto>();

            var messages = await _context.Messages
                .AsNoTracking()
                .Where(m => m.ChatId == chat.ChatId && !m.IsDeleted)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            return messages.Select(m => MapMessage(m, "", "", m.SenderId == userId ? otherUserId : userId));
        }

        public async Task<ChatMessageDto> SendMessageAsync(int senderId, SendMessageRequest request)
        {
            var sender = await _context.Users.FindAsync(senderId);
            var receiver = await _context.Users.FindAsync(request.ReceiverId);

            if (receiver == null || receiver.IsDeleted)
                throw new KeyNotFoundException("Receiver not found");

            // Find or create chat session
            var chat = await _context.Chats
                .FirstOrDefaultAsync(c => 
                    (c.User1Id == senderId && c.User2Id == request.ReceiverId) ||
                    (c.User1Id == request.ReceiverId && c.User2Id == senderId));

            if (chat == null)
            {
                chat = new Domain.Entities.Chat { User1Id = senderId, User2Id = request.ReceiverId };
                _context.Chats.Add(chat);
                await _context.SaveChangesAsync();
            }

            var message = new Domain.Entities.Message
            {
                ChatId = chat.ChatId,
                SenderId = senderId,
                Content = request.Content,
                IsRead = false,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var dto = MapMessage(message, sender != null ? $"{sender.FirstName} {sender.LastName}" : "", $"{receiver.FirstName} {receiver.LastName}", request.ReceiverId);

            // Push via RealTimeService
            await _realTimeService.SendMessageAsync(dto, request.ReceiverId.ToString());

            return dto;
        }

        public async Task MarkMessagesAsReadAsync(int userId, int senderId)
        {
            var chat = await _context.Chats.FirstOrDefaultAsync(c => 
                (c.User1Id == userId && c.User2Id == senderId) || 
                (c.User1Id == senderId && c.User2Id == userId));

            if (chat == null) return;

            var unreadMessages = await _context.Messages
                .Where(m => m.ChatId == chat.ChatId && m.SenderId == senderId && !m.IsRead && !m.IsDeleted)
                .ToListAsync();

            foreach (var msg in unreadMessages)
            {
                msg.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteMessageAsync(int userId, int messageId)
        {
            var message = await _context.Messages.FirstOrDefaultAsync(m => m.MessageId == messageId && m.SenderId == userId);
            if (message == null) throw new KeyNotFoundException("Message not found or unauthorized");

            message.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        public async Task BlockUserAsync(int userId, int userToBlockId, string reason)
        {
            var existing = await _context.BlockedUsers.AnyAsync(b => b.BlockedByUserId == userId && b.BlockedUserId == userToBlockId);
            if (existing) return;

            var block = new BlockedUser
            {
                BlockedByUserId = userId,
                BlockedUserId = userToBlockId,
                Reason = reason,
                BlockedAt = DateTimeOffset.UtcNow
            };

            _context.BlockedUsers.Add(block);
            await _context.SaveChangesAsync();
        }

        public async Task ReportConversationAsync(int userId, int otherUserId, string reason, string details)
        {
            var report = new Report
            {
                ReportedBy = userId,
                EntityType = "Message",
                EntityId = otherUserId, // Reporting the user or the chat? The frontend usually reports the user/convo
                Reason = reason,
                Details = details,
                Status = "Pending",
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ChatMessageDto>> SearchMessagesAsync(int userId, string query)
        {
            var chats = await _context.Chats
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .Select(c => c.ChatId)
                .ToListAsync();

            var messages = await _context.Messages
                .Where(m => chats.Contains(m.ChatId) && m.Content.Contains(query) && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return messages.Select(m => MapMessage(m, "", "", 0)); // Simplified mapping
        }

        public async Task ArchiveConversationAsync(int userId, int otherUserId)
        {
            var chat = await _context.Chats.FirstOrDefaultAsync(c =>
                (c.User1Id == userId && c.User2Id == otherUserId) ||
                (c.User1Id == otherUserId && c.User2Id == userId));

            if (chat == null) return;

            if (chat.User1Id == userId) chat.IsArchivedByUser1 = true;
            else chat.IsArchivedByUser2 = true;

            await _context.SaveChangesAsync();
        }

        public async Task UnarchiveConversationAsync(int userId, int otherUserId)
        {
            var chat = await _context.Chats.FirstOrDefaultAsync(c =>
                (c.User1Id == userId && c.User2Id == otherUserId) ||
                (c.User1Id == otherUserId && c.User2Id == userId));

            if (chat == null) return;

            if (chat.User1Id == userId) chat.IsArchivedByUser1 = false;
            else chat.IsArchivedByUser2 = false;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateTypingStatusAsync(int userId, int otherUserId, bool isTyping)
        {
            // Usually this is handled in real-time without DB persistence for "UX"
            // but we can notify via RealTimeService
            await _realTimeService.SendNotificationAsync(new DTOs.Notification.NotificationDto { 
                Type = "Typing",
                Message = isTyping ? "typing..." : "",
                CreatedAt = DateTimeOffset.UtcNow
            }, otherUserId.ToString());
        }

        private static ChatMessageDto MapMessage(Domain.Entities.Message m, string? senderName, string? receiverName, int receiverId) => new()
        {
            ChatId = m.ChatId,
            SenderId = m.SenderId,
            SenderName = senderName ?? "",
            ReceiverId = receiverId,
            ReceiverName = receiverName ?? "",
            Content = m.Content,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt
        };
    }
}
