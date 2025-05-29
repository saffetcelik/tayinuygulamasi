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
      if (response.data.token) {
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminToken', response.data.token);
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
  
  // Sistem loglarını getir
  getSistemLoglari: async (filtreParams) => {
    try {
      const response = await api.get('/Log/sistem', { params: filtreParams });
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Sistem logları alınamadı:', error);
      throw error;
    }
  },
  
  // Kullanıcı işlem kayıtlarını getir
  getKullaniciIslemKayitlari: async (filtreParams) => {
    try {
      const response = await api.get('/Log/kullanici-islemleri', { params: filtreParams });
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Kullanıcı işlem kayıtları alınamadı:', error);
      throw error;
    }
  },
  
  // Tayin işlem kayıtlarını getir
  getTayinIslemKayitlari: async (filtreParams) => {
    try {
      const response = await api.get('/Log/tayin-islemleri', { params: filtreParams });
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Tayin işlem kayıtları alınamadı:', error);
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
};

export { authService, personelService, tayinService, sssService, adminService };
