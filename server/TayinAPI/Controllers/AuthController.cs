using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using TayinAPI.Data;
using TayinAPI.Models;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TayinDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly Services.LogService _logService;

        public AuthController(TayinDbContext context, IConfiguration configuration, Services.LogService logService)
        {
            _context = context;
            _configuration = configuration;
            _logService = logService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel login)
        {
            Console.WriteLine($"Giriş denemesi: Sicil No: {login?.SicilNo}, Beni Hatırla: {login?.BeniHatirla}");
            
            if (login == null || string.IsNullOrEmpty(login.SicilNo) || string.IsNullOrEmpty(login.Sifre))
            {
                Console.WriteLine("Geçersiz istek: Sicil no veya şifre boş");
                return BadRequest("Geçersiz istek");
            } 
            

            Personel personel;
            try 
            {
                personel = await _context.Personeller
                    .FirstOrDefaultAsync(p => p.SicilNo == login.SicilNo);

                Console.WriteLine($"Personel bulundu mu: {personel != null}");
                
                if (personel == null)
                {
                    Console.WriteLine($"Personel bulunamadı: {login.SicilNo}");
                    
                    // Bulunamayan sicil no ile giriş denemesini logla
                    await _logService.KaydetAsync(
                        "Giriş Denemesi", 
                        $"Bulunamayan sicil no ile giriş denemesi: {login.SicilNo}", 
                        login.SicilNo,
                        basariliMi: false,
                        hataBilgisi: "Sicil numarası bulunamadı"
                    );
                    
                    return Unauthorized("Sicil numarası bulunamadı");
                }
                
                Console.WriteLine($"Veritabanındaki şifre: {personel.Sifre}");
                Console.WriteLine($"Girilen şifre: {login.Sifre}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Veritabanı hatası: {ex.Message}");
                return StatusCode(500, $"Veritabanı hatası: {ex.Message}");
            }

            // SQL enjeksiyon için girdi temizleme
            string sanitizedSifre = login.Sifre?.Replace("'", "''");
            
            // Şifre kontrolü
            bool isPasswordValid = false;
            
            // Şifre BCrypt formatında mı kontrol et
            if (personel.Sifre.StartsWith("$2a$") || personel.Sifre.StartsWith("$2b$") || personel.Sifre.StartsWith("$2y$"))
            {
                // BCrypt ile hash doğrulama
                isPasswordValid = BCrypt.Net.BCrypt.Verify(sanitizedSifre, personel.Sifre);
            }
            else
            {
                // Düz metin karşılaştırma (geçiş döneminde)
                isPasswordValid = personel.Sifre == sanitizedSifre;
                
                // Eski düz metin şifreyi BCrypt ile güncelle
                if (isPasswordValid)
                {
                    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(sanitizedSifre);
                    personel.Sifre = hashedPassword;
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Şifre güvenli formata güncellendi: {personel.SicilNo}");
                }
            }
            
            if (!isPasswordValid)
            {
                Console.WriteLine("Hatalı şifre");
                
                // Başarısız giriş denemesini logla
                await _logService.KaydetAsync(
                    "Giriş Denemesi", 
                    $"Hatalı şifre ile giriş denemesi", 
                    login.SicilNo, 
                    personel?.Ad + " " + personel?.Soyad,
                    basariliMi: false,
                    hataBilgisi: "Hatalı şifre"
                );
                
                return Unauthorized("Hatalı şifre");
            }
            
            Console.WriteLine("Giriş başarılı!");
            
            // Başarılı girişi logla
            await _logService.KaydetAsync(
                "Giriş", 
                $"{personel.Ad} {personel.Soyad} kullanıcısı sisteme giriş yaptı", 
                login.SicilNo, 
                personel.Ad + " " + personel.Soyad,
                basariliMi: true
            );

            // JWT token oluşturma
            var token = GenerateJwtToken(personel);

            // Eğer beni hatırla seçeneği işaretlendiyse
            // Burada cookie ayarlamak yerine client tarafında localStorage kullanacağız
            // Login yanıtında beniHatirla bayrağını döndürüyoruz
            // Kullanıcı sicil numarası da localStorage'a kaydedilecek
            Console.WriteLine($"Beni hatırla işaretlendi: {login.BeniHatirla}, Sicil No: {personel.SicilNo}");

            return Ok(new
            {
                token = token,
                personelId = personel.Id,
                sicilNo = personel.SicilNo,
                ad = personel.Ad,
                soyad = personel.Soyad,
                beniHatirla = login.BeniHatirla
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
        {
            Console.WriteLine($"Şifre değiştirme isteği: Sicil No: {model?.SicilNo}");
            
            if (model == null || string.IsNullOrEmpty(model.SicilNo) || 
                string.IsNullOrEmpty(model.MevcutSifre) || string.IsNullOrEmpty(model.YeniSifre))
            {
                Console.WriteLine("Geçersiz istek: Sicil no veya şifreler boş");
                return BadRequest("Geçersiz istek. Tüm alanlar doldurulmalıdır.");
            }

            if (model.YeniSifre.Length < 4)
            {
                return BadRequest("Yeni şifre en az 4 karakter olmalıdır.");
            }
            
            var personel = await _context.Personeller
                .FirstOrDefaultAsync(p => p.SicilNo == model.SicilNo);
                
            if (personel == null)
            {
                Console.WriteLine($"Personel bulunamadı: {model.SicilNo}");
                return Unauthorized("Sicil numarası bulunamadı");
            }
            
            // SQL enjeksiyon için girdi temizleme
            string sanitizedCurrentPassword = model.MevcutSifre?.Replace("'", "''");
            string sanitizedNewPassword = model.YeniSifre?.Replace("'", "''");
            
            // Mevcut şifre kontrolü
            bool isCurrentPasswordValid = false;
            
            // Şifre BCrypt formatında mı kontrol et
            if (personel.Sifre.StartsWith("$2a$") || personel.Sifre.StartsWith("$2b$") || personel.Sifre.StartsWith("$2y$"))
            {
                // BCrypt ile hash doğrulama
                isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(sanitizedCurrentPassword, personel.Sifre);
            }
            else
            {
                // Düz metin karşılaştırma (geçiş döneminde)
                isCurrentPasswordValid = personel.Sifre == sanitizedCurrentPassword;
            }
            
            if (!isCurrentPasswordValid)
            {
                Console.WriteLine("Mevcut şifre hatalı");
                return Unauthorized("Mevcut şifre hatalı");
            }
            
            try
            {
                // Yeni şifreyi BCrypt ile hashleme
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(sanitizedNewPassword);
                
                // Şifreyi güncelle
                personel.Sifre = hashedPassword;
                personel.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"Şifre başarıyla değiştirildi: {model.SicilNo}");

                // Şifre değiştirme işlemini logla
                await _logService.KaydetAsync(
                    "Şifre Değiştirme", 
                    $"{personel.Ad} {personel.Soyad} kullanıcısı şifresini değiştirdi", 
                    model.SicilNo, 
                    personel.Ad + " " + personel.Soyad,
                    basariliMi: true
                );
                
                return Ok(new { message = "Şifre başarıyla değiştirildi" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Şifre değiştirme hatası: {ex.Message}");
                
                // Hatalı şifre değiştirme işlemini logla
                await _logService.KaydetAsync(
                    "Şifre Değiştirme", 
                    $"Şifre değiştirme sırasında hata", 
                    model.SicilNo, 
                    personel?.Ad + " " + personel?.Soyad,
                    basariliMi: false,
                    hataBilgisi: ex.Message
                );
                
                return StatusCode(500, "Şifre değiştirme sırasında bir hata oluştu");
            }
        }

        private string GenerateJwtToken(Personel personel)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, personel.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, personel.Email ?? ""),
                new Claim("sicilNo", personel.SicilNo),
                new Claim("ad", personel.Ad),
                new Claim("soyad", personel.Soyad),
                new Claim("unvan", personel.Unvan),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginModel
    {
        public string SicilNo { get; set; }
        public string Sifre { get; set; }
        public bool BeniHatirla { get; set; }
    }
    
    public class ChangePasswordModel
    {
        [JsonPropertyName("sicilNo")]
        public string SicilNo { get; set; }
        
        [JsonPropertyName("mevcutSifre")]
        public string MevcutSifre { get; set; }
        
        [JsonPropertyName("yeniSifre")]
        public string YeniSifre { get; set; }
    }
}
