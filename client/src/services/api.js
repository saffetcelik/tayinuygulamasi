import axios from 'axios';

// API temel URL'si
const API_URL = 'http://localhost:5000/api';

// API istekleri için axios instance oluşturma
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Her istek öncesi token ekleme
api.interceptors.request.use(
  (config) => {
    // API yoluna göre token seçimi yap
    const isAdminRequest = config.url && (
      config.url.startsWith('/Admin') ||
      config.url.startsWith('/Log')
    );

    // Admin isteği için admin token'ını kullan
    if (isAdminRequest) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers['Authorization'] = `Bearer ${adminToken}`;
      }
    }
    // Normal kullanıcı isteği için normal token'ı kullan
    else {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hata yakalama interceptor'u
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Hata bilgilerini topla
    const errorData = {
      islemTuru: "Frontend Sistem Hatası",
      detayBilgi: `API isteği başarısız: ${error?.config?.url || 'Bilinmeyen URL'}`,
      kullaniciSicilNo: localStorage.getItem('userSicil') || 'Bilinmeyen Kullanıcı',
      kullaniciAdi: null,
      basariliMi: "Hayır",
      hataBilgisi: JSON.stringify({
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        method: error?.config?.method,
        url: error?.config?.url,
        data: error?.config?.data,
        time: new Date().toISOString()
      })
    };

    // Sunucu hatası olduğunda loglama yap (5xx hatalar)
    if (error?.response?.status >= 500) {
      try {
        // Log API'sine direkt axios ile istek yapalım (api instance değil - sonsuz döngüye girmemek için)
        await axios.post(`${API_URL}/Log`, errorData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}`
          }
        });
        console.log('Sistem hatası loglandı:', errorData.detayBilgi);
      } catch (logError) {
        // Log kaydedilemezse local storage'a kaydet
        console.error('Hata loglanırken ikincil hata oluştu:', logError);
        const clientErrorLogs = JSON.parse(localStorage.getItem('clientErrorLogs') || '[]');
        clientErrorLogs.push({
          ...errorData,
          timestamp: new Date().toISOString(),
          logError: logError?.message
        });
        localStorage.setItem('clientErrorLogs', JSON.stringify(clientErrorLogs.slice(-20))); // Son 20 hatayı sakla
      }
    }

    return Promise.reject(error);
  }
);

// Kimlik doğrulama servisleri
const authService = {
  // Giriş işlemi
  login: async (sicilNo, sifre, beniHatirla = false) => {
    try {
      // Backend bağlantı hatası kontrolü
      const response = await api.post('/Auth/login', { sicilNo, sifre, beniHatirla });
      if (response.data.token) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userSicil', sicilNo);
        
        // Beni hatırla seçeneği işaretlendiyse sicil numarasını ayrıca sakla
        // aksi takdirde temizle
        if (beniHatirla) {
          localStorage.setItem('lastLoginSicilNo', sicilNo);
          console.log('Beni hatırla etkinleştirildi ve sicil no kaydedildi:', sicilNo);
        } else {
          localStorage.removeItem('lastLoginSicilNo');
          console.log('Beni hatırla devre dışı, sicil no hafızadan silindi');
        }
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Çıkış işlemi
  logout: () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('userSicil');
  },
  
  // Şifre değiştirme işlemi
  changePassword: async (mevcutSifre, yeniSifre) => {
    try {
      const sicilNo = localStorage.getItem('userSicil') || '';
      const response = await api.post('/auth/change-password', {
        sicilNo,
        mevcutSifre,
        yeniSifre
      });
      return response.data;
    } catch (error) {
      console.error('Şifre değiştirme sırasında hata:', error);
      throw error;
    }
  },
};

// Personel servisleri
const personelService = {
  // Personel bilgilerini getir
  getPersonelBilgisi: async () => {
    try {
      const sicilNo = localStorage.getItem('userSicil') || '';
      
      // Sicil numarasını hem header hem de query string olarak gönder
      const config = {
        headers: {
          'X-Sicil-No': sicilNo
        },
        params: {
          sicilNo: sicilNo
        }
      };
      
      const response = await api.get('/personel/bilgi', config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Tayin talebi servisleri
const tayinService = {
  // Tayin talebi oluştur
  createTayinTalebi: async (talepData) => {
    try {
      const sicilNo = localStorage.getItem('userSicil') || '';
      
      // Sicil numarasını hem header hem de query string olarak gönder
      const config = {
        headers: {
          'X-Sicil-No': sicilNo
        },
        params: {
          sicilNo: sicilNo
        }
      };
      
      console.log('Tayin talebi gönderiliyor:', talepData, 'Sicil No:', sicilNo);
      const response = await api.post('/tayin/talepler', talepData, config);
      return response.data;
    } catch (error) {
      console.error('Tayin talebi oluşturulurken hata:', error);
      throw error;
    }
  },
  
  // Tayin taleplerini listele
  getTayinTalepleri: async () => {
    try {
      const sicilNo = localStorage.getItem('userSicil') || '';
      
      // Sicil numarasını query parametresi olarak gönder
      const response = await api.get('/tayin/talepler', {
        params: { sicilNo }
      });
      
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Tayin talepleri alınamadı:', error);
      throw error;
    }
  },
  
  // Adliyeleri listele
  getAdliyeler: async () => {
    try {
      const response = await api.get('/tayin/adliyeler');
      console.log('API yanıtı:', response.data);
      // API yanıtı farklı formatlarda olabilir, kontrol edelim
      let data = response.data;
      
      // $values içinde bir dizi varsa onu al
      if (data && data.$values && Array.isArray(data.$values)) {
        return data.$values;
      }
      
      // value içinde bir dizi varsa onu al
      if (data && data.value && Array.isArray(data.value)) {
        return data.value;
      }
      
      // Doğrudan dizi ise onu kullan
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn('Adliyeler uygun formatta gelmedi:', data);
      return [];
    } catch (error) {
      console.error('Adliyeler alınamadı:', error);
      throw error;
    }
  },
  
  // Tayin talebini iptal et
  cancelTayinTalebi: async (talepId) => {
    try {
      const sicilNo = localStorage.getItem('userSicil') || '';
      
      // Sicil numarasını query parametresi olarak gönder
      const response = await api.delete(`/tayin/talepler/${talepId}`, {
        params: { sicilNo }
      });
      
      return response.data;
    } catch (error) {
      console.error('Tayin talebi iptal edilirken hata:', error);
      throw error;
    }
  },
};

// Sık Sorulan Sorular (SSS) servisleri
const sssService = {
  // Tüm SSS'leri getir
  getSikcaSorulanSorular: async () => {
    try {
      const response = await api.get('/SSS');
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('SSS alınamadı:', error);
      throw error;
    }
  },

  // Kategori bazlı SSS'leri getir
  getSikcaSorulanSorularByKategori: async (kategori) => {
    try {
      const response = await api.get(`/SSS/kategori/${kategori}`);
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Kategori bazlı SSS alınamadı:', error);
      throw error;
    }
  },

  // SSS arama
  searchSikcaSorulanSorular: async (aramaMetni) => {
    try {
      if (!aramaMetni || aramaMetni.trim() === '') {
        return await sssService.getSikcaSorulanSorular();
      }
      const response = await api.get(`/SSS/arama/${encodeURIComponent(aramaMetni)}`);
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('SSS arama sonuçları alınamadı:', error);
      throw error;
    }
  },
};

// Admin servisleri
const adminService = {
  // Admin girişi
  adminLogin: async (kullaniciAdi, sifre) => {
    try {
      const response = await api.post('/Admin/login', { KullaniciAdi: kullaniciAdi, Sifre: sifre });

      if (response.data.Token || response.data.token) {
        const token = response.data.Token || response.data.token;
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminKullaniciAdi', kullaniciAdi);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Admin çıkışı
  adminLogout: () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminKullaniciAdi');
  },
  
  // Personel listesini getir
  getPersoneller: async () => {
    try {
      const response = await api.get('/Admin/personeller');
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Personel listesi alınamadı:', error);
      throw error;
    }
  },
  
  // İstatistikleri getir (Admin için)
  getIstatistikler: async () => {
    try {
      const response = await api.get('/Admin/istatistikler');
      const data = response.data;
      return data || {
        toplamKullanici: 0,
        toplamTayinTalebi: 0,
        kullaniciArtisYuzdesi: 0,
        tayinArtisYuzdesi: 0
      };
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
      // Hata durumunda varsayılan boş istatistik dön
      return {
        toplamKullanici: 0,
        toplamTayinTalebi: 0,
        kullaniciArtisYuzdesi: 0,
        tayinArtisYuzdesi: 0
      };
    }
  },
  
  // Tayin taleplerini getir (Admin için)
  getTayinTalepleri: async () => {
    try {
      // Admin isteği olduğu için farklı bir endpoint kullan
      const response = await api.get('/Admin/tayin-talepleri');
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Tayin talepleri alınamadı:', error);
      throw error;
    }
  },
  
  // Tayin talebi detayını getir
  getTayinTalebiDetay: async (talepId) => {
    try {
      const response = await api.get(`/Admin/tayin-talebi/${talepId}`);
      return response.data;
    } catch (error) {
      console.error('Tayin talebi detayı alınamadı:', error);
      throw error;
    }
  },
  
  // Tayin talebinin durumunu güncelle
  updateTayinTalebiDurum: async (talepId, yeniDurum, aciklama = '') => {
    try {
      const response = await api.put(`/Admin/tayin-talebi/${talepId}/durum`, {
        Durum: yeniDurum,
        DurumAciklamasi: aciklama
      });
      return response.data;
    } catch (error) {
      console.error('Tayin talebi durumu güncellenirken hata:', error);
      throw error;
    }
  },
  
  // Logları getir
  getLoglar: async (queryParams) => {
    try {
      const response = await api.get('/Log', { params: queryParams });
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Loglar alınamadı:', error);
      throw error;
    }
  },
  
  // Log detayını getir
  getLogDetay: async (logId) => {
    try {
      const response = await api.get(`/Log/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Log detayı alınamadı:', error);
      throw error;
    }
  },
  
  // Log özeti getir
  getLogOzeti: async () => {
    try {
      const response = await api.get('/Log/ozet');
      return response.data;
    } catch (error) {
      console.error('Log özeti alınamadı:', error);
      throw error;
    }
  },

  // Tüm logları temizle
  temizleLoglar: async () => {
    try {
      const response = await api.delete('/Log/temizle');
      return response.data;
    } catch (error) {
      console.error('Loglar temizlenirken hata:', error);
      throw error;
    }
  },
  
  // Personel detaylarını getir
  getPersonelById: async (id) => {
    try {
      const response = await api.get(`/Admin/personel/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Personel #${id} detayları alınamadı:`, error);
      throw error;
    }
  },
  
  // Personel bilgilerini güncelle
  updatePersonel: async (id, personelData) => {
    try {
      const response = await api.put(`/Admin/personel/${id}`, personelData);
      return response.data;
    } catch (error) {
      console.error(`Personel #${id} güncellenirken hata:`, error);
      throw error;
    }
  },
  
  // Personel sil
  deletePersonel: async (id) => {
    try {
      const response = await api.delete(`/Admin/personel/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Personel #${id} silinirken hata:`, error);
      throw error;
    }
  },
  
  // Sık Sorulan Sorular yönetimi
  
  // Tüm sık sorulan soruları getir (aktif/pasif hepsi) - Admin için
  getAllSSS: async () => {
    try {
      const response = await api.get('/Admin/sss');
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Sık sorulan sorular alınamadı:', error);
      throw error;
    }
  },
  
  // SSS kategorilerini getir
  getSSSKategorileri: async () => {
    try {
      const response = await api.get('/Admin/sss/kategoriler');
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('SSS kategorileri alınamadı:', error);
      throw error;
    }
  },
  
  // SSS detayını getir
  getSSSById: async (id) => {
    try {
      const response = await api.get(`/Admin/sss/${id}`);
      return response.data;
    } catch (error) {
      console.error(`SSS #${id} detayları alınamadı:`, error);
      throw error;
    }
  },
  
  // Yeni SSS ekle
  createSSS: async (sssData) => {
    try {
      const response = await api.post('/Admin/sss', sssData);
      return response.data;
    } catch (error) {
      console.error('SSS eklenirken hata:', error);
      throw error;
    }
  },
  
  // SSS güncelle
  updateSSS: async (id, sssData) => {
    try {
      const response = await api.put(`/Admin/sss/${id}`, sssData);
      return response.data;
    } catch (error) {
      console.error(`SSS #${id} güncellenirken hata:`, error);
      throw error;
    }
  },
  
  // SSS durumunu değiştir (aktif/pasif)
  toggleSSSStatus: async (id) => {
    try {
      const response = await api.put(`/Admin/sss/${id}/durum`);
      return response.data;
    } catch (error) {
      console.error(`SSS #${id} durumu değiştirilirken hata:`, error);
      throw error;
    }
  },
  
  // SSS sil
  deleteSSS: async (id) => {
    try {
      const response = await api.delete(`/Admin/sss/${id}`);
      return response.data;
    } catch (error) {
      console.error(`SSS #${id} silinirken hata:`, error);
      throw error;
    }
  },

  // Sistem sağlığı endpoint'leri
  getSystemHealth: async () => {
    try {
      console.log('API çağrısı yapılıyor: /SystemHealth');
      const response = await api.get('/SystemHealth');
      console.log('API yanıtı alındı:', response);
      return response.data;
    } catch (error) {
      console.error('Sistem sağlığı API hatası:', error);
      console.error('Hata response:', error.response);
      console.error('Hata status:', error.response?.status);
      console.error('Hata data:', error.response?.data);
      throw error.response ? error.response.data : error;
    }
  },

  getSystemInfo: async () => {
    try {
      const response = await api.get('/SystemHealth/system-info');
      return response.data;
    } catch (error) {
      console.error('Sistem bilgileri alınamadı:', error);
      throw error.response ? error.response.data : 'Sistem bilgileri alınamadı';
    }
  },

  getDatabaseHealth: async () => {
    try {
      const response = await api.get('/SystemHealth/database-health');
      return response.data;
    } catch (error) {
      console.error('Veritabanı sağlığı kontrol edilemedi:', error);
      throw error.response ? error.response.data : 'Veritabanı sağlığı kontrol edilemedi';
    }
  },

  getApiHealth: async () => {
    try {
      const response = await api.get('/SystemHealth/api-health');
      return response.data;
    } catch (error) {
      console.error('API sağlığı kontrol edilemedi:', error);
      throw error.response ? error.response.data : 'API sağlığı kontrol edilemedi';
    }
  },

  getPerformanceMetrics: async () => {
    try {
      const response = await api.get('/SystemHealth/performance-metrics');
      return response.data;
    } catch (error) {
      console.error('Performans metrikleri alınamadı:', error);
      throw error.response ? error.response.data : 'Performans metrikleri alınamadı';
    }
  },

  getRecentErrors: async () => {
    try {
      const response = await api.get('/SystemHealth/recent-errors');
      return response.data;
    } catch (error) {
      console.error('Son hatalar alınamadı:', error);
      throw error.response ? error.response.data : 'Son hatalar alınamadı';
    }
  },

  // Test hata endpoint'leri
  testHata: async (endpoint) => {
    try {
      const response = await api.get(`/TestHata/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Test hatası gerçekleştirilemedi:', error);
      throw error.response ? error.response.data : 'Test hatası gerçekleştirilemedi';
    }
  }
};

export { authService, personelService, tayinService, sssService, adminService };
