import React, { useState, useEffect } from 'react';
import { tayinService } from '../services/api';
import Select from 'react-select';
import { createPortal } from 'react-dom';

const TayinTalebiForm = () => {
  // Sayfa yüklendikten sonra document.body'yi erişilebilir yapmak için state
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const [talep, setTalep] = useState({
    talepTuru: '',
    aciklama: '',
    tercihler: [null, null, null]
  });
  
  const [adliyeler, setAdliyeler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [talepTuruError, setTalepTuruError] = useState('');
  const [tercihError, setTercihError] = useState('');

  // Adliyeleri yükle
  useEffect(() => {
    const fetchAdliyeler = async () => {
      try {
        // Veritabanından gerçek adliyeleri çek
        const data = await tayinService.getAdliyeler();
        
        // API'den gelen veri formatını react-select için uygun formata dönüştür
        const formattedData = data.map(adliye => ({
          value: adliye.id,
          label: adliye.adliyeAdi,
          data: {
            id: adliye.id,
            adliye_adi: adliye.adliyeAdi
          }
        }));
        
        setAdliyeler(formattedData);
      } catch (err) {
        console.error('Adliyeler yüklenirken hata oluştu:', err);
        setError('Adliye listesi yüklenirken bir hata oluştu.');
      }
    };

    fetchAdliyeler();
  }, []);

  // Form alanları değiştiğinde state'i güncelle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTalep({
      ...talep,
      [name]: value
    });
    
    // Talep türü değiştiğinde doğrulama yap
    if (name === 'talepTuru') {
      if (!value) {
        setTalepTuruError('Lütfen bir talep türü seçiniz');
      } else {
        setTalepTuruError('');
      }
    }
  };

  // Tercih sıralaması değiştiğinde state'i güncelle
  const handleTercihChange = (selectedOption, index) => {
    const newTercihler = [...talep.tercihler];
    newTercihler[index] = selectedOption ? selectedOption.value : null;
    
    // Eğer aynı adliye başka bir tercihte seçilmişse, onu sıfırla
    if (selectedOption) {
      newTercihler.forEach((tercih, idx) => {
        if (idx !== index && tercih === selectedOption.value) {
          newTercihler[idx] = null;
        }
      });
    }
    
    setTalep({
      ...talep,
      tercihler: newTercihler
    });
    
    // Tercih değişikliğinde doğrulama yap
    const validTercihler = newTercihler.filter(t => t !== null);
    if (validTercihler.length === 0) {
      setTercihError('Lütfen en az bir adliye tercihi yapınız');
    } else {
      setTercihError('');
    }
  };
  
  // Belirli bir tercih sırası için kullanılabilir adliyeleri filtrele
  const getFilteredAdliyeler = (currentIndex) => {
    // Mevcut tercih hariç tüm tercihlerde seçilen adliyelerin ID'lerini al
    const selectedAdliyeIds = talep.tercihler
      .map((tercih, idx) => idx !== currentIndex ? tercih : null) // Mevcut tercih hariç tüm tercihleri al
      .filter(id => id !== null); // Boş olanları filtrele
    
    // Diğer tercihlerde seçilen adliyeleri filtreleyerek çıkar
    return adliyeler.filter(adliye => !selectedAdliyeIds.includes(adliye.value));
  };

  // Formu gönder
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hata durumlarını temizle
    setError('');
    
    // Tercih kontrolü
    const validTercihler = talep.tercihler.filter(t => t !== null);
    if (validTercihler.length === 0) {
      setTercihError('Lütfen en az bir adliye tercihi yapınız.');
      setError('Lütfen formdaki hataları düzeltiniz.');
      return;
    }
    
    if (!talep.talepTuru) {
      setTalepTuruError('Lütfen talep türünü seçiniz.');
      setError('Lütfen formdaki hataları düzeltiniz.');
      return;
    }
    
    setLoading(true);
    setError('');
    setTalepTuruError('');
    setTercihError('');
    
    try {
      // Tayin talebini oluşturacak veriyi hazırla
      const talepData = {
        TalepTuru: talep.talepTuru,  // Backend'in beklediği format: Pascal case
        Aciklama: talep.aciklama,    // Backend'in beklediği format: Pascal case
        Tercihler: talep.tercihler
          .filter(t => t !== null)
          .map((adliyeId, index) => ({
            AdliyeId: adliyeId,      // Backend'in beklediği format: Pascal case
            TercihSirasi: index + 1  // Backend'in beklediği format: Pascal case
          }))
      };
      
      console.log('Gönderilecek tayin talebi:', talepData);
      
      // Gerçek API üzerinden tayin talebi oluştur
      const response = await tayinService.createTayinTalebi(talepData);
      console.log('Tayin talebi başarıyla oluşturuldu:', response);
      
      setSuccess(true);
      setTalep({
        talepTuru: '',
        aciklama: '',
        tercihler: [null, null, null]
      });
      setLoading(false);
    } catch (err) {
      console.error('Tayin talebi oluşturulurken hata:', err);
      setError('Tayin talebi oluşturulurken bir hata meydana geldi.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      {success ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
              <svg className="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">Başarılı!</h3>
              <p className="text-base text-green-700 mb-4">
                Tayin talebiniz başarıyla oluşturuldu. Talebiniz incelendikten sonra size bilgi verilecektir.
              </p>
              <button 
                onClick={() => setSuccess(false)} 
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Yeni bir talep oluştur
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 p-1 rounded-full mr-3">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="talepTuru" className="form-label flex items-center mb-2">
              <div className="bg-primary-100 text-primary-700 p-1.5 rounded-md mr-2">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Talep Türü <span className="text-red-500">*</span></span>
            </label>
            <div className="relative">
              <select
                id="talepTuru"
                name="talepTuru"
                value={talep.talepTuru}
                onChange={handleChange}
                className={`form-input pl-10 ${talepTuruError ? 'border-red-500 text-red-600' : ''}`}
              >
                <option value="">Seçiniz</option>
                <option value="Sağlık Nedeniyle">Sağlık Nedeniyle</option>
                <option value="Eş Durumu">Eş Durumu</option>
                <option value="İsteğe Bağlı">İsteğe Bağlı</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="aciklama" className="form-label flex items-center mb-2">
              <div className="bg-primary-100 text-primary-700 p-1.5 rounded-md mr-2">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span>Açıklama</span>
            </label>
            <div className="relative">
              <textarea
                id="aciklama"
                name="aciklama"
                value={talep.aciklama}
                onChange={handleChange}
                className="form-input min-h-[120px] pl-10"
                placeholder="Tayin talebinizin nedenini açıklayınız..."
              ></textarea>
              <div className="absolute top-3 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="form-label flex items-center mb-2">
              <div className="bg-primary-100 text-primary-700 p-1.5 rounded-md mr-2">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span>Tercih Ettiğiniz Adliyeler <span className="text-red-500">*</span></span>
            </label>
            <p className="text-sm text-gray-500 mb-3 ml-9">
              Lütfen tayin olmak istediğiniz adliyeleri öncelik sırasına göre seçiniz.
            </p>
            {tercihError && (
              <div className="mb-3 flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md border-l-4 border-red-500 animate-fade-in transition-all duration-300 ease-in-out">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{tercihError}</span>
              </div>
            )}
            
            {[0, 1, 2].map((index) => (
              <div key={index} className="mb-3">
                <label className="form-label text-sm flex items-center mb-1">
                  <div className="bg-primary-50 text-primary-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 font-medium">
                    {index + 1}
                  </div>
                  <span>{index + 1}. Tercih</span>
                </label>
                <Select
                  value={adliyeler.find(option => option.value === talep.tercihler[index]) || null}
                  onChange={(selectedOption) => handleTercihChange(selectedOption, index)}
                  options={getFilteredAdliyeler(index)}
                  isClearable
                  isSearchable
                  placeholder="Adliye seçiniz veya arayınız..."
                  noOptionsMessage={() => "Sonuç bulunamadı"}
                  classNamePrefix="react-select"
                  className="react-select-container"
                  // Son tercih için menüyü yukarı doğru açarak sayfa kaymasını önle
                  menuPlacement={index === 2 ? "top" : "auto"}
                  // Menü portal ayarları - menüyü body'ye taşır
                  menuPortalTarget={mounted ? document.body : null}
                  // Otomatik scroll'u devre dışı bırak
                  menuShouldScrollIntoView={false}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      minHeight: '42px',
                      borderColor: tercihError ? '#ef4444' : state.isFocused ? '#818cf8' : '#e2e8f0',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: tercihError ? '#ef4444' : state.isFocused ? '#818cf8' : '#cbd5e0'
                      }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f1f1ff' : 'white',
                      color: state.isSelected ? 'white' : '#4a5568',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#6366f1' : '#f1f1ff',
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 50,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      backgroundColor: tercihError ? 'rgba(254, 242, 242, 0.2)' : 'transparent'
                    })
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Talebi Oluştur
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TayinTalebiForm;

// CSS için stil tanımlamaları
document.head.appendChild(document.createElement('style')).textContent = `
@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
`;
