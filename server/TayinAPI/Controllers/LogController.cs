using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TayinAPI.Data;
using TayinAPI.Models;
using TayinAPI.Services;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Sadece yetkili kullanıcılar log görüntüleyebilir
    public class LogController : ControllerBase
    {
        private readonly TayinDbContext _context;
        private readonly LogService _logService;

        public LogController(TayinDbContext context, LogService logService)
        {
            _context = context;
            _logService = logService;
        }

        // Tu00fcm loglaru0131 getir
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Log>>> GetLogs([FromQuery] string islemTuru = null, 
                                                                [FromQuery] string kullaniciSicilNo = null,
                                                                [FromQuery] DateTime? baslangicTarihi = null,
                                                                [FromQuery] DateTime? bitisTarihi = null,
                                                                [FromQuery] string basariliMi = null)
        {
            // Admin giriu015f kontrolu00fc burada yapu0131labilir

            try
            {
                // Log listesi görüntülenirken log kaydı oluşturmuyoruz
                // Böylece admin panelinde sayfa yenilenirken gereksiz log kaydı oluşmasını engelliyoruz

                IQueryable<Log> sorgu = _context.Loglar.OrderByDescending(l => l.IslemZamani);

                // Filtreleri uygula
                if (!string.IsNullOrEmpty(islemTuru))
                    sorgu = sorgu.Where(l => l.IslemTuru.Contains(islemTuru));

                if (!string.IsNullOrEmpty(kullaniciSicilNo))
                    sorgu = sorgu.Where(l => l.KullaniciSicilNo == kullaniciSicilNo);

                if (baslangicTarihi.HasValue)
                    sorgu = sorgu.Where(l => l.IslemZamani >= baslangicTarihi.Value);

                if (bitisTarihi.HasValue)
                    sorgu = sorgu.Where(l => l.IslemZamani <= bitisTarihi.Value);

                if (!string.IsNullOrEmpty(basariliMi))
                    sorgu = sorgu.Where(l => l.BasariliMi == basariliMi);

                return await sorgu.ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Log verileri alu0131nu0131rken hata oluu015ftu: {ex.Message}");
            }
        }

        // Son 24 saatteki loglaru0131n u00f6zetini getir (iu015flem tu00fcru00fcne gu00f6re gruplandu0131ru0131lmu0131u015f)
        [HttpGet("ozet")]
        public async Task<ActionResult<object>> GetLogOzeti()
        {
            try
            {
                DateTime sonYirmiDortSaat = DateTime.UtcNow.AddHours(-24);

                var logOzeti = await _context.Loglar
                    .Where(l => l.IslemZamani >= sonYirmiDortSaat)
                    .GroupBy(l => l.IslemTuru)
                    .Select(g => new
                    {
                        IslemTuru = g.Key,
                        ToplamSayi = g.Count(),
                        BasariliSayi = g.Count(l => l.BasariliMi == "Evet"),
                        BasarisizSayi = g.Count(l => l.BasariliMi == "Hayır")
                    })
                    .ToListAsync();

                return Ok(new
                {
                    sonYirmiDortSaatOzeti = logOzeti,
                    toplamLogSayisi = await _context.Loglar.CountAsync(),
                    toplamBasariliSayisi = await _context.Loglar.CountAsync(l => l.BasariliMi == "Evet"),
                    toplamBasarisizSayisi = await _context.Loglar.CountAsync(l => l.BasariliMi == "Hayır"),
                    sonGuncellemeZamani = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Log u00f6zeti alu0131nu0131rken hata oluu015ftu: {ex.Message}");
            }
        }

        // Belirli bir log detayu0131nu0131 getir
        [HttpGet("{id}")]
        public async Task<ActionResult<Log>> GetLog(int id)
        {
            try
            {
                var log = await _context.Loglar.FindAsync(id);

                if (log == null)
                {
                    return NotFound("Log bulunamadu0131");
                }

                return log;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Log detayu0131 alu0131nu0131rken hata oluu015ftu: {ex.Message}");
            }
        }

        // Tüm logları temizle endpoint'i
        [HttpDelete("temizle")]
        public async Task<IActionResult> TemizleLoglar()
        {
            try
            {
                var adminKullaniciAdi = HttpContext.User?.Identity?.Name ?? "Admin";
                var silinecekLogSayisi = await _context.Loglar.CountAsync();

                // Tüm logları sil
                _context.Loglar.RemoveRange(_context.Loglar);
                await _context.SaveChangesAsync();

                // Bu işlemi logla
                var temizlemeLog = new Log
                {
                    IslemTuru = "Sistem Yönetimi",
                    DetayBilgi = $"Tüm sistem kayıtları temizlendi. Silinen kayıt sayısı: {silinecekLogSayisi}",
                    KullaniciSicilNo = null,
                    KullaniciAdi = adminKullaniciAdi,
                    BasariliMi = "Evet",
                    HataBilgisi = null,
                    IslemZamani = DateTime.UtcNow
                };

                _context.Loglar.Add(temizlemeLog);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Tüm sistem kayıtları başarıyla temizlendi",
                    SilinenKayitSayisi = silinecekLogSayisi,
                    IslemZamani = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Loglar temizlenirken hata oluştu", Error = ex.Message });
            }
        }
    }
}
