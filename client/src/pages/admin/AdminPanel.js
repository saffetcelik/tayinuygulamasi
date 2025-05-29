import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import TayinListesi from './components/TayinListesi';
import LogPanel from './components/LogPanel';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tayinler');
  const [tayinTalepleri, setTayinTalepleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Admin bilgilerini ve yetki kontrolü
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminKullaniciAdi = localStorage.getItem('adminKullaniciAdi');
    
    // Token veya admin bilgisi yoksa login sayfasına yönlendir
    if (!token || !adminKullaniciAdi) {
      navigate('/admin/login');
      return;
    }
    
    setAdminInfo({ kullaniciAdi: adminKullaniciAdi });
  }, [navigate]);
  
  // Tayin taleplerini getir - ayrı bir useEffect içinde
  useEffect(() => {
    if (adminInfo) {
      fetchTayinTalepleri();
    }
  }, [adminInfo]); // Sadece adminInfo değiştiğinde çalışır
  
  // Tayin taleplerini getir
  const fetchTayinTalepleri = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTayinTalepleri();
      setTayinTalepleri(data);
    } catch (error) {
      console.error('Tayin talepleri alınamadı:', error);
      toast.error('Tayin talepleri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // updateTayinDurum fonksiyonunu adminService'den doğru isimle çağırıyoruz
  
  // Tayin durumunu güncelle
  const updateTayinDurumu = async (id, durum, durumAciklamasi) => {
    try {
      await adminService.updateTayinTalebiDurum(id, durum, durumAciklamasi);
      toast.success('Tayin talebi durumu güncellendi.');
      // Listeyi yenile
      fetchTayinTalepleri();
    } catch (error) {
      console.error('Tayin durumu güncellenemedi:', error);
      toast.error('Tayin durumu güncellenirken bir hata oluştu.');
    }
  };
  
  // Çıkış işlemi
  const handleLogout = () => {
    adminService.adminLogout();
    navigate('/admin/login');
    toast.info('Başarıyla çıkış yapıldı.');
  };
  
  if (loading && !tayinTalepleri.length) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Header */}
      <AdminHeader 
        adminInfo={adminInfo} 
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Ana İçerik */}
      <div className="flex flex-1 pt-16">
        {/* Sol Menü */}
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        {/* Sağ İçerik */}
        <main className="flex-1 p-4 md:p-6 bg-gray-100 ml-0 md:ml-64 transition-all duration-300">
          {activeTab === 'tayinler' && (
            <TayinListesi 
              tayinTalepleri={tayinTalepleri} 
              loading={loading} 
              updateTayinDurumu={updateTayinDurumu}
              onRefresh={fetchTayinTalepleri}
            />
          )}
          

          {activeTab === 'istatistikler' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">İstatistikler</h2>
              <p className="text-gray-600 mb-4">
                Bu bölüm yapım aşamasındadır. Yakında burada tayin taleplerine ilişkin istatistikler görüntülenecektir.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Toplam Tayin Talebi</h3>
                  <p className="text-3xl font-bold text-blue-600">{tayinTalepleri.length}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 border border-green-100">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Onaylanan Talepler</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {tayinTalepleri.filter(t => t.durum === 'Onaylandı').length}
                  </p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-6 border border-red-100">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Reddedilen Talepler</h3>
                  <p className="text-3xl font-bold text-red-600">
                    {tayinTalepleri.filter(t => t.durum === 'Reddedildi').length}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'loglar' && (
            <LogPanel />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
