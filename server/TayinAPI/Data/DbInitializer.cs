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
            // Veritabanı migration'larını uygula
            // NOT: Migration'ları zaten komut satırından (dotnet ef database update) uyguluyorsak,
            // aşağıdaki satırı yoruma alabilirsiniz.
            // await context.Database.MigrateAsync();

            // İlk veriler veritabanında var mı kontrol et, yoksa ekle
            await InitializeAdminAsync(context);
            await InitializeAdliyelerAsync(context);
            await InitializePersonellerAsync(context);
            await InitializeSikcaSorulanSorularAsync(context);
            await InitializeLogsAsync(context);
            await InitializeTayinTalepleriAsync(context);
        }

        private static async Task InitializeAdminAsync(TayinDbContext context)
        {
            // Admin kullanıcısı var mı kontrol et, yoksa ekle
            if (!context.Adminler.Any())
            {
                var admin = new Admin
                {
                    KullaniciAdi = "admin",
                    Sifre = BCrypt.Net.BCrypt.HashPassword("123"), // Güvenli şifre hash'leme
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
            // Personel tablosunda veri var mı kontrol et
            var personelCount = await context.Personeller.CountAsync();
            
            // Eğer personel tablosunda veri varsa ve doğum tarihi tanımlıysa, hiçbir şey yapma
            if (personelCount > 0)
            {
                // Örnek olarak ilk kaydı kontrol edelim
                var firstPersonel = await context.Personeller.FirstOrDefaultAsync();
                if (firstPersonel != null && firstPersonel.DogumTarihi != null)
                {
                    // Doğum tarihi zaten tanımlı, hiçbir işlem yapma
                    Console.WriteLine("Personel tablosu zaten mevcut ve doğum tarihleri tanımlı.");
                    return;
                }
            }
            
            // Eğer buraya geldiysek ya tablo boş ya da doğum tarihleri tanımlı değil
            // Bu durumda tabloyu temizleyip yeniden oluşturabiliriz
            if (personelCount > 0)
            {
                context.Personeller.RemoveRange(await context.Personeller.ToListAsync());
                await context.SaveChangesAsync();
                Console.WriteLine("Personel tablosu temizlendi, yeniden oluşturulacak...");
            }
            
            // Önce adliyeleri almamız gerekiyor
            var adliyeler = await context.Adliyeler.ToListAsync();
            if (adliyeler.Count == 0)
            {
                Console.WriteLine("Personel eklemek için önce adliyeler oluşturulmalıdır.");
                return;
            }

            // Rastgele adliyeler ve doğum tarihleri seçmek için
            var random = new Random();

            // UTC zamanını burada da kullanalım
            DateTime simdi = DateTime.UtcNow;
            
            // Doğum tarihi oluşturmak için yardımcı fonksiyon
            DateTime GenerateRandomBirthDate()
            {
                // En fazla 40 yaş, en az 23 yaş olacak şekilde rastgele doğum tarihi
                int years = random.Next(23, 40);
                int days = random.Next(1, 365);
                return simdi.AddYears(-years).AddDays(-days);
            }
            
            var personeller = new List<Personel>
                {
                    new Personel
                    {
                        SicilNo = "229301",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("123"), // Güvenli şifre hash'leme
                        Ad = "Saffet",
                        Soyad = "Çelik",
                        Email = "saffet.celik@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Zabıt Katibi",
                        Telefon = GenerateRandomPhoneNumber(),
                        DogumTarihi = GenerateRandomBirthDate(),
                        BaslamaTarihi = simdi.AddYears(-5),
                        CreatedAt = simdi,
                        UpdatedAt = simdi
                    },
                    new Personel
                    {
                        SicilNo = "229304",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("123"),
                        Ad = "Ayşe",
                        Soyad = "Demir",
                        Email = "ayse.demir@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Yazı İşleri Müdürü",
                        Telefon = GenerateRandomPhoneNumber(),
                        DogumTarihi = GenerateRandomBirthDate(),
                        BaslamaTarihi = simdi.AddYears(-4),
                        CreatedAt = simdi,
                        UpdatedAt = simdi
                    },
                    new Personel
                    {
                        SicilNo = "229305",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("123"),
                        Ad = "Ahmet",
                        Soyad = "Öztürk",
                        Email = "ahmet.ozturk@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Mübaşir",
                        Telefon = GenerateRandomPhoneNumber(),
                        DogumTarihi = GenerateRandomBirthDate(),
                        BaslamaTarihi = simdi.AddYears(-5),
                        CreatedAt = simdi,
                        UpdatedAt = simdi
                    }
                };

            context.Personeller.AddRange(personeller);
            await context.SaveChangesAsync();
            Console.WriteLine("Varsayılan personeller oluşturuldu.");
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
                    // Kategori: Başvuru Süreci (4 soru)
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvuruları ne zaman başlar?", 
                        Cevap = "Tayin başvuruları her yıl Nisan ve Ekim aylarında olmak üzere yılda iki kez yapılmaktadır.", 
                        Kategori = "Başvuru Süreci",
                        SiraNo = 1,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvurusu sonuçları ne zaman açıklanır?", 
                        Cevap = "Tayin başvuru sonuçları genellikle başvuru döneminin bitiminden itibaren 30 gün içerisinde açıklanmaktadır.", 
                        Kategori = "Başvuru Süreci",
                        SiraNo = 2,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvurusunu nasıl yapabilirim?", 
                        Cevap = "Tayin başvurunuzu bu uygulama üzerinden çevrimiçi olarak yapabilirsiniz. Giriş yaptıktan sonra 'Tayin Başvurusu' menüsünden yeni bir başvuru oluşturabilir ve tercihlerinizi belirtebilirsiniz.", 
                        Kategori = "Başvuru Süreci",
                        SiraNo = 3,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Başvuru durumumu nasıl takip edebilirim?", 
                        Cevap = "Başvuru durumunuzu, giriş yaptıktan sonra 'Başvuru Durumu' sayfasından takip edebilirsiniz. Başvurunuzun güncel durumu, değerlendirme aşaması ve sonucu burada görüntülenecektir.", 
                        Kategori = "Başvuru Süreci",
                        SiraNo = 4,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },

                    // Kategori: Başvuru Şartları (3 soru)
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvurusu için gereken minimum çalışma süresi nedir?", 
                        Cevap = "Bulunduğunuz adliyede en az 2 yıl çalışmış olmanız gerekmektedir. Bu süre mazeret tayinlerinde farklılık gösterebilir.", 
                        Kategori = "Başvuru Şartları",
                        SiraNo = 5,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Kaç adliye tercihi yapabilirim?", 
                        Cevap = "Bir tayin başvurusunda en fazla 5 adliye tercihi yapabilirsiniz. Tercihlerinizi öncelik sırasına göre belirtmeniz önemlidir.", 
                        Kategori = "Başvuru Şartları",
                        SiraNo = 6,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Tayin başvurusunda hangi belgeler gereklidir?", 
                        Cevap = "Normal tayin başvurusunda ek belge gerekmez. Ancak mazeret tayininde; sağlık raporu, evlilik cüzdanı, eş çalışma belgesi gibi durumunuzu destekleyen belgeleri sisteme yüklemeniz gerekebilir.", 
                        Kategori = "Başvuru Şartları",
                        SiraNo = 7,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },

                    // Kategori: Tayin Türleri (3 soru)
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Mazeret tayini nedir?", 
                        Cevap = "Mazeret tayini, sağlık, eş durumu gibi özel sebeplerle yapılan tayin başvurularıdır ve normal tayin dönemlerini beklemeden yapılabilir.", 
                        Kategori = "Tayin Türleri",
                        SiraNo = 8,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Sağlık durumu tayini için gerekli şartlar nelerdir?", 
                        Cevap = "Sağlık durumu tayini için, kendinize ya da bakmakla yükümlü olduğunuz aile bireylerine ait sağlık kurulu raporu ve tedavinin başka bir ilde sürdürülmesi gerektiğine dair uzman hekim görüşü gereklidir.", 
                        Kategori = "Tayin Türleri",
                        SiraNo = 9,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    },
                    new SikcaSorulanSoru 
                    { 
                        Soru = "Eş durumu tayini nasıl yapılır?", 
                        Cevap = "Eş durumu tayini için eşinizin çalıştığı kurumdan alınmış güncel çalışma belgesi ve evlilik cüzdanı fotokopisi gereklidir. Başvuru sırasında bu belgeleri sisteme yüklemeniz ve eşinizin görev yaptığı ile tayin talebinde bulunmanız gerekmektedir.", 
                        Kategori = "Tayin Türleri",
                        SiraNo = 10,
                        EklenmeTarihi = simdi,
                        GuncellenmeTarihi = simdi,
                        AktifMi = true
                    }
                };

                context.SikcaSorulanSorular.AddRange(sorular);
                await context.SaveChangesAsync();
                Console.WriteLine("Varsayılan sıkça sorulan sorular oluşturuldu.");
            }
        }

        private static async Task InitializeLogsAsync(TayinDbContext context)
        {
            // Loglar var mı kontrol et, yoksa ekle
            if (!context.Loglar.Any())
            {
                // UTC zamanını burada da kullanalım
                DateTime simdi = DateTime.UtcNow;
                
                // Farklı zamanlarda olaylar ekleyelim
                DateTime birGunOnce = simdi.AddDays(-1);
                DateTime ikiGunOnce = simdi.AddDays(-2);
                DateTime ucGunOnce = simdi.AddDays(-3);
                DateTime birHaftaOnce = simdi.AddDays(-7);
                
                var loglar = new List<Log>
                {
                    // Giriş logları
                    new Log 
                    { 
                        IslemTuru = "Giriş", 
                        DetayBilgi = "Kullanıcı sisteme giriş yaptı", 
                        KullaniciSicilNo = "229301",
                        KullaniciAdi = "Saffet Çelik",
                        IpAdresi = "192.168.1.101",
                        TarayiciBilgisi = "Chrome/117.0.5938.149",
                        IslemZamani = simdi.AddHours(-1),
                        BasariliMi = "Evet",
                        HataBilgisi = null
                    },
                    new Log 
                    { 
                        IslemTuru = "Giriş", 
                        DetayBilgi = "Kullanıcı sisteme giriş yaptı", 
                        KullaniciSicilNo = "229302",
                        KullaniciAdi = "Zeynep Çelik",
                        IpAdresi = "192.168.1.102",
                        TarayiciBilgisi = "Firefox/120.0",
                        IslemZamani = birGunOnce,
                        BasariliMi = "Evet",
                        HataBilgisi = null
                    },
                    new Log 
                    { 
                        IslemTuru = "Giriş", 
                        DetayBilgi = "Hatalı şifre girişi", 
                        KullaniciSicilNo = "229303",
                        KullaniciAdi = "Ali Yılmaz",
                        IpAdresi = "192.168.1.103",
                        TarayiciBilgisi = "Safari/15.1",
                        IslemZamani = birGunOnce.AddHours(2),
                        BasariliMi = "Hayır",
                        HataBilgisi = "Yanlış şifre girildi"
                    },
                    
                    // Tayin talebi logları
                    new Log 
                    { 
                        IslemTuru = "Tayin Talebi", 
                        DetayBilgi = "Yeni tayin talebi oluşturuldu", 
                        KullaniciSicilNo = "229301",
                        KullaniciAdi = "Saffet Çelik",
                        IpAdresi = "192.168.1.101",
                        TarayiciBilgisi = "Chrome/117.0.5938.149",
                        IslemZamani = ikiGunOnce,
                        BasariliMi = "Evet",
                        HataBilgisi = null
                    },

                    
                    // Profil işlemleri
                    new Log 
                    { 
                        IslemTuru = "Şifre Değiştirme", 
                        DetayBilgi = "Kullanıcı şifresini değiştirdi", 
                        KullaniciSicilNo = "229301",
                        KullaniciAdi = "Saffet Çelik",
                        IpAdresi = "192.168.1.101",
                        TarayiciBilgisi = "Chrome/117.0.5938.149",
                        IslemZamani = ucGunOnce.AddHours(5),
                        BasariliMi = "Evet",
                        HataBilgisi = null
                    },
                    

                    

                };

                context.Loglar.AddRange(loglar);
                await context.SaveChangesAsync();
                Console.WriteLine("Varsayılan log kayıtları oluşturuldu.");
            }
        }
        
        private static async Task InitializeTayinTalepleriAsync(TayinDbContext context)
        {
            // Tayin talepleri var mı kontrol et, yoksa ekle
            if (!context.TayinTalepleri.Any())
            {
                // Rasgele tayin türleri listesi
                var talepTurleri = new List<string>
                {
                    "Normal Tayin",
                    "Mazeret Tayini",
                    "Sağlık Durumu Tayini",
                    "Eş Durumu Tayini",
                    "Zorunlu Hizmet Tayini"
                };
                
                // Tüm personeller için birer tane tayin talebi oluştur
                var personeller = await context.Personeller.ToListAsync();
                var adliyeler = await context.Adliyeler.ToListAsync();
                var random = new Random();
                
                // Rasgele tarihler için aralık
                DateTime simdi = DateTime.UtcNow;
                DateTime birAyOnce = simdi.AddMonths(-1);
                
                // Her personel için tayin talebi oluştur
                foreach (var personel in personeller)
                {
                    // Personelin mevcut adliye ID'sini al
                    int mevcutAdliyeId = personel.MevcutAdliyeId ?? 0;
                    
                    // Rasgele bir tayin türü seç
                    string talepTuru = talepTurleri[random.Next(talepTurleri.Count)];
                    
                    // Rasgele bir başvuru tarihi oluştur
                    TimeSpan araliktakiSure = simdi - birAyOnce;
                    int toplamDakika = (int)araliktakiSure.TotalMinutes;
                    DateTime basvuruTarihi = birAyOnce.AddMinutes(random.Next(toplamDakika));
                    
                    // Rasgele durum seç
                    var durumlar = new List<string> { "Beklemede", "İncelemede", "Onaylandı", "Reddedildi" };
                    string rasgeledurum = durumlar[random.Next(durumlar.Count)];
                    
                    // Duruma göre açıklama oluştur
                    string aciklama = rasgeledurum switch
                    {
                        "Beklemede" => $"{talepTuru} sebebiyle tayin talebi oluşturulmuştur. Talebiniz beklemede.",
                        "İncelemede" => $"{talepTuru} sebebiyle oluşturulan tayin talebiniz inceleniyor.",
                        "Onaylandı" => $"{talepTuru} sebebiyle oluşturduğunuz tayin talebiniz onaylanmıştır.",
                        "Reddedildi" => $"{talepTuru} sebebiyle oluşturduğunuz tayin talebiniz uygun görülmemiştir.",
                        _ => $"{talepTuru} sebebiyle tayin talebi oluşturulmuştur."
                    };
                    
                    // Güncelleme tarihini duruma göre ayarla (onaylanan veya reddedilen talepler için daha sonraki bir tarih)
                    DateTime updateTarihi = rasgeledurum == "Beklemede" ? basvuruTarihi : 
                                        rasgeledurum == "İncelemede" ? basvuruTarihi.AddDays(random.Next(1, 3)) : 
                                        basvuruTarihi.AddDays(random.Next(3, 7));
                    
                    // Tayin talebini oluştur
                    var tayinTalebi = new TayinTalebi
                    {
                        PersonelId = personel.Id,
                        BasvuruTarihi = basvuruTarihi,
                        TalepDurumu = rasgeledurum,
                        TalepTuru = talepTuru,
                        Aciklama = aciklama,
                        CreatedAt = basvuruTarihi,
                        UpdatedAt = updateTarihi
                    };
                    
                    // Tayin talebini veritabanına ekle
                    context.TayinTalepleri.Add(tayinTalebi);
                    await context.SaveChangesAsync();
                    
                    // Mevcut adliyeyi hariç tutacak şekilde adliye listesini oluştur
                    var tercihilenebilirAdliyeler = adliyeler.Where(a => a.Id != mevcutAdliyeId).ToList();
                    
                    // Rasgele 3 tercih oluştur (eğer yeterli adliye varsa)
                    int tercihSayisi = Math.Min(3, tercihilenebilirAdliyeler.Count);
                    var seçilenAdliyeIdleri = new List<int>();
                    
                    for (int i = 0; i < tercihSayisi; i++)
                    {
                        // Henüz seçilmemiş adliyelerden birini rasgele seç
                        int adliyeIndex;
                        int adliyeId;
                        
                        do
                        {
                            adliyeIndex = random.Next(tercihilenebilirAdliyeler.Count);
                            adliyeId = tercihilenebilirAdliyeler[adliyeIndex].Id;
                        } while (seçilenAdliyeIdleri.Contains(adliyeId));
                        
                        // Seçilen adliyeyi listeye ekle
                        seçilenAdliyeIdleri.Add(adliyeId);
                        
                        // Tayin tercihini oluştur
                        var tayinTercihi = new TayinTercihi
                        {
                            TayinTalebiId = tayinTalebi.Id,
                            AdliyeId = adliyeId,
                            TercihSirasi = i + 1,  // 1-tabanlı tercih sırası
                            CreatedAt = basvuruTarihi,
                            UpdatedAt = basvuruTarihi
                        };
                        
                        // Tayin tercihini veritabanına ekle
                        context.TayinTercihleri.Add(tayinTercihi);
                    }
                    
                    await context.SaveChangesAsync();
                }
                
                Console.WriteLine("Varsayılan tayin talepleri ve tercihleri oluşturuldu.");
            }
        }
    }
}
