using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayinAPI.Models
{
    [Table("sikcasorulansorular")]
    public class SikcaSorulanSoru
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(255)]
        [Column("soru")]
        public string Soru { get; set; }
        
        [Required]
        [Column("cevap")]
        public string Cevap { get; set; }
        
        [Required]
        [MaxLength(100)]
        [Column("kategori")]
        public string Kategori { get; set; }
        
        [Column("sira_no")]
        public int SiraNo { get; set; }
        
        [Column("eklenme_tarihi")]
        public DateTime EklenmeTarihi { get; set; } = DateTime.Now;
        
        [Column("guncellenme_tarihi")]
        public DateTime? GuncellenmeTarihi { get; set; }
        
        [Column("aktif_mi")]
        public bool AktifMi { get; set; } = true;
    }
}
