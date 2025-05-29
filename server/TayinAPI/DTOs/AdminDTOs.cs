using System;
using System.ComponentModel.DataAnnotations;

namespace TayinAPI.DTOs
{
    // Admin giriş DTO'su
    public class AdminLoginDTO
    {
        [Required(ErrorMessage = "Kullanıcı adı zorunludur.")]
        public string KullaniciAdi { get; set; } = "";

        [Required(ErrorMessage = "Şifre zorunludur.")]
        public string Sifre { get; set; } = "";
    }

    // Tayin talebi durum güncelleme DTO'su
    public class TayinTalebiDurumDTO
    {
        [Required(ErrorMessage = "Durum bilgisi zorunludur.")]
        public string Durum { get; set; } = "";

        public string DurumAciklamasi { get; set; } = "";
    }

    // Admin şifre değiştirme DTO'su
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
}
