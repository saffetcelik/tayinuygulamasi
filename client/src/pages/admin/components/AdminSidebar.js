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
      className={`fixed bg-white w-64 h-full top-16 left-0 shadow-md transition-transform duration-300 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 z-20 overflow-y-auto pb-16`}
    >
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-blue-800">Yönetim Menüsü</h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-3">
          <li className="text-blue-600 text-xs uppercase font-semibold tracking-wider mb-2 px-2">
            ANA MENÜ
          </li>
          
          <li>
            <button
              onClick={() => handleTabChange('tayinler')}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === 'tayinler'
                  ? 'bg-blue-100 text-blue-800 shadow-sm font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Tayin Talepleri
            </button>
          </li>
          
          <li>
            <button
              onClick={() => handleTabChange('istatistikler')}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === 'istatistikler'
                  ? 'bg-blue-100 text-blue-800 shadow-sm font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              İstatistikler
            </button>
          </li>
          
          <li className="text-blue-600 text-xs uppercase font-semibold tracking-wider mb-2 mt-6 px-2">
            GÜVENLİK
          </li>
          
          <li>
            <button
              onClick={() => handleTabChange('logs')}
              className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === 'logs'
                  ? 'bg-blue-100 text-blue-800 shadow-sm font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
              }`}
            >
              <svg
                className="w-5 h-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Sistem Logları
            </button>
          </li>
          
        </ul>
      </nav>
      
      <div className="p-4 text-center mt-auto border-t border-gray-200 text-xs text-gray-500">
        <p>Adalet Bakanlığı © {new Date().getFullYear()}</p>
        <p>Personel Tayin Sistemi v1.0</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
