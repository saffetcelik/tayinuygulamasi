# Tayin Projesi

Bu proje, ASP.NET Core backend ve React frontend kullanan MVC mimarisine uygun bir web uygulamasıdır.

## 📖 Detaylı Dokümantasyon

Projenin kurulum adımları, ekran görüntüleri ve tüm detaylı bilgileri için:
**[📋 Proje Dokümantasyonu](https://saffetcelik.github.io/tayinuygulamasi/)**

## Proje Hakkında

Tayin projesi, kullanıcı dostu arayüz tasarımı ve verimli bileşen kullanımına odaklanmış, mobil ve tablet cihazlarda uyumlu çalışacak şekilde tasarlanmıştır.

### Kullanıcı Profil Özellikleri 

- **Profil Yönetimi:** Kullanıcılar kişisel bilgilerini ve mevcut adliye bilgilerini görüntüleyebilir
- **Vektörel Türkiye Haritası:** Modern harita arayüzü ile şehir seçerek adliye tercihlerini yapabilme
- **Adliye Seçimi:** Açılır menü üzerinden adliye seçimi yaparak tayin tercihlerini sıralayabilme
- **Tayin Talepleri Takibi:** Kullanıcılar mevcut tayin taleplerini listeleyebilir, durumlarını görebilir ve taleplerini iptal edebilir
- **Sıkça Sorulan Sorular:** Kategorize edilmiş SSS bölümü ve arama özelliği ile bilgilere hızlı erişim
- **Şifre Değiştirme:** Kullanıcılar ayarlar menüsü üzerinden güvenli şekilde şifrelerini değiştirebilir

### Admin Panel Özellikleri

- **Personel Yönetimi:** Tüm personel kayıtlarını görüntüleme, düzenleme, silme
- **Tayin Talepleri Yönetimi:** Gelen tayin taleplerini inceleme, onaylama veya reddetme
- **Log Yönetimi:** Sistem loglarını çeşitli kriterlere göre filtreleme ve görüntüleme
  - Loglanan İşlemler: Kimlik doğrulama, başarılı başarısız login istekleri, tayin talepleri, sistem hataları
  - Filtreleme Seçenekleri: Tarih, kullanıcı, işlem türü, başarı durumu
- **Sıkça Sorulan Sorular Yönetimi:** SSS bölümü için soru ekleme, düzenleme, silme
- **Sistem Testleri:** Hata senaryolarını test etme ve log kayıtlarını kontrol etme
- **API Dokümantasyonu:** Tüm API endpoint'lerini ve kullanım örneklerini görüntüleme
- **İstatistikler:** Tayin taleplerine ilişkin istatistikleri görüntüleme


## Teknolojiler

### Backend
- ASP.NET Core 8.0
- Entity Framework Core
- PostgreSQL
- JWT Kimlik Doğrulama
- Swagger/OpenAPI

### Frontend
- React.js
- React Router
- Axios
- React Bootstrap
- React Icons
- React Simple Maps
- SweetAlert2
- React Toastify

## Özellikler

- MVC mimarisine uygun yapı
- JWT tabanlı kimlik doğrulama ve yetkilendirme
- Responsive tasarım (mobil ve tablet uyumlu)
- Kullanıcı dostu arayüz
- RESTful API

## Kurulum Gereksinimleri

### Zorunlu Gereksinimler
- .NET 8.0 SDK
- Node.js 18+ ve npm
- PostgreSQL 14+
- PowerShell 5.0+

### İsteğe Bağlı Araçlar
- Visual Studio 2022 veya Visual Studio Code
- pgAdmin (PostgreSQL yönetimi için)

## Kurulum Adımları

### 1. Hızlı Başlangıç - Docker İmajı ile Çalıştırma (En Kolay Yöntem - Önerilen)

Projeyi tek komutla çalıştırmanın en hızlı yolu hazır Docker imajını kullanmaktır. Docker ve Docker Compose kurulu olduğundan emin olun Bu yöntemle herhangi ek bir kurulum yapmadan direkt projeyi çalıştırabilirsiniz:

```powershell
docker run -p 3000:3000 -p 5000:5000 saffetcelikdocker/tayin-app:latest
```

Bu komut:
- Hazır Docker imajını indirir
- PostgreSQL veritabanını başlatır
- Backend API'yi çalıştırır (port 5000)
- Frontend uygulamasını çalıştırır (port 3000)
- Tüm bağımlılıkları otomatik olarak yükler

**Erişim Bilgileri:**
- Frontend: http://localhost:3000 (Varsayılan Kullanıcı ve Admin giriş bilgileri aşağıda verilmiştir.)
- Backend API: http://localhost:5000  
 

### 2. Alternatif  Kaynak Koddan Docker ile Çalıştırma

Kaynak kodu indirip Docker ile çalıştırmak istiyorsanız:

#### 2.1. Projeyi Klonlama

```powershell
git clone https://github.com/saffetcelik/tayinuygulamasi.git
cd tayinuygulamasi # Proje dizinine girin docker komutunu çalıştırmak için proje dizininde olmak gerekir.
```

#### 2.2. Docker Compose ile Çalıştırma

Docker ve Docker Compose kurulu olduğundan emin olun. Proje tek komutla Docker üzerinde çalıştırılabilir, tüm bağımlılıklar otomatik olarak yüklenir ve proje başlatılır.

```powershell
docker-compose up -d --build
```

Bu komut:
- PostgreSQL veritabanını başlatır
- PostreSQL veritabanı için migration'ları uygular ve temel verileri ekler
- Backend API'yi build edip çalıştırır (veritabanı bağlantısını bekler)
- Frontend uygulamasını build edip çalıştırır
- Tüm bileşenleri Docker ağında birbirine bağlar

> **Not:** Backend konteyneri (`tayin-backend`) için veritabanı bağlantı bilgileri (`ConnectionStrings__DefaultConnection`) `dockerfiles/entrypoint.sh` dosyası içerisinde tanımlanmıştır. Varsayılan olarak `Host=postgres;Database=tayin;Username=postgres;Password=root` şeklindedir.

**Erişim Bilgileri:**
- "docker ps" komutunu terminalde çalıştırarak projenin hangi portta çalıştığını görebilirsiniz.
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000 (Varsayılan Kullanıcı ve Admin giriş bilgileri aşağıda verilmiştir.)
- PostgreSQL: localhost:5432 (Docker içinde tayin-postgres konteynerinde)


### 3. Manuel Kurulum (Docker Olmadan)

#### 3.1. PostgreSQL Kurulumu ve Veritabanı Ayarları

1. PostgreSQL'i indirin ve kurun: [PostgreSQL İndirme Sayfası](https://www.postgresql.org/download/)
2. Kurulum sırasında veya sonrasında şu bilgileri not edin:
   - Kullanıcı adı (varsayılan: postgres)
   - Şifre (kurulum sırasında belirlenir)
   - Port (varsayılan: 5432)
3. `server/TayinAPI/appsettings.json` dosyasını açın ve veritabanı bağlantı dizesini güncelleyin:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tayin;Username=postgres;Password=şifreniz"
  }
}
```

#### 3.2. Backend (.NET Core) Kurulumu

```powershell
cd server/TayinAPI
dotnet restore
dotnet tool install --global dotnet-ef  # Entity Framework CLI aracını kurun
dotnet ef database update  # Veritabanını oluştur ve migrate edin
```

> **Not:** Veritabanı migration işlemi sırasında otomatik olarak varsayılan başlangıç verileri oluşturulur. Bu veriler arasında:
> - Rasgele personel kayıtları (farklı illerde görev yapan)
> - Çeşitli durumlarda (Beklemede, İncelemede, Onaylandı, Reddedildi) tayin talepleri ve tercihleri
> - Personellerin giriş, şifre değiştirme ve tayin taleplerine ait örnek log kayıtları 
> - Kategorilere ayrılmış sıkça sorulan sorular bulunmaktadır. Böylece sistem ilk kurulumda demo kullanım için hazır hale gelir.
>


#### 3.3. Frontend (React) Kurulumu

```powershell
cd ../../client  # Kök dizinden client klasörüne girin
npm install
```

#### 3.4. Otomasyon ile Çalıştırma (Manuel Kurulum Sonrası Backend ve Frontendin Aynı anda Çalıştırılması için )

Kök dizinde bulunan PowerShell scriptini kullanarak hem backend hem de frontend tek bir komutla başlatılabilir:

``` kök dizinde start.ps1 dosyasını çalıştır
./start.ps1
```

Bu script şunları yapacaktır:
- Backend API'yi http://localhost:5000 adresinde başlatır
- Frontend'i http://localhost:3001 adresinde başlatır
- Tarayıcınızı otomatik olarak frontend adresine yönlendirir

#### 3.5. Manuel Çalıştırma

Otomasyon scriptini kullanmak istemiyorsanız, backend ve frontend'i ayrı ayrı başlatabilirsiniz:

**Backend için:**
```powershell
cd server/TayinAPI
dotnet run --urls=http://localhost:5000
```

**Frontend için:**
```powershell
cd client
npm start
```


**Uygulama Erişim Linkleri:**
- Kullanıcı Girişi: http://localhost:3001
- Admin Panel Girişi: http://localhost:3001/admin/panel

> **Varsayılan Kullanıcı Bilgileri:**
>
> **Admin Paneli Kullanıcısı:**
> - Kullanıcı Adı: `admin`
> - Şifre: `123`
>
> **Personel (Deneme) Kullanıcıları:**
> 1. **Zabıt Katibi**
>    - Sicil No: `229301`
>    - Şifre: `123`
>    - Ad Soyad: Saffet Çelik
> 
> 2. **Mübaşir**
>    - Sicil No: `229302`
>    - Şifre: `123`
>    - Ad Soyad: Zeynep Çelik
> 
> 3. **Yazı İşleri Müdürü**
>    - Sicil No: `229304`
>    - Şifre: `123`
>    - Ad Soyad: Ayşe Demir



### Sistem Hatalarının Loglandığını Test Etme (Admin Paneldeki Sistem Testleri Bölümünden Test Edilebilir)
- Aşağıdaki adresler üzerinden çeşitli hata senaryolarını test edebilirsiniz:
  1. Manuel log oluşturma: `http://localhost:5000/api/TestHata/log-olustur?mesaj=Test%20Mesaj`
  2. Sıfıra bölme hatası: `http://localhost:5000/api/TestHata/bolme-hatasi?sayi=0`
  3. Veritabanı hatası: `http://localhost:5000/api/TestHata/veritabani-hatasi`
  4. Bellek hatası: `http://localhost:5000/api/TestHata/bellek-hatasi`
