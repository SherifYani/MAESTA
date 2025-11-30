using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Skill
    {
        [Key]
        public int SkillId { get; set; }
        
        [Required(ErrorMessage = "اسم المهارة مطلوب")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "اسم المهارة يجب أن يكون بين 2 و 100 حرف")]
        public string Name { get; set; }
    }


}
