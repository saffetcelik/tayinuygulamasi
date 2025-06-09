import React, { useRef, useEffect } from 'react';
import { Users, BarChart2, Activity, LogOut, Calendar, ChevronRight, HelpCircle, TestTube, BookOpen, Monitor } from 'lucide-react';

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
      className={`fixed bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white w-72 h-full top-0 left-0 shadow-2xl transition-transform duration-300 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 z-30 overflow-y-auto overflow-x-hidden scrollbar-hide border-r border-slate-700/50 dark:border-gray-700/50`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitScrollbar: { display: 'none' }
      }}
    >
      {/* Kurumsal Header - Kompakt */}
      <div className="p-6 border-b border-slate-700/30">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg mb-4">
            <svg className="w-7 h-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white mb-2 tracking-tight">T.C. Adalet Bakanlığı</h1>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto rounded-full mb-3"></div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Tayin Yönetim Sistemi</p>
        </div>
      </div>
      

      

      
      {/* Ana Navigasyon */}
      <div className="flex-1 p-5">
        <nav className="space-y-2">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Yönetim Modülleri</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleTabChange('tayinler')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === 'tayinler'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                    activeTab === 'tayinler'
                    ? 'bg-white/20'
                    : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                  }`}>
                    <Calendar size={18} />
                  </div>
                  <span className="font-medium text-sm">Tayin Talepleri</span>
                  <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleTabChange('personeller')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === 'personeller'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                    activeTab === 'personeller'
                    ? 'bg-white/20'
                    : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                  }`}>
                    <Users size={18} />
                  </div>
                  <span className="font-medium text-sm">Personeller</span>
                  <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleTabChange('istatistikler')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === 'istatistikler'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                    activeTab === 'istatistikler'
                    ? 'bg-white/20'
                    : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                  }`}>
                    <BarChart2 size={18} />
                  </div>
                  <span className="font-medium text-sm">İstatistikler</span>
                  <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>
              </li>

              <li>
                <button
                  onClick={() => handleTabChange('sss')}
                  className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === 'sss'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                    activeTab === 'sss'
                    ? 'bg-white/20'
                    : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                  }`}>
                    <HelpCircle size={18} />
                  </div>
                  <span className="font-medium text-sm">Sık Sorulan Sorular</span>
                  <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>
              </li>
          </ul>
        </div>

        {/* Sistem Yönetimi */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Sistem Yönetimi</h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleTabChange('logs')}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === 'logs'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                  activeTab === 'logs'
                  ? 'bg-white/20'
                  : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                }`}>
                  <Activity size={18} />
                </div>
                <span className="font-medium text-sm">Sistem Logları</span>
                <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            </li>

            <li>
              <button
                onClick={() => handleTabChange('sistem-testleri')}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === 'sistem-testleri'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                  activeTab === 'sistem-testleri'
                  ? 'bg-white/20'
                  : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                }`}>
                  <TestTube size={18} />
                </div>
                <span className="font-medium text-sm">Sistem Testleri</span>
                <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            </li>

            <li>
              <button
                onClick={() => handleTabChange('sistem-sagligi')}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === 'sistem-sagligi'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                  activeTab === 'sistem-sagligi'
                  ? 'bg-white/20'
                  : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                }`}>
                  <Monitor size={18} />
                </div>
                <span className="font-medium text-sm">Sistem Sağlığı</span>
                <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            </li>

            <li>
              <button
                onClick={() => handleTabChange('api-dokumantasyon')}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === 'api-dokumantasyon'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                  activeTab === 'api-dokumantasyon'
                  ? 'bg-white/20'
                  : 'bg-slate-600/40 group-hover:bg-slate-500/40'
                }`}>
                  <BookOpen size={18} />
                </div>
                <span className="font-medium text-sm">API Dokümantasyonu</span>
                <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
              </button>
            </li>
          </ul>
        </div>
        </nav>

        {/* Çıkış Butonu */}
        <div className="mt-auto pt-6 border-t border-slate-700/30">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-slate-300 hover:bg-red-500/20 hover:text-red-300 group border border-slate-600/30 hover:border-red-500/30"
          >
            <div className="p-1.5 rounded-lg mr-3 bg-slate-600/40 group-hover:bg-red-500/20 transition-all duration-200">
              <LogOut size={18} />
            </div>
            <span className="font-medium text-sm">Güvenli Çıkış</span>
            <ChevronRight size={16} className="ml-auto opacity-50 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all duration-200" />
          </button>
        </div>
        
        {/* Footer */}
        <div className="pt-4 pb-3">
          <div className="text-center">
            <div className="bg-slate-800/30 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-600/20 dark:border-slate-500/30">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">v1.0 • © {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
