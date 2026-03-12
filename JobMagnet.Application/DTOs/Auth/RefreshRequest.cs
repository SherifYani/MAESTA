using System.ComponentModel.DataAnnotations;

namespace JobMagnet.Application.DTOs.Auth
{
    public class RefreshRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
