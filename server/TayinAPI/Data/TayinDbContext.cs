using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using TayinAPI.Models;

namespace TayinAPI.Data
{
    public class TayinDbContext : DbContext
    {
        public TayinDbContext(DbContextOptions<TayinDbContext> options)
            : base(options)
        {
            // Constructor'da herhangi bir veritabanı operasyonu yapmıyoruz
        }
        
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(warnings => 
                warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
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
