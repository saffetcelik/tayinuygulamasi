import React, { useRef, useEffect } from 'react';
import { Users, FileText, BarChart2, Activity, Shield, Settings, LogOut, Database, Home, Calendar, ChevronRight, LogIn } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen, istatistikler = {}, onLogout }) => {
  const sidebarRef = useRef(null);

  // Mobil görünümde menü dışına tıklandığında menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && 
          !sidebarRef.current.contains(event.target) && 
          !event.target.closest('.hamburger-menu-button')) {
        // Mobil ekranda ve menü açıksa kapat
        if (window.innerWidth < 768 && mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarRef, mobileMenuOpen, setMobileMenuOpen]);

  // Menü seçildiğinde mobil görünümde menüyü kapat
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className={`fixed bg-[#0f172a] text-white w-64 h-full top-0 left-0 shadow-lg transition-transform duration-300 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 z-30 overflow-y-auto pb-16`}
    >
      {/* Logo ve Başlık - Minimalist Tasarım */}
      <div className="p-5 border-b border-blue-800/20">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-600 rounded-lg p-2 shadow">
            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight">Tayin Sistemi</h2>
          <div className="text-xs text-blue-400/80 uppercase tracking-wider font-medium mt-1">Yönetim Paneli</div>
        </div>
      </div>
      
      {/* Admin Profil Bilgisi - Minimalist */}
      <div className="py-3 px-4 border-b border-blue-800/20 text-center">
        <div className="inline-flex items-center justify-center mb-1">
          <div className="bg-blue-700 text-white rounded-full p-1 mr-2">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium">Admin Kullanıcı</span>
        </div>
      </div>
      
      {/* İstatistik Kartları */}
      <div className="p-3 border-b border-blue-800">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="text-xs text-blue-300">Toplam Kullanıcı</div>
            <div className="text-xl font-bold text-white">{istatistikler.toplamKullanici || 0}</div>

          </div>
          <div className="bg-blue-800/50 p-3 rounded-lg">
            <div className="text-xs text-blue-300">Tayin Talebi</div>
            <div className="text-xl font-bold text-white">{istatistikler.toplamTayinTalebi || 0}</div>

          </div>
        </div>
      </div>
      
      {/* Ana Menü */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-xs uppercase font-bold tracking-wider text-white/70 mb-3 pl-2 flex items-center">
            <Home size={14} className="mr-1" />
            <span>GENEL</span>
          </p>
          
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleTabChange('tayinler')}
                className={`flex items-center w-full px-3 py-2.5 rounded transition-all duration-200 ${
                  activeTab === 'tayinler' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-white hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <Calendar size={18} className="mr-3" />
                <span className="font-medium">Tayin Talepleri</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            </li>
            
            <li>
              <button
                onClick={() => handleTabChange('personeller')}
                className={`flex items-center w-full px-3 py-2.5 rounded transition-all duration-200 ${
                  activeTab === 'personeller' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-white hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <Users size={18} className="mr-3" />
                <span className="font-medium">Personeller</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            </li>
            
            <li>
              <button
                onClick={() => handleTabChange('istatistikler')}
                className={`flex items-center w-full px-3 py-2.5 rounded transition-all duration-200 ${
                  activeTab === 'istatistikler' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-white hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <BarChart2 size={18} className="mr-3" />
                <span className="font-medium">İstatistikler</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            </li>
          </ul>
        </div>
          
        <div className="mb-4">
          <p className="text-xs uppercase font-bold tracking-wider text-white/70 mb-3 pl-2 flex items-center">
            <Shield size={14} className="mr-1" />
            <span>GÜVENLİK</span>
          </p>
          
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleTabChange('logs')}
                className={`flex items-center w-full px-3 py-2.5 rounded transition-all duration-200 ${
                  activeTab === 'logs' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-white hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <Activity size={18} className="mr-3" />
                <span className="font-medium">Sistem Logları</span>
                <ChevronRight size={16} className="ml-auto" />
              </button>
            </li>
          </ul>
        </div>
        
        <div className="mb-4">
          <p className="text-xs uppercase font-bold tracking-wider text-white/70 mb-3 pl-2 flex items-center">
            <Settings size={14} className="mr-1" />
            <span>SİSTEM</span>
          </p>
          
          <ul className="space-y-1">

            <li>
              <button
                onClick={onLogout}
                className="flex items-center w-full px-3 py-2.5 rounded transition-all duration-200 text-white hover:bg-red-500 hover:text-white"
              >
                <LogOut size={18} className="mr-3" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </li>
          </ul>
        </div>
        
        {/* Versiyon Bilgisi */}
        <div className="pt-6 pb-2 px-4 mt-auto">
          <div className="p-3 rounded-lg bg-blue-800/30 text-center">
            <p className="text-xs text-blue-300">Tayin Sistemi</p>
            <p className="text-xs text-blue-400 font-medium">v1.5.2</p>
          </div>
        </div>
        <p className="text-xs text-blue-400 mt-1 text-center">© {new Date().getFullYear()} Personel Tayin Sistemi v1.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
