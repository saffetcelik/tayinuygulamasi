import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';
import { useDarkMode } from '../../context/DarkModeContext';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import TayinListesi from './components/TayinListesi';
import LogPanel from './components/LogPanel';
import PersonelListesi from './components/PersonelListesi';
import SSSYonetimi from './components/SSSYonetimi';
import SistemTestleri from './components/SistemTestleri';
import APIDokumantasyon from './components/APIDokumantasyon';
import SistemSagligi from './components/SistemSagligi';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
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
        fetchTayinTalepleri(false, false); // sessiz yenileme, bildirim yok
        fetchPersoneller(false); // sessiz yenileme
      }, 120000); // 2 dakika
      
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [adminInfo]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Tayin taleplerini getir
  const fetchTayinTalepleri = async (showLoading = true, showNotification = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await adminService.getTayinTalepleri();
      setTayinTalepleri(data);
      // Sadece bildirim gösterilmesi istendiğinde toast göster
      if (showNotification) toast.success('Tayin talepleri güncellendi.');
    } catch (error) {
      console.error('Tayin talepleri alınamadı:', error);
      // Hata durumunda her zaman bildirim göster
      toast.error('Tayin talepleri yüklenirken bir hata oluştu.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  // Personelleri getir
  const fetchPersoneller = async (showLoading = false) => {
    try {
      const data = await adminService.getPersoneller();

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
      toast.success(`${durum} olarak güncellendi.`);
      // Listeyi sessizce yenile (bildirim göstermeden)
      fetchTayinTalepleri(true, false);
    } catch (error) {
      console.error('Tayin durumu güncellenemedi:', error);
      toast.error('Güncelleme hatası.');
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
  const bekleyenTalepler = tayinTalepleri.filter(t => t.durum === 'Beklemede' || t.durum === 'İncelemede').length;
  const onaylananTalepler = tayinTalepleri.filter(t => t.durum === 'Onaylandı').length;
  const reddedilenTalepler = tayinTalepleri.filter(t => t.durum === 'Reddedildi').length;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col ${isDarkMode ? 'dark' : ''}`}>
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
        <main className="flex-1 p-4 md:p-6 ml-0 md:ml-72 mt-16 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
          {/* Modern Başlık Bölümü */}
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
              <div className="flex items-center">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-2xl mr-6">
                  {activeTab === 'tayinler' && (
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  )}
                  {activeTab === 'personeller' && (
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  )}
                  {activeTab === 'istatistikler' && (
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  )}
                  {activeTab === 'logs' && (
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  )}
                  {activeTab === 'sss' && (
                    <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    {activeTab === 'tayinler' && 'Tayin Talepleri'}
                    {activeTab === 'personeller' && 'Personel Yönetimi'}
                    {activeTab === 'istatistikler' && 'İstatistikler'}
                    {activeTab === 'logs' && 'Sistem Kayıtları'}
                    {activeTab === 'sss' && 'Sık Sorulan Sorular Yönetimi'}
                    {activeTab === 'sistem-testleri' && 'Sistem Testleri'}
                    {activeTab === 'sistem-sagligi' && 'Sistem Sağlığı Monitörü'}
                    {activeTab === 'api-dokumantasyon' && 'API Dokümantasyonu'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {activeTab === 'tayinler' && 'Tüm tayin taleplerini görüntüleyebilir ve yönetebilirsiniz'}
                    {activeTab === 'personeller' && 'Sistemdeki personelleri görüntüleyebilir ve yönetebilirsiniz'}
                    {activeTab === 'istatistikler' && 'Tayin taleplerine ilişkin istatistikleri inceleyebilirsiniz'}
                    {activeTab === 'logs' && 'Sistem üzerinde gerçekleştirilen işlemlerin kayıtlarını görüntüleyebilirsiniz'}
                    {activeTab === 'sistem-testleri' && 'Sistem hatalarını test edebilir ve log kayıtlarını kontrol edebilirsiniz'}
                    {activeTab === 'sistem-sagligi' && 'Sistem performansını ve sağlığını gerçek zamanlı olarak izleyebilirsiniz'}
                    {activeTab === 'api-dokumantasyon' && 'API endpoint\'lerini ve kullanım örneklerini görüntüleyebilirsiniz'}
                    {activeTab === 'sss' && 'Sık sorulan soruları ekleyebilir, düzenleyebilir ve silebilirsiniz'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern İstatistik Kartları - Sadece tayin talepleri menüsünde gösterelim */}
          {activeTab === 'tayinler' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Toplam Talep</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{tayinTalepleri.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                      <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Tüm Talepler</div>
                  </div>
                </div>
              </div>

              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bekleyen</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{bekleyenTalepler}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl shadow-lg">
                      <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">İnceleme Bekliyor</div>
                  </div>
                </div>
              </div>

              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Onaylanan</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{onaylananTalepler}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                      <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Başarılı Talepler</div>
                  </div>
                </div>
              </div>

              <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Reddedilen</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{reddedilenTalepler}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                      <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">Kabul Edilmeyen</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Modern İçerik Alanları */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
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
              <div className="space-y-8">
                {/* Modern İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-blue-500 dark:bg-blue-600 p-3 rounded-xl shadow-lg">
                        <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="bg-blue-500 dark:bg-blue-600 text-white text-lg font-bold py-2 px-4 rounded-xl shadow-md">{tayinTalepleri.length}</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">Toplam Tayin Talebi</h3>
                    <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden mb-3">
                      <div className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all duration-500" style={{ width: '100%' }}></div>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Tüm zamanlar</div>
                  </div>

                  <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-emerald-500 dark:bg-emerald-600 p-3 rounded-xl shadow-lg">
                        <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="bg-emerald-500 dark:bg-emerald-600 text-white text-lg font-bold py-2 px-4 rounded-xl shadow-md">{onaylananTalepler}</span>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Onaylanan Talepler</h3>
                    <div className="h-3 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden mb-3">
                      <div className="bg-emerald-600 dark:bg-emerald-400 h-3 rounded-full transition-all duration-500" style={{ width: `${tayinTalepleri.length ? (onaylananTalepler / tayinTalepleri.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      {tayinTalepleri.length ? Math.round((onaylananTalepler / tayinTalepleri.length) * 100) : 0}% başarı oranı
                    </div>
                  </div>

                  <div className="group bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6 border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-red-500 dark:bg-red-600 p-3 rounded-xl shadow-lg">
                        <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="bg-red-500 dark:bg-red-600 text-white text-lg font-bold py-2 px-4 rounded-xl shadow-md">{reddedilenTalepler}</span>
                    </div>
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Reddedilen Talepler</h3>
                    <div className="h-3 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden mb-3">
                      <div className="bg-red-600 dark:bg-red-400 h-3 rounded-full transition-all duration-500" style={{ width: `${tayinTalepleri.length ? (reddedilenTalepler / tayinTalepleri.length) * 100 : 0}%` }}></div>
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                      {tayinTalepleri.length ? Math.round((reddedilenTalepler / tayinTalepleri.length) * 100) : 0}% red oranı
                    </div>
                  </div>
                </div>

                {/* Ek İstatistik Bilgileri */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Özet Bilgiler
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bekleyen Talepler</div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{bekleyenTalepler}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Beklemede + İncelemede</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">İşlem Oranı</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {tayinTalepleri.length ? Math.round(((onaylananTalepler + reddedilenTalepler) / tayinTalepleri.length) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Tamamlanan işlemler</div>
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

            {activeTab === 'sistem-testleri' && (
              <SistemTestleri />
            )}

            {activeTab === 'sistem-sagligi' && (
              <SistemSagligi />
            )}

            {activeTab === 'api-dokumantasyon' && (
              <APIDokumantasyon />
            )}
          </div>
          
          {/* Alt bilgi - Footer */}
          <div className="mt-8 pb-6 pt-6 border-t border-gray-200 dark:border-gray-600 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-b-lg shadow-inner">
            <div className="flex flex-col md:flex-row justify-between items-center px-6">
              <div className="flex items-center mb-3 md:mb-0">
                <div className="bg-indigo-800 dark:bg-indigo-700 text-white p-2 rounded-lg shadow-md mr-3">
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">T.C. Adalet Bakanlığı</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tayin ve Personel Yönetim Sistemi</p>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Tüm Hakları Saklıdır</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sürüm 1.0</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
