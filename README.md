# Tayin Projesi

Bu proje, ASP.NET Core backend ve React frontend kullanan MVC mimarisine uygun bir web uygulamasıdır.

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
  - Loglanan İşlemler: Kimlik doğrulama, başarılı başarısız login istekleri, tayin talepleri
  - Filtreleme Seçenekleri: Tarih, kullanıcı, işlem türü, başarı durumu
- **Sıkça Sorulan Sorular Yönetimi:** SSS bölümü için soru ekleme, düzenleme, silme

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

### 1. Projeyi Klonlama

```powershell
git clone https://github.com/saffetcelik/tayinuygulamasi.git
cd tayinuygulamasi
```

### 2. PostgreSQL Kurulumu ve Veritabanı Ayarları

1. PostgreSQL'i indirin ve kurun: [PostgreSQL İndirme Sayfası](https://www.postgresql.org/download/)
2. Kurulum sırasında veya sonrasında şu bilgileri not edin:
   - Kullanıcı adı (varsayılan: postgres)
   - Şifre (kurulum sırasında belirlenir)
   - Port (varsayılan: 5432)
3. `server/TayinAPI/appsettings.json` dosyasını açın ve veritabanı bağlantı dizesini güncelleyin:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=TayinDB;Username=postgres;Password=şifreniz"
  }
}
```

### 3. Backend (.NET Core) Kurulumu

```powershell
cd server/TayinAPI
dotnet restore
dotnet tool install --global dotnet-ef  # Entity Framework CLI aracını kur
dotnet ef database update  # Veritabanını oluştur ve migrate et
```

> **Not:** Veritabanı migration işlemi sırasında otomatik olarak varsayılan başlangıç verileri oluşturulur. Bu veriler arasında:
> - Rasgele personel kayıtları (farklı illerde görev yapan)
> - Çeşitli durumlarda (Beklemede, İncelemede, Onaylandı, Reddedildi) tayin talepleri ve tercihleri
> - Personellerin giriş, şifre değiştirme ve tayin taleplerine ait örnek log kayıtları 
> - Kategorilere ayrılmış sıkça sorulan sorular bulunmaktadır. Böylece sistem ilk kurulumda demo kullanım için hazır hale gelir.

### 4. Frontend (React) Kurulumu

```powershell
cd ../../client  # Kök dizinden client klasörüne git
npm install
```

### 5. Otomasyon ile Çalıştırma (Önerilen)

Kök dizinde bulunan PowerShell scriptini kullanarak hem backend hem de frontend tek bir komutla başlatılabilir:

```powershell
cd ../  # Kök dizine dön
./start.ps1
```

Bu script şunları yapacaktır:
- Backend API'yi http://localhost:5000 adresinde başlatır
- Frontend'i http://localhost:3001 adresinde başlatır
- Tarayıcınızı otomatik olarak frontend adresine yönlendirir
- Her iki uygulamanın loglarını konsolda gösterir

### 6. Manuel Çalıştırma

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
- OpenSSL sorunları için start.ps1 scriptini kullanın (otomatik olarak NODE_OPTIONS ayarlanır)

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
