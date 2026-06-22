using JobMagnet.Application.Interfaces;
using JobMagnet.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMagnet.Application.Services
{
    public class PlatformSettingsService : IPlatformSettingsService
    {
        private readonly JobMagnetDbContext _context;

        public PlatformSettingsService(JobMagnetDbContext context)
        {
            _context = context;
        }

        public async Task<string?> GetValueAsync(string key)
        {
            return await _context.PlatformSettings
                .AsNoTracking()
                .Where(s => s.SettingKey == key && !s.IsDeleted)
                .Select(s => s.SettingValue)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> GetBoolAsync(string key, bool defaultValue = false)
        {
            var value = await GetValueAsync(key);
            if (string.IsNullOrWhiteSpace(value)) return defaultValue;
            return value.Trim().ToLowerInvariant() switch
            {
                "true" or "1" or "yes" or "on" => true,
                "false" or "0" or "no" or "off" => false,
                _ => defaultValue
            };
        }

        public async Task<decimal> GetDecimalAsync(string key, decimal defaultValue = 0m)
        {
            var value = await GetValueAsync(key);
            return decimal.TryParse(value, out var parsed) ? parsed : defaultValue;
        }
    }
}
