using JobMagnet.Application.DTOs.Notification;
using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using JobMagnet.Domain.Entities;

namespace JobMagnet.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly JobMagnetDbContext _context;
        private readonly IRealTimeService _realTimeService;

        public NotificationService(JobMagnetDbContext context, IRealTimeService realTimeService)
        {
            _context = context;
            _realTimeService = realTimeService;
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsAsync(int userId, int page = 1, int limit = 20)
        {
            return await _context.Notifications
                .AsNoTracking()
                .Where(n => n.UserId == userId && !n.IsDeleted)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    Title = n.Title ?? string.Empty,
                    Message = n.Message,
                    Type = n.NotificationType,
                    IsRead = n.IsRead,
                    ActionUrl = n.RedirectUrl,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<UnreadCountDto> GetUnreadCountAsync(int userId)
        {
            var count = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead && !n.IsDeleted)
                .CountAsync();

            return new UnreadCountDto { Count = count };
        }

        public async Task MarkAsReadAsync(int userId, int notificationId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId && !n.IsDeleted);

            if (notification != null && !notification.IsRead)
            {
                notification.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            var unread = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead && !n.IsDeleted)
                .ToListAsync();

            if (unread.Any())
            {
                foreach (var note in unread)
                {
                    note.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteNotificationAsync(int userId, int notificationId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId && !n.IsDeleted);

            if (notification != null)
            {
                notification.IsDeleted = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<NotificationPreferencesDto> GetPreferencesAsync(int userId)
        {
            var settings = await _context.UserSettings.FindAsync(userId);
            if (settings == null)
            {
                return new NotificationPreferencesDto { EmailNotifications = true, PushNotifications = true, Language = "en" };
            }

            return new NotificationPreferencesDto
            {
                EmailNotifications = settings.EmailNotifications,
                SmsNotifications = settings.SmsNotifications,
                PushNotifications = settings.PushNotifications,
                Language = settings.Language
            };
        }

        public async Task UpdatePreferencesAsync(int userId, NotificationPreferencesDto preferences)
        {
            var settings = await _context.UserSettings.FindAsync(userId);
            if (settings == null)
            {
                settings = new UserSettings 
                { 
                    UserId = userId, 
                    CreatedAt = DateTimeOffset.UtcNow,
                    Language = preferences.Language 
                };
                _context.UserSettings.Add(settings);
            }

            settings.EmailNotifications = preferences.EmailNotifications;
            settings.SmsNotifications = preferences.SmsNotifications;
            settings.PushNotifications = preferences.PushNotifications;
            settings.Language = preferences.Language;
            settings.UpdatedAt = DateTimeOffset.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task SubscribePushAsync(int userId, string deviceToken)
        {
            // For now, we store this in UserSettings.Preferences or a dedicated table.
            // Let's assume UserSettings.Preferences JSON string for now to avoid migrations.
            var settings = await _context.UserSettings.FindAsync(userId);
            if (settings == null)
            {
                settings = new UserSettings { UserId = userId, CreatedAt = DateTimeOffset.UtcNow, Language = "en" };
                _context.UserSettings.Add(settings);
            }

            settings.Preferences = deviceToken; // Simple storage for trial
            await _context.SaveChangesAsync();
        }

        public async Task UnsubscribePushAsync(int userId)
        {
            var settings = await _context.UserSettings.FindAsync(userId);
            if (settings != null)
            {
                settings.Preferences = null; // Clear device token
                settings.UpdatedAt = DateTimeOffset.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Helper for other services to trigger notifications
        public async Task CreateNotificationAsync(int userId, string title, string message, string type, string? actionUrl = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                NotificationType = type,
                RedirectUrl = actionUrl,
                CreatedAt = DateTimeOffset.UtcNow,
                IsRead = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Push via RealTimeService
            await _realTimeService.SendNotificationAsync(new 
            {
                notification.NotificationId,
                notification.Title,
                notification.Message,
                Type = notification.NotificationType,
                ActionUrl = notification.RedirectUrl,
                notification.CreatedAt
            }, userId.ToString());
        }
    }
}
