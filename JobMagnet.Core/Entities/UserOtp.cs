using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{
    public enum OtpType
    {
        EmailVerification,
        PasswordReset,
        TwoFactorAuth
    }

    public class UserOtp
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Code { get; set; }

        [Required]
        public OtpType Type { get; set; }

        [Required]
        public DateTimeOffset ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey("UserId")]
        public virtual User User { get; set; }
    }
}
