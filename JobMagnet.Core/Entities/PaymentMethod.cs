using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{
    public class PaymentMethod
    {
        [Key]
        public int PaymentMethodId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(50)]
        public string Provider { get; set; } = string.Empty; // e.g., "Visa", "PayPal"

        [Required]
        [StringLength(100)]
        public string AccountIdentifier { get; set; } = string.Empty; // e.g., "**** 1234" or email

        public bool IsDefault { get; set; }

        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
