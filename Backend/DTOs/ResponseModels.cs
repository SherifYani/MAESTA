using Swashbuckle.AspNetCore.Annotations;

namespace JobMagnet.DTOs
{
    /// <summary>
    /// نموذج الاستجابة للأخطاء
    /// </summary>
    public class ErrorResponse
    {
        /// <summary>
        /// رسالة الخطأ
        /// </summary>
        [SwaggerSchema("رسالة الخطأ")]
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// تفاصيل إضافية عن الخطأ
        /// </summary>
        [SwaggerSchema("تفاصيل إضافية عن الخطأ")]
        public string? Details { get; set; }

        /// <summary>
        /// وقت حدوث الخطأ
        /// </summary>
        [SwaggerSchema("وقت حدوث الخطأ")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// نموذج الاستجابة للنجاح
    /// </summary>
    /// <typeparam name="T">نوع البيانات المُرجعة</typeparam>
    public class SuccessResponse<T>
    {
        /// <summary>
        /// البيانات المُرجعة
        /// </summary>
        [SwaggerSchema("البيانات المُرجعة")]
        public T Data { get; set; }

        /// <summary>
        /// رسالة النجاح
        /// </summary>
        [SwaggerSchema("رسالة النجاح")]
        public string Message { get; set; } = "تم بنجاح";

        /// <summary>
        /// وقت الاستجابة
        /// </summary>
        [SwaggerSchema("وقت الاستجابة")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public SuccessResponse(T data, string message = "تم بنجاح")
        {
            Data = data;
            Message = message;
        }
    }

    /// <summary>
    /// نموذج النتائج المقسمة على صفحات
    /// </summary>
    /// <typeparam name="T">نوع العناصر في القائمة</typeparam>
    public class PagedResult<T>
    {
        /// <summary>
        /// البيانات في الصفحة الحالية
        /// </summary>
        [SwaggerSchema("البيانات في الصفحة الحالية")]
        public IEnumerable<T> Data { get; set; } = new List<T>();

        /// <summary>
        /// رقم الصفحة الحالية
        /// </summary>
        [SwaggerSchema("رقم الصفحة الحالية")]
        public int CurrentPage { get; set; }

        /// <summary>
        /// عدد العناصر في الصفحة
        /// </summary>
        [SwaggerSchema("عدد العناصر في الصفحة")]
        public int PageSize { get; set; }

        /// <summary>
        /// العدد الإجمالي للعناصر
        /// </summary>
        [SwaggerSchema("العدد الإجمالي للعناصر")]
        public int TotalCount { get; set; }

        /// <summary>
        /// العدد الإجمالي للصفحات
        /// </summary>
        [SwaggerSchema("العدد الإجمالي للصفحات")]
        public int TotalPages { get; set; }

        /// <summary>
        /// هل توجد صفحة تالية
        /// </summary>
        [SwaggerSchema("هل توجد صفحة تالية")]
        public bool HasNext { get; set; }

        /// <summary>
        /// هل توجد صفحة سابقة
        /// </summary>
        [SwaggerSchema("هل توجد صفحة سابقة")]
        public bool HasPrevious { get; set; }

        public PagedResult(IEnumerable<T> data, int currentPage, int pageSize, int totalCount)
        {
            Data = data;
            CurrentPage = currentPage;
            PageSize = pageSize;
            TotalCount = totalCount;
            TotalPages = (int)Math.Ceiling((double)totalCount / pageSize);
            HasNext = currentPage < TotalPages;
            HasPrevious = currentPage > 1;
        }
    }

    /// <summary>
    /// نموذج استجابة بسيط للعمليات التي لا تُرجع بيانات
    /// </summary>
    public class SimpleResponse
    {
        /// <summary>
        /// رسالة الاستجابة
        /// </summary>
        [SwaggerSchema("رسالة الاستجابة")]
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// حالة النجاح
        /// </summary>
        [SwaggerSchema("حالة النجاح")]
        public bool Success { get; set; }

        /// <summary>
        /// وقت الاستجابة
        /// </summary>
        [SwaggerSchema("وقت الاستجابة")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public SimpleResponse(string message, bool success = true)
        {
            Message = message;
            Success = success;
        }
    }
}
