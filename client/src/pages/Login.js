import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [sicilNo, setSicilNo] = useState('');
  const [sifre, setSifre] = useState('');
  const [beniHatirla, setBeniHatirla] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sicilNoError, setSicilNoError] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();
  
  // Sayfa yüklendiğinde animasyon efekti ve cookie kontrolü
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 800);
    
    // localStorage'dan son giriş yapan kullanıcıyı kontrol et
    const checkLastLogin = () => {
      try {
        const lastSicilNo = localStorage.getItem('lastLoginSicilNo');
        
        console.log('localStorage\'dan alınan son giriş sicil no:', lastSicilNo);
        
        if (lastSicilNo && lastSicilNo.length > 0) {
          setSicilNo(lastSicilNo);
          setBeniHatirla(true);
          console.log('Son giriş yapan kullanıcı sicil no bulundu:', lastSicilNo);
        } else {
          console.log('Kayıtlı son giriş yapan kullanıcı bulunamadı');
        }
      } catch (error) {
        console.error('localStorage okuma hatası:', error);
      }
    };
    
    checkLastLogin();
    return () => clearTimeout(timer);
  }, []);

  // Sicil numarası doğrulama fonksiyonu
  const validateSicilNo = (value) => {
    // Sadece rakamlardan oluşup oluşmadığını kontrol et
    const isNumeric = /^\d+$/.test(value);
    
    // 6 haneli olup olmadığını kontrol et
    const isSixDigits = value.length === 6;
    
    if (!isNumeric) {
      return 'Sicil numarası yalnızca rakamlardan oluşmalıdır';
    }
    
    if (!isSixDigits) {
      return 'Sicil numarası 6 haneli olmalıdır';
    }
    
    return '';
  };

  // Sicil numarası değiştiğinde doğrulama yap
  const handleSicilNoChange = (e) => {
    const value = e.target.value;
    setSicilNo(value);
    
    // Kullanıcı veri girişi yaparken anlık doğrulama
    if (value) {
      // Sadece sayısal karakter kontrolü
      const isNumeric = /^\d+$/.test(value);
      if (!isNumeric) {
        setSicilNoError('Sicil no yalnızca sayılardan oluşmalıdır');
      } else if (value.length !== 6 && value.length > 0) {
        setSicilNoError('Sicil numarası 6 haneli olmalıdır');
      } else {
        setSicilNoError('');
      }
    } else {
      setSicilNoError('');
    }
  };
  
  // Giriş işlemi
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Sicil numarası doğrulaması
    const sicilNoValidationError = validateSicilNo(sicilNo);
    
    if (sicilNoValidationError) {
      setSicilNoError(sicilNoValidationError);
      toast.error(sicilNoValidationError);
      return;
    }
    
    if (!sicilNo || !sifre) {
      setError('Sicil numarası ve şifre gereklidir');
      toast.error('Lütfen tüm alanları doldurunuz');
      return;
    }
    
    setLoading(true);
    setError('');
    setSicilNoError('');
    
    try {
      // Login butonuna tıklanınca "dalgalanma" animasyonu
      document.querySelector('.login-btn').classList.add('animate-ripple');
      
      // Gerçek API isteği yapılıyor
      const response = await authService.login(sicilNo, sifre, beniHatirla);
      
      // Başarılı giriş
      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
      
      // Yönlendirme öncesi kısa bir bekleme (animasyon görünürlüğü için)
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      // Hata mesajını göster
      const errorMessage = err.response?.data || 'Giriş başarısız. Lütfen sicil numaranızı ve şifrenizi kontrol ediniz.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      
      // Hata durumunda buton animasyonunu kaldır
      document.querySelector('.login-btn').classList.remove('animate-ripple');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-800 to-primary-600 p-4 relative overflow-hidden">
      {/* Modernleştirilmiş arka plan desenleri */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Modern geometrik desenler */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          
          {/* Başlık - Animasyonlar korundu */}
          <div className="text-center">
            <h1 className={`text-2xl md:text-3xl font-bold text-white mb-2 transition-all duration-1000 ease-out ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              T.C. ADALET BAKANLIĞI
            </h1>
            <h2 className={`text-base md:text-xl font-semibold text-white/80 transition-all duration-1000 delay-300 ease-out ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
              Personel Tayin Talebi Yönetim Sistemi
            </h2>
          </div>
        </div>
        
        {/* Giriş Formu */}
        <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 ease-out ${animationComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <h2 className="text-2xl font-bold text-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">Giriş Yap</span>
                </h2>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transform scale-x-0 transition-transform group-hover:scale-x-100" style={{transform: animationComplete ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 0.5s ease-out 1s'}}></div>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded animate-shake" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group mb-4">
                <label htmlFor="sicilNo" className="block text-sm font-medium text-gray-700 mb-1 transition-all group-focus-within:text-primary-600">
                  Sicil Numarası
                </label>
                <div className="relative overflow-hidden rounded-lg transition-all duration-300 border border-gray-200 group-focus-within:border-primary-500 group-focus-within:ring-1 group-focus-within:ring-primary-500 shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <input
                    id="sicilNo"
                    type="text"
                    value={sicilNo}
                    onChange={handleSicilNoChange}
                    className={`block w-full pl-10 pr-3 py-3 border-0 focus:ring-0 transition-all duration-200 bg-transparent ${sicilNoError ? 'border-red-500 text-red-600' : ''}`}
                    placeholder="Sicil numaranızı giriniz (6 haneli)"
                    maxLength={6}
                    required
                  />
                  {sicilNoError && (
                <div className="mt-2 flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md border-l-4 border-red-500 animate-fade-in transition-all duration-300 ease-in-out">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{sicilNoError}</span>
                </div>
              )}
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-400 w-0 group-focus-within:w-full transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="relative group mb-6">
                <label htmlFor="sifre" className="block text-sm font-medium text-gray-700 mb-1 transition-all group-focus-within:text-primary-600">
                  Şifre
                </label>
                <div className="relative overflow-hidden rounded-lg transition-all duration-300 border border-gray-200 group-focus-within:border-primary-500 group-focus-within:ring-1 group-focus-within:ring-primary-500 shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-400 w-0 group-focus-within:w-full transition-all duration-300"></div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`login-btn w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 relative overflow-hidden transform hover:translate-y-[-2px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={beniHatirla}
                    onChange={(e) => setBeniHatirla(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Beni hatırla
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                    Şifremi unuttum
                  </a>
                </div>
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
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          60% { transform: scale(1.8); opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 15s ease-in-out infinite;
        }
        
        .animate-float-fast {
          animation: float-fast 12s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
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
      `}</style>
    </div>
  );
};

export default Login;
