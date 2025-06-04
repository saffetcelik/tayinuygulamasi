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

      {/* Ultra Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Large Floating Orbs with Complex Gradients */}
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-gradient-to-br from-primary-400/20 via-blue-500/15 to-indigo-600/10 rounded-full blur-3xl animate-float-complex"></div>
        <div className="absolute top-2/3 right-1/5 w-96 h-96 bg-gradient-to-tr from-purple-500/15 via-pink-400/10 to-indigo-600/8 rounded-full blur-3xl animate-float-reverse-complex"></div>
        <div className="absolute bottom-1/3 left-1/2 w-72 h-72 bg-gradient-to-r from-cyan-400/18 via-blue-500/12 to-teal-600/8 rounded-full blur-2xl animate-float-diagonal"></div>

        {/* Medium Orbs with Pulsing Effects */}
        <div className="absolute top-10 right-32 w-48 h-48 bg-gradient-to-br from-emerald-400/25 via-green-500/15 to-teal-600/10 rounded-full blur-2xl animate-pulse-breathe"></div>
        <div className="absolute bottom-20 left-20 w-56 h-56 bg-gradient-to-tr from-orange-400/20 via-red-500/12 to-pink-600/8 rounded-full blur-2xl animate-float-wobble"></div>

        {/* Small Accent Orbs */}
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-yellow-400/30 via-orange-500/20 to-red-600/15 rounded-full blur-xl animate-spin-wobble"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-gradient-to-tr from-violet-400/25 via-purple-500/18 to-indigo-600/12 rounded-full blur-xl animate-bounce-float"></div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] animate-grid-shift">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="dynamicGrid" width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M 25 0 L 0 0 0 25" fill="none" stroke="white" strokeWidth="0.3" opacity="0.6"/>
                <circle cx="0" cy="0" r="1.5" fill="white" opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.8;0.2" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="12.5" cy="12.5" r="0.8" fill="cyan" opacity="0.3">
                  <animate attributeName="opacity" values="0.1;0.6;0.1" dur="4s" repeatCount="indefinite"/>
                </circle>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dynamicGrid)" />
          </svg>
        </div>

        {/* Complex Geometric Elements */}
        <div className="absolute top-16 right-16 w-28 h-28 border-2 border-white/15 rounded-2xl rotate-45 animate-spin-complex"></div>
        <div className="absolute top-32 left-32 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm rounded-full animate-pulse-glow"></div>
        <div className="absolute bottom-24 right-24 w-36 h-2 bg-gradient-to-r from-transparent via-white/25 via-cyan-400/20 to-transparent animate-slide-wave"></div>
        <div className="absolute top-1/2 left-8 w-24 h-24 border border-blue-300/20 rounded-full animate-ripple-expand"></div>

        {/* Dynamic Light Rays */}
        <div className="absolute top-0 left-1/5 w-0.5 h-full bg-gradient-to-b from-transparent via-white/15 via-blue-400/10 to-transparent animate-light-sweep"></div>
        <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-white/12 via-purple-400/8 to-transparent animate-light-sweep-reverse"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent animate-light-pulse"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-particle-float ${
                i % 4 === 0 ? 'w-1 h-1 bg-white/50' :
                i % 4 === 1 ? 'w-2 h-2 bg-blue-300/40' :
                i % 4 === 2 ? 'w-1.5 h-1.5 bg-cyan-300/45' :
                'w-0.5 h-0.5 bg-purple-300/35'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${5 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo ve Başlık - Mobil görünümde sorun yaşanmaması için düzenlenmiş yapı */}
        <div className="flex flex-col items-center justify-center mb-8">
          {/* Spectacular Logo with Multiple Effects */}
          <div className={`relative mb-6 transition-all duration-1000 ease-out ${animationComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/20 to-cyan-400/30 rounded-full blur-xl animate-pulse-glow-ring"></div>

            {/* Middle Ring */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/20 via-blue-300/15 to-purple-300/20 rounded-full blur-lg animate-spin-slow"></div>

            {/* Logo Container */}
            <div className="relative bg-gradient-to-br from-white/15 via-blue-100/10 to-purple-100/15 backdrop-blur-lg p-4 rounded-full shadow-2xl border border-white/20 animate-float-gentle">
              {/* Inner Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full animate-pulse-inner"></div>

              {/* Logo Icon */}
              <svg className="relative w-14 h-14 md:w-18 md:h-18 text-white drop-shadow-lg animate-icon-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>

              {/* Sparkle Effects */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-sparkle-1"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-sparkle-2"></div>
              <div className="absolute top-3 left-1 w-1 h-1 bg-blue-300 rounded-full animate-sparkle-3"></div>
            </div>
          </div>

          {/* Dynamic Title with Spectacular Effects */}
          <div className="text-center relative">
            {/* Background Glow for Title */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-2xl animate-title-glow"></div>

            {/* Main Title */}
            <h1 className={`relative text-2xl md:text-4xl font-bold mb-3 transition-all duration-1200 ease-out ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'}`}>
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent animate-text-shimmer">
                T.C. ADALET BAKANLIĞI
              </span>
              {/* Text Shadow Effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/20 to-cyan-400/30 bg-clip-text text-transparent blur-sm animate-text-glow"></span>
            </h1>

            {/* Subtitle with Typewriter Effect */}
            <h2 className={`relative text-base md:text-xl font-semibold transition-all duration-1200 delay-400 ease-out ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
              <span className="bg-gradient-to-r from-white/90 via-blue-100/80 to-cyan-100/90 bg-clip-text text-transparent animate-subtitle-reveal">
                Personel Tayin Talebi Yönetim Sistemi
              </span>
            </h2>

            {/* Decorative Elements */}
            <div className={`flex justify-center mt-4 space-x-2 transition-all duration-1000 delay-600 ease-out ${animationComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-line-expand"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse-dot"></div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-line-expand-reverse"></div>
            </div>
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
      
      {/* Ultra Dynamic CSS Animasyonları */}
      <style>{`
        /* Background Animations */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .bg-gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }

        /* Complex Float Animations */
        @keyframes float-complex {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(10px, -15px) rotate(2deg) scale(1.05); }
          50% { transform: translate(-5px, -25px) rotate(-1deg) scale(0.95); }
          75% { transform: translate(-15px, -10px) rotate(1deg) scale(1.02); }
        }

        @keyframes float-reverse-complex {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(-12px, 18px) rotate(-2deg) scale(0.98); }
          50% { transform: translate(8px, 30px) rotate(1.5deg) scale(1.03); }
          75% { transform: translate(18px, 12px) rotate(-1deg) scale(0.97); }
        }

        @keyframes float-diagonal {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -20px) rotate(3deg); }
        }

        @keyframes pulse-breathe {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: scale(1.1) rotate(2deg); opacity: 0.8; }
        }

        @keyframes float-wobble {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(8px, -12px) rotate(1deg) scale(1.02); }
          50% { transform: translate(-6px, -18px) rotate(-1.5deg) scale(0.98); }
          75% { transform: translate(-10px, -8px) rotate(0.5deg) scale(1.01); }
        }

        @keyframes spin-wobble {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.05); }
          50% { transform: rotate(180deg) scale(0.95); }
          75% { transform: rotate(270deg) scale(1.02); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes bounce-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }

        /* Grid and Geometric Animations */
        @keyframes grid-shift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2px, 2px); }
        }

        @keyframes spin-complex {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(0.9); }
          75% { transform: rotate(270deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes slide-wave {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        @keyframes ripple-expand {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Light and Ray Animations */
        @keyframes light-sweep {
          0% { opacity: 0; transform: translateY(-100%); }
          50% { opacity: 1; transform: translateY(0%); }
          100% { opacity: 0; transform: translateY(100%); }
        }

        @keyframes light-sweep-reverse {
          0% { opacity: 0; transform: translateY(100%); }
          50% { opacity: 1; transform: translateY(0%); }
          100% { opacity: 0; transform: translateY(-100%); }
        }

        @keyframes light-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }

        /* Particle Animations */
        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(10px, -20px) scale(1.2); opacity: 0.7; }
          50% { transform: translate(-15px, -40px) scale(0.8); opacity: 1; }
          75% { transform: translate(5px, -60px) scale(1.1); opacity: 0.5; }
        }

        /* Logo Spectacular Animations */
        @keyframes pulse-glow-ring {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }

        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse-inner {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }

        @keyframes icon-glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.3)); }
          50% { filter: drop-shadow(0 0 15px rgba(255,255,255,0.6)) drop-shadow(0 0 25px rgba(59,130,246,0.4)); }
        }

        @keyframes sparkle-1 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes sparkle-2 {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }

        @keyframes sparkle-3 {
          0%, 100% { opacity: 0; transform: scale(0); }
          33% { opacity: 1; transform: scale(1); }
          66% { opacity: 0; transform: scale(0); }
        }

        /* Title Spectacular Animations */
        @keyframes title-glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }

        @keyframes text-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes text-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }

        @keyframes subtitle-reveal {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes line-expand {
          0% { width: 0; opacity: 0; }
          50% { width: 2rem; opacity: 1; }
          100% { width: 2rem; opacity: 0.6; }
        }

        @keyframes line-expand-reverse {
          0% { width: 0; opacity: 0; }
          50% { width: 2rem; opacity: 1; }
          100% { width: 2rem; opacity: 0.6; }
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Animation Classes */
        .animate-float-complex { animation: float-complex 8s ease-in-out infinite; }
        .animate-float-reverse-complex { animation: float-reverse-complex 10s ease-in-out infinite; }
        .animate-float-diagonal { animation: float-diagonal 6s ease-in-out infinite; }
        .animate-pulse-breathe { animation: pulse-breathe 4s ease-in-out infinite; }
        .animate-float-wobble { animation: float-wobble 7s ease-in-out infinite; }
        .animate-spin-wobble { animation: spin-wobble 12s linear infinite; }
        .animate-bounce-float { animation: bounce-float 3s ease-in-out infinite; }
        .animate-grid-shift { animation: grid-shift 15s ease-in-out infinite; }
        .animate-spin-complex { animation: spin-complex 20s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-slide-wave { animation: slide-wave 4s ease-in-out infinite; }
        .animate-ripple-expand { animation: ripple-expand 2s ease-out infinite; }
        .animate-light-sweep { animation: light-sweep 6s ease-in-out infinite; }
        .animate-light-sweep-reverse { animation: light-sweep-reverse 8s ease-in-out infinite; }
        .animate-light-pulse { animation: light-pulse 3s ease-in-out infinite; }
        .animate-particle-float { animation: particle-float 8s ease-in-out infinite; }

        /* Logo Animation Classes */
        .animate-pulse-glow-ring { animation: pulse-glow-ring 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 30s linear infinite; }
        .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }
        .animate-pulse-inner { animation: pulse-inner 2s ease-in-out infinite; }
        .animate-icon-glow { animation: icon-glow 3s ease-in-out infinite; }
        .animate-sparkle-1 { animation: sparkle-1 2s ease-in-out infinite; }
        .animate-sparkle-2 { animation: sparkle-2 3s ease-in-out infinite 0.5s; }
        .animate-sparkle-3 { animation: sparkle-3 4s ease-in-out infinite 1s; }

        /* Title Animation Classes */
        .animate-title-glow { animation: title-glow 4s ease-in-out infinite; }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }
        .animate-text-glow { animation: text-glow 2s ease-in-out infinite; }
        .animate-subtitle-reveal { animation: subtitle-reveal 1s ease-out; }
        .animate-line-expand { animation: line-expand 2s ease-out infinite; }
        .animate-line-expand-reverse { animation: line-expand-reverse 2s ease-out infinite 1s; }
        .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        
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
