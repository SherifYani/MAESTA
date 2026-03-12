using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace JobMagnet.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private static readonly Dictionary<string, string> UserConnections = new();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections[userId] = Context.ConnectionId;
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier;
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections.Remove(userId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string receiverId, string message)
    {
        var senderId = Context.UserIdentifier;
        await Clients.Group(receiverId).SendAsync("ReceiveMessage", senderId, message);
    }

    public async Task SendTypingIndicator(string receiverId, bool isTyping)
    {
        var senderId = Context.UserIdentifier;
        await Clients.Group(receiverId).SendAsync("UserTyping", senderId, isTyping);
    }
}
