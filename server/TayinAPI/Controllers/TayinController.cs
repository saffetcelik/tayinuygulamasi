using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TayinAPI.Data;
using TayinAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize] - JWT sorunu çözülünceye kadar kaldırıldı
    public class TayinController : ControllerBase
    {
        private readonly TayinDbContext _context;

        public TayinController(TayinDbContext context)
        {
            _context = context;
        }

        // Tüm adliyeleri listele
        [HttpGet("adliyeler")]
        public async Task<IActionResult> GetAdliyeler()
        {
            try
            {
                var adliyeler = await _context.Adliyeler
                    .OrderBy(a => a.AdliyeAdi)
                    .Select(a => new
                    {
                        id = a.Id,
                        adliyeAdi = a.AdliyeAdi
                    })
                    .ToListAsync();

                // Düz dizin olarak döndür
                return Ok(adliyeler);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Adliyeler listelenirken hata: {ex.Message}");
                return StatusCode(500, "Adliyeler listelenirken bir hata oluştu.");
            }
        }

        // Personelin tayin taleplerini listele
        [HttpGet("talepler")]
        public async Task<IActionResult> GetTayinTalepleri([FromQuery] string sicilNo)
        {
            // Sicil numarasına göre personeli bul
            var personel = await _context.Personeller
                .FirstOrDefaultAsync(p => p.SicilNo == sicilNo);
            
            if (personel == null)
            {
                return BadRequest("Geçersiz sicil numarası");
            }
            
            var personelId = personel.Id;

            var talepler = await _context.TayinTalepleri
                .Where(t => t.PersonelId == personelId)
                .Include(t => t.TayinTercihleri)
                .ThenInclude(tt => tt.Adliye)
                .OrderByDescending(t => t.BasvuruTarihi)
                .Select(t => new
                {
                    id = t.Id,
                    basvuruTarihi = t.BasvuruTarihi,
                    talepDurumu = t.TalepDurumu,
                    talepTuru = t.TalepTuru,
                    aciklama = t.Aciklama,
                    tercihler = t.TayinTercihleri.OrderBy(tt => tt.TercihSirasi).Select(tt => new 
                    {
                        id = tt.Id,
                        tercihSirasi = tt.TercihSirasi,
                        adliyeAdi = tt.Adliye.AdliyeAdi
                    }).ToList()
                })
                .ToListAsync();

            return Ok(talepler);
        }

        // Yeni tayin talebi oluştur
        [HttpPost("talepler")]
        public async Task<IActionResult> CreateTayinTalebi([FromBody] TayinTalebiViewModel model, [FromQuery] string sicilNo)
        {
            // Debug mesajları ekle
            Console.WriteLine($"Tayin talebi oluşturma isteği alındı: {model?.TalepTuru}, Tercih sayısı: {model?.Tercihler?.Count}");
            
            if (model == null)
            {
                Console.WriteLine("Model null geldi");
                return BadRequest("Geçersiz tayin talebi: Model boş");
            }
            
            if (model.Tercihler == null || model.Tercihler.Count == 0)
            {
                Console.WriteLine("Tercihler boş geldi");
                return BadRequest("Geçersiz tayin talebi: Tercihler boş");
            }

            // Sicil numarasına göre personeli bul
            if (string.IsNullOrEmpty(sicilNo))
            {
                Console.WriteLine("Sicil numarası boş");
                return BadRequest("Sicil numarası belirtilmedi");
            }
            
            var personel = await _context.Personeller
                .FirstOrDefaultAsync(p => p.SicilNo == sicilNo);
                
            if (personel == null)
            {
                Console.WriteLine($"Personel bulunamadı: {sicilNo}");
                return BadRequest($"Geçersiz kullanıcı: {sicilNo}");
            }
            
            int personelId = personel.Id;
            Console.WriteLine($"Personel bulundu ID: {personelId}");

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var now = DateTime.UtcNow;
                    
                    // Tayin talebi oluştur
                    var tayinTalebi = new TayinTalebi
                    {
                        PersonelId = personelId,
                        BasvuruTarihi = now,
                        TalepDurumu = "Beklemede",
                        TalepTuru = model.TalepTuru,
                        Aciklama = model.Aciklama ?? "",
                        CreatedAt = now,
                        UpdatedAt = now
                    };

                    Console.WriteLine($"Tayin talebi oluşturuluyor: {tayinTalebi.TalepTuru}, {tayinTalebi.BasvuruTarihi}");
                    
                    try
                    {
                        _context.TayinTalepleri.Add(tayinTalebi);
                        await _context.SaveChangesAsync();

                        Console.WriteLine($"Tayin talebi başarıyla oluşturuldu, ID: {tayinTalebi.Id}");

                        // Tayin tercihleri oluştur
                        Console.WriteLine($"Tercih sayısı: {model.Tercihler.Count}");
                        foreach (var tercih in model.Tercihler.Where(t => t.AdliyeId > 0))
                        {
                            Console.WriteLine($"Tercih ekleniyor: AdliyeId={tercih.AdliyeId}, Sıra={tercih.TercihSirasi}");
                            var tayinTercihi = new TayinTercihi
                            {
                                TayinTalebiId = tayinTalebi.Id,
                                AdliyeId = tercih.AdliyeId,
                                TercihSirasi = tercih.TercihSirasi,
                                CreatedAt = now,
                                UpdatedAt = now
                            };

                            _context.TayinTercihleri.Add(tayinTercihi);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Tayin talebi oluşturma alt işlemi sırasında hata: {ex.Message}");
                        Console.WriteLine($"Stack trace: {ex.StackTrace}");
                        throw;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { id = tayinTalebi.Id, message = "Tayin talebi başarıyla oluşturuldu" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Tayin talebi oluşturma işlemi sırasında hata: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    return StatusCode(500, "Tayin talebi oluşturulurken bir hata oluştu: " + ex.Message);
                }
            }
        }

        // Tayin talebini iptal et
        [HttpDelete("talepler/{id}")]
        public async Task<IActionResult> CancelTayinTalebi(int id, [FromQuery] string sicilNo)
        {
            // Debug mesajları ekle
            Console.WriteLine($"Tayin talebi iptal isteği alındı: TalepId={id}, SicilNo={sicilNo}");
            
            // Sicil numarasına göre personeli bul
            if (string.IsNullOrEmpty(sicilNo))
            {
                Console.WriteLine("Sicil numarası boş");
                return BadRequest("Sicil numarası belirtilmedi");
            }
            
            var personel = await _context.Personeller
                .FirstOrDefaultAsync(p => p.SicilNo == sicilNo);
                
            if (personel == null)
            {
                Console.WriteLine($"Personel bulunamadı: {sicilNo}");
                return BadRequest($"Geçersiz kullanıcı: {sicilNo}");
            }
            
            int personelId = personel.Id;
            Console.WriteLine($"Personel bulundu ID: {personelId}");

            var tayinTalebi = await _context.TayinTalepleri
                .FirstOrDefaultAsync(t => t.Id == id && t.PersonelId == personelId);

            if (tayinTalebi == null)
            {
                return NotFound("Tayin talebi bulunamadı");
            }

            if (tayinTalebi.TalepDurumu != "Beklemede")
            {
                return BadRequest("Sadece 'Beklemede' durumundaki talepler iptal edilebilir");
            }

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Önce tayin tercihlerini sil
                    var tercihler = await _context.TayinTercihleri
                        .Where(tt => tt.TayinTalebiId == id)
                        .ToListAsync();

                    _context.TayinTercihleri.RemoveRange(tercihler);
                    
                    // Sonra tayin talebini sil
                    _context.TayinTalepleri.Remove(tayinTalebi);
                    
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Tayin talebi başarıyla iptal edildi" });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, "Tayin talebi iptal edilirken bir hata oluştu: " + ex.Message);
                }
            }
        }
    }

    // ViewModel sınıfları
    public class TayinTalebiViewModel
    {
        public string TalepTuru { get; set; } = "";
        public string? Aciklama { get; set; } = "";
        public List<TercihViewModel> Tercihler { get; set; } = new List<TercihViewModel>();
    }

    public class TercihViewModel
    {
        public int AdliyeId { get; set; }
        public int TercihSirasi { get; set; }
    }
}
