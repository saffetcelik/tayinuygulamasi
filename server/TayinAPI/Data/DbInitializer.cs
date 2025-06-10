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
            
            
            
            

            
            await InitializeAdminAsync(context);
            await InitializeAdliyelerAsync(context);
            await InitializePersonellerAsync(context);
            await InitializeSikcaSorulanSorularAsync(context);
            await InitializeLogsAsync(context);
            await InitializeTayinTalepleriAsync(context);
        }

        private static async Task InitializeAdminAsync(TayinDbContext context)
        {
            
            if (!context.Adminler.Any())
            {
                var admin = new Admin
                {
                    KullaniciAdi = "admin",
                    Sifre = BCrypt.Net.BCrypt.HashPassword("123"), 
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
            
            if (!context.Adliyeler.Any())
            {
                
                DateTime simdi = DateTime.UtcNow;
                
                
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
            
            return $"535000{random.Next(1000, 9999)}";
        }

        private static async Task InitializePersonellerAsync(TayinDbContext context)
        {
            
            var personelCount = await context.Personeller.CountAsync();
            
            
            if (personelCount > 0)
            {
                
                var firstPersonel = await context.Personeller.FirstOrDefaultAsync();
                if (firstPersonel != null && firstPersonel.DogumTarihi != null)
                {
                    
                    Console.WriteLine("Personel tablosu zaten mevcut ve doğum tarihleri tanımlı.");
                    return;
                }
            }
            
            
            
            if (personelCount > 0)
            {
                context.Personeller.RemoveRange(await context.Personeller.ToListAsync());
                await context.SaveChangesAsync();
                Console.WriteLine("Personel tablosu temizlendi, yeniden oluşturulacak...");
            }
            
            
            var adliyeler = await context.Adliyeler.ToListAsync();
            if (adliyeler.Count == 0)
            {
                Console.WriteLine("Personel eklemek için önce adliyeler oluşturulmalıdır.");
                return;
            }

            
            var random = new Random();

            
            DateTime simdi = DateTime.UtcNow;
            
            
            DateTime GenerateRandomBirthDate()
            {
                
                int years = random.Next(23, 40);
                int days = random.Next(1, 365);
                return simdi.AddYears(-years).AddDays(-days);
            }
            
            var personeller = new List<Personel>
                {
                    new Personel
                    {
                        SicilNo = "229301",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("123"), 
                        Ad = "Saffet",
                        Soyad = "Çelik",
                        Email = "saffet.celik@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Zabıt Katibi",
                        Telefon = "5350001001",
                        DogumTarihi = GenerateRandomBirthDate(),
                        BaslamaTarihi = simdi.AddYears(-5),
                        CreatedAt = simdi,
                        UpdatedAt = simdi
                    },
                    new Personel
                    {
                        SicilNo = "229302",
                        Sifre = BCrypt.Net.BCrypt.HashPassword("123"),
                        Ad = "Zeynep",
                        Soyad = "Çelik",
                        Email = "zeynep.celik@adalet.gov.tr",
                        MevcutAdliyeId = adliyeler[random.Next(adliyeler.Count)].Id,
                        Unvan = "Mübaşir",
                        Telefon = "5350001002",
                        DogumTarihi = GenerateRandomBirthDate(),
                        BaslamaTarihi = simdi.AddYears(-3),
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
                        Telefon = "5350002002",
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
                        Telefon = "5350003003",
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
            
            if (!context.SikcaSorulanSorular.Any())
            {
                
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
            
            if (!context.Loglar.Any())
            {
                
                DateTime simdi = DateTime.UtcNow;
                
                
                DateTime birGunOnce = simdi.AddDays(-1);
                DateTime ikiGunOnce = simdi.AddDays(-2);
                DateTime ucGunOnce = simdi.AddDays(-3);
                DateTime birHaftaOnce = simdi.AddDays(-7);
                
                var loglar = new List<Log>
                {
                    
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
            
            if (!context.TayinTalepleri.Any())
            {
                
                var talepTurleri = new List<string>
                {
                    "Normal Tayin",
                    "Mazeret Tayini",
                    "Sağlık Durumu Tayini",
                    "Eş Durumu Tayini",
                    "Zorunlu Hizmet Tayini"
                };
                
                
                var personeller = await context.Personeller.ToListAsync();
                var adliyeler = await context.Adliyeler.ToListAsync();
                var random = new Random();
                
                
                DateTime simdi = DateTime.UtcNow;
                DateTime birAyOnce = simdi.AddMonths(-1);
                
                
                foreach (var personel in personeller)
                {
                    
                    int mevcutAdliyeId = personel.MevcutAdliyeId ?? 0;
                    
                    
                    string talepTuru = talepTurleri[random.Next(talepTurleri.Count)];
                    
                    
                    TimeSpan araliktakiSure = simdi - birAyOnce;
                    int toplamDakika = (int)araliktakiSure.TotalMinutes;
                    DateTime basvuruTarihi = birAyOnce.AddMinutes(random.Next(toplamDakika));
                    
                    
                    var durumlar = new List<string> { "Beklemede", "İncelemede", "Onaylandı", "Reddedildi" };
                    string rasgeledurum = durumlar[random.Next(durumlar.Count)];
                    
                    
                    string aciklama = rasgeledurum switch
                    {
                        "Beklemede" => $"{talepTuru} sebebiyle tayin talebi oluşturulmuştur. Talebiniz beklemede.",
                        "İncelemede" => $"{talepTuru} sebebiyle oluşturulan tayin talebiniz inceleniyor.",
                        "Onaylandı" => $"{talepTuru} sebebiyle oluşturduğunuz tayin talebiniz onaylanmıştır.",
                        "Reddedildi" => $"{talepTuru} sebebiyle oluşturduğunuz tayin talebiniz uygun görülmemiştir.",
                        _ => $"{talepTuru} sebebiyle tayin talebi oluşturulmuştur."
                    };
                    
                    
                    DateTime updateTarihi = rasgeledurum == "Beklemede" ? basvuruTarihi : 
                                        rasgeledurum == "İncelemede" ? basvuruTarihi.AddDays(random.Next(1, 3)) : 
                                        basvuruTarihi.AddDays(random.Next(3, 7));
                    
                    
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
                    
                    
                    context.TayinTalepleri.Add(tayinTalebi);
                    await context.SaveChangesAsync();
                    
                    
                    var tercihilenebilirAdliyeler = adliyeler.Where(a => a.Id != mevcutAdliyeId).ToList();
                    
                    
                    int tercihSayisi = Math.Min(3, tercihilenebilirAdliyeler.Count);
                    var seçilenAdliyeIdleri = new List<int>();
                    
                    for (int i = 0; i < tercihSayisi; i++)
                    {
                        
                        int adliyeIndex;
                        int adliyeId;
                        
                        do
                        {
                            adliyeIndex = random.Next(tercihilenebilirAdliyeler.Count);
                            adliyeId = tercihilenebilirAdliyeler[adliyeIndex].Id;
                        } while (seçilenAdliyeIdleri.Contains(adliyeId));
                        
                        
                        seçilenAdliyeIdleri.Add(adliyeId);
                        
                        
                        var tayinTercihi = new TayinTercihi
                        {
                            TayinTalebiId = tayinTalebi.Id,
                            AdliyeId = adliyeId,
                            TercihSirasi = i + 1,  
                            CreatedAt = basvuruTarihi,
                            UpdatedAt = basvuruTarihi
                        };
                        
                        
                        context.TayinTercihleri.Add(tayinTercihi);
                    }
                    
                    await context.SaveChangesAsync();
                }
                
                Console.WriteLine("Varsayılan tayin talepleri ve tercihleri oluşturuldu.");
            }
        }
    }
}
