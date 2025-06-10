using System;
using System.ComponentModel.DataAnnotations;

namespace TayinAPI.DTOs
{
    
    public class AdminLoginDTO
    {
        [Required(ErrorMessage = "Kullanıcı adı zorunludur.")]
        public string KullaniciAdi { get; set; } = "";

        [Required(ErrorMessage = "Şifre zorunludur.")]
        public string Sifre { get; set; } = "";
    }

    
    public class TayinTalebiDurumDTO
    {
        [Required(ErrorMessage = "Durum bilgisi zorunludur.")]
        public string Durum { get; set; } = "";

        public string DurumAciklamasi { get; set; } = "";
    }

    
    public class AdminSifreDegistirDTO
    {
        [Required(ErrorMessage = "Admin ID zorunludur.")]
        public int AdminId { get; set; }

        [Required(ErrorMessage = "Mevcut şifre zorunludur.")]
        public string MevcutSifre { get; set; } = "";

        [Required(ErrorMessage = "Yeni şifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
        public string YeniSifre { get; set; } = "";
    }

    
    public class PersonelGuncelleDTO
    {
        [Required(ErrorMessage = "Ad alanı zorunludur.")]
        [MaxLength(50, ErrorMessage = "Ad alanı en fazla 50 karakter olabilir.")]
        public string Ad { get; set; } = "";

        [Required(ErrorMessage = "Soyad alanı zorunludur.")]
        [MaxLength(50, ErrorMessage = "Soyad alanı en fazla 50 karakter olabilir.")]
        public string Soyad { get; set; } = "";

        [Required(ErrorMessage = "Unvan alanı zorunludur.")]
        [MaxLength(50, ErrorMessage = "Unvan alanı en fazla 50 karakter olabilir.")]
        public string Unvan { get; set; } = "";

        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
        [MaxLength(100, ErrorMessage = "E-posta alanı en fazla 100 karakter olabilir.")]
        public string Email { get; set; } = "";

        [MaxLength(15, ErrorMessage = "Telefon alanı en fazla 15 karakter olabilir.")]
        public string Telefon { get; set; } = "";

        public int? MevcutAdliyeId { get; set; }

        public DateTime? DogumTarihi { get; set; }

        public DateTime? BaslamaTarihi { get; set; }

        
        [MinLength(1, ErrorMessage = "Şifre en az 1 karakter olmalıdır.")]
        public string YeniSifre { get; set; } = "";
    }
}
