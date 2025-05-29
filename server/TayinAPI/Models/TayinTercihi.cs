using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TayinAPI.Models
{
    [Table("tayin_tercihleri")]
    public class TayinTercihi
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("tayin_talebi_id")]
        public int TayinTalebiId { get; set; }

        [Required]
        [Column("adliye_id")]
        public int AdliyeId { get; set; }

        [Required]
        [Column("tercih_sirasi")]
        public int TercihSirasi { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // İlişkiler
        [ForeignKey("TayinTalebiId")]
        public virtual TayinTalebi TayinTalebi { get; set; }

        [ForeignKey("AdliyeId")]
        public virtual Adliye Adliye { get; set; }
    }
}
