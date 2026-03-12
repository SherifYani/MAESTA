using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class UserWallet
    {
        [Key]
        public int WalletId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [Range(0, 999999999)]
        public decimal Balance { get; set; }
        
        [Required]
        [StringLength(10)]
        [RegularExpression(@"^[A-Z]{3}$")]
        public string Currency { get; set; }
        
        [Required]
        public DateTimeOffset CreatedAt { get; set; }
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        public bool IsDeleted { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
