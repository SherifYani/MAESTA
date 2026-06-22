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

        [Required(ErrorMessage = "الاسم الأول مطلوب")]
        [StringLength(50, ErrorMessage = "الاسم الأول يجب ألا يتجاوز 50 حرف")]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "الاسم الأخير مطلوب")]
        [StringLength(50, ErrorMessage = "الاسم الأخير يجب ألا يتجاوز 50 حرف")]
        public string LastName { get; set; }

        [StringLength(500, ErrorMessage = "رابط الصورة الشخصية يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط الصورة غير صحيحة")]
        public string? ProfilePictureUrl { get; set; }

        public DateTimeOffset? DateOfBirth { get; set; }

        [StringLength(20, ErrorMessage = "الجنس يجب ألا يتجاوز 20 حرف")]
        [RegularExpression(@"^(Male|Female)$", ErrorMessage = "الجنس يجب أن يكون ذكر أو أنثى")]
        public string? Gender { get; set; }

        [StringLength(100, ErrorMessage = "الدولة يجب ألا تتجاوز 100 حرف")]
        public string? Country { get; set; }

        [StringLength(100, ErrorMessage = "المدينة يجب ألا تتجاوز 100 حرف")]
        public string? City { get; set; }

        [StringLength(500, ErrorMessage = "رابط LinkedIn يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط LinkedIn غير صحيحة")]
        public string? LinkedInUrl { get; set; }
        
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

        [Required(ErrorMessage = "حالة التسجيل مطلوبة")]
        [StringLength(30, ErrorMessage = "حالة التسجيل يجب ألا تتجاوز 30 حرف")]
        [RegularExpression(@"^(PendingStep2|PendingApproval|Approved)$", ErrorMessage = "حالة التسجيل غير صالحة")]
        public string RegistrationStatus { get; set; } = "PendingStep2";
        
        public DateTimeOffset? LastLoginAt { get; set; }
        
        public DateTimeOffset? LastSeenAt { get; set; }
        
        public bool IsActive { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        
        // ===== COMPUTED COLUMNS: Multi-Role Support =====
        // هذه الحقول محسوبة تلقائياً من قاعدة البيانات
        // تسمح للمستخدم بأن يكون له عدة أدوار في نفس الوقت
        
        [NotMapped]
        public bool IsFreelancer { get; private set; }
        
        [NotMapped]
        public bool IsJobSeeker { get; private set; }
        
        [NotMapped]
        public bool IsEmployer { get; private set; }
        
        [NotMapped]
        public bool IsClient { get; private set; }
        
        [NotMapped]
        public bool IsAdmin { get; private set; }
        
        
        public int? CreatedBy { get; set; }
        
        public DateTimeOffset? UpdatedAt { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }


}
