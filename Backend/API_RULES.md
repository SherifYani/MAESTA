# JobMagnet API Development Rules & Guidelines

## 📋 قواعد تطوير الـ API

### 1. هيكل الـ Controller
```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[SwaggerTag("وصف المجموعة")]
public class ExampleController : ControllerBase
{
    // Implementation here
}
```

### 2. قواعد تسمية الـ Endpoints
- **GET**: `/api/jobs` - للحصول على قائمة
- **GET**: `/api/jobs/{id}` - للحصول على عنصر واحد
- **POST**: `/api/jobs` - لإنشاء عنصر جديد
- **PUT**: `/api/jobs/{id}` - لتحديث عنصر كامل
- **PATCH**: `/api/jobs/{id}` - لتحديث جزئي
- **DELETE**: `/api/jobs/{id}` - لحذف عنصر

### 3. قالب الـ Function الإجباري

#### 3.1 GET - جلب قائمة
```csharp
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
[SwaggerOperation(Summary = "جلب قائمة العناصر", Description = "وصف مفصل للوظيفة")]
[SwaggerResponse(200, "تم جلب البيانات بنجاح", typeof(PagedResult<ItemDto>))]
[SwaggerResponse(400, "خطأ في البيانات المرسلة")]
[SwaggerResponse(500, "خطأ في الخادم")]
public async Task<ActionResult<PagedResult<ItemDto>>> GetItems(
    [FromQuery, SwaggerParameter("رقم الصفحة")] int page = 1,
    [FromQuery, SwaggerParameter("عدد العناصر في الصفحة")] int pageSize = 10,
    [FromQuery, SwaggerParameter("نص البحث")] string? search = null,
    [FromQuery, SwaggerParameter("ترتيب حسب")] string sortBy = "CreatedAt",
    [FromQuery, SwaggerParameter("اتجاه الترتيب")] string sortOrder = "desc")
{
    // Validation
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 100) pageSize = 10;

    try
    {
        // Implementation
        return Ok(result);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "حدث خطأ في الخادم", error = ex.Message });
    }
}
```

#### 3.2 GET - جلب عنصر واحد
```csharp
/// <summary>
/// جلب عنصر واحد بالمعرف
/// </summary>
/// <param name="id">معرف العنصر</param>
/// <returns>بيانات العنصر</returns>
[HttpGet("{id}")]
[SwaggerOperation(Summary = "جلب عنصر بالمعرف")]
[SwaggerResponse(200, "تم العثور على العنصر", typeof(ItemDto))]
[SwaggerResponse(404, "لم يتم العثور على العنصر")]
[SwaggerResponse(400, "معرف غير صحيح")]
public async Task<ActionResult<ItemDto>> GetItem(
    [FromRoute, SwaggerParameter("معرف العنصر")] int id)
{
    if (id <= 0)
        return BadRequest(new { message = "معرف العنصر غير صحيح" });

    try
    {
        // Implementation
        if (item == null)
            return NotFound(new { message = "لم يتم العثور على العنصر" });

        return Ok(item);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "حدث خطأ في الخادم", error = ex.Message });
    }
}
```

#### 3.3 POST - إنشاء عنصر جديد
```csharp
/// <summary>
/// إنشاء عنصر جديد
/// </summary>
/// <param name="createDto">بيانات العنصر الجديد</param>
/// <returns>العنصر المُنشأ</returns>
[HttpPost]
[SwaggerOperation(Summary = "إنشاء عنصر جديد")]
[SwaggerResponse(201, "تم إنشاء العنصر بنجاح", typeof(ItemDto))]
[SwaggerResponse(400, "بيانات غير صحيحة")]
[SwaggerResponse(409, "العنصر موجود مسبقاً")]
public async Task<ActionResult<ItemDto>> CreateItem(
    [FromBody, SwaggerParameter("بيانات العنصر الجديد")] CreateItemDto createDto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    try
    {
        // Check for duplicates if needed
        // Implementation
        
        return CreatedAtAction(nameof(GetItem), new { id = newItem.Id }, newItem);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "حدث خطأ في الخادم", error = ex.Message });
    }
}
```

