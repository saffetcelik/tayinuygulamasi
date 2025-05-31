import React, { useState, useRef, useEffect } from 'react';

const AdminHeader = ({ adminInfo, onLogout, mobileMenuOpen, setMobileMenuOpen }) => {
  const [profilMenuOpen, setProfilMenuOpen] = useState(false);
  const profilMenuRef = useRef(null);
  
  // Dışarıya tıklandığında açık menüleri kapat
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
    <header className="bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-800 text-white fixed w-full top-0 left-0 z-30 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo ve hamburger menü */}
        <div className="flex items-center">
          {/* Hamburger menü butonu - Mobil görünüm için */}
          <button 
            className="mr-3 md:hidden bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menüyü Aç/Kapat"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-5 h-5"
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
            <div className="mr-3 bg-white p-2 rounded-lg shadow-lg w-10 h-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-wide">YÖNETİCİ PANELİ</h1>
              <div className="text-xs text-white/80 font-light hidden md:block tracking-wider">T.C. ADALET BAKANLIĞI</div>
            </div>
          </div>
        </div>

        {/* Sağ taraf araçları */}
        <div className="flex items-center">

          {/* Kullanıcı bilgisi */}
          <div className="relative" ref={profilMenuRef}>
            <button 
              onClick={() => setProfilMenuOpen(!profilMenuOpen)}
              className="flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 transition-all duration-300 shadow-sm hover:shadow-md border border-white/10"
              aria-label="Profil Menüsü"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full p-1.5 mr-2 shadow-lg">
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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fadeIn">
                <div className="p-5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-b border-indigo-600">
                  <div className="flex items-center">
                    <div className="bg-white text-indigo-600 rounded-full p-2 mr-3 shadow-lg">
                      <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{adminInfo?.adSoyad || 'Admin'}</h3>
                      <p className="text-sm text-indigo-100">{adminInfo?.rol || 'Yönetici'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2 px-1">
                  
                  <button 
                    onClick={() => onLogout()}
                    className="w-full flex items-center p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors mt-1"
                  >
                    <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
