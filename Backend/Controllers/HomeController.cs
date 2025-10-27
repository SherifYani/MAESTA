using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using JobMagnet.Data;
using JobMagnet.DTOs;

namespace JobMagnet.Controllers
{
    /// <summary>
    /// Controller للصفحة الرئيسية والتحقق من حالة الـ API
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [SwaggerTag("الصفحة الرئيسية")]
    public class HomeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// التحقق من حالة الـ API والاتصال بقاعدة البيانات
        /// </summary>
        /// <returns>معلومات حالة الـ API</returns>
        [HttpGet]
        [SwaggerOperation(Summary = "فحص حالة الـ API", Description = "يتحقق من أن الـ API يعمل بشكل صحيح ويمكنه الاتصال بقاعدة البيانات")]
        [SwaggerResponse(200, "الـ API يعمل بشكل صحيح", typeof(SuccessResponse<object>))]
        [SwaggerResponse(500, "خطأ في الخادم أو قاعدة البيانات", typeof(ErrorResponse))]
        public async Task<ActionResult<SuccessResponse<object>>> GetStatus()
        {
            try
            {
                // Test database connection
                var canConnect = await _context.Database.CanConnectAsync();
                
                var statusInfo = new
                {
                    ApiStatus = "يعمل بشكل صحيح",
                    DatabaseConnection = canConnect ? "متصل" : "غير متصل",
                    ServerTime = DateTime.UtcNow,
                    Version = "1.0.0"
                };

                return Ok(new SuccessResponse<object>(statusInfo, "JobMagnet API يعمل بشكل صحيح"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "حدث خطأ أثناء فحص حالة الـ API",
                    Details = ex.Message
                });
            }
        }

        /// <summary>
        /// معلومات عامة عن الـ API
        /// </summary>
        /// <returns>معلومات الـ API</returns>
        [HttpGet("info")]
        [SwaggerOperation(Summary = "معلومات الـ API", Description = "يُرجع معلومات عامة عن الـ API والإصدار")]
        [SwaggerResponse(200, "تم جلب المعلومات بنجاح", typeof(SuccessResponse<object>))]
        public ActionResult<SuccessResponse<object>> GetInfo()
        {
            try
            {
                var apiInfo = new
                {
                    Name = "JobMagnet API",
                    Version = "1.0.0",
                    Description = "API لإدارة الوظائف والباحثين عن عمل",
                    Documentation = "/swagger",
                    SupportedVersions = new[] { "v1" },
                    LastUpdated = DateTime.UtcNow
                };

                return Ok(new SuccessResponse<object>(apiInfo, "تم جلب معلومات الـ API بنجاح"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Message = "حدث خطأ أثناء جلب معلومات الـ API",
                    Details = ex.Message
                });
            }
        }
    }
}
