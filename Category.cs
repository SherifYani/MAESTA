using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMagnet.Domain.Entities
{

    public class Category
    {
        [Key]
        public int CategoryId { get; set; }
        
        [Required(ErrorMessage = "اسم التصنيف مطلوب")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "اسم التصنيف يجب أن يكون بين 2 و 100 حرف")]
        public string Name { get; set; }
        
        [StringLength(500, ErrorMessage = "الوصف يجب ألا يتجاوز 500 حرف")]
        public string? Description { get; set; }
    }


}
