using JobMagnet.Application.DTOs.Notification;

namespace JobMagnet.Application.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetNotificationsAsync(int userId, int page, int limit);
        Task<UnreadCountDto> GetUnreadCountAsync(int userId);
        Task MarkAsReadAsync(int userId, int notificationId);
        Task MarkAllAsReadAsync(int userId);
        Task DeleteNotificationAsync(int userId, int notificationId);
        Task<NotificationPreferencesDto> GetPreferencesAsync(int userId);
        Task UpdatePreferencesAsync(int userId, NotificationPreferencesDto preferences);
        Task SubscribePushAsync(int userId, string deviceToken);
        Task CreateNotificationAsync(int userId, string title, string message, string type, string? actionUrl = null);
    }
}
