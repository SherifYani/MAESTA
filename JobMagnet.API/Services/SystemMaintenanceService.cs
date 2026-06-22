using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace JobMagnet.API.Services
{
    public class SystemMaintenanceService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SystemMaintenanceService> _logger;

        public SystemMaintenanceService(IServiceProvider serviceProvider, ILogger<SystemMaintenanceService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("System Maintenance Service is starting.");

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        await PerformMaintenanceTasks();
                        _logger.LogInformation("Maintenance tasks completed successfully.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error occurred while performing system maintenance.");
                    }

                    _logger.LogInformation("Waiting for 1 hour before next maintenance cycle...");
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("System Maintenance Service is stopping due to cancellation.");
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "System Maintenance Service crashed with a critical error.");
                throw;
            }

            _logger.LogInformation("System Maintenance Service has exited.");
        }

        private async Task PerformMaintenanceTasks()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<JobMagnetDbContext>();

                _logger.LogInformation("Running hourly maintenance tasks...");

                // 1. Clean up expired refresh tokens
                var expiredTokens = await context.RefreshTokens
                    .Where(t => t.ExpiresAt < DateTimeOffset.UtcNow || t.RevokedAt != null)
                    .ToListAsync();

                if (expiredTokens.Any())
                {
                    context.RefreshTokens.RemoveRange(expiredTokens);
                    _logger.LogInformation("Cleaned up {Count} expired or revoked refresh tokens.", expiredTokens.Count);
                }

                // 2. Auto-close expired jobs (example logic: jobs older than 30 days that are still active)
                var thirtyDaysAgo = DateTimeOffset.UtcNow.AddDays(-30);
                var expiredJobs = await context.Jobs
                    .Where(j => j.IsActive && j.CreatedAt < thirtyDaysAgo)
                    .ToListAsync();

                if (expiredJobs.Any())
                {
                    foreach (var job in expiredJobs)
                    {
                        job.IsActive = false;
                        job.UpdatedAt = DateTimeOffset.UtcNow;
                    }
                    _logger.LogInformation("Auto-closed {Count} expired jobs.", expiredJobs.Count);
                }

                await context.SaveChangesAsync();
            }
        }
    }
}
