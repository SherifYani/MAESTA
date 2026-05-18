using JobMagnet.Application.Interfaces;
using JobMagnet.API.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace JobMagnet.API.Services
{
    public class SignalRRealTimeService : IRealTimeService
    {
        private readonly IHubContext<ChatHub> _chatHubContext;
        private readonly IHubContext<NotificationHub> _notificationHubContext;

        public SignalRRealTimeService(
            IHubContext<ChatHub> chatHubContext,
            IHubContext<NotificationHub> notificationHubContext)
        {
            _chatHubContext = chatHubContext;
            _notificationHubContext = notificationHubContext;
        }

        public async Task SendMessageAsync(object messageDto, string receiverId)
        {
            await _chatHubContext.Clients.Group(receiverId).SendAsync("ReceiveMessage", messageDto);
        }

        public async Task SendNotificationAsync(object notificationDto, string userId)
        {
            await _notificationHubContext.Clients.Group(userId).SendAsync("ReceiveNotification", notificationDto);
        }
    }
}
