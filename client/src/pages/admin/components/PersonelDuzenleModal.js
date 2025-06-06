import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/api';

const PersonelDuzenleModal = ({ personelId, isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personel, setPersonel] = useState(null);
  const [adliyeler, setAdliyeler] = useState([]);
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    unvan: '',
    email: '',
    telefon: '',
    mevcutAdliyeId: null,
    dogumTarihi: '',
    baslamaTarihi: '',
    yeniSifre: ''
  });

  // Personel detaylarını yükle
  useEffect(() => {
    if (isOpen && personelId) {
      loadPersonelData();
    }
  }, [isOpen, personelId]);

  const loadPersonelData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPersonelById(personelId);
      console.log('Personel detay yanıtı:', response); // Yanıtı kontrol etmek için log
      
      // Adliyeleri kaydet
      setAdliyeler(response.adliyeler || []);
      
      // Personel verilerini ayarla
      const p = response.personel;
      if (p) {
        setPersonel(p);
        
        // Form verilerini başlat
        setFormData({
          ad: p.ad || '',
          soyad: p.soyad || '',
          unvan: p.unvan || '',
          email: p.email || '',
          telefon: p.telefon || '',
          mevcutAdliyeId: p.mevcutAdliyeId || null,
          dogumTarihi: p.dogumTarihi ? new Date(p.dogumTarihi).toISOString().split('T')[0] : '',
          baslamaTarihi: p.baslamaTarihi ? new Date(p.baslamaTarihi).toISOString().split('T')[0] : '',
          yeniSifre: ''
        });
      }
    } catch (error) {
      console.error('Personel verileri yüklenemedi:', error);
      toast.error('Personel bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Form input değişikliklerini işle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Formu gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Form verilerini API'ye uygun formata dönüştür
      const updateData = {
        ad: formData.ad,
        soyad: formData.soyad,
        unvan: formData.unvan,
        email: formData.email,
        telefon: formData.telefon,
        mevcutAdliyeId: formData.mevcutAdliyeId ? parseInt(formData.mevcutAdliyeId) : null,
        dogumTarihi: formData.dogumTarihi ? new Date(formData.dogumTarihi).toISOString() : null,
        baslamaTarihi: formData.baslamaTarihi ? new Date(formData.baslamaTarihi).toISOString() : null,
        yeniSifre: formData.yeniSifre || null
      };
      
      // Güncelleme API çağrısını yap
      await adminService.updatePersonel(personelId, updateData);
      
      toast.success('Personel bilgileri başarıyla güncellendi.');
      onSave && onSave(); // Callback fonksiyonu çağır
      onClose(); // Modalı kapat
    } catch (error) {
      console.error('Personel güncellenirken hata:', error);
      toast.error('Personel bilgileri güncellenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  
  // Modal açıldığında konsola log yazdır
  console.log('Personel düzenle modalı açılıyor');

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      style={{ zIndex: 9999, overflow: 'hidden' }}
    >
      <div className="relative w-full h-full max-w-4xl mx-auto flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto border border-gray-200/50">
          {/* Modern Modal Başlık */}
          <div className="relative bg-gradient-to-br from-slate-50 to-gray-100/80 px-8 py-6 border-b border-gray-200/50 sticky top-0 z-10 rounded-t-2xl">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full -translate-y-16 translate-x-16"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-xl border border-primary-200/50 mr-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Personel Bilgilerini Düzenle</h3>
                  <p className="text-gray-600 text-sm mt-1">Personel bilgilerini güncelleyin ve değişiklikleri kaydedin</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal İçerik */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
                <span className="ml-4 text-gray-600 text-lg">Yükleniyor...</span>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Temel Bilgiler */}
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-2.5 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Temel Bilgiler</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="sicilNo">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      Sicil No
                    </label>
                    <input
                      type="text"
                      id="sicilNo"
                      value={personel?.sicilNo || ''}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="ad">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Ad
                    </label>
                    <input
                      type="text"
                      id="ad"
                      name="ad"
                      value={formData.ad}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="soyad">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="soyad"
                      name="soyad"
                      value={formData.soyad}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="unvan">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                      </svg>
                      Unvan
                    </label>
                    <input
                      type="text"
                      id="unvan"
                      name="unvan"
                      value={formData.unvan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-2.5 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">İletişim Bilgileri</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="telefon">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Kurum Bilgileri */}
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 p-2.5 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Kurum Bilgileri</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="mevcutAdliyeId">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Mevcut Adliye
                    </label>
                    <select
                      id="mevcutAdliyeId"
                      name="mevcutAdliyeId"
                      value={formData.mevcutAdliyeId || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    >
                      <option value="">Seçiniz</option>
                      {adliyeler.map(adliye => (
                        <option key={adliye.id} value={adliye.id}>
                          {adliye.adliyeAdi}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="baslamaTarihi">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Başlama Tarihi
                    </label>
                    <input
                      type="date"
                      id="baslamaTarihi"
                      name="baslamaTarihi"
                      value={formData.baslamaTarihi}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="dogumTarihi">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      id="dogumTarihi"
                      name="dogumTarihi"
                      value={formData.dogumTarihi}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Şifre Güncelleme */}
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="bg-orange-100 p-2.5 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Şifre Güncelleme</h4>
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2" htmlFor="yeniSifre">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Yeni Şifre (Boş bırakılırsa güncellenmez)
                  </label>
                  <input
                    type="password"
                    id="yeniSifre"
                    name="yeniSifre"
                    value={formData.yeniSifre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    placeholder="Yeni şifre girin (değiştirmek istemiyorsanız boş bırakın)"
                  />
                </div>
              </div>

              {/* Modern Form Düğmeleri */}
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200 font-medium"
                  disabled={saving}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  disabled={saving}
                >
                  {saving ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonelDuzenleModal;
