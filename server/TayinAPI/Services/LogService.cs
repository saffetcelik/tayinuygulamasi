using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using TayinAPI.Data;
using TayinAPI.Models;

namespace TayinAPI.Services
{
    public class LogService
    {
        private readonly TayinDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LogService(TayinDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task KaydetAsync(string islemTuru, string detayBilgi, string kullaniciSicilNo = null, string kullaniciAdi = null, bool basariliMi = true, string hataBilgisi = null)
        {
            try
            {
                // Admin kullanıcısı için log tutma
                if (kullaniciAdi == "admin")
                {
                    return; // Admin kullanıcısı için log kaydı oluşturma
                }
                
                var httpContext = _httpContextAccessor.HttpContext;
                string ipAdresi = httpContext?.Connection?.RemoteIpAddress?.ToString();
                string tarayiciBilgisi = httpContext?.Request?.Headers["User-Agent"].ToString();

                var log = new Log
                {
                    IslemTuru = islemTuru,
                    DetayBilgi = detayBilgi,
                    KullaniciSicilNo = kullaniciSicilNo,
                    KullaniciAdi = kullaniciAdi,
                    IpAdresi = ipAdresi,
                    TarayiciBilgisi = tarayiciBilgisi,
                    IslemZamani = DateTime.UtcNow,
                    BasariliMi = basariliMi ? "Evet" : "Hayır",
                    HataBilgisi = hataBilgisi
                };

                _context.Loglar.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log kaydetme iu015flemi su0131rasu0131nda hata oluu015ftuu011funda, konsola yazdu0131ralu0131m ama uygulamayu0131 durdurmayu0131n
                Console.WriteLine($"Log kaydederken hata: {ex.Message}");
            }
        }
    }
}
