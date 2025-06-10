import axios from 'axios';

const API_URL = 'http://localhost:5000/api';


const adminService = {
  
  login: async (kullaniciAdi, sifre) => {
    try {
      const response = await axios.post(`${API_URL}/Admin/login`, {
        kullaniciAdi,
        sifre
      });
      
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminInfo', JSON.stringify(response.data.admin));
      }
      
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },

  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
  },
  
  
  getToken: () => {
    return localStorage.getItem('adminToken');
  },
  
  
  getAdminInfo: () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo) : null;
  },
  
  
  getTayinTalepleri: async () => {
    try {
      const token = adminService.getToken();
      
      const response = await axios.get(`${API_URL}/Admin/tayin-talepleri`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Tayin talepleri alınamadı:', error);
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },
  
  
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
  
  
  getPersoneller: async () => {
    try {
      const token = adminService.getToken();
      
      const response = await axios.get(`${API_URL}/Admin/personeller`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      const data = response.data;
      return Array.isArray(data) ? data : 
             (data && data.value && Array.isArray(data.value)) ? data.value : [];
    } catch (error) {
      console.error('Personeller alınamadı:', error);
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },
  
  
  getPersonelById: async (id) => {
    try {
      const token = adminService.getToken();
      
      const response = await axios.get(`${API_URL}/Admin/personel/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Personel #${id} detayları alınamadı:`, error);
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },
  
  
  updatePersonel: async (id, personelData) => {
    try {
      const token = adminService.getToken();
      
      const response = await axios.put(`${API_URL}/Admin/personel/${id}`, personelData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Personel #${id} güncellenirken hata:`, error);
      throw error.response ? error.response.data : 'Bağlantı hatası';
    }
  },
  

};

export default adminService;
