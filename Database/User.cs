using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class User
    {
        [Key]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "البريد الإلكتروني مطلوب")]
        [EmailAddress(ErrorMessage = "صيغة البريد الإلكتروني غير صحيحة")]
        [StringLength(100, ErrorMessage = "البريد الإلكتروني يجب ألا يتجاوز 100 حرف")]
        public string Email { get; set; }
        
        [Required(ErrorMessage = "كلمة المرور مطلوبة")]
        [StringLength(500, ErrorMessage = "كلمة المرور المشفرة يجب ألا تتجاوز 500 حرف")]
        public string PasswordHash { get; set; }
        
        [StringLength(20, ErrorMessage = "رقم الهاتف يجب ألا يتجاوز 20 حرف")]
        [RegularExpression(@"^\+?[0-9]{10,15}$", ErrorMessage = "صيغة رقم الهاتف غير صحيحة")]
        public string? Phone { get; set; }
        
        public bool IsPhoneVerified { get; set; }
        
        public bool IsEmailVerified { get; set; }
        
        [Range(0, 10, ErrorMessage = "عدد محاولات تسجيل الدخول الفاشلة يجب أن يكون بين 0 و 10")]
        public int FailedLoginAttempts { get; set; }
        
        public DateTimeOffset? LockoutEndDate { get; set; }
        
        public bool TwoFactorEnabled { get; set; }
        
        [StringLength(200, ErrorMessage = "مفتاح التحقق الثنائي يجب ألا يتجاوز 200 حرف")]
        public string? TwoFactorSecretKey { get; set; }
        
        [StringLength(30, ErrorMessage = "نوع المستخدم يجب ألا يتجاوز 30 حرف")]
        [RegularExpression(@"^(Admin|Freelancer|Employer|JobSeeker|Client)?$", ErrorMessage = "نوع المستخدم غير صالح")]
        public string? UserType { get; set; } // nullable - استخدم IsFreelancer, IsJobSeeker, etc بدلاً منه
        
        public DateTimeOffset? LastLoginAt { get; set; }
        
        public DateTimeOffset? LastSeenAt { get; set; }
        
        public bool IsActive { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        // ===== COMPUTED COLUMNS: Multi-Role Support =====
        // هذه الحقول محسوبة تلقائياً من قاعدة البيانات
        // تسمح للمستخدم بأن يكون له عدة أدوار في نفس الوقت
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsFreelancer { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsJobSeeker { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsEmployer { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsClient { get; private set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public bool IsAdmin { get; private set; }
        
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
