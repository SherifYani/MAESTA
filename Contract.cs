using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Contract
    {
        [Key]
        public int ContractId { get; set; }
        
        [Required(ErrorMessage = "معرف المشروع مطلوب")]
        public int ProjectId { get; set; }
        
        [Required(ErrorMessage = "معرف العميل مطلوب")]
        public int ClientUserId { get; set; }
        
        [Required(ErrorMessage = "معرف المستقل مطلوب")]
        public int FreelancerUserId { get; set; }
        
        [Required(ErrorMessage = "شروط العقد مطلوبة")]
        [StringLength(10000, MinimumLength = 20, ErrorMessage = "شروط العقد يجب أن تكون بين 20 و 10000 حرف")]
        public string Terms { get; set; }
        
        public DateTimeOffset? SignedDate { get; set; }
        
        [StringLength(500, ErrorMessage = "رابط ملف العقد يجب ألا يتجاوز 500 حرف")]
        [Url(ErrorMessage = "صيغة رابط ملف العقد غير صحيحة")]
        public string? ContractFileUrl { get; set; }

        [ForeignKey("ProjectId")]
        public Project? Project { get; set; }

        [ForeignKey("ClientUserId")]
        public User? ClientUser { get; set; }

        [ForeignKey("FreelancerUserId")]
        public User? FreelancerUser { get; set; }

    }


}
