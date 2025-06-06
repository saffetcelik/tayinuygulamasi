using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using TayinAPI.Data;
using TayinAPI.Models;

namespace TayinAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SSSController : ControllerBase
    {
        private readonly TayinDbContext _context;

        public SSSController(TayinDbContext context)
        {
            _context = context;
        }

        // GET: api/SSS - Public endpoint (herkes erişebilir)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SikcaSorulanSoru>>> GetSikcaSorulanSorular()
        {
            return await _context.SikcaSorulanSorular
                .Where(s => s.AktifMi)
                .OrderBy(s => s.Kategori)
                .ThenBy(s => s.SiraNo)
                .ToListAsync();
        }

        // GET: api/SSS/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SikcaSorulanSoru>> GetSikcaSorulanSoru(int id)
        {
            var sikcaSorulanSoru = await _context.SikcaSorulanSorular.FindAsync(id);

            if (sikcaSorulanSoru == null || !sikcaSorulanSoru.AktifMi)
            {
                return NotFound();
            }

            return sikcaSorulanSoru;
        }

        // GET: api/SSS/kategori/Genel
        [HttpGet("kategori/{kategori}")]
        public async Task<ActionResult<IEnumerable<SikcaSorulanSoru>>> GetSikcaSorulanSorularByKategori(string kategori)
        {
            return await _context.SikcaSorulanSorular
                .Where(s => s.AktifMi && s.Kategori == kategori)
                .OrderBy(s => s.SiraNo)
                .ToListAsync();
        }

        // GET: api/SSS/arama/tayin
        [HttpGet("arama/{aramaMetni}")]
        public async Task<ActionResult<IEnumerable<SikcaSorulanSoru>>> SearchSikcaSorulanSorular(string aramaMetni)
        {
            if (string.IsNullOrWhiteSpace(aramaMetni))
            {
                return await GetSikcaSorulanSorular();
            }

            return await _context.SikcaSorulanSorular
                .Where(s => s.AktifMi && 
                    (s.Soru.Contains(aramaMetni) || 
                     s.Cevap.Contains(aramaMetni) || 
                     s.Kategori.Contains(aramaMetni)))
                .OrderBy(s => s.Kategori)
                .ThenBy(s => s.SiraNo)
                .ToListAsync();
        }

        // POST: api/SSS
        [HttpPost]
        public async Task<ActionResult<SikcaSorulanSoru>> PostSikcaSorulanSoru(SikcaSorulanSoru sikcaSorulanSoru)
        {
            sikcaSorulanSoru.EklenmeTarihi = DateTime.Now;
            sikcaSorulanSoru.AktifMi = true;
            
            _context.SikcaSorulanSorular.Add(sikcaSorulanSoru);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSikcaSorulanSoru), new { id = sikcaSorulanSoru.Id }, sikcaSorulanSoru);
        }

        // PUT: api/SSS/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSikcaSorulanSoru(int id, SikcaSorulanSoru sikcaSorulanSoru)
        {
            if (id != sikcaSorulanSoru.Id)
            {
                return BadRequest();
            }

            sikcaSorulanSoru.GuncellenmeTarihi = DateTime.Now;

            _context.Entry(sikcaSorulanSoru).State = EntityState.Modified;
            _context.Entry(sikcaSorulanSoru).Property(s => s.EklenmeTarihi).IsModified = false;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SikcaSorulanSoruExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/SSS/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSikcaSorulanSoru(int id)
        {
            var sikcaSorulanSoru = await _context.SikcaSorulanSorular.FindAsync(id);
            if (sikcaSorulanSoru == null)
            {
                return NotFound();
            }

            // Soft delete - sadece AktifMi değerini false yap
            sikcaSorulanSoru.AktifMi = false;
            sikcaSorulanSoru.GuncellenmeTarihi = DateTime.Now;
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SikcaSorulanSoruExists(int id)
        {
            return _context.SikcaSorulanSorular.Any(e => e.Id == id);
        }
    }
}
