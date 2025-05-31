import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import TayinListesi from './components/TayinListesi';
import LogPanel from './components/LogPanel';
import PersonelListesi from './components/PersonelListesi';
import SSSYonetimi from './components/SSSYonetimi';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tayinler');
  const [tayinTalepleri, setTayinTalepleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [istatistikler, setIstatistikler] = useState({
    toplamKullanici: 0,
    toplamTayinTalebi: 0,
    kullaniciArtisYuzdesi: 0,
    tayinArtisYuzdesi: 0
  });
  
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
  
  // Tayin taleplerini ve personel listesini getir - ayrı bir useEffect içinde
  useEffect(() => {
    if (adminInfo) {
      fetchTayinTalepleri();
      fetchPersoneller();
      
      // Her 2 dakikada bir otomatik yenileme yapalım
      const interval = setInterval(() => {
        fetchTayinTalepleri(false); // sessiz yenileme
        fetchPersoneller(false); // sessiz yenileme
      }, 120000); // 2 dakika
      
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [adminInfo]); // Sadece adminInfo değiştiğinde çalışır
  
  // Tayin taleplerini getir
  const fetchTayinTalepleri = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await adminService.getTayinTalepleri();
      setTayinTalepleri(data);
      if (showLoading) toast.success('Tayin talepleri güncellendi.');
    } catch (error) {
      console.error('Tayin talepleri alınamadı:', error);
      toast.error('Tayin talepleri yüklenirken bir hata oluştu.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  // Personel listesini getir
  const [personeller, setPersoneller] = useState([]);
  
  // Personelleri getir
  const fetchPersoneller = async (showLoading = false) => {
    try {
      const data = await adminService.getPersoneller();
      setPersoneller(data);
      
      // İstatistikleri güncelle
      setIstatistikler(prev => ({
        ...prev,
        toplamKullanici: data.length,
        kullaniciArtisYuzdesi: 4 // Sabit bırakılabilir ya da hesaplanabilir
      }));
    } catch (error) {
      console.error('Personeller alınamadı:', error);
    }
  };
  
  // İstatistikleri güncelle - tayinTalepleri değiştiğinde çağrılır
  useEffect(() => {
    if (tayinTalepleri.length > 0) {
      setIstatistikler(prev => ({
        ...prev,
        toplamTayinTalebi: tayinTalepleri.length,
        tayinArtisYuzdesi: 3 // Sabit bırakılabilir ya da hesaplanabilir
      }));
    }
  }, [tayinTalepleri]);
  
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent mb-2"></div>
          <p className="text-lg font-medium text-gray-700 mt-4">Yükleniyor...</p>
          <p className="text-sm text-gray-500 mt-2">Tayin talepleri getiriliyor, lütfen bekleyiniz.</p>
        </div>
      </div>
    );
  }

  // Özet istatistikleri hesaplayalım
  const bekleyenTalepler = tayinTalepleri.filter(t => t.durum === 'Beklemede').length;
  const onaylananTalepler = tayinTalepleri.filter(t => t.durum === 'Onaylandı').length;
  const reddedilenTalepler = tayinTalepleri.filter(t => t.durum === 'Reddedildi').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Sol Menü */} 
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        istatistikler={istatistikler}
        onLogout={handleLogout}
      />
      
      {/* Admin Header */}
      <AdminHeader 
        adminInfo={adminInfo} 
        onLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* Ana İçerik */}
      <div className="flex flex-1 relative">
        {/* Sağ İçerik */}
        <main className="flex-1 p-4 md:p-6 ml-0 md:ml-64 mt-16 transition-all duration-300 bg-slate-50 min-h-screen">
          {/* Sayfanın başlık bölümü */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {activeTab === 'tayinler' && 'Tayin Talepleri'}
              {activeTab === 'personeller' && 'Personel Yönetimi'}
              {activeTab === 'istatistikler' && 'İstatistikler'}
              {activeTab === 'logs' && 'Sistem Kayıtları'}
              {activeTab === 'sss' && 'Sık Sorulan Sorular Yönetimi'}
            </h1>
            <p className="text-gray-600 mt-1">
              {activeTab === 'tayinler' && 'Tüm tayin taleplerini görüntüleyebilir ve yönetebilirsiniz.'}
              {activeTab === 'personeller' && 'Sistemdeki personelleri görüntüleyebilir ve yönetebilirsiniz.'}
              {activeTab === 'istatistikler' && 'Tayin taleplerine ilişkin istatistikleri inceleyebilirsiniz.'}
              {activeTab === 'logs' && 'Sistem üzerinde gerçekleştirilen işlemlerin kayıtlarını görüntüleyebilirsiniz.'}
              {activeTab === 'sss' && 'Sık sorulan soruları ekleyebilir, düzenleyebilir ve silebilirsiniz.'}
            </p>
          </div>
          
          {/* Özet bilgi kartları - Sadece tayin talepleri menüsünde gösterelim */}
          {activeTab === 'tayinler' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow flex items-center p-1">
                <div className="flex-shrink-0 bg-indigo-50 p-4 flex items-center justify-center rounded-lg mr-4">
                  <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="py-4 pr-4">
                  <div className="text-sm font-medium text-gray-500">Toplam Talepler</div>
                  <div className="text-2xl font-bold text-gray-800">{tayinTalepleri.length}</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow flex items-center p-1">
                <div className="flex-shrink-0 bg-yellow-50 p-4 flex items-center justify-center rounded-lg mr-4">
                  <svg className="w-8 h-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="py-4 pr-4">
                  <div className="text-sm font-medium text-gray-500">Bekleyen Talepler</div>
                  <div className="text-2xl font-bold text-gray-800">{bekleyenTalepler}</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow flex items-center p-1">
                <div className="flex-shrink-0 bg-green-50 p-4 flex items-center justify-center rounded-lg mr-4">
                  <svg className="w-8 h-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="py-4 pr-4">
                  <div className="text-sm font-medium text-gray-500">Onaylanan Talepler</div>
                  <div className="text-2xl font-bold text-gray-800">{onaylananTalepler}</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow flex items-center p-1">
                <div className="flex-shrink-0 bg-red-50 p-4 flex items-center justify-center rounded-lg mr-4">
                  <svg className="w-8 h-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="py-4 pr-4">
                  <div className="text-sm font-medium text-gray-500">Reddedilen Talepler</div>
                  <div className="text-2xl font-bold text-gray-800">{reddedilenTalepler}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* İçerik Alanları */}
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            {activeTab === 'tayinler' && (
              <TayinListesi 
                tayinTalepleri={tayinTalepleri} 
                loading={loading} 
                updateTayinDurumu={updateTayinDurumu}
                onRefresh={fetchTayinTalepleri}
              />
            )}
            
            {activeTab === 'personeller' && (
              <PersonelListesi />
            )}

            {activeTab === 'istatistikler' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Detaylı İstatistikler</h2>
                <p className="text-gray-600 mb-6">
                  Bu bölümde tayin taleplerine ilişkin detaylı istatistikleri görüntüleyebilirsiniz. Aşağıdaki grafikler, taleplerin durumlarına ve kategorilerine göre dağılımını göstermektedir.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-indigo-800">Toplam Tayin Talebi</h3>
                      <span className="bg-indigo-100 text-indigo-700 text-sm font-medium py-1 px-2.5 rounded-md">{tayinTalepleri.length}</span>
                    </div>
                    <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="mt-3 text-sm text-indigo-700">
                      Tüm zamanlar
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-green-800">Onaylanan Talepler</h3>
                      <span className="bg-green-100 text-green-700 text-sm font-medium py-1 px-2.5 rounded-md">{onaylananTalepler}</span>
                    </div>
                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${tayinTalepleri.length ? (onaylananTalepler / tayinTalepleri.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className="mt-3 text-sm text-green-700">
                      {tayinTalepleri.length ? Math.round((onaylananTalepler / tayinTalepleri.length) * 100) : 0}% oran
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-red-800">Reddedilen Talepler</h3>
                      <span className="bg-red-100 text-red-700 text-sm font-medium py-1 px-2.5 rounded-md">{reddedilenTalepler}</span>
                    </div>
                    <div className="h-2 bg-red-100 rounded-full overflow-hidden">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${tayinTalepleri.length ? (reddedilenTalepler / tayinTalepleri.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className="mt-3 text-sm text-red-700">
                      {tayinTalepleri.length ? Math.round((reddedilenTalepler / tayinTalepleri.length) * 100) : 0}% oran
                    </div>
                  </div>
                </div>
                

              </div>
            )}
            
            {activeTab === 'logs' && (
              <LogPanel />
            )}
            
            {activeTab === 'sss' && (
              <SSSYonetimi />
            )}
          </div>
          
          {/* Alt bilgi - Footer */}
          <div className="mt-8 pb-6 pt-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 rounded-b-lg shadow-inner">
            <div className="flex flex-col md:flex-row justify-between items-center px-6">
              <div className="flex items-center mb-3 md:mb-0">
                <div className="bg-indigo-800 text-white p-2 rounded-lg shadow-md mr-3">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">T.C. Adalet Bakanlığı</p>
                  <p className="text-xs text-gray-500">Tayin ve Personel Yönetim Sistemi</p>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-xs text-gray-500">© {new Date().getFullYear()} Tüm Hakları Saklıdır</p>
                <p className="text-xs text-gray-400 mt-1">Sürüm 1.0</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
