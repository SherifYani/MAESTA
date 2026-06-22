using JobMagnet.Application.Interfaces;
using System.Security.Claims;

namespace JobMagnet.API.Middleware
{
    public class MaintenanceModeMiddleware
    {
        private static readonly string[] AllowedPrefixes =
        {
            "/api/Auth/login",
            "/api/Auth/refresh-token",
            "/api/Auth/me",
            "/api/Admin",
            "/swagger",
            "/hubs"
        };

        private readonly RequestDelegate _next;

        public MaintenanceModeMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IPlatformSettingsService settingsService)
        {
            var maintenanceEnabled = await settingsService.GetBoolAsync("maintenanceMode", false);
            if (!maintenanceEnabled)
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.Value ?? string.Empty;
            var isAllowedPath = AllowedPrefixes.Any(prefix => path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
            var isAdmin = context.User.Claims.Any(claim => claim.Type == ClaimTypes.Role && claim.Value == "Admin");

            if (isAllowedPath || isAdmin)
            {
                await _next(context);
                return;
            }

            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsJsonAsync(new
            {
                message = "Platform is currently in maintenance mode. Please try again later."
            });
        }
    }
}
