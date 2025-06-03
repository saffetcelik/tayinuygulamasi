using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using TayinAPI.Data;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly TayinDbContext _context;
        private readonly ILogger<HealthController> _logger;

        public HealthController(TayinDbContext context, ILogger<HealthController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                // Veritabanı bağlantısını kontrol et
                bool canConnect = _context.Database.CanConnect();
                
                if (canConnect)
                {
                    return Ok(new { status = "healthy", message = "API ve veritabanı bağlantısı çalışıyor" });
                }
                else
                {
                    _logger.LogWarning("Sağlık kontrolü: Veritabanı bağlantısı kurulamadı");
                    return StatusCode(500, new { status = "unhealthy", message = "Veritabanı bağlantısı kurulamadı" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sağlık kontrolü sırasında hata oluştu");
                return StatusCode(500, new { status = "error", message = $"Hata: {ex.Message}" });
            }
        }
    }
}
