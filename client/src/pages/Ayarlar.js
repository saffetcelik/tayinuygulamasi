import React, { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Ayarlar = () => {
  const [mevcutSifre, setMevcutSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSifreDegistir = async (e) => {
    e.preventDefault();
    
    // Doğrulama kontrolleri
    if (!mevcutSifre || !yeniSifre || !yeniSifreTekrar) {
      toast.error('Tüm alanları doldurunuz');
      return;
    }
    
    if (yeniSifre !== yeniSifreTekrar) {
      toast.error('Yeni şifre ve tekrarı eşleşmiyor');
      return;
    }
    
    if (yeniSifre.length < 4) {
      toast.error('Yeni şifre en az 4 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.changePassword(mevcutSifre, yeniSifre);
      toast.success('Şifreniz başarıyla değiştirildi');
      setMevcutSifre('');
      setYeniSifre('');
      setYeniSifreTekrar('');
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      
      if (error.response) {
        // Sunucudan dönen hata mesajı
        if (error.response.status === 401) {
          toast.error('Mevcut şifreniz hatalı');
        } else {
          toast.error(error.response.data || 'Şifre değiştirme işlemi başarısız oldu');
        }
      } else {
        toast.error('Şifre değiştirme sırasında bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Modern Şifre Değiştirme Kartı */}
      <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
        {/* Card Header - Soft Tasarım */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border-b border-gray-200/50 px-8 py-6">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-xl mr-4">
              <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Şifre Değiştir</h2>
              <p className="text-gray-600 text-sm">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8">
          <form onSubmit={handleSifreDegistir} className="space-y-6">
            {/* Mevcut Şifre */}
            <div className="group">
              <label htmlFor="mevcutSifre" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                <div className="bg-gray-100 p-2 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </div>
                Mevcut Şifre <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                id="mevcutSifre"
                value={mevcutSifre}
                onChange={(e) => setMevcutSifre(e.target.value)}
                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Mevcut şifrenizi giriniz"
                required
              />
            </div>

            {/* Yeni Şifre */}
            <div className="group">
              <label htmlFor="yeniSifre" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                <div className="bg-green-100 p-2 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                Yeni Şifre <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                id="yeniSifre"
                value={yeniSifre}
                onChange={(e) => setYeniSifre(e.target.value)}
                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Yeni şifrenizi giriniz (en az 4 karakter)"
                required
                minLength={4}
              />
              <p className="mt-2 text-xs text-gray-500">Şifreniz en az 4 karakter olmalıdır.</p>
            </div>

            {/* Yeni Şifre Tekrar */}
            <div className="group">
              <label htmlFor="yeniSifreTekrar" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
                <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                Yeni Şifre Tekrar <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                id="yeniSifreTekrar"
                value={yeniSifreTekrar}
                onChange={(e) => setYeniSifreTekrar(e.target.value)}
                className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Yeni şifrenizi tekrar giriniz"
                required
                minLength={4}
              />
              {yeniSifre && yeniSifreTekrar && (
                <div className="mt-2 flex items-center">
                  {yeniSifre === yeniSifreTekrar ? (
                    <div className="flex items-center text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Şifreler eşleşiyor</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium">Şifreler eşleşmiyor</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading || (yeniSifre && yeniSifreTekrar && yeniSifre !== yeniSifreTekrar)}
                className={`group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 hover:-translate-y-1 ${loading ? 'animate-pulse' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="bg-white/20 p-1 rounded-lg">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span>İşlem yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Şifreyi Değiştir</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Güvenlik İpuçları Kartı */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-xl mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-800">Güvenlik İpuçları</h3>
            <p className="text-sm text-blue-600">Hesabınızı güvende tutmak için</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg mt-1">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Güçlü Şifre</p>
              <p className="text-xs text-blue-600">En az 8 karakter, büyük-küçük harf ve rakam kullanın</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-yellow-100 p-2 rounded-lg mt-1">
              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Düzenli Değiştirin</p>
              <p className="text-xs text-blue-600">Şifrenizi düzenli aralıklarla güncelleyin</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-red-100 p-2 rounded-lg mt-1">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Paylaşmayın</p>
              <p className="text-xs text-blue-600">Şifrenizi kimseyle paylaşmayın</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg mt-1">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Benzersiz Olsun</p>
              <p className="text-xs text-blue-600">Her hesap için farklı şifre kullanın</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ayarlar;
