using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using TayinAPI.Data;
using TayinAPI.Models;
using TayinAPI.DTOs;
using BCrypt.Net;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Sınıf düzeyinde yetkilendirmeyi kaldırıp, her metot için ayrı ekleyeceğiz
    public class AdminController : ControllerBase
    {
        private readonly TayinDbContext _context;
        private readonly IConfiguration _configuration;

        public AdminController(TayinDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Admin giriş işlemi
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AdminLoginDTO loginDto)
        {
            var admin = await _context.Adminler
                .FirstOrDefaultAsync(a => a.KullaniciAdi == loginDto.KullaniciAdi);

            if (admin == null)
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            // Şifre kontrolü - BCrypt şifreleme kullanılabilir
            // İlk kurulumda düz şifre kontrolü yapılacak, sonrasında BCrypt'e geçilebilir
            bool passwordValid = false;
            
            // Şifre BCrypt ile hashlenmişse
            if (admin.Sifre.StartsWith("$2a$") || admin.Sifre.StartsWith("$2b$") || admin.Sifre.StartsWith("$2y$"))
            {
                passwordValid = BCrypt.Net.BCrypt.Verify(loginDto.Sifre, admin.Sifre);
            }
            // Düz şifre ise (ilk kurulum için)
            else
            {
                passwordValid = admin.Sifre == loginDto.Sifre;
                
                // Eğer şifre doğruysa, BCrypt ile hashleyelim ve kaydedelim
                if (passwordValid)
                {
                    admin.Sifre = BCrypt.Net.BCrypt.HashPassword(loginDto.Sifre);
                    admin.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            if (!passwordValid)
            {
                return Unauthorized("Kullanıcı adı veya şifre hatalı.");
            }

            // Son giriş tarihini güncelle
            admin.SonGirisTarihi = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // JWT token oluşturma
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] 
                { 
                    new Claim(ClaimTypes.Name, admin.Id.ToString()),
                    new Claim(ClaimTypes.Role, admin.Rol),
                    new Claim("AdminId", admin.Id.ToString()),
                    new Claim("KullaniciAdi", admin.KullaniciAdi)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
                                                         SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new 
            { 
                Token = tokenString,
                Admin = new
                {
                    admin.Id,
                    admin.KullaniciAdi,
                    AdSoyad = admin.AdSoyad ?? string.Empty,
                    Email = admin.Email ?? string.Empty,
                    admin.Rol,
                    ProfilResmi = admin.ProfilResmi ?? string.Empty,
                    Telefon = admin.Telefon ?? string.Empty
                }
            });
        }

        // Tüm tayin taleplerini getir - yeni endpoint
        [HttpGet("tayin-talepleri")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> GetTayinTalepleri()
        {
            var tayinTalepleri = await _context.TayinTalepleri
                .Include(t => t.Personel)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new 
                {
                    t.Id,
                    TalepNedeni = t.TalepTuru,
                    TalepAciklamasi = t.Aciklama,
                    // Tercihli yerler şimdilik sabit değerler olarak verildi - gerçek veriler için TayinTercihleri kullanılacak
                    TercihEdilenYer1 = "Ankara Adliyesi",
                    TercihEdilenYer2 = "İstanbul Adliyesi",
                    TercihEdilenYer3 = "İzmir Adliyesi",
                    t.Durum,
                    t.CreatedAt,
                    t.UpdatedAt,
                    Personel = new 
                    {
                        t.Personel.Id,
                        t.Personel.SicilNo,
                        t.Personel.Ad,
                        t.Personel.Soyad,
                        t.Personel.Unvan,
                        MevcutAdliye = t.Personel.MevcutAdliye != null ? new {
                            t.Personel.MevcutAdliye.Id,
                            t.Personel.MevcutAdliye.AdliyeAdi
                        } : null
                    }
                })
                .ToListAsync();

            // ReferenceHandler.Preserve ile gelen "value" sarmasını kaldırıp doğrudan listeyi döndürelim
            return new JsonResult(tayinTalepleri);
        }

        // Tayin talebi durumunu güncelle
        [HttpPut("tayin-talebi/{id}/durum")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> UpdateTayinTalebiDurum(int id, [FromBody] TayinTalebiDurumDTO durumDto)
        {
            var tayinTalebi = await _context.TayinTalepleri.FindAsync(id);
            
            if (tayinTalebi == null)
            {
                return NotFound("Tayin talebi bulunamadı.");
            }

            tayinTalebi.Durum = durumDto.Durum;
            tayinTalebi.DurumAciklamasi = durumDto.DurumAciklamasi;
            tayinTalebi.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return Ok(new { Mesaj = "Tayin talebi durumu güncellendi.", TayinTalebi = tayinTalebi });
        }

        // Tüm personelleri getir
        [HttpGet("personeller")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> GetPersoneller()
        {
            try
            {
                var personeller = await _context.Personeller
                    .Include(p => p.MevcutAdliye)
                    .OrderBy(p => p.Ad)
                    .ThenBy(p => p.Soyad)
                    .Select(p => new 
                    {
                        p.Id,
                        p.SicilNo,
                        p.Ad,
                        p.Soyad,
                        p.Unvan,
                        p.Email,
                        p.Telefon,
                        DogumTarihi = p.DogumTarihi,
                        BaslamaTarihi = p.BaslamaTarihi,
                        MevcutAdliye = p.MevcutAdliye != null ? new {
                            p.MevcutAdliye.Id,
                            p.MevcutAdliye.AdliyeAdi
                        } : null,
                        p.CreatedAt,
                        p.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(personeller);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Personeller getirilirken hata oluştu: {ex.Message}");
            }
        }

        // Personel detaylarını getir
        [HttpGet("personel/{id}")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> GetPersonelById(int id)
        {
            try
            {
                var personel = await _context.Personeller
                    .Include(p => p.MevcutAdliye)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (personel == null)
                {
                    return NotFound("Personel bulunamadı.");
                }

                // Adliyeleri de getir (seçim listesi için)
                var adliyeler = await _context.Adliyeler
                    .Where(a => a.Aktif)
                    .OrderBy(a => a.AdliyeAdi)
                    .Select(a => new { a.Id, a.AdliyeAdi })
                    .ToListAsync();

                return Ok(new
                {
                    Personel = new
                    {
                        personel.Id,
                        personel.SicilNo,
                        personel.Ad,
                        personel.Soyad,
                        personel.Unvan,
                        personel.Email,
                        personel.Telefon,
                        DogumTarihi = personel.DogumTarihi,
                        BaslamaTarihi = personel.BaslamaTarihi,
                        MevcutAdliyeId = personel.MevcutAdliyeId,
                        MevcutAdliye = personel.MevcutAdliye != null ? new
                        {
                            personel.MevcutAdliye.Id,
                            personel.MevcutAdliye.AdliyeAdi
                        } : null,
                        personel.CreatedAt,
                        personel.UpdatedAt
                    },
                    Adliyeler = adliyeler
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Personel detayları getirilirken hata oluştu: {ex.Message}");
            }
        }

        // Personel bilgilerini güncelle
        [HttpPut("personel/{id}")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> UpdatePersonel(int id, [FromBody] PersonelGuncelleDTO personelDTO)
        {
            try
            {
                var personel = await _context.Personeller.FindAsync(id);
                if (personel == null)
                {
                    return NotFound("Personel bulunamadı.");
                }

                // Temel bilgileri güncelle
                personel.Ad = personelDTO.Ad;
                personel.Soyad = personelDTO.Soyad;
                personel.Unvan = personelDTO.Unvan;
                personel.Email = personelDTO.Email;
                personel.Telefon = personelDTO.Telefon;
                personel.MevcutAdliyeId = personelDTO.MevcutAdliyeId;
                
                // Tarih bilgilerini güncelle
                if (personelDTO.DogumTarihi.HasValue)
                {
                    personel.DogumTarihi = personelDTO.DogumTarihi.Value;
                }
                
                if (personelDTO.BaslamaTarihi.HasValue)
                {
                    personel.BaslamaTarihi = personelDTO.BaslamaTarihi.Value;
                }
                
                // Şifre güncellemesi istenmişse
                if (!string.IsNullOrEmpty(personelDTO.YeniSifre))
                {
                    personel.Sifre = BCrypt.Net.BCrypt.HashPassword(personelDTO.YeniSifre);
                }

                personel.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                return Ok(new { Mesaj = "Personel bilgileri başarıyla güncellendi.", PersonelId = personel.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Personel güncellenirken hata oluştu: {ex.Message}");
            }
        }

        // Personel sil
        [HttpDelete("personel/{id}")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> DeletePersonel(int id)
        {
            try
            {
                var personel = await _context.Personeller.FindAsync(id);
                if (personel == null)
                {
                    return NotFound("Personel bulunamadı.");
                }

                // Tayin taleplerini kontrol et
                var tayinTalepleri = await _context.TayinTalepleri
                    .Where(t => t.PersonelId == id)
                    .ToListAsync();

                // Tayin taleplerini sil
                if (tayinTalepleri.Any())
                {
                    _context.TayinTalepleri.RemoveRange(tayinTalepleri);
                }

                // Personeli sil
                _context.Personeller.Remove(personel);
                await _context.SaveChangesAsync();
                
                return Ok(new { Mesaj = "Personel başarıyla silindi.", PersonelId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Personel silinirken hata oluştu: {ex.Message}");
            }
        }

        #region Sık Sorulan Sorular Yönetimi
        
        // Tüm sık sorulan soruları getir (aktif/pasif hepsi)
        [HttpGet("sss")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> GetAllSikcaSorulanSorular()
        {
            try
            {
                var sorular = await _context.SikcaSorulanSorular
                    .OrderBy(s => s.Kategori)
                    .ThenBy(s => s.SiraNo)
                    .Select(s => new
                    {
                        s.Id,
                        s.Soru,
                        s.Cevap,
                        s.Kategori,
                        s.SiraNo,
                        s.EklenmeTarihi,
                        s.GuncellenmeTarihi,
                        s.AktifMi
                    })
                    .ToListAsync();

                return Ok(sorular);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sık sorulan sorular getirilirken hata oluştu: {ex.Message}");
            }
        }

        // Sık sorulan soru kategorilerini getir
        [HttpGet("sss/kategoriler")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> GetSSSKategorileri()
        {
            try
            {
                var kategoriler = await _context.SikcaSorulanSorular
                    .Select(s => s.Kategori)
                    .Distinct()
                    .OrderBy(k => k)
                    .ToListAsync();

                return Ok(kategoriler);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"SSS kategorileri getirilirken hata oluştu: {ex.Message}");
            }
        }

        // Sık sorulan soru detayını getir
        [HttpGet("sss/{id}")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> GetSSSById(int id)
        {
            try
            {
                var sss = await _context.SikcaSorulanSorular.FindAsync(id);
                if (sss == null)
                {
                    return NotFound("Sık sorulan soru bulunamadı.");
                }

                return Ok(sss);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sık sorulan soru detayı getirilirken hata oluştu: {ex.Message}");
            }
        }

        // Yeni sık sorulan soru ekle
        [HttpPost("sss")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> CreateSSS([FromBody] SikcaSorulanSoru sss)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Null kontrolü ve varsayılan değerler
                sss.EklenmeTarihi = DateTime.UtcNow; // UTC zaman kullan
                sss.GuncellenmeTarihi = null; // Yeni eklenen kaydın güncellenme tarihi olmasın
                sss.AktifMi = true;

                // ID sıfırla (otomatik artan alanda sorun olmasın)
                sss.Id = 0;

                _context.SikcaSorulanSorular.Add(sss);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSSSById), new { id = sss.Id }, sss);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sık sorulan soru eklenirken hata oluştu: {ex.Message}");
            }
        }

        // Sık sorulan soru güncelle
        [HttpPut("sss/{id}")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> UpdateSSS(int id, [FromBody] SikcaSorulanSoru sss)
        {
            try
            {
                if (id != sss.Id)
                {
                    return BadRequest("Parametre ID'si ile gönderilen ID eşleşmiyor.");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Mevcut SSS'yi veritabanından oku
                var existingSss = await _context.SikcaSorulanSorular.FindAsync(id);
                if (existingSss == null)
                {
                    return NotFound("Sık sorulan soru bulunamadı.");
                }

                // Güncellenecek alanları mevcut nesneden kopyala
                existingSss.Soru = sss.Soru;
                existingSss.Cevap = sss.Cevap;
                existingSss.Kategori = sss.Kategori;
                existingSss.SiraNo = sss.SiraNo;
                existingSss.AktifMi = sss.AktifMi;
                existingSss.GuncellenmeTarihi = DateTime.UtcNow; // UTC zaman kullan

                // Eklenme tarihini koruyoruz
                // existingSss.EklenmeTarihi değiştirilmiyor

                await _context.SaveChangesAsync();

                return Ok(new { Mesaj = "Sık sorulan soru başarıyla güncellendi.", SoruId = id, AktifMi = existingSss.AktifMi });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sık sorulan soru güncellenirken hata oluştu: {ex.Message}");
            }
        }

        // Sık sorulan soru durumunu değiştir (aktif/pasif)
        [HttpPut("sss/{id}/durum")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> ToggleSSSStatus(int id)
        {
            try
            {
                var sss = await _context.SikcaSorulanSorular.FindAsync(id);
                if (sss == null)
                {
                    return NotFound("Sık sorulan soru bulunamadı.");
                }

                // Durumu tersine çevir
                sss.AktifMi = !sss.AktifMi;
                sss.GuncellenmeTarihi = DateTime.UtcNow; // UTC zaman kullan

                await _context.SaveChangesAsync();

                return Ok(new { Mesaj = $"Sık sorulan soru durumu {(sss.AktifMi ? "aktif" : "pasif")} olarak güncellendi.", SoruId = id, AktifMi = sss.AktifMi });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sık sorulan soru durumu değiştirilirken hata oluştu: {ex.Message}");
            }
        }

        // Sık sorulan soru sil
        [HttpDelete("sss/{id}")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> DeleteSSS(int id)
        {
            try
            {
                var sss = await _context.SikcaSorulanSorular.FindAsync(id);
                if (sss == null)
                {
                    return NotFound("Sık sorulan soru bulunamadı.");
                }

                _context.SikcaSorulanSorular.Remove(sss);
                await _context.SaveChangesAsync();

                return Ok(new { Mesaj = "Sık sorulan soru başarıyla silindi.", SoruId = id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Sık sorulan soru silinirken hata oluştu: {ex.Message}");
            }
        }

        private bool SSSExists(int id)
        {
            return _context.SikcaSorulanSorular.Any(e => e.Id == id);
        }

        #endregion

    }
}
