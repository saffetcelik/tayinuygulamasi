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
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Kurumsal Modern Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/80 via-transparent to-primary-700/40"></div>

      {/* Animated Corporate Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Floating Corporate Shapes */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-r from-primary-500/10 to-blue-600/10 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute top-2/3 right-1/5 w-80 h-80 bg-gradient-to-r from-indigo-500/8 to-purple-600/8 rounded-full blur-3xl animate-float-medium"></div>
        <div className="absolute bottom-1/3 left-1/2 w-72 h-72 bg-gradient-to-r from-cyan-500/6 to-blue-700/6 rounded-full blur-2xl animate-float-fast"></div>

        {/* Corporate Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="corporateGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                <circle cx="0" cy="0" r="1" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#corporateGrid)" />
          </svg>
        </div>

        {/* Modern Geometric Elements */}
        <div className="absolute top-20 right-20 w-24 h-24 border border-white/10 rounded-lg rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-32 left-16 w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-10 w-32 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right"></div>

        {/* Subtle Light Rays */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-fade-in-out"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/8 to-transparent animate-fade-in-out-delayed"></div>
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
                    onFocus={() => setFocusedField('sicilNo')}
                    onBlur={() => setFocusedField('')}
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
                    type={showPassword ? "text" : "password"}
                    value={sifre}
                    onChange={(e) => setSifre(e.target.value)}
                    onFocus={() => setFocusedField('sifre')}
                    onBlur={() => setFocusedField('')}
                    className="block w-full pl-10 pr-12 py-3 border-0 focus:ring-0 transition-all duration-200 bg-transparent"
                    placeholder="Şifrenizi giriniz"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
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
              
              <div className="flex items-center mt-4">
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
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(10px) rotate(1deg); }
          50% { transform: translateY(-10px) translateX(-15px) rotate(-1deg); }
          75% { transform: translateY(-30px) translateX(5px) rotate(0.5deg); }
        }

        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-15px) translateX(-10px) rotate(-0.5deg); }
          66% { transform: translateY(-25px) translateX(8px) rotate(1deg); }
        }

        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-20px) translateX(-12px) rotate(-0.8deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes slide-right {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes fade-in-out {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.3; }
        }

        @keyframes fade-in-out-delayed {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.2; }
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

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-slide-right {
          animation: slide-right 6s ease-in-out infinite;
        }

        .animate-fade-in-out {
          animation: fade-in-out 8s ease-in-out infinite;
        }

        .animate-fade-in-out-delayed {
          animation: fade-in-out-delayed 10s ease-in-out infinite 2s;
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
