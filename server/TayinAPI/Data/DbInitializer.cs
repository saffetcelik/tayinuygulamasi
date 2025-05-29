using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TayinAPI.Models;

namespace TayinAPI.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(TayinDbContext context)
        {
            // Veritabanını oluştur (eğer yoksa)
            await context.Database.MigrateAsync();

            // İlk veriler veritabanında var mı kontrol et, yoksa ekle
            await InitializeAdminAsync(context);
            await InitializeAdliyelerAsync(context);
            await InitializePersonellerAsync(context);
            await InitializeSikcaSorulanSorularAsync(context);
        }

        private static async Task InitializeAdminAsync(TayinDbContext context)
        {
            // Admin kullanıcısı var mı kontrol et, yoksa ekle
            if (!context.Adminler.Any())
            {
                var admin = new Admin
                {
                    KullaniciAdi = "admin",
                    Sifre = BCrypt.Net.BCrypt.HashPassword("1"), // Güvenli şifre hash'leme
                    AdSoyad = "Sistem Yöneticisi",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Rol = "Admin"
                };

                context.Adminler.Add(admin);
                await context.SaveChangesAsync();
                Console.WriteLine("Varsayılan admin kullanıcısı oluşturuldu.");
            }
        }

        private static async Task InitializeAdliyelerAsync(TayinDbContext context)
        {
            // Adliyeler var mı kontrol et, yoksa ekle
            if (!context.Adliyeler.Any())
            {
                // Tüm timestamp değerlerini UTC olarak ayarla (PostgreSQL için gerekli)
                DateTime simdi = DateTime.UtcNow;
                
                // Adliyeleri tanımla
                var ilListesi = new string[] {
                    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
                    "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
                    "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum",
                    "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
                    "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis",
                    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde",
                    "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ",
                    "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
                };
                
                var adliyeler = new List<Adliye>();
                
                // Tüm adliyeleri oluştur ve CreatedAt/UpdatedAt alanlarını ekle
                foreach (var il in ilListesi)
                {
                    string adliyeAdi = $"{il} Adliyesi";
                    adliyeler.Add(new Adliye {
                        AdliyeAdi = adliyeAdi,
                        Adres = $"{il} Merkez",
                        Aktif = true,
                        CreatedAt = simdi,
                        UpdatedAt = simdi
                    });
                }

                context.Adliyeler.AddRange(adliyeler);

                await context.SaveChangesAsync();
                Console.WriteLine("Varsayılan adliyeler oluşturuldu.");
            }
        }

        private static string GenerateRandomPhoneNumber()
        {
            Random random = new Random();
            // Format: 5xxxxxxxxx (10 digits)
            return $"5{random.Next(100000000, 999999999)}";
        }

        private static async Task InitializePersonellerAsync(TayinDbContext context)
        {
            // Personeller var mı kontrol et, yoksa ekle
            if (!context.Personeller.Any())
            {
                // Önce adliyeleri almamız gerekiyor
                var adliyeler = await context.Adliyeler.ToListAsync();
                if (adliyeler.Count == 0)
                {
                    Console.WriteLine("Personel eklemek için önce adliyeler oluşturulmalıdır.");
                    return;
                }

                // Rastgele adliyeler seçmek için
                var random = new Random();

                // UTC zamanını burada da kullanalım
                DateTime simdi = DateTime.UtcNow;
                
                var personeller = new List<Personel>
                {
                    new Personel
                    {
                        SicilNo = "229301",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("1"), // Güvenli şifre hash'leme
                        Ad = "Saffet",
                        Soyad = "Çelik",
                        Email = "saffet.celik@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Zabıt Katibi",
                        Telefon = GenerateRandomPhoneNumber(),
                        BaslamaTarihi = simdi.AddYears(-5),
                        CreatedAt = simdi,
                        UpdatedAt = simdi
                    },
                    new Personel
                    {
                        SicilNo = "229302",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("1"),
                        Ad = "Zeynep",
                        Soyad = "Çelik",
                        Email = "zeynep.celik@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Mübaşir",
                        Telefon = GenerateRandomPhoneNumber(),
                        BaslamaTarihi = DateTime.UtcNow.AddYears(-1),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Personel
                    {
                        SicilNo = "229303",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("1"),
                        Ad = "Ali",
                        Soyad = "Yılmaz",
                        Email = "ali.yilmaz@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Zabıt Katibi",
                        Telefon = GenerateRandomPhoneNumber(),
                        BaslamaTarihi = DateTime.UtcNow.AddYears(-3),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Personel
                    {
                        SicilNo = "229304",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("1"),
                        Ad = "Ayşe",
                        Soyad = "Demir",
                        Email = "ayse.demir@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Yazı İşleri Müdürü",
                        Telefon = GenerateRandomPhoneNumber(),
                        BaslamaTarihi = DateTime.UtcNow.AddYears(-4),
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new Personel
                    {
                        SicilNo = "229305",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("1"),
                        Ad = "Ahmet",
                        Soyad = "Öztürk",
                        Email = "ahmet.ozturk@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Mübaşir",
                        Telefon = GenerateRandomPhoneNumber(),
                        BaslamaTarihi = simdi.AddYears(-5),
                        CreatedAt = simdi,
                        UpdatedAt = simdi
                    }
                };

                context.Personeller.AddRange(personeller);
                await context.SaveChangesAsync();
                Console.WriteLine("Varsayılan personeller oluşturuldu.");
            }
        }

        private static async Task InitializeSikcaSorulanSorularAsync(TayinDbContext context)
        {
            // Sıkça Sorulan Sorular var mı kontrol et, yoksa ekle
            if (!context.SikcaSorulanSorular.Any())
            {
                // UTC zamanını burada da kullanalım
                DateTime simdi = DateTime.UtcNow;
                
                var sorular = new List<SikcaSorulanSoru>
                {
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvuruları ne zaman başlar?", 
                        Cevap = "Tayin başvuruları her yıl Nisan ve Ekim aylarında olmak üzere yılda iki kez yapılmaktadır.", 
                        Kategori = "Başvuru Süreci",
                        SiraNo = 1,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvurusu için gereken minimum çalışma süresi nedir?", 
                        Cevap = "Bulunduğunuz adliyede en az 2 yıl çalışmış olmanız gerekmektedir.", 
                        Kategori = "Başvuru Şartları",
                        SiraNo = 2,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Mazeret tayini nedir?", 
                        Cevap = "Mazeret tayini, sağlık, eş durumu gibi özel sebeplerle yapılan tayin başvurularıdır ve normal tayin dönemlerini beklemeden yapılabilir.", 
                        Kategori = "Tayin Türleri",
                        SiraNo = 3,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvurusu sonuçları ne zaman açıklanır?", 
                        Cevap = "Tayin başvuru sonuçları genellikle başvuru döneminin bitiminden itibaren 30 gün içerisinde açıklanmaktadır.", 
                        Kategori = "Başvuru Süreci",
                        SiraNo = 4,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Kaç adliye tercihi yapabilirim?", 
                        Cevap = "Bir tayin başvurusunda en fazla 5 adliye tercihi yapabilirsiniz.", 
                        Kategori = "Başvuru Şartları",
                        SiraNo = 5,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi
                    }
                };

                context.SikcaSorulanSorular.AddRange(sorular);
                await context.SaveChangesAsync();
                Console.WriteLine("Varsayılan sıkça sorulan sorular oluşturuldu.");
            }
        }
    }
}
