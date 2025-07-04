import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TayinTalebiForm from '../components/TayinTalebiForm';
import TayinTalepleriList from '../components/TayinTalepleriList';
import SSSPage from './SSSPage';
import Ayarlar from './Ayarlar';
import { personelService } from '../services/api';
import '../components/TayinTalebiForm.css'; // Modern gradient title için
import DarkModeToggle from '../components/DarkModeToggle';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [personelBilgisi, setPersonelBilgisi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilMenuOpen, setProfilMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const profilMenuRef = React.useRef(null);
  const mobileMenuRef = React.useRef(null);

  // Personel bilgisini yükle
  useEffect(() => {
    // Veritabanından gerçek personel bilgilerini almak için API isteği yapılıyor
    const fetchPersonelBilgisi = async () => {
      try {
        const data = await personelService.getPersonelBilgisi();
        setPersonelBilgisi(data);
      } catch (error) {
        console.error('Personel bilgisi alınamadı:', error);
        // Hata durumunda varsayılan değerleri göster
        const userSicil = localStorage.getItem('userSicil') || '';
        setPersonelBilgisi({
          id: 0,
          sicilNo: userSicil,
          ad: 'Bilinmeyen',
          soyad: 'Kullanıcı',
          unvan: 'Belirtilmemiş',
          mevcutAdliye: 'Belirtilmemiş',
          telefon: 'Belirtilmemiş',
          email: 'belirtilmemis@adalet.gov.tr',
          dogumTarihi: '2000-01-01',
          baslamaTarihi: '2000-01-01'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPersonelBilgisi();
  }, []);

  // Çıkış işlemi
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userSicil');
    navigate('/');
  };
  
  // Profil menüsünü ve mobil menüyü dış tıklamalarda kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Sadece profil menüsünü kapat
      if (profilMenuRef.current && !profilMenuRef.current.contains(event.target)) {
        setProfilMenuOpen(false);
      }
      
      // Mobil menüyü dış tıklamada kapat, SADECE EKRAN BOYUTU MOBİL İSE ve hamburger butonuna tıklanmadıysa
      if (window.innerWidth < 768 && // Ekran boyutu kontrolü eklendi
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.hamburger-menu-button')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profilMenuRef, mobileMenuRef]);
  
  // Ekran boyutu değiştiğinde menü durumunu ayarla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Masaüstü görünümünde menü her zaman açık
        setMobileMenuOpen(true);
      } else {
        // Mobil görünümde menü kapalı başlar
        setMobileMenuOpen(false);
      }
    };
    
    // İlk yükleme
    handleResize();
    
    // Ekran boyutu değişikliklerini izle
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kaydırma çubuğunu gizleme stili
  const customStyles = `
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    
    /* Mobil görünüm için modern stil */ 
    @media (max-width: 768px) {
      .mobile-menu-container {
        margin-bottom: 1rem;
      }
      
      .mobile-header {
        padding-bottom: 0.75rem;
      }
      
      .mobile-menu {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
      }
      
      .mobile-menu-item {
        transition: all 0.2s ease;
      }
      
      .mobile-menu-item:active {
        transform: scale(0.95);
      }
      
      .menu-slide-in {
        animation: slideInLeft 0.3s forwards;
      }
      
      /* Hamburger menü animasyonu */
      .hamburger-line {
        width: 24px;
        height: 3px;
        background-color: currentColor;
        margin: 5px 0;
        transition: all 0.3s;
      }
      
      .hamburger-active .line1 {
        transform: rotate(-45deg) translate(-5px, 6px);
      }
      
      .hamburger-active .line2 {
        opacity: 0;
      }
      
      .hamburger-active .line3 {
        transform: rotate(45deg) translate(-5px, -6px);
      }

      /* Modern animasyonlar */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }

      .animate-slideInRight {
        animation: slideInRight 0.4s ease-out forwards;
      }

      .animate-float {
        animation: float 3s ease-in-out infinite;
      }

      .hamburger-menu-button {
        transition: all 0.3s ease;
      }

      .hamburger-menu-button:hover {
        transform: scale(1.05);
      }

      .shimmer-effect {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* CSS stil tanımı */}
      <style>{customStyles}</style>
      {/* Modern Kurumsal Header */}
      <header className="relative bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary-400 to-indigo-400 rounded-full translate-x-32 translate-y-32 animate-pulse delay-1000"></div>
        </div>

        {/* Üst şerit - T.C. Adalet Bakanlığı */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 dark:from-gray-900 dark:to-gray-800 py-2 px-4 border-b border-slate-600/30 dark:border-gray-600/30 transition-colors duration-300">
          <div className="container mx-auto flex justify-between items-center text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="font-semibold tracking-wider text-white">T.C. ADALET BAKANLIĞI</span>
            </div>
            <div className="flex space-x-4 items-center text-slate-300">
              <span className="flex items-center hover:text-white transition-colors duration-200">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-xs">{new Date().toLocaleDateString('tr-TR')}</span>
              </span>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <span className="flex items-center hover:text-white transition-colors duration-200">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Ana header - Modern tasarım */}
        <div className="relative container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0 group">
            {/* Modern Logo tasarımı */}
            <div className="relative mr-4 bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-2xl shadow-lg w-16 h-16 flex items-center justify-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl group-hover:rotate-3">
              <svg className="w-9 h-9 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {/* Animated ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary-300 animate-ping opacity-20"></div>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="inline-flex items-center space-x-2">
                  <span className="modern-gradient-title font-extrabold">
                    PERSONEL TAYİN TALEBİ UYGULAMASI
                  </span>
                </span>
              </h1>
              <p className="text-gray-600 text-sm font-medium flex items-center">
                <svg className="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Adalet Bakanlığı Personel Genel Müdürlüğü
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:space-x-6 w-full md:w-auto">
            {/* Karanlık Mod Toggle Butonu */}
            <div className="mb-3 md:mb-0">
              <DarkModeToggle />
            </div>

            {/* Modern kullanıcı bilgisi ve profil alanı */}
            <div className="relative w-full md:w-auto">
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right
                  });
                  setProfilMenuOpen(!profilMenuOpen);
                }}
                className="flex items-center mb-3 md:mb-0 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 backdrop-blur-sm rounded-xl px-4 py-3 transition-all duration-300 shadow-lg hover:shadow-xl w-full md:w-auto justify-between md:justify-start border border-gray-200/50 dark:border-gray-600/50 group"
                ref={profilMenuRef}
              >
                <div className="flex items-center">
                  <div className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-2 mr-3 shadow-md group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold modern-gradient-title">{personelBilgisi.ad} {personelBilgisi.soyad}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">{personelBilgisi.unvan}</div>
                  </div>
                </div>
                <svg className={`w-4 h-4 ml-2 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${profilMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Profil Açılır Menü */}
              {profilMenuOpen && (
                <div
                  className="fixed w-72 bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-600 animate-fadeIn"
                  style={{
                    zIndex: 99999,
                    top: `${dropdownPosition.top}px`,
                    right: `${dropdownPosition.right}px`
                  }}
                >
                  <div className="p-4 bg-primary-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center">
                      <div className="bg-primary-500 rounded-full p-2 mr-3">
                        <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium modern-gradient-title">{personelBilgisi.ad} {personelBilgisi.soyad}</h3>
                        <p className="text-sm text-primary-600 dark:text-primary-400">{personelBilgisi.unvan}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex items-center">
                      <div className="bg-gray-100 dark:bg-gray-600 text-primary-700 dark:text-primary-400 p-1.5 rounded-md mr-3">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sicil Numarası</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{personelBilgisi.sicilNo}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-gray-100 dark:bg-gray-600 text-primary-700 dark:text-primary-400 p-1.5 rounded-md mr-3">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mevcut Adliye</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{personelBilgisi.mevcutAdliye}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-gray-100 dark:bg-gray-600 text-primary-700 dark:text-primary-400 p-1.5 rounded-md mr-3">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">İşe Başlama Tarihi</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{new Date(personelBilgisi.baslamaTarihi).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-gray-100 dark:bg-gray-600 text-primary-700 dark:text-primary-400 p-1.5 rounded-md mr-3">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{personelBilgisi.telefon}</p>
                      </div>
                    </div>
                  </div>
                  

                </div>
              )}
            </div>
            
            {/* Çıkış butonu */}
            <div className="flex items-center w-full md:w-auto justify-center md:justify-start">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Alt navigasyon menüsü */}
        {/* Alt çizgiden kaldırıldı */}
      </header>

      {/* Modern Ana İçerik */}
      <main className="container mx-auto px-4 py-6">
        {/* Mobil görünümde hamburger menü butonu */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Menü</h2>
          <button
            className="hamburger-menu-button p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sol Menü - Kurumsal Modern Tasarım */}
          <div
            ref={mobileMenuRef}
            className={`${mobileMenuOpen ? 'block animate-slideInRight' : 'hidden'} md:block w-full md:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 ease-in-out transform md:transform-none ${mobileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>

              {/* Modern Header */}
              <div className="relative bg-gradient-to-br from-slate-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-800/80 px-6 py-5 border-b border-gray-200/50 dark:border-gray-600/50">
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500 rounded-full -translate-y-12 translate-x-12"></div>
                </div>
                <div className="relative flex items-center">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-xl mr-3 border border-primary-200/50 dark:border-primary-700/50">
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Menü</h2>
                </div>
              </div>

              <nav className="p-4">
                <ul className="space-y-2">
                  <li className="group">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-500 ease-out overflow-hidden ${activeTab === 'profile' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:shadow-md'}`}
                    >
                      {/* Smooth background transition */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 transition-all duration-500 ease-out ${activeTab === 'profile' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

                      <div className={`relative p-2 rounded-lg mr-3 transition-all duration-500 ease-out ${activeTab === 'profile' ? 'bg-white/20 scale-110' : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:scale-105'}`}>
                        <svg className="w-4 h-4 transition-transform duration-500 ease-out" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="relative font-medium transition-all duration-500 ease-out">Profil Bilgileri</span>
                    </button>
                  </li>
                  <li className="group">
                    <button
                      onClick={() => setActiveTab('create')}
                      className={`relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-500 ease-out overflow-hidden ${activeTab === 'create' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:shadow-md'}`}
                    >
                      {/* Smooth background transition */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 transition-all duration-500 ease-out ${activeTab === 'create' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

                      <div className={`relative p-2 rounded-lg mr-3 transition-all duration-500 ease-out ${activeTab === 'create' ? 'bg-white/20 scale-110' : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:scale-105'}`}>
                        <svg className="w-4 h-4 transition-transform duration-500 ease-out" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="relative font-medium transition-all duration-500 ease-out">Tayin Talebi Oluştur</span>
                    </button>
                  </li>
                  <li className="group">
                    <button
                      onClick={() => setActiveTab('list')}
                      className={`relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-500 ease-out overflow-hidden ${activeTab === 'list' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:shadow-md'}`}
                    >
                      {/* Smooth background transition */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 transition-all duration-500 ease-out ${activeTab === 'list' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

                      <div className={`relative p-2 rounded-lg mr-3 transition-all duration-500 ease-out ${activeTab === 'list' ? 'bg-white/20 scale-110' : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:scale-105'}`}>
                        <svg className="w-4 h-4 transition-transform duration-500 ease-out" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <span className="relative font-medium transition-all duration-500 ease-out">Tayin Taleplerim</span>
                    </button>
                  </li>

                  {/* Ayırıcı çizgi */}
                  <li className="my-4">
                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                  </li>

                  <li className="group">
                    <button
                      onClick={() => setActiveTab('sss')}
                      className={`relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-500 ease-out overflow-hidden ${activeTab === 'sss' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:shadow-md'}`}
                    >
                      {/* Smooth background transition */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 transition-all duration-500 ease-out ${activeTab === 'sss' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

                      <div className={`relative p-2 rounded-lg mr-3 transition-all duration-500 ease-out ${activeTab === 'sss' ? 'bg-white/20 scale-110' : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:scale-105'}`}>
                        <svg className="w-4 h-4 transition-transform duration-500 ease-out" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="relative font-medium transition-all duration-500 ease-out">Sık Sorulan Sorular</span>
                    </button>
                  </li>

                  <li className="group">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`relative flex items-center w-full px-4 py-3 rounded-xl transition-all duration-500 ease-out overflow-hidden ${activeTab === 'settings' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 hover:shadow-md'}`}
                    >
                      {/* Smooth background transition */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 transition-all duration-500 ease-out ${activeTab === 'settings' ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

                      <div className={`relative p-2 rounded-lg mr-3 transition-all duration-500 ease-out ${activeTab === 'settings' ? 'bg-white/20 scale-110' : 'bg-gray-100 dark:bg-gray-600 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:scale-105'}`}>
                        <svg className="w-4 h-4 transition-transform duration-500 ease-out" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="relative font-medium transition-all duration-500 ease-out">Ayarlar</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

          {/* Modern içerik alanı */}
          <div className="flex-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Soft Corporate Header */}
                <div className="relative bg-gradient-to-br from-slate-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-800/80 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
                  {/* Subtle background accent */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full -translate-y-32 translate-x-32"></div>
                  </div>

                  <div className="relative z-10 px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl border border-primary-200/50 dark:border-primary-700/50">
                          <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border border-white"></div>
                      </div>

                      <div className="text-gray-800 dark:text-gray-200 flex-1">
                        <h1 className="text-xl font-bold mb-1 modern-gradient-title">{personelBilgisi.ad} {personelBilgisi.soyad}</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{personelBilgisi.unvan}</p>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                          <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium">{personelBilgisi.mevcutAdliye}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kurumsal Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Kurumsal Kişisel Bilgiler Kartı */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-600/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-slate-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 px-6 py-4 border-b border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold modern-gradient-title">Kişisel Bilgiler</h3>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Sicil Numarası */}
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Sicil Numarası</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{personelBilgisi.sicilNo}</p>
                        </div>
                      </div>

                      {/* Doğum Tarihi */}
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Doğum Tarihi</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {personelBilgisi.dogumTarihi ? new Date(personelBilgisi.dogumTarihi).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                          </p>
                        </div>
                      </div>

                      {/* İşe Başlama Tarihi */}
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">İşe Başlama Tarihi</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {personelBilgisi.baslamaTarihi ? new Date(personelBilgisi.baslamaTarihi).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kurumsal İletişim Bilgileri Kartı */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200/50 dark:border-gray-600/50 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="bg-gradient-to-r from-slate-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 px-6 py-4 border-b border-gray-200/50 dark:border-gray-600/50">
                      <div className="flex items-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold modern-gradient-title">İletişim Bilgileri</h3>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Telefon */}
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Telefon</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{personelBilgisi.telefon}</p>
                        </div>
                      </div>

                      {/* E-posta */}
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">E-posta</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 break-all">{personelBilgisi.email}</p>
                        </div>
                      </div>

                      {/* Mevcut Adliye */}
                      <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Mevcut Adliye</p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{personelBilgisi.mevcutAdliye}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            )}

            {activeTab === 'create' && (
              <div className="space-y-8">
                <TayinTalebiForm setActiveTab={setActiveTab} />
              </div>
            )}

            {activeTab === 'list' && (
              <div className="space-y-8">
                {/* Modern Header - Soft Kurumsal */}
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800/30 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
                  <div className="relative bg-gradient-to-br from-slate-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50 px-8 py-6">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    <div className="relative z-10 flex items-center">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl border border-primary-200/50 dark:border-primary-700/50 mr-4">
                        <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold modern-gradient-title mb-1">Tayin Taleplerim</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Oluşturduğunuz tayin taleplerini görüntüleyin ve yönetin</p>
                      </div>
                    </div>
                  </div>
                </div>
                <TayinTalepleriList />
              </div>
            )}
            
            {activeTab === 'sss' && (
              <div className="space-y-8">
                {/* Modern Header - Soft Kurumsal */}
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800/30 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
                  <div className="relative bg-gradient-to-br from-slate-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50 px-8 py-6">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    <div className="relative z-10 flex items-center">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl border border-primary-200/50 dark:border-primary-700/50 mr-4">
                        <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold modern-gradient-title mb-1">Sık Sorulan Sorular</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Tayin işlemleri hakkında merak edilen sorular ve cevapları</p>
                      </div>
                    </div>
                  </div>
                </div>
                <SSSPage />
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Modern Header - Soft Kurumsal */}
                <div className="max-w-7xl mx-auto bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800/30 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
                  <div className="relative bg-gradient-to-br from-slate-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50 px-8 py-6">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    <div className="relative z-10 flex items-center">
                      <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl border border-primary-200/50 dark:border-primary-700/50 mr-4">
                        <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold modern-gradient-title mb-1">Ayarlar</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Hesap güvenliğinizi ve tercihlerinizi yönetin</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Ayarlar />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
