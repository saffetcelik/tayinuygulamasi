import React, { useRef, useEffect } from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
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
      className={`fixed bg-gradient-to-b from-white to-gray-50 w-64 h-full top-16 left-0 shadow-lg transition-transform duration-300 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 z-20 overflow-y-auto pb-16 border-r border-gray-100`}
    >
      <div className="p-4 bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-800 text-white border-b border-indigo-600 flex items-center">
        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm border border-white/10 mr-3">
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </div>
        <span className="text-sm font-medium">MENÜ</span>
      </div>
      
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">Hoş Geldiniz</p>
            <p className="text-xs text-gray-500 truncate">Yönetici Paneli</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-5">
          <li>
            <span className="text-indigo-600 text-xs uppercase font-bold tracking-wider flex items-center mb-3 px-2">
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              ANA MENÜ
            </span>
          
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleTabChange('tayinler')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'tayinler'
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 shadow-sm font-medium border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-l-4 hover:border-indigo-200'
                  }`}
                >
                  <div className="bg-white shadow-md rounded-lg p-1.5 mr-3">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Tayin Talepleri</span>
                    <p className="text-xs text-gray-500 mt-0.5">Tayin talep listesi ve yönetimi</p>
                  </div>
                </button>
              </li>
              
              <li>
                <button
                  onClick={() => handleTabChange('personeller')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'personeller'
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 shadow-sm font-medium border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-l-4 hover:border-indigo-200'
                  }`}
                >
                  <div className="bg-white shadow-md rounded-lg p-1.5 mr-3">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Personeller</span>
                    <p className="text-xs text-gray-500 mt-0.5">Personel listesi ve bilgileri</p>
                  </div>
                </button>
              </li>
              
              <li>
                <button
                  onClick={() => handleTabChange('istatistikler')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'istatistikler'
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 shadow-sm font-medium border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-l-4 hover:border-indigo-200'
                  }`}
                >
                  <div className="bg-white shadow-md rounded-lg p-1.5 mr-3">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">İstatistikler</span>
                    <p className="text-xs text-gray-500 mt-0.5">Genel tayin istatistikleri</p>
                  </div>
                </button>
              </li>
            </ul>
          </li>
          
          <li>
            <span className="text-indigo-600 text-xs uppercase font-bold tracking-wider flex items-center mb-3 px-2">
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              GÜVENLİK
            </span>
            
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleTabChange('logs')}
                  className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === 'logs'
                      ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 shadow-sm font-medium border-l-4 border-indigo-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-l-4 hover:border-indigo-200'
                  }`}
                >
                  <div className="bg-white shadow-md rounded-lg p-1.5 mr-3">
                    <svg
                      className="w-5 h-5 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium">Sistem Logları</span>
                    <p className="text-xs text-gray-500 mt-0.5">Güvenlik ve sistem kayıtları</p>
                  </div>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      
      <div className="p-5 mt-auto border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white text-center">
        <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-lg mb-2">
          <svg className="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p className="text-xs font-medium text-gray-600">T.C. Adalet Bakanlığı</p>
        <p className="text-xs text-gray-500 mt-1">© {new Date().getFullYear()} Personel Tayin Sistemi v1.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
