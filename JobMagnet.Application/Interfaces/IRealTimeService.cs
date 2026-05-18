using System.Threading.Tasks;

namespace JobMagnet.Application.Interfaces
{
    public interface IRealTimeService
    {
        Task SendMessageAsync(object messageDto, string receiverId);
        Task SendNotificationAsync(object notificationDto, string userId);
    }
}
