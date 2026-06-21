using Microsoft.AspNetCore.Mvc;
using JobMagnet.Infrastructure.Data;
using System.Linq;

namespace JobMagnet.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestErrorController : ControllerBase
    {
        private readonly JobMagnetDbContext _context;

        public TestErrorController(JobMagnetDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetErrors()
        {
            var errors = _context.ErrorLogs.OrderByDescending(e => e.LoggedAt).Take(10).ToList();
            return Ok(errors);
        }
    }
}
