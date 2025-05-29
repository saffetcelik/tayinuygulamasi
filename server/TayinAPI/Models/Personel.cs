using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayinAPI.Models
{
    [Table("personel")]
    public class Personel
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required(ErrorMessage = "Sicil No Gereklidir.")]
        [Column("sicil_no")]
        [StringLength(20)]
        public string SicilNo { get; set; }

        [Required]
        [Column("sifre")]
        [StringLength(255)]
        public string Sifre { get; set; }

        [Required]
        [Column("ad")]
        [StringLength(50)]
        public string Ad { get; set; }

        [Required]
        [Column("soyad")]
        [StringLength(50)]
        public string Soyad { get; set; }

        [Required]
        [Column("unvan")]
        [StringLength(50)]
        public string Unvan { get; set; }

        [Column("mevcut_adliye_id")]
        public int? MevcutAdliyeId { get; set; }

        [Column("telefon")]
        [StringLength(15)]
        public string Telefon { get; set; }

        [Column("email")]
        [StringLength(100)]
        public string Email { get; set; }

        [Column("dogum_tarihi")]
        public DateTime? DogumTarihi { get; set; }

        [Column("baslama_tarihi")]
        public DateTime? BaslamaTarihi { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        // İlişkiler
        [ForeignKey("MevcutAdliyeId")]
        public virtual Adliye MevcutAdliye { get; set; }

        public virtual ICollection<TayinTalebi> TayinTalepleri { get; set; }
    }
}
