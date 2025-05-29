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


    }
}