#### 3.4 PUT - تحديث كامل
```csharp
/// <summary>
/// تحديث عنصر موجود (تحديث كامل)
/// </summary>
/// <param name="id">معرف العنصر</param>
/// <param name="updateDto">البيانات المحدثة</param>
/// <returns>العنصر المحدث</returns>
[HttpPut("{id}")]
[SwaggerOperation(Summary = "تحديث عنصر كامل")]
[SwaggerResponse(200, "تم التحديث بنجاح", typeof(ItemDto))]
[SwaggerResponse(404, "لم يتم العثور على العنصر")]
[SwaggerResponse(400, "بيانات غير صحيحة")]
public async Task<ActionResult<ItemDto>> UpdateItem(
    [FromRoute, SwaggerParameter("معرف العنصر")] int id,
    [FromBody, SwaggerParameter("البيانات المحدثة")] UpdateItemDto updateDto)
{
    if (id <= 0)
        return BadRequest(new { message = "معرف العنصر غير صحيح" });

    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    try
    {
        // Implementation
        if (existingItem == null)
            return NotFound(new { message = "لم يتم العثور على العنصر" });

        return Ok(updatedItem);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "حدث خطأ في الخادم", error = ex.Message });
    }
}
```

#### 3.5 DELETE - حذف عنصر
```csharp
/// <summary>
/// حذف عنصر
/// </summary>
/// <param name="id">معرف العنصر</param>
/// <returns>رسالة تأكيد الحذف</returns>
[HttpDelete("{id}")]
[SwaggerOperation(Summary = "حذف عنصر")]
[SwaggerResponse(200, "تم الحذف بنجاح")]
[SwaggerResponse(404, "لم يتم العثور على العنصر")]
[SwaggerResponse(400, "معرف غير صحيح")]
public async Task<ActionResult> DeleteItem(
    [FromRoute, SwaggerParameter("معرف العنصر")] int id)
{
    if (id <= 0)
        return BadRequest(new { message = "معرف العنصر غير صحيح" });

    try
    {
        // Implementation
        if (existingItem == null)
            return NotFound(new { message = "لم يتم العثور على العنصر" });

        return Ok(new { message = "تم حذف العنصر بنجاح" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "حدث خطأ في الخادم", error = ex.Message });
    }
}
```

### 4. قواعد الـ DTOs

#### 4.1 Create DTO
```csharp
/// <summary>
/// DTO لإنشاء عنصر جديد
/// </summary>
public class CreateItemDto
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
```

#### 4.2 Update DTO
```csharp
/// <summary>
/// DTO لتحديث عنصر موجود
/// </summary>
public class UpdateItemDto
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
```

#### 4.3 Response DTO
```csharp
/// <summary>
/// DTO لعرض بيانات العنصر
/// </summary>
public class ItemDto
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
```

### 5. قواعد معالجة الأخطاء

#### 5.1 Response Models
```csharp
/// <summary>
/// نموذج الاستجابة للأخطاء
/// </summary>
public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// نموذج الاستجابة للنجاح
/// </summary>
public class SuccessResponse<T>
{
    public T Data { get; set; }
    public string Message { get; set; } = "تم بنجاح";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// نموذج النتائج المقسمة على صفحات
/// </summary>
public class PagedResult<T>
{
    public IEnumerable<T> Data { get; set; } = new List<T>();
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasNext { get; set; }
    public bool HasPrevious { get; set; }
}
```

### 6. قواعد إجبارية يجب اتباعها

1. **كل function يجب أن تحتوي على**:
   - XML Documentation (`/// <summary>`)
   - SwaggerOperation attribute
   - SwaggerResponse attributes لكل حالة
   - SwaggerParameter لكل parameter
   - معالجة الأخطاء بـ try-catch
   - التحقق من صحة البيانات

2. **Parameters يجب أن تكون**:
   - مُعرفة بوضوح مع SwaggerParameter
   - لها قيم افتراضية عند الحاجة
   - مُتحقق من صحتها

3. **Response يجب أن يكون**:
   - موحد الشكل
   - يحتوي على رسائل واضحة بالعربية
   - يتضمن HTTP Status Code المناسب

4. **أسماء المتغيرات والوظائف**:
   - بالإنجليزية
   - واضحة ومفهومة
   - تتبع naming conventions

5. **التوثيق**:
   - كل شيء موثق بالعربية في الـ comments
   - Swagger descriptions بالعربية
   - أمثلة واضحة في التوثيق

### 7. مثال كامل - JobController

```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[SwaggerTag("إدارة الوظائف")]
public class JobsController : ControllerBase
{
    // يجب اتباع القوالب المذكورة أعلاه لكل function
}
```

## ⚠️ تحذيرات مهمة

1. **لا تخالف هذه القواعد** - أي function لا تتبع هذا القالب سيتم رفضها
2. **كل parameter يجب أن يكون موثق** مع SwaggerParameter
3. **كل response يجب أن يكون موثق** مع SwaggerResponse
4. **معالجة الأخطاء إجبارية** في كل function
5. **التحقق من صحة البيانات إجباري** قبل المعالجة

## 📚 مراجع مفيدة

- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)
- [ASP.NET Core Web API Best Practices](https://docs.microsoft.com/en-us/aspnet/core/web-api/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
