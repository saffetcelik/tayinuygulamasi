import React, { useState, useEffect } from 'react';
import { tayinService } from '../services/api';
import Select from 'react-select';
import Swal from 'sweetalert2';
import TurkeyMap from './TurkeyMap';
import './TayinTalebiForm.css';

const TayinTalebiForm = ({ setActiveTab }) => {
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
  const [error, setError] = useState('');
  const [talepTuruError, setTalepTuruError] = useState('');
  const [tercihError, setTercihError] = useState('');
  const [highlightSubmitButton, setHighlightSubmitButton] = useState(false);

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
    
    // 3. tercih de seçildiyse butonu vurgula
    if (validTercihler.length === 3) {
      setHighlightSubmitButton(true);
      // Artık butona tıklanana kadar animasyon devam edecek
    }
  };
  
  // Haritadan il seçme işleyicisi
  const handleIlSelect = (ilAdi) => {
    // İl adına göre adliyeleri filtrele
    const ilAdliyeleri = adliyeler.filter(adliye => {
      // Adliye adından il adını çıkar (örn: "Ankara Adliyesi" -> "Ankara")
      const adliyeIlAdi = adliye.label.split(' ')[0];
      return adliyeIlAdi.toLowerCase() === ilAdi.toLowerCase();
    });
    
    if (ilAdliyeleri.length === 0) {
      setTercihError(`${ilAdi} ilinde adliye bulunamadı.`);
      setTimeout(() => setTercihError(''), 3000);
      return;
    }
    
    // İlk boş tercih alanını bul
    const emptyIndex = talep.tercihler.findIndex(tercihId => tercihId === null);
    
    // Tüm tercihler doluysa ve maksimum tercih sayısına ulaşıldıysa uyarı göster
    if (emptyIndex === -1) {
      setTercihError(`Maksimum 3 tercih yapabilirsiniz. Yeni tercih yapmak için önce bir tercihi temizleyin.`);
      setTimeout(() => setTercihError(''), 3000);
      return;
    }
    
    // İlden bir adliye zaten seçilmiş mi kontrol et
    const isAlreadySelected = talep.tercihler.some(tercihId => {
      if (!tercihId) return false;
      const tercih = adliyeler.find(a => a.value === tercihId);
      if (!tercih) return false;
      const tercihIlAdi = tercih.label.split(' ')[0];
      return tercihIlAdi.toLowerCase() === ilAdi.toLowerCase();
    });
    
    if (isAlreadySelected) {
      setTercihError(`${ilAdi} ilinden bir adliye zaten tercihlerinizde bulunuyor.`);
      setTimeout(() => setTercihError(''), 3000);
      return;
    }
    
    // Bulduğumuz boş alana adliyeyi ekle
    const newTercihler = [...talep.tercihler];
    newTercihler[emptyIndex] = ilAdliyeleri[0].value;
    
    setTalep({
      ...talep,
      tercihler: newTercihler
    });
    
    // 3. tercih de seçildiyse butonu vurgula
    const validTercihler = newTercihler.filter(t => t !== null);
    if (validTercihler.length === 3) {
      setHighlightSubmitButton(true);
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
    // Form gönderildiğinde animasyonu durdur
    setHighlightSubmitButton(false);
    
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
      
      // Form verilerini sıfırla
      setTalep({
        talepTuru: '',
        aciklama: '',
        tercihler: [null, null, null]
      });
      setLoading(false);
      
      // SweetAlert2 ile başarı mesajı göster ve tamam butonuna tıklandığında yönlendir
      Swal.fire({
        title: 'Başarılı!',
        text: 'Tayin talebiniz başarıyla oluşturuldu.',
        icon: 'success',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#3B82F6'
      }).then((result) => {
        if (result.isConfirmed) {
          // Tamam butonuna tıklandığında Tayin Taleplerim sayfasına yönlendir
          // Sayfa yenilenmesini önlemek için navigate yerine setActiveTab kullan
          setActiveTab('list');
        }
      });
    } catch (err) {
      console.error('Tayin talebi oluşturulurken hata:', err);
      setError('Tayin talebi oluşturulurken bir hata meydana geldi.');
      setLoading(false);
    }
  };



  return (
    <>
      <div className="max-w-7xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
          <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800">Tayin Talebi Oluştur</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg animate-fade-in">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <label
                htmlFor="talepTuru"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Talep Türü
              </label>
              <div className="relative">
                <select
                  id="talepTuru"
                  name="talepTuru"
                  value={talep.talepTuru}
                  onChange={handleChange}
                  className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none"
                >
                  <option value="">Talep türü seçiniz</option>
                  <option value="Mazeret">Mazeret</option>
                  <option value="Sağlık">Sağlık</option>
                  <option value="Eş Durumu">Eş Durumu</option>
                  <option value="Diğer">Diğer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              {talepTuruError && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{talepTuruError}</p>
              )}
            </div>
            
            <div className="relative">
              <label
                htmlFor="aciklama"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Açıklama
              </label>
              <textarea
                id="aciklama"
                name="aciklama"
                rows="3"
                value={talep.aciklama}
                onChange={handleChange}
                className="block w-full py-2.5 px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Tayin talebinizle ilgili açıklamanızı giriniz"
              ></textarea>
            </div>
          </div>
          
          <div className="pt-4">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Tercih Ettiğiniz Adliyeler <span className="text-red-500">*</span></h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 ml-7">
              Lütfen tayin olmak istediğiniz adliyeleri öncelik sırasına göre seçiniz.
            </p>
            
            {tercihError && (
              <div className="mb-3 flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md border-l-4 border-red-500 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{tercihError}</span>
              </div>
            )}
            
            <div className="space-y-4">
              {talep.tercihler.map((tercihId, index) => (
                <div className="relative bg-white rounded-lg p-4 border border-gray-200 shadow-sm tercih-kutusu hover:border-blue-300 transition-all duration-200" key={index}>
                  <div className="absolute -top-2 left-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {index + 1}. Tercih
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <Select
                      inputId={`tercih-${index + 1}`}
                      value={adliyeler.find(a => a.value === tercihId)}
                      onChange={(selected) => handleTercihChange(selected, index)}
                      options={getFilteredAdliyeler(index)}
                      isClearable={true} // Tüm tercihler için temizleme ikonu göster
                      placeholder="Adliye seçiniz"
                      isDisabled={loading}
                      className="basic-single"
                      classNamePrefix="select"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: '0.5rem',
                          border: '1px solid #e2e8f0',
                          padding: '2px',
                          boxShadow: 'none',
                          '&:hover': {
                            border: '1px solid #cbd5e1',
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : null,
                          color: state.isSelected ? 'white' : '#1e293b',
                        }),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6 mb-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center ${highlightSubmitButton ? 'highlight-button' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Talebi Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
          
          <TurkeyMap 
            tercihler={talep.tercihler.map((tercihId) => {
              if (!tercihId) return null;
              return adliyeler.find(a => a.value === tercihId);
            }).filter(t => t !== null)} 
            onIlSelect={handleIlSelect}
            maxTercih={3}
          />
        </form>
      </div>
    </>
  );
};

export default TayinTalebiForm;
