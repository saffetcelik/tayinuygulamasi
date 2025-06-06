using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using TayinAPI.Data;
using TayinAPI.Models;
using Microsoft.AspNetCore.Authorization;

namespace TayinAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // JWT token gerekli
    public class PersonelController : ControllerBase
    {
        private readonly TayinDbContext _context;

        public PersonelController(TayinDbContext context)
        {
            _context = context;
        }

        // Giriş yapan personelin bilgilerini getir
        [HttpGet("bilgi")]
        public async Task<IActionResult> GetPersonelBilgi()
        {
            // Header'dan gelen sicil numarasını kullan veya query parameter'dan al
            string sicilNo = HttpContext.Request.Headers["X-Sicil-No"].ToString() ?? Request.Query["sicilNo"].ToString();
            
            // Eğer sicil numarası yoksa localStorage'dan sicil numarası kullanılacağını belirt
            if (string.IsNullOrEmpty(sicilNo))
            {
                sicilNo = Request.Query["sicilNo"].ToString();
                
                if (string.IsNullOrEmpty(sicilNo))
                {
                    return BadRequest("Sicil numarası belirtilmedi. Lütfen giriş yapın.");
                }
            }
            
            Console.WriteLine($"Personel bilgisi isteniyor: {sicilNo}");

            var personel = await _context.Personeller
                .Include(p => p.MevcutAdliye)
                .FirstOrDefaultAsync(p => p.SicilNo == sicilNo);

            if (personel == null)
            {
                return NotFound("Personel bulunamadı");
            }

            return Ok(new
            {
                id = personel.Id,
                sicilNo = personel.SicilNo,
                ad = personel.Ad,
                soyad = personel.Soyad,
                unvan = personel.Unvan,
                mevcutAdliye = personel.MevcutAdliye?.AdliyeAdi,
                telefon = personel.Telefon,
                email = personel.Email,
                dogumTarihi = personel.DogumTarihi,
                baslamaTarihi = personel.BaslamaTarihi
            });
        }
    }
}