- Hata loglarını admin panelindeki Log Yönetimi bölümünden görüntüleyebilirsiniz
- Frontend hatalarının yakalanması için Axios hata interceptor'ı eklenmiştir
- Sistem hatalarının tümü otomatik olarak loglanır ve admin panelinde incelenebilir


## Sorun Giderme

### Veritabanı Bağlantı Hatası
- PostgreSQL servisinin çalıştığından emin olun
- appsettings.json dosyasındaki bağlantı bilgilerinin doğru olduğunu kontrol edin
- Güvenlik duvarı ayarlarınızın PostgreSQL portuna (5432) erişime izin verdiğinden emin olun

### Backend Başlatma Sorunları
- .NET SDK'nın doğru sürümünün (8.0+) yüklü olduğunu kontrol edin: `dotnet --version`
- Eksik paketleri yükleyin: `dotnet restore`


### Frontend Başlatma Sorunları
- Node.js sürümünüzün 18+ olduğundan emin olun: `node --version`
- npm paketlerini yeniden yükleyin: `npm ci`

## Proje Yapısı

### Backend (server/TayinAPI)
- **Controllers**: API endpoint'lerini içerir
- **Models**: Veri modellerini içerir
- **DTOs**: Veri transfer nesnelerini içerir
- **Data**: Veritabanı bağlantısı ve DbContext'i içerir
- **Services**: İş mantığı servislerini içerir
- **Migrations**: Veritabanı migration'larını içerir

### Frontend (client)
- **src/components**: React bileşenlerini içerir
- **src/pages**: Uygulama sayfalarını içerir
- **src/services**: API isteklerini yöneten servisleri içerir
- **src/context**: React context'lerini içerir
- **src/utils**: Yardımcı fonksiyonları içerir