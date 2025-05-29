using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayinAPI.Models
{
    [Table("adliyeler")]
    public class Adliye
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("adliye_adi")]
        [StringLength(100)]
        public string AdliyeAdi { get; set; }

        [Column("adres")]
        public string Adres { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Column("aktif")]
        public bool Aktif { get; set; } = true;

        // İlişkiler
        public virtual ICollection<Personel> Personeller { get; set; }
        public virtual ICollection<TayinTercihi> TayinTercihleri { get; set; }
    }
}
