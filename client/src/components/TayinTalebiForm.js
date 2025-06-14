import React, { useState, useEffect } from 'react';
import { tayinService } from '../services/api';
import Select from 'react-select';
import Swal from 'sweetalert2';
import TurkeyMap from './TurkeyMap';
import { toast } from 'react-toastify';
import { useDarkMode } from '../context/DarkModeContext';

import './TayinTalebiForm.css';

const TayinTalebiForm = ({ setActiveTab }) => {
  const { isDarkMode } = useDarkMode();

  const [talep, setTalep] = useState({
    talepTuru: '',
    aciklama: '',
    tercihler: [null]
  });
  
  const [adliyeler, setAdliyeler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [talepTuruError, setTalepTuruError] = useState('');
  const [tercihError, setTercihError] = useState('');
  const [highlightSubmitButton, setHighlightSubmitButton] = useState(false);
  const [showMapSubmitButton, setShowMapSubmitButton] = useState(false);
  const [showMapTercihPanel, setShowMapTercihPanel] = useState(false);

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
        const errorMsg = 'Adliye listesi yüklenirken bir hata oluştu.';
        setError(errorMsg);
        toast.error(errorMsg);
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
        const errorMsg = 'Lütfen bir talep türü seçiniz';
        setTalepTuruError(errorMsg);
        toast.error(errorMsg);
      } else {
        setTalepTuruError('');
        // Talep türü seçildi ve tercih varsa floating buton ve panel göster
        const validTercihler = talep.tercihler.filter(t => t !== null);
        if (validTercihler.length > 0) {
          setShowMapSubmitButton(true);
          setShowMapTercihPanel(true);
        }
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
      const errorMsg = 'Lütfen en az bir adliye tercihi yapınız';
      setTercihError(errorMsg);
      toast.error(errorMsg);
      setShowMapSubmitButton(false); // Tercih yoksa floating buton gizle
      setShowMapTercihPanel(false); // Tercih yoksa panel gizle
    } else {
      setTercihError('');

      // En az bir geçerli tercih varsa butonu vurgula - kullanıcı tıklayana kadar devam edecek
      setHighlightSubmitButton(true);
      setShowMapSubmitButton(true); // Tercih varsa floating buton göster
      setShowMapTercihPanel(true); // Tercih varsa panel göster
    }
  };
  
  // Yeni tercih alanı ekleme
  const handleAddTercih = () => {
    if (talep.tercihler.length < 3) {
      const newTercihler = [...talep.tercihler, null];
      setTalep({
        ...talep,
        tercihler: newTercihler
      });

    } else {

    }
  };
  
  // Tercih alanını kaldırma
  const handleRemoveTercih = (index) => {
    if (talep.tercihler.length > 1) {
      const newTercihler = [...talep.tercihler];
      newTercihler.splice(index, 1);
      setTalep({
        ...talep,
        tercihler: newTercihler
      });

    } else {

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
      const errorMsg = `${ilAdi} ilinde adliye bulunamadı.`;
      setTercihError(errorMsg);
      toast.error(errorMsg);

      setTimeout(() => setTercihError(''), 3000);
      return;
    }
    
    // İlk boş tercih alanını bul
    const emptyIndex = talep.tercihler.findIndex(tercihId => tercihId === null);
    
    // Tüm mevcut tercihler doluysa
    if (emptyIndex === -1) {
      // Eğer maksimum tercih sayısına ulaşılmadıysa yeni tercih ekle
      if (talep.tercihler.length < 3) {
        const newTercihler = [...talep.tercihler, ilAdliyeleri[0].value];
        setTalep({
          ...talep,
          tercihler: newTercihler
        });

        return;
      } else {
        // Maksimum tercih sayısına ulaşıldıysa uyarı göster
        const errorMsg = `Maksimum 3 tercih yapabilirsiniz. Yeni tercih yapmak için önce bir tercihi temizleyin.`;
        setTercihError(errorMsg);
        toast.error(errorMsg);

        setTimeout(() => setTercihError(''), 3000);
        return;
      }
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
      const errorMsg = `${ilAdi} ilinden bir adliye zaten tercihlerinizde bulunuyor.`;
      setTercihError(errorMsg);
      toast.error(errorMsg);

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
    
    // Eğer geçerli tercihler varsa butonu vurgula ve harita butonunu göster
    const validTercihler = newTercihler.filter(t => t !== null);
    if (validTercihler.length > 0) {
      setHighlightSubmitButton(true);
      setShowMapSubmitButton(true); // Haritadan tercih yapıldığında floating buton göster
      setShowMapTercihPanel(true); // Haritadan tercih yapıldığında panel göster
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
      const tercihErrorMsg = 'Lütfen en az bir adliye tercihi yapınız.';
      const formErrorMsg = 'Lütfen formdaki hataları düzeltiniz.';
      setTercihError(tercihErrorMsg);
      setError(formErrorMsg);
      toast.error(tercihErrorMsg);

      // Floating buton'u geri göster çünkü form geçersiz
      setShowMapSubmitButton(false);
      return;
    }

    if (!talep.talepTuru) {
      const talepTuruErrorMsg = 'Lütfen talep türünü seçiniz.';
      const formErrorMsg = 'Lütfen formdaki hataları düzeltiniz.';
      setTalepTuruError(talepTuruErrorMsg);
      setError(formErrorMsg);
      toast.error(talepTuruErrorMsg);

      // Tercih var ama talep türü yok, floating buton'u geri göster
      setShowMapSubmitButton(true);
      return;
    }

    // Form geçerli, şimdi animasyonu durdur ve floating buton/panel gizle
    setHighlightSubmitButton(false);
    setShowMapSubmitButton(false);
    setShowMapTercihPanel(false);
    
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
        tercihler: [null]
      });
      setLoading(false);
      setShowMapSubmitButton(false); // Floating buton gizle
      setShowMapTercihPanel(false); // Panel gizle
      

      
      // SweetAlert2 ile başarı mesajı göster ve tamam butonuna tıklandığında yönlendir
      Swal.fire({
        title: `<div class="flex items-center justify-center"><div class="bg-green-100 ${isDarkMode ? 'dark:bg-green-900/30' : ''} p-3 rounded-xl mr-3"><svg class="w-6 h-6 text-green-600 ${isDarkMode ? 'dark:text-green-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div><span class="${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Başarılı!</span></div>`,
        html: `<p class="text-gray-700 ${isDarkMode ? 'dark:text-gray-300' : ''}">Tayin talebiniz başarıyla oluşturuldu.</p>`,
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#10b981',
        background: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
        customClass: {
          confirmButton: 'px-6 py-2 rounded-lg font-medium',
          popup: 'rounded-2xl'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Tamam butonuna tıklandığında Tayin Taleplerim sayfasına yönlendir
          // Sayfa yenilenmesini önlemek için navigate yerine setActiveTab kullan
          setActiveTab('list');
        }
      });
    } catch (err) {
      console.error('Tayin talebi oluşturulurken hata:', err);
      const errorMsg = 'Tayin talebi oluşturulurken bir hata meydana geldi.';
      setError(errorMsg);
      toast.error(errorMsg);

      setLoading(false);
      // Hata durumunda floating buton ve panel'i geri göster
      const validTercihler = talep.tercihler.filter(t => t !== null);
      if (validTercihler.length > 0) {
        setShowMapSubmitButton(true);
        setShowMapTercihPanel(true);
      }
    }
  };



  return (
    <>
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800/30 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 overflow-hidden">
        {/* Modern Header - Soft Kurumsal */}
        <div className="relative bg-gradient-to-br from-slate-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50 px-8 py-6">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500 rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          <div className="relative z-10 flex items-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl border border-primary-200/50 dark:border-primary-700/50 mr-4">
              <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1 modern-gradient-title">Tayin Talebi Oluştur</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Yeni tayin talebinizi oluşturun ve tercihlerinizi belirleyin</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
        
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 p-4 mb-6 rounded-xl animate-fade-in shadow-sm">
            <div className="flex items-center">
              <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-lg mr-3">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Corporate Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Talep Türü Card */}
            <div className="group bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-700/30 p-6 rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-all duration-200">
              <label
                htmlFor="talepTuru"
                className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3"
              >
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3 group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                Talep Türü <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  id="talepTuru"
                  name="talepTuru"
                  value={talep.talepTuru}
                  onChange={handleChange}
                  className="block w-full py-3 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 appearance-none hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <option value="">Talep türü seçiniz</option>
                  <option value="Mazeret">Mazeret</option>
                  <option value="Sağlık">Sağlık</option>
                  <option value="Eş Durumu">Eş Durumu</option>
                  <option value="Diğer">Diğer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              {talepTuruError && (
                <div className="mt-2 flex items-center text-red-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">{talepTuruError}</p>
                </div>
              )}
            </div>

            {/* Açıklama Card */}
            <div className="group bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-700/30 p-6 rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-all duration-200">
              <label
                htmlFor="aciklama"
                className="flex items-center text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3"
              >
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                Açıklama
              </label>
              <textarea
                id="aciklama"
                name="aciklama"
                rows="4"
                value={talep.aciklama}
                onChange={handleChange}
                className="block w-full py-3 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 resize-none"
                placeholder="Tayin talebinizle ilgili açıklamanızı giriniz..."
              ></textarea>
            </div>
          </div>
          
          {/* Corporate Tercihler Section */}
          <div className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-700/30 p-8 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-xl mr-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold modern-gradient-title">Tercih Ettiğiniz Adliye(ler) <span className="text-red-500">*</span></h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Lütfen tayin olmak istediğiniz adliyeleri öncelik sırasına göre seçiniz.
                </p>
              </div>
            </div>

            {tercihError && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 p-4 rounded-xl animate-fade-in shadow-sm">
                <div className="flex items-center">
                  <div className="bg-red-100 dark:bg-red-800/30 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-red-800 dark:text-red-300">{tercihError}</span>
                </div>
              </div>
            )}
            
            <div className="space-y-5">
              {talep.tercihler.map((tercihId, index) => (
                <div className="group relative bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md hover:border-primary-300/50 dark:hover:border-primary-600/50 transition-all duration-300" key={index}>
                  <div className="absolute -top-3 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm">
                      {index + 1}. Tercih
                    </span>
                  </div>

                  <div className="mt-3 flex items-center space-x-3">
                    <div className="flex-grow">
                      <Select
                        inputId={`tercih-${index + 1}`}
                        value={adliyeler.find(a => a.value === tercihId)}
                        onChange={(selected) => handleTercihChange(selected, index)}
                        options={getFilteredAdliyeler(index)}
                        isClearable={true}
                        placeholder="Adliye seçiniz..."
                        isDisabled={loading}
                        className="basic-single"
                        classNamePrefix="select"
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            borderRadius: '0.75rem',
                            border: state.isFocused ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                            padding: '4px 8px',
                            boxShadow: state.isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : 'none',
                            '&:hover': {
                              border: '1px solid #cbd5e1',
                            },
                            minHeight: '48px',
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? (document.documentElement.classList.contains('dark') ? '#4b5563' : '#eff6ff') : (document.documentElement.classList.contains('dark') ? '#374151' : 'white'),
                            color: state.isSelected ? 'white' : (document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1e293b'),
                            padding: '12px 16px',
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                            fontSize: '14px',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1e293b',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                            border: document.documentElement.classList.contains('dark') ? '1px solid #4b5563' : '1px solid #e2e8f0',
                          }),
                        }}
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTercih(index)}
                        className="group/btn p-3 text-red-500 dark:text-red-400 hover:text-white hover:bg-red-500 rounded-xl border border-red-200 dark:border-red-700 hover:border-red-500 focus:outline-none transition-all duration-200 hover:shadow-md"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {talep.tercihler.length < 3 && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={handleAddTercih}
                    className="group px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-300/50 shadow-sm hover:shadow-md"
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">Tercih Ekle</span>
                  </button>
                </div>
              )}
            </div>

            {/* Corporate Submit Button - Right Aligned */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-3 hover:-translate-y-1 ${highlightSubmitButton ? 'highlight-button' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="bg-white/20 p-1 rounded-lg">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <span>Talebi Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Corporate Turkey Map Section */}
          <div className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-700/30 p-8 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg relative">


            <div className="relative">
              <TurkeyMap
                tercihler={talep.tercihler.map((tercihId) => {
                  if (!tercihId) return null;
                  return adliyeler.find(a => a.value === tercihId);
                }).filter(t => t !== null)}
                onIlSelect={handleIlSelect}
                maxTercih={3}
              />

              {/* Modern Tercih Paneli - Harita Sağ Üst Köşe */}
              {showMapTercihPanel && (
                <div className="absolute top-4 left-4 right-4 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-600/50 p-3 animate-fade-in">
                  {/* Minimal Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tercihler</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {talep.tercihler.filter(t => t !== null).length}/3
                      </span>
                    </div>
                    <button
                      onClick={() => setShowMapTercihPanel(false)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Compact Horizontal Tercih Listesi */}
                  <div className="flex space-x-3 overflow-x-auto pb-1">
                    {[1, 2, 3].map((tercihNo) => {
                      const tercihId = talep.tercihler[tercihNo - 1];
                      const tercihAdliye = tercihId ? adliyeler.find(a => a.value === tercihId) : null;

                      return (
                        <div key={tercihNo} className={`flex-shrink-0 w-48 p-3 rounded-lg border transition-all duration-200 ${
                          tercihAdliye
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 border-dashed'
                        }`}>
                          {tercihAdliye ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {tercihNo}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {tercihAdliye.label}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {tercihNo}. Tercih
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const newTercihler = [...talep.tercihler];
                                  newTercihler[tercihNo - 1] = null;
                                  setTalep({
                                    ...talep,
                                    tercihler: newTercihler
                                  });

                                  // Panel görünürlüğünü kontrol et
                                  const validTercihler = newTercihler.filter(t => t !== null);
                                  if (validTercihler.length === 0) {
                                    setShowMapTercihPanel(false);
                                    setShowMapSubmitButton(false);
                                  }
                                }}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-12">
                              <div className="text-center">
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold mx-auto mb-1">
                                  {tercihNo}
                                </div>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  Boş
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Floating Submit Button - Harita Sağ Alt Köşe */}
              {showMapSubmitButton && (
                <div className="absolute bottom-4 right-4 z-10">
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit}
                    className={`group px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:from-primary-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 hover:-translate-y-1 animate-bounce ${highlightSubmitButton ? 'highlight-button' : ''}`}
                  >
                    {loading ? (
                      <>
                        <div className="bg-white/20 p-1 rounded-lg">
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                        <span className="text-sm">İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-sm font-semibold">Talebi Oluştur</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};

export default TayinTalebiForm;