using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using TayinAPI.Data;
using TayinAPI.Models;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PasswordMigrationController : ControllerBase
    {
        private readonly TayinDbContext _context;

        public PasswordMigrationController(TayinDbContext context)
        {
            _context = context;
        }

        // Bu endpoint sadece yetkili admin tarafından çalıştırılmalıdır
        // Güvenlik amaçlı olarak gizli bir yönetici anahtarı ile korunmalıdır
        [HttpPost("migrate")]
        public async Task<IActionResult> MigratePasswords([FromBody] MigrationRequestModel model)
        {
            if (model == null || model.AdminKey != "gizli_admin_anahtari_buraya")
            {
                return Unauthorized("Bu işlem için yetkiniz bulunmamaktadır.");
            }

            try
            {
                int hashedCount = 0;
                var personeller = await _context.Personeller.ToListAsync();

                foreach (var personel in personeller)
                {
                    // Şifre zaten BCrypt formatında ise geç
                    if (personel.Sifre.StartsWith("$2a$") || personel.Sifre.StartsWith("$2b$") || personel.Sifre.StartsWith("$2y$"))
                    {
                        continue;
                    }

                    // Düz metin şifreyi BCrypt ile hashle
                    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(personel.Sifre);
                    personel.Sifre = hashedPassword;
                    personel.UpdatedAt = DateTime.UtcNow;
                    hashedCount++;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = $"{hashedCount} şifre başarıyla güvenli formata dönüştürüldü." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Şifre dönüştürme işlemi sırasında bir hata oluştu: {ex.Message}");
            }
        }
    }

    public class MigrationRequestModel
    {
        public string AdminKey { get; set; }
    }
}
