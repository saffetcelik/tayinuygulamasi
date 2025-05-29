import React, { useState, useRef, useEffect } from 'react';

const AdminHeader = ({ adminInfo, onLogout, mobileMenuOpen, setMobileMenuOpen }) => {
  const [profilMenuOpen, setProfilMenuOpen] = useState(false);
  const profilMenuRef = useRef(null);
  
  // Dışarıya tıklandığında profil menüsünü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profilMenuRef.current && !profilMenuRef.current.contains(event.target)) {
        setProfilMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profilMenuRef]);

  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white fixed w-full top-0 left-0 z-30 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo ve hamburger menü */}
        <div className="flex items-center">
          {/* Hamburger menü butonu - Mobil görünüm için */}
          <button 
            className="mr-3 md:hidden bg-blue-700/50 p-2 rounded-lg hover:bg-blue-700/70 transition-colors"
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

          {/* Logo ve başlık */}
          <div className="flex items-center">
            <div className="mr-3 bg-white/90 p-2 rounded-lg shadow-md w-10 h-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">YÖNETİCİ PANELİ</h1>
              <div className="text-xs text-white/80 font-light hidden md:block">Personel Tayin Talebi Yönetim Sistemi</div>
            </div>
          </div>
        </div>

        {/* Kullanıcı bilgisi */}
        <div className="relative" ref={profilMenuRef}>
          <button 
            onClick={() => setProfilMenuOpen(!profilMenuOpen)}
            className="flex items-center bg-blue-700/60 hover:bg-blue-800/80 backdrop-blur-sm rounded-lg px-3 py-2 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <div className="bg-white/90 text-blue-700 rounded-full p-1.5 mr-2 shadow-sm">
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-sm">
              <div className="font-medium">{adminInfo?.adSoyad || 'Admin'}</div>
              <div className="text-xs text-white/80">{adminInfo?.rol || 'Yönetici'}</div>
            </div>
            <svg className={`w-4 h-4 ml-2 transition-transform ${profilMenuOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profil açılır menü */}
          {profilMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden z-50 border border-gray-200 animate-fadeIn">
              <div className="p-4 bg-blue-50 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-blue-800">{adminInfo?.adSoyad || 'Admin'}</h3>
                    <p className="text-sm text-blue-600">{adminInfo?.rol || 'Yönetici'}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <button 
                  onClick={() => onLogout()}
                  className="w-full flex items-center p-2 hover:bg-red-50 text-red-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
