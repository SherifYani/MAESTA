# ✅ قائمة التحقق من القواعد - JobMagnet API

## قبل إنشاء أي Controller جديد، تأكد من:

### 1. ✅ هيكل الـ Controller
- [ ] يحتوي على `[ApiController]` attribute
- [ ] يحتوي على `[Route("api/[controller]")]` attribute  
- [ ] يحتوي على `[Produces("application/json")]` attribute
- [ ] يحتوي على `[SwaggerTag("وصف المجموعة")]` attribute
- [ ] يرث من `ControllerBase`
- [ ] له XML documentation comment

### 2. ✅ كل Function يجب أن تحتوي على:
- [ ] XML Documentation (`/// <summary>`)
- [ ] `[SwaggerOperation]` attribute مع Summary و Description
- [ ] `[SwaggerResponse]` attributes لكل حالة استجابة محتملة
- [ ] معالجة الأخطاء بـ `try-catch`
- [ ] التحقق من صحة البيانات
- [ ] استخدام الـ DTOs المناسبة

### 3. ✅ Parameters يجب أن تكون:
- [ ] مُعرفة مع `[SwaggerParameter("وصف")]`
- [ ] لها قيم افتراضية عند الحاجة
- [ ] مُتحقق من صحتها قبل الاستخدام
- [ ] مُعرفة مع `[FromQuery]`, `[FromRoute]`, `[FromBody]` حسب الحاجة

### 4. ✅ Response يجب أن يكون:
- [ ] يستخدم `SuccessResponse<T>` للنجاح
- [ ] يستخدم `ErrorResponse` للأخطاء
- [ ] يستخدم `PagedResult<T>` للقوائم
- [ ] يستخدم `SimpleResponse` للعمليات البسيطة
- [ ] يحتوي على HTTP Status Code المناسب
- [ ] رسائل واضحة بالعربية

### 5. ✅ DTOs يجب أن تحتوي على:
- [ ] XML Documentation لكل property
- [ ] `[SwaggerSchema("وصف")]` لكل property
- [ ] Validation attributes مناسبة (`[Required]`, `[StringLength]`, إلخ)
- [ ] أسماء واضحة ومفهومة

## 📋 قالب سريع للتحقق

```csharp
/// <summary>
/// وصف الـ Controller
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[SwaggerTag("وصف المجموعة")]
public class YourController : ControllerBase
{
    /// <summary>
    /// وصف الوظيفة
    /// </summary>
    /// <param name="param1">وصف المعامل الأول</param>
    /// <returns>وصف المُرجع</returns>
    [HttpGet]
    [SwaggerOperation(Summary = "ملخص", Description = "وصف مفصل")]
    [SwaggerResponse(200, "نجح", typeof(SuccessResponse<YourDto>))]
    [SwaggerResponse(400, "خطأ", typeof(ErrorResponse))]
    [SwaggerResponse(500, "خطأ خادم", typeof(ErrorResponse))]
    public async Task<ActionResult<SuccessResponse<YourDto>>> YourMethod(
        [FromQuery, SwaggerParameter("وصف المعامل")] string param1)
    {
        // التحقق من صحة البيانات
        if (string.IsNullOrEmpty(param1))
            return BadRequest(new ErrorResponse { Message = "المعامل مطلوب" });

        try
        {
            // الكود الفعلي
            return Ok(new SuccessResponse<YourDto>(result, "تم بنجاح"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ErrorResponse
            {
                Message = "حدث خطأ",
                Details = ex.Message
            });
        }
    }
}
```

## 🚫 أخطاء شائعة يجب تجنبها:

1. **عدم استخدام SwaggerParameter** - كل parameter يجب أن يكون موثق
2. **عدم معالجة الأخطاء** - كل function يجب أن تحتوي على try-catch
3. **عدم التحقق من البيانات** - تحقق من صحة البيانات قبل المعالجة
4. **استخدام return Ok(object)** بدلاً من الـ Response Models المحددة
5. **عدم توثيق SwaggerResponse** - كل حالة استجابة يجب أن تكون موثقة
6. **استخدام رسائل خطأ بالإنجليزية** - كل الرسائل يجب أن تكون بالعربية
7. **عدم استخدام HTTP Status Codes المناسبة**

## 🔍 كيفية التحقق من التطبيق الصحيح:

1. **شغل المشروع** واذهب إلى `/swagger`
2. **تأكد من ظهور التوثيق** بشكل صحيح
3. **جرب كل endpoint** وتأكد من الاستجابات
4. **تحقق من رسائل الأخطاء** أنها بالعربية
5. **تأكد من وجود كل Parameters** في التوثيق

## ✅ مثال صحيح:
انظر إلى `ExampleController.cs` كمرجع لتطبيق جميع القواعد بشكل صحيح.

## ❌ مثال خاطئ:
```csharp
[HttpGet]
public IActionResult Get(int id) // ❌ لا يوجد توثيق أو معالجة أخطاء
{
    return Ok(data); // ❌ لا يستخدم Response Models
}
```

---

**تذكر**: أي Controller لا يتبع هذه القواعد سيتم رفضه! 🚫
