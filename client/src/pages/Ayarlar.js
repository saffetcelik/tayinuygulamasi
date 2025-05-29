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
    <div className="container mx-auto p-4 md:p-6">

      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Şifre Değiştir</h2>
        
        <form onSubmit={handleSifreDegistir} className="space-y-4">
          <div>
            <label htmlFor="mevcutSifre" className="block text-sm font-medium text-gray-700 mb-1">
              Mevcut Şifre
            </label>
            <input
              type="password"
              id="mevcutSifre"
              value={mevcutSifre}
              onChange={(e) => setMevcutSifre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="yeniSifre" className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre
            </label>
            <input
              type="password"
              id="yeniSifre"
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={4}
            />
          </div>
          
          <div>
            <label htmlFor="yeniSifreTekrar" className="block text-sm font-medium text-gray-700 mb-1">
              Yeni Şifre Tekrar
            </label>
            <input
              type="password"
              id="yeniSifreTekrar"
              value={yeniSifreTekrar}
              onChange={(e) => setYeniSifreTekrar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={4}
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'İşlem yapılıyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Ayarlar;
