using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Swashbuckle.AspNetCore.Annotations;
using JobMagnet.Data;
using JobMagnet.DTOs;
using System.ComponentModel.DataAnnotations;

namespace JobMagnet.Controllers
{
    /// <summary>
    /// مثال على Controller يتبع جميع القواعد المطلوبة
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [SwaggerTag("مثال على الـ Controller المطابق للقواعد")]
    public class ExampleController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExampleController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// جلب قائمة من العناصر مع إمكانية البحث والفلترة
        /// </summary>
        /// <param name="page">رقم الصفحة (افتراضي: 1)</param>
        /// <param name="pageSize">عدد العناصر في الصفحة (افتراضي: 10, أقصى: 100)</param>
        /// <param name="search">نص البحث (اختياري)</param>
        /// <param name="sortBy">ترتيب حسب (افتراضي: CreatedAt)</param>
        /// <param name="sortOrder">اتجاه الترتيب (asc/desc, افتراضي: desc)</param>
        /// <returns>قائمة العناصر مع معلومات الصفحات</returns>
        [HttpGet]
        [SwaggerOperation(Summary = "جلب قائمة العناصر", Description = "يُرجع قائمة من العناصر مع إمكانية البحث والفلترة والترتيب")]
        [SwaggerResponse(200, "تم جلب البيانات بنجاح", typeof(PagedResult<ExampleItemDto>))]
        [SwaggerResponse(400, "خطأ في البيانات المرسلة", typeof(ErrorResponse))]
        [SwaggerResponse(500, "خطأ في الخادم", typeof(ErrorResponse))]
        public async Task<ActionResult<PagedResult<ExampleItemDto>>> GetItems(
            [FromQuery, SwaggerParameter("رقم الصفحة")] int page = 1,
            [FromQuery, SwaggerParameter("عدد العناصر في الصفحة")] int pageSize = 10,
            [FromQuery, SwaggerParameter("نص البحث")] string? search = null,
            [FromQuery, SwaggerParameter("ترتيب حسب")] string sortBy = "CreatedAt",
            [FromQuery, SwaggerParameter("اتجاه الترتيب (asc/desc)")] string sortOrder = "desc")
        {
            // Validation
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            try
            {
                // هنا يكون الكود الفعلي لجلب البيانات من قاعدة البيانات
                // مثال وهمي:
                var items = new List<ExampleItemDto>
                {
                    new ExampleItemDto { Id = 1, Name = "عنصر تجريبي 1", Description = "وصف العنصر الأول", CreatedAt = DateTime.UtcNow },
                    new ExampleItemDto { Id = 2, Name = "عنصر تجريبي 2", Description = "وصف العنصر الثاني", CreatedAt = DateTime.UtcNow }
                };

                var totalCount = items.Count;
                var result = new PagedResult<ExampleItemDto>(items, page, pageSize, totalCount);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "حدث خطأ في الخادم أثناء جلب البيانات",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// جلب عنصر واحد بالمعرف
        /// </summary>
        /// <param name="id">معرف العنصر</param>
        /// <returns>بيانات العنصر</returns>
        [HttpGet("{id}")]
        [SwaggerOperation(Summary = "جلب عنصر بالمعرف", Description = "يُرجع بيانات عنصر واحد باستخدام المعرف")]
        [SwaggerResponse(200, "تم العثور على العنصر", typeof(SuccessResponse<ExampleItemDto>))]
        [SwaggerResponse(404, "لم يتم العثور على العنصر", typeof(ErrorResponse))]
        [SwaggerResponse(400, "معرف غير صحيح", typeof(ErrorResponse))]
        [SwaggerResponse(500, "خطأ في الخادم", typeof(ErrorResponse))]
        public async Task<ActionResult<SuccessResponse<ExampleItemDto>>> GetItem(
            [FromRoute, SwaggerParameter("معرف العنصر")] int id)
        {
            if (id <= 0)
                return BadRequest(new ErrorResponse { Message = "معرف العنصر غير صحيح" });

            try
            {
                // هنا يكون الكود الفعلي للبحث في قاعدة البيانات
                // مثال وهمي:
                var item = new ExampleItemDto 
                { 
                    Id = id, 
                    Name = $"عنصر رقم {id}", 
                    Description = $"وصف العنصر رقم {id}",
                    CreatedAt = DateTime.UtcNow 
                };

                if (id > 10) // مثال على عدم وجود العنصر
                    return NotFound(new ErrorResponse { Message = "لم يتم العثور على العنصر المطلوب" });

                return Ok(new SuccessResponse<ExampleItemDto>(item, "تم جلب العنصر بنجاح"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "حدث خطأ في الخادم أثناء جلب العنصر",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// إنشاء عنصر جديد
        /// </summary>
        /// <param name="createDto">بيانات العنصر الجديد</param>
        /// <returns>العنصر المُنشأ</returns>
        [HttpPost]
        [SwaggerOperation(Summary = "إنشاء عنصر جديد", Description = "ينشئ عنصر جديد في النظام")]
        [SwaggerResponse(201, "تم إنشاء العنصر بنجاح", typeof(SuccessResponse<ExampleItemDto>))]
        [SwaggerResponse(400, "بيانات غير صحيحة", typeof(ErrorResponse))]
        [SwaggerResponse(409, "العنصر موجود مسبقاً", typeof(ErrorResponse))]
        [SwaggerResponse(500, "خطأ في الخادم", typeof(ErrorResponse))]
        public async Task<ActionResult<SuccessResponse<ExampleItemDto>>> CreateItem(
            [FromBody, SwaggerParameter("بيانات العنصر الجديد")] CreateExampleItemDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse { Message = "البيانات المرسلة غير صحيحة", Details = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });

            try
            {
                // فحص التكرار (مثال)
                // var existingItem = await _context.Items.FirstOrDefaultAsync(x => x.Name == createDto.Name);
                // if (existingItem != null)
                //     return Conflict(new ErrorResponse { Message = "يوجد عنصر بنفس الاسم مسبقاً" });

                // إنشاء العنصر الجديد (مثال وهمي)
                var newItem = new ExampleItemDto
                {
                    Id = new Random().Next(1, 1000),
                    Name = createDto.Name,
                    Description = createDto.Description,
                    CreatedAt = DateTime.UtcNow
                };

                return CreatedAtAction(nameof(GetItem), new { id = newItem.Id }, 
                    new SuccessResponse<ExampleItemDto>(newItem, "تم إنشاء العنصر بنجاح"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "حدث خطأ في الخادم أثناء إنشاء العنصر",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// تحديث عنصر موجود (تحديث كامل)
        /// </summary>
        /// <param name="id">معرف العنصر</param>
        /// <param name="updateDto">البيانات المحدثة</param>
        /// <returns>العنصر المحدث</returns>
        [HttpPut("{id}")]
        [SwaggerOperation(Summary = "تحديث عنصر كامل", Description = "يحدث جميع بيانات العنصر")]
        [SwaggerResponse(200, "تم التحديث بنجاح", typeof(SuccessResponse<ExampleItemDto>))]
        [SwaggerResponse(404, "لم يتم العثور على العنصر", typeof(ErrorResponse))]
        [SwaggerResponse(400, "بيانات غير صحيحة", typeof(ErrorResponse))]
        [SwaggerResponse(500, "خطأ في الخادم", typeof(ErrorResponse))]
        public async Task<ActionResult<SuccessResponse<ExampleItemDto>>> UpdateItem(
            [FromRoute, SwaggerParameter("معرف العنصر")] int id,
            [FromBody, SwaggerParameter("البيانات المحدثة")] UpdateExampleItemDto updateDto)
        {
            if (id <= 0)
                return BadRequest(new ErrorResponse { Message = "معرف العنصر غير صحيح" });

            if (!ModelState.IsValid)
                return BadRequest(new ErrorResponse { Message = "البيانات المرسلة غير صحيحة", Details = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)) });

            try
            {
                // البحث عن العنصر (مثال وهمي)
                if (id > 10)
                    return NotFound(new ErrorResponse { Message = "لم يتم العثور على العنصر المطلوب" });

                // تحديث العنصر (مثال وهمي)
                var updatedItem = new ExampleItemDto
                {
                    Id = id,
                    Name = updateDto.Name,
                    Description = updateDto.Description,
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    UpdatedAt = DateTime.UtcNow
                };

                return Ok(new SuccessResponse<ExampleItemDto>(updatedItem, "تم تحديث العنصر بنجاح"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "حدث خطأ في الخادم أثناء تحديث العنصر",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// حذف عنصر
        /// </summary>
        /// <param name="id">معرف العنصر</param>
        /// <returns>رسالة تأكيد الحذف</returns>
        [HttpDelete("{id}")]
        [SwaggerOperation(Summary = "حذف عنصر", Description = "يحذف العنصر من النظام نهائياً")]
        [SwaggerResponse(200, "تم الحذف بنجاح", typeof(SimpleResponse))]
        [SwaggerResponse(404, "لم يتم العثور على العنصر", typeof(ErrorResponse))]
        [SwaggerResponse(400, "معرف غير صحيح", typeof(ErrorResponse))]
        [SwaggerResponse(500, "خطأ في الخادم", typeof(ErrorResponse))]
        public async Task<ActionResult<SimpleResponse>> DeleteItem(
            [FromRoute, SwaggerParameter("معرف العنصر")] int id)
        {
            if (id <= 0)
                return BadRequest(new ErrorResponse { Message = "معرف العنصر غير صحيح" });

            try
            {
                // البحث عن العنصر (مثال وهمي)
                if (id > 10)
                    return NotFound(new ErrorResponse { Message = "لم يتم العثور على العنصر المطلوب" });

                // حذف العنصر من قاعدة البيانات
                // await _context.Items.Where(x => x.Id == id).ExecuteDeleteAsync();

                return Ok(new SimpleResponse("تم حذف العنصر بنجاح"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "حدث خطأ في الخادم أثناء حذف العنصر",
                    Details = ex.Message
                });
            }
        }
    }

    #region DTOs للمثال

    /// <summary>
    /// DTO لعرض بيانات العنصر
    /// </summary>
    public class ExampleItemDto
    {
        /// <summary>
        /// معرف العنصر
        /// </summary>
        [SwaggerSchema("معرف العنصر")]
        public int Id { get; set; }

        /// <summary>
        /// اسم العنصر
        /// </summary>
        [SwaggerSchema("اسم العنصر")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// وصف العنصر
        /// </summary>
        [SwaggerSchema("وصف العنصر")]
        public string? Description { get; set; }

        /// <summary>
        /// تاريخ الإنشاء
        /// </summary>
        [SwaggerSchema("تاريخ الإنشاء")]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// تاريخ آخر تحديث
        /// </summary>
        [SwaggerSchema("تاريخ آخر تحديث")]
        public DateTime? UpdatedAt { get; set; }
    }

    /// <summary>
    /// DTO لإنشاء عنصر جديد
    /// </summary>
    public class CreateExampleItemDto
    {
        /// <summary>
        /// اسم العنصر
        /// </summary>
        [Required(ErrorMessage = "اسم العنصر مطلوب")]
        [StringLength(100, ErrorMessage = "اسم العنصر يجب أن يكون أقل من 100 حرف")]
        [SwaggerSchema("اسم العنصر")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// وصف العنصر
        /// </summary>
        [StringLength(500, ErrorMessage = "الوصف يجب أن يكون أقل من 500 حرف")]
        [SwaggerSchema("وصف العنصر")]
        public string? Description { get; set; }
    }

    /// <summary>
    /// DTO لتحديث عنصر موجود
    /// </summary>
    public class UpdateExampleItemDto
    {
        /// <summary>
        /// اسم العنصر
        /// </summary>
        [Required(ErrorMessage = "اسم العنصر مطلوب")]
        [StringLength(100, ErrorMessage = "اسم العنصر يجب أن يكون أقل من 100 حرف")]
        [SwaggerSchema("اسم العنصر")]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// وصف العنصر
        /// </summary>
        [StringLength(500, ErrorMessage = "الوصف يجب أن يكون أقل من 500 حرف")]
        [SwaggerSchema("وصف العنصر")]
        public string? Description { get; set; }
    }

    #endregion
}
