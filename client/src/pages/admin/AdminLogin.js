import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminService } from '../../services/api';

const AdminLogin = () => {
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();
  
  // Sayfa yüklendiğinde animasyon efekti
  useEffect(() => {
    // Admin token varsa doğrudan panele yönlendir
    const adminToken = localStorage.getItem('adminToken');
    const handleRedirect = () => {
      if (adminToken) {
        navigate('/admin/panel');
      }
    };
    
    // Timeout kullanarak güvenli bir şekilde yönlendirme yapıyoruz
    const redirectTimer = setTimeout(handleRedirect, 0);
    
    const animationTimer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500);
    
    return () => {
      clearTimeout(redirectTimer);
      clearTimeout(animationTimer);
    };
  }, [navigate]);

  // Giriş işlemi
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!kullaniciAdi || !sifre) {
      setError('Kullanıcı adı ve şifre gereklidir');
      toast.error('Lütfen tüm alanları doldurunuz');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Login butonuna tıklanınca "dalgalanma" animasyonu
      const loginBtn = document.querySelector('.login-btn');
      if (loginBtn) {
        loginBtn.classList.add('animate-ripple');
      }
      
      // API isteği yapılıyor
      await adminService.adminLogin(kullaniciAdi, sifre);
      
      // Başarılı giriş
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      
      // Yönlendirme öncesi kısa bir bekleme (animasyon görünürlüğü için)
      const redirectTimer = setTimeout(() => {
        setLoading(false);
        navigate('/admin/panel', { replace: true }); // replace: true kullanarak güvenli yönlendirme yapıyoruz
      }, 1000);
      
      // Bileşen kaldırılırsa timer'ı temizleme işlemini sağlamak için
      return () => clearTimeout(redirectTimer);
    } catch (err) {
      // Hata mesajını göster
      const errorMessage = typeof err === 'string' ? err : 'Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol ediniz.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      
      // Hata durumunda buton animasyonunu kaldır
      const loginBtn = document.querySelector('.login-btn');
      if (loginBtn) {
        loginBtn.classList.remove('animate-ripple');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-800 to-blue-600 p-4 relative overflow-hidden">
      {/* Modernleştirilmiş arka plan desenleri */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grad1)" />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white opacity-[0.03] rounded-br-full"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-1/3 bg-white opacity-[0.04] rounded-tl-3xl"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo ve Başlık - Mobil görünümde sorun yaşanmaması için düzenlenmiş yapı */}
        <div className="flex flex-col items-center justify-center mb-8">
          {/* Logo - Artık başlıktan ayrı bir konumda */}
          <div className={`mb-6 bg-white/10 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-700 ease-out ${animationComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
            <svg className="w-12 h-12 md:w-16 md:h-16 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          
          {/* Başlık - Animasyonlar korundu */}
          <div className="text-center">
            <h1 className={`text-2xl md:text-3xl font-bold text-white mb-2 transition-all duration-1000 ease-out ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              T.C. ADALET BAKANLIĞI
            </h1>
            <h2 className={`text-base md:text-xl font-semibold text-white/80 transition-all duration-1000 delay-300 ease-out ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Personel Tayin Yönetim Sistemi - Admin Paneli
            </h2>
          </div>
        </div>
        
        {/* Giriş Formu */}
        <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ease-out ${animationComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <h2 className="text-2xl font-bold text-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">Yönetici Girişi</span>
                </h2>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transform scale-x-0 transition-transform group-hover:scale-x-100" style={{transform: animationComplete ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.5s ease-out 1s'}}></div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded animate-shake" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group mb-4">
                <label htmlFor="kullaniciAdi" className="block text-sm font-medium text-gray-700 mb-1 transition-all group-focus-within:text-blue-600">
                  Kullanıcı Adı
                </label>
                <div className="relative overflow-hidden rounded-lg transition-all duration-300 border border-gray-200 group-focus-within:border-blue-500 group-focus-within:ring-1 group-focus-within:ring-blue-500 shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="kullaniciAdi"
                    type="text"
                    value={kullaniciAdi}
                    onChange={(e) => setKullaniciAdi(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-0 focus:ring-0 transition-all duration-200 bg-transparent"
                    placeholder="Kullanıcı adınızı giriniz"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 w-0 group-focus-within:w-full transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="relative group mb-6">
                <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-1 transition-all group-focus-within:text-blue-600">
                  Şifre
                </label>
                <div className="relative overflow-hidden rounded-lg transition-all duration-300 border border-gray-200 group-focus-within:border-blue-500 group-focus-within:ring-1 group-focus-within:ring-blue-500 shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="sifre"
                    type="password"
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border-0 focus:ring-0 transition-all duration-200 bg-transparent"
                    placeholder="Şifrenizi giriniz"
                    required
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 w-0 group-focus-within:w-full transition-all duration-300"></div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`login-btn w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 relative overflow-hidden transform hover:translate-y-[-2px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Giriş Yapılıyor...
                      </span>
                    ) : (
                      'Giriş Yap'
                    )}
                  </span>
                </button>
              </div>
            </form>
          </div>
          
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-sm text-gray-600 text-center">
              T.C. Adalet Bakanlığı Personel Genel Müdürlüğü © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
      
      {/* CSS Animasyonları */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .bg-gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .animate-ripple::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%) scale(0);
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 100%;
          animation: ripple 0.6s linear;
        }
        
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          60% { transform: translate(-50%, -50%) scale(1.8); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
