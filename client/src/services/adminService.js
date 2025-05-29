import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Admin API servislerini oluşturuyoruz
const adminService = {
  // Admin girişi
  login: async (kullaniciAdi, sifre) => {
    try {
      const response = await axios.post(`${API_URL}/Admin/login`, {
        kullaniciAdi,
        sifre
      });
      
      // JWT tokenı ve admin bilgilerini localStorage'da saklama
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },

  // Admin çıkışı
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
  },
  
  // Admin tokenı alın
  getToken: () => {
    return localStorage.getItem('adminToken');
  },
  
  // Admin bilgilerini alın
  getAdminInfo: () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo) : null;
  },
  
  // Tayin taleplerini getir
  getTayinTalepleri: async () => {
    try {
      const token = adminService.getToken();
      
      const response = await axios.get(`${API_URL}/Admin/tayin-talepleri`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // ReferenceHandler.Preserve kullanıldığında value özelliğinde gelen veriyi kontrol et
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Tayin talepleri alınamadı:', error);
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },
  
  // Tayin talebi durumunu güncelle
  updateTayinDurum: async (id, durum, durumAciklamasi) => {
    try {
      const token = adminService.getToken();
      
      const response = await axios.put(`${API_URL}/Admin/tayin-talebi/${id}/durum`, {
        durum,
        durumAciklamasi
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },
  

};

export default adminService;
