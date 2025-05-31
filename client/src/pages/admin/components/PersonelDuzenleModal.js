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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
      style={{ zIndex: 9999, overflow: 'hidden' }}
    >
      <div className="relative w-full h-full max-w-3xl mx-auto flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-auto">
          {/* Modal Başlık */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-xl font-semibold text-gray-800">
              Personel Bilgilerini Düzenle
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal İçerik */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Yükleniyor...</span>
              </div>
            ) : (
            <form onSubmit={handleSubmit}>
              {/* Temel Bilgiler */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Temel Bilgiler</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sicilNo">
                      Sicil No
                    </label>
                    <input
                      type="text"
                      id="sicilNo"
                      value={personel?.sicilNo || ''}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ad">
                      Ad
                    </label>
                    <input
                      type="text"
                      id="ad"
                      name="ad"
                      value={formData.ad}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="soyad">
                      Soyad
                    </label>
                    <input
                      type="text"
                      id="soyad"
                      name="soyad"
                      value={formData.soyad}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unvan">
                      Unvan
                    </label>
                    <input
                      type="text"
                      id="unvan"
                      name="unvan"
                      value={formData.unvan}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">İletişim Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="telefon">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Kurum Bilgileri */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Kurum Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="mevcutAdliyeId">
                      Mevcut Adliye
                    </label>
                    <select
                      id="mevcutAdliyeId"
                      name="mevcutAdliyeId"
                      value={formData.mevcutAdliyeId || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="baslamaTarihi">
                      Başlama Tarihi
                    </label>
                    <input
                      type="date"
                      id="baslamaTarihi"
                      name="baslamaTarihi"
                      value={formData.baslamaTarihi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dogumTarihi">
                      Doğum Tarihi
                    </label>
                    <input
                      type="date"
                      id="dogumTarihi"
                      name="dogumTarihi"
                      value={formData.dogumTarihi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Şifre Güncelleme */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Şifre Güncelleme</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="yeniSifre">
                    Yeni Şifre (Boş bırakılırsa güncellenmez)
                  </label>
                  <input
                    type="password"
                    id="yeniSifre"
                    name="yeniSifre"
                    value={formData.yeniSifre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Yeni şifre girin (değiştirmek istemiyorsanız boş bırakın)"
                  />
                </div>
              </div>

              {/* Form Düğmeleri */}
              <div className="flex justify-end gap-3 mt-8 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={saving}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center"
                  disabled={saving}
                >
                  {saving && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Kaydet
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
