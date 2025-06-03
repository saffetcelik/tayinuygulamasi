using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using TayinAPI.Data;
using TayinAPI.Services;

namespace TayinAPI.Controllers
{
    [Route("api/TestHata")]
    [ApiController]
    public class TestHataController : ControllerBase
    {
        private readonly TayinDbContext _context;
        private readonly LogService _logService;

        public TestHataController(TayinDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        // 1. Basit bir sistem hatası örneği (bölme hatası)
        [HttpGet("bolme-hatasi")]
        public IActionResult BolmeHatasi([FromQuery] int sayi = 0)
        {
            try
            {
                int sonuc = 100 / sayi; // Sıfıra bölme hatası
                return Ok(new { sonuc });
            }
            catch (Exception ex)
            {
                // Manuel olarak hata logla
                _logService.KaydetAsync(
                    "Test Sistem Hatası",
                    "Bölme hatası testi",
                    null,
                    "Sistem",
                    false,
                    ex.Message
                ).Wait();
                
                throw; // Tekrar fırlat, global exception handler yakalayacak
            }
        }

        // 2. Veritabanı bağlantı hatası simulasyonu
        [HttpGet("veritabani-hatasi")]
        public async Task<IActionResult> VeritabaniHatasi()
        {
            try
            {
                // Var olmayan bir tabloya erişmeye çalış
                await _context.Database.ExecuteSqlRawAsync("SELECT * FROM olmayanTablo");
                
                return Ok(new { mesaj = "Bu mesaj görülmeyecek" });
            }
            catch (Exception ex)
            {
                // Manuel olarak hata logla
                await _logService.KaydetAsync(
                    "Veritabanı Hatası",
                    "Veritabanı erişim hatası testi",
                    null,
                    "Sistem",
                    false,
                    ex.Message
                );
                
                throw; // Tekrar fırlat, global exception handler yakalayacak
            }
        }
        
        // 3. Bellek hatası simulasyonu
        [HttpGet("bellek-hatasi")]
        public IActionResult BellekHatasi()
        {
            try
            {
                // Büyük bir dizi oluşturmaya çalış (Out of Memory simülasyonu)
                int boyut = int.MaxValue / 10;
                var buyukDizi = new byte[boyut];
                
                return Ok(new { mesaj = "Bu mesaj görülmeyecek" });
            }
            catch (Exception ex)
            {
                // Manuel olarak hata logla
                _logService.KaydetAsync(
                    "Bellek Hatası",
                    "Bellek hatası testi",
                    null,
                    "Sistem",
                    false,
                    ex.Message
                ).Wait();
                
                throw; // Tekrar fırlat, global exception handler yakalayacak
            }
        }
        
        // 4. Manuel loglama örneği
        [HttpGet("log-olustur")]
        public async Task<IActionResult> LogOlustur([FromQuery] string mesaj = "Test log mesajı")
        {
            await _logService.KaydetAsync(
                "Manuel Test Log",
                mesaj,
                null,
                "Sistem",
                true,
                null
            );
            
            return Ok(new { mesaj = "Log başarıyla oluşturuldu" });
        }
    }
}
