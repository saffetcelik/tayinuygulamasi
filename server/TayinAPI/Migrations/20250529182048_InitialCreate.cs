using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TayinAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "adliyeler",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    adliye_adi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    adres = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    aktif = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_adliyeler", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Adminler",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KullaniciAdi = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Sifre = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    AdSoyad = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Rol = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SonGirisTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProfilResmi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Telefon = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Aktif = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Adminler", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "sikcasorulansorular",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    soru = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    cevap = table.Column<string>(type: "text", nullable: false),
                    kategori = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sira_no = table.Column<int>(type: "integer", nullable: false),
                    eklenme_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    guncellenme_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    aktif_mi = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sikcasorulansorular", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "personel",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    sicil_no = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    sifre = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ad = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    soyad = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    unvan = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    mevcut_adliye_id = table.Column<int>(type: "integer", nullable: true),
                    telefon = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    dogum_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    baslama_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_personel", x => x.id);
                    table.ForeignKey(
                        name: "FK_personel_adliyeler_mevcut_adliye_id",
                        column: x => x.mevcut_adliye_id,
                        principalTable: "adliyeler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "tayin_talepleri",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    personel_id = table.Column<int>(type: "integer", nullable: false),
                    basvuru_tarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    talep_durumu = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    talep_turu = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    aciklama = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tayin_talepleri", x => x.id);
                    table.ForeignKey(
                        name: "FK_tayin_talepleri_personel_personel_id",
                        column: x => x.personel_id,
                        principalTable: "personel",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "tayin_tercihleri",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tayin_talebi_id = table.Column<int>(type: "integer", nullable: false),
                    adliye_id = table.Column<int>(type: "integer", nullable: false),
                    tercih_sirasi = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tayin_tercihleri", x => x.id);
                    table.ForeignKey(
                        name: "FK_tayin_tercihleri_adliyeler_adliye_id",
                        column: x => x.adliye_id,
                        principalTable: "adliyeler",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tayin_tercihleri_tayin_talepleri_tayin_talebi_id",
                        column: x => x.tayin_talebi_id,
                        principalTable: "tayin_talepleri",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_personel_mevcut_adliye_id",
                table: "personel",
                column: "mevcut_adliye_id");

            migrationBuilder.CreateIndex(
                name: "IX_tayin_talepleri_personel_id",
                table: "tayin_talepleri",
                column: "personel_id");

            migrationBuilder.CreateIndex(
                name: "IX_tayin_tercihleri_adliye_id",
                table: "tayin_tercihleri",
                column: "adliye_id");

            migrationBuilder.CreateIndex(
                name: "IX_tayin_tercihleri_tayin_talebi_id",
                table: "tayin_tercihleri",
                column: "tayin_talebi_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Adminler");

            migrationBuilder.DropTable(
                name: "sikcasorulansorular");

            migrationBuilder.DropTable(
                name: "tayin_tercihleri");

            migrationBuilder.DropTable(
                name: "tayin_talepleri");

            migrationBuilder.DropTable(
                name: "personel");

            migrationBuilder.DropTable(
                name: "adliyeler");
        }
    }
}
