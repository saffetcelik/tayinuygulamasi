using System;
using System.ComponentModel.DataAnnotations;

namespace TayinAPI.Models
{
    public class Log
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string IslemTuru { get; set; } // Giriş, Çıkış, Tayin Talebi, Şifre Değiştirme, vb.
        
        [Required]
        public string DetayBilgi { get; set; } // İşlemle ilgili detaylı bilgi
        
        public string KullaniciSicilNo { get; set; } // Personel sicil numarası (eğer biliniyorsa)
        
        public string KullaniciAdi { get; set; } // İşlemi yapan kullanıcının adı soyadı
        
        public string IpAdresi { get; set; } // İşlemin gerçekleştirildiği IP adresi
        
        public string TarayiciBilgisi { get; set; } // İşlemin gerçekleştirildiği tarayıcı bilgisi
        
        [Required]
        public DateTime IslemZamani { get; set; } = DateTime.UtcNow; // İşlemin gerçekleştiği zaman (UTC)
        
        public string BasariliMi { get; set; } // İşlemin başarılı olup olmadığı (Evet/Hayır)
        
        public string HataBilgisi { get; set; } // Eğer işlem başarısız olduysa, hata bilgisi
    }
}
