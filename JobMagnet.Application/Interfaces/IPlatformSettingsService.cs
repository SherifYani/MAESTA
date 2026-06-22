namespace JobMagnet.Application.Interfaces
{
    public interface IPlatformSettingsService
    {
        Task<string?> GetValueAsync(string key);
        Task<bool> GetBoolAsync(string key, bool defaultValue = false);
        Task<decimal> GetDecimalAsync(string key, decimal defaultValue = 0m);
    }
}
