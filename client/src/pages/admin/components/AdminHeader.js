import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, HelpCircle, Settings, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';

const AdminHeader = ({ adminInfo, onLogout, mobileMenuOpen, setMobileMenuOpen }) => {
  const [profilMenuOpen, setProfilMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profilMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Dışarıya tıklandığında açık menüleri kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profilMenuRef.current && !profilMenuRef.current.contains(event.target)) {
        setProfilMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profilMenuRef, notificationsRef]);

  return (
    <header className="bg-white text-slate-700 fixed w-full top-0 left-0 z-20 shadow-sm border-b border-slate-200 md:pl-72">
      <div className="px-4 py-2.5 flex justify-between items-center">
        {/* Hamburger menü butonu - Mobil görünüm için */}
        <div className="flex items-center">
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menüyü Aç/Kapat"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          {/* Arama alanı kaldırıldı */}
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
