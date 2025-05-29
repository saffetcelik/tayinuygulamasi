using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayinAPI.Models
{
    [Table("tayin_talepleri")]
    public class TayinTalebi
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("personel_id")]
        public int PersonelId { get; set; }

        [Column("basvuru_tarihi")]
        public DateTime BasvuruTarihi { get; set; }

        [Column("talep_durumu")]
        [StringLength(20)]
        public string TalepDurumu { get; set; } = "Beklemede"; // "Beklemede", "İncelemede", "Onaylandı", "Reddedildi"
        
        // AdminController ile uyumlu Durum alanı
        [NotMapped]
        public string Durum 
        { 
            get { return TalepDurumu; } 
            set { TalepDurumu = value; }
        }

        [Required]
        [Column("talep_turu")]
        [StringLength(50)]
        public string TalepTuru { get; set; }

        [Column("aciklama")]
        public string? Aciklama { get; set; } = string.Empty;
        
        // AdminController ile uyumlu DurumAciklamasi alanı
        [NotMapped]
        public string DurumAciklamasi 
        { 
            get { return Aciklama ?? string.Empty; } 
            set { Aciklama = value; }
        }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // İlişkiler
        [ForeignKey("PersonelId")]
        public virtual Personel Personel { get; set; }

        public virtual ICollection<TayinTercihi> TayinTercihleri { get; set; }
    }
}
