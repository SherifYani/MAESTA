namespace JobMagnet.Application.DTOs.Profile
{
    public class UserSettingsDto
    {
        public string Language { get; set; } = "en";
        public string? TimeZone { get; set; }
        public bool EmailNotifications { get; set; }
        public bool SmsNotifications { get; set; }
        public bool PushNotifications { get; set; }
        public bool DarkMode { get; set; }
        public string? Preferences { get; set; }
    }

    public class UpdateUserSettingsRequest
    {
        public string? Language { get; set; }
        public string? TimeZone { get; set; }
        public bool? EmailNotifications { get; set; }
        public bool? SmsNotifications { get; set; }
        public bool? PushNotifications { get; set; }
        public bool? DarkMode { get; set; }
        public string? Preferences { get; set; }
    }
}
