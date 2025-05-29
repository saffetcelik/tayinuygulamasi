using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayinAPI.Models
{
    [Table("Adminler")]
    public class Admin
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string KullaniciAdi { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Sifre { get; set; }
        
        [StringLength(100)]
        public string? AdSoyad { get; set; }
        
        [StringLength(100)]
        public string? Email { get; set; }
        
        [StringLength(50)]
        public string Rol { get; set; } = "Admin";
        
        public DateTime? SonGirisTarihi { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Ek bilgiler
        [StringLength(255)]
        public string? ProfilResmi { get; set; }
        
        [StringLength(20)]
        public string? Telefon { get; set; }
        
        public bool Aktif { get; set; } = true;
    }
}
