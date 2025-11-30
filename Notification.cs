using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }
        
        [Required(ErrorMessage = "معرف المستخدم مطلوب")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "عنوان الإشعار مطلوب")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "عنوان الإشعار يجب أن يكون بين 1 و 200 حرف")]
        public string Title { get; set; }
        
        [Required(ErrorMessage = "محتوى الإشعار مطلوب")]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "محتوى الإشعار يجب أن يكون بين 1 و 1000 حرف")]
        public string Message { get; set; }
        
        [StringLength(50, ErrorMessage = "نوع الإشعار يجب ألا يتجاوز 50 حرف")]
        [RegularExpression(@"^(Info|Warning|Error|Success|NewMessage|NewJob|NewProject|Payment|Review|System)$", ErrorMessage = "نوع الإشعار غير صالح")]
        public string? NotificationType { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط التوجيه يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط التوجيه غير صحيحة")]
        public string? RedirectUrl { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط الصورة يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط الصورة غير صحيحة")]
        public string? ImageUrl { get; set; }
        
        public bool IsRead { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public DateTimeOffset CreatedAt { get; set; }
        [Timestamp]
        public byte[]? RowVersion { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

    }


}
