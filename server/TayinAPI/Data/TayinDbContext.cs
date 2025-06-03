using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using TayinAPI.Models;

namespace TayinAPI.Data
{
    public class TayinDbContext : DbContext
    {
        private readonly ILogger<TayinDbContext> _logger;

        public TayinDbContext(DbContextOptions<TayinDbContext> options, ILogger<TayinDbContext> logger)
            : base(options)
        {
            _logger = logger;
        }
        
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings => 
                warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
                
            // Veritabanı komutlarının loglama için yakalanması
            optionsBuilder.LogTo(message => 
            {
                if (message.Contains("fail") || message.Contains("error") || message.Contains("exception"))
                {
                    _logger?.LogError("Veritabanı hatası: {Message}", message);
                    LogDatabaseError("Veritabanı Hatası", message).ConfigureAwait(false);
                }
            }, LogLevel.Error);
        }
        
        // Veritabanı hatalarını loglama
        private Task LogDatabaseError(string islemTuru, string hataMesaji)
        {
            try
            {
                // LogService yerine ILogger kullanarak hataları loglama
                _logger?.LogError(
                    "Veritabanı hatası: {IslemTuru}, {HataMesaji}", 
                    islemTuru, 
                    hataMesaji);
                
                // Konsola da yazalım
                Console.WriteLine($"Veritabanı hatası: {islemTuru} - {hataMesaji}");
            }
            catch (Exception ex)
            {
                // Loglama işlemi sırasında hata oluşursa konsola yaz
                Console.WriteLine($"Veritabanı hatası loglanırken ek hata oluştu: {ex.Message}");
                Console.WriteLine($"Orijinal hata: {hataMesaji}");
            }
            
            return Task.CompletedTask;
        }

        public DbSet<Personel> Personeller { get; set; }
        public DbSet<Adliye> Adliyeler { get; set; }
        public DbSet<TayinTalebi> TayinTalepleri { get; set; }
        public DbSet<TayinTercihi> TayinTercihleri { get; set; }
        public DbSet<SikcaSorulanSoru> SikcaSorulanSorular { get; set; }
        public DbSet<Admin> Adminler { get; set; }
        public DbSet<Log> Loglar { get; set; }
        

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // İlişkileri ve kısıtlamaları tanımlama
            modelBuilder.Entity<Personel>()
                .HasOne(p => p.MevcutAdliye)
                .WithMany(a => a.Personeller)
                .HasForeignKey(p => p.MevcutAdliyeId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<TayinTalebi>()
                .HasOne(t => t.Personel)
                .WithMany(p => p.TayinTalepleri)
                .HasForeignKey(t => t.PersonelId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TayinTercihi>()
                .HasOne(t => t.TayinTalebi)
                .WithMany(tt => tt.TayinTercihleri)
                .HasForeignKey(t => t.TayinTalebiId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TayinTercihi>()
                .HasOne(t => t.Adliye)
                .WithMany(a => a.TayinTercihleri)
                .HasForeignKey(t => t.AdliyeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
