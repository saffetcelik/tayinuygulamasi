import React, { useState, useEffect } from 'react';
import { tayinService } from '../services/api';
import Swal from 'sweetalert2';
import { useDarkMode } from '../context/DarkModeContext';

const TayinTalepleriList = () => {
  const { isDarkMode } = useDarkMode();
  const [talepler, setTalepler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {
    const fetchTalepler = async () => {
      try {
        // Veritabanından gerçek tayin taleplerini çek
        const data = await tayinService.getTayinTalepleri();
        
        // API'den gelen veri formatını kontrol et ve uyumlu hale getir
        // Backend'deki camelCase ve frontend'deki snake_case format farkı için dönüştürme yapıyoruz
        const formattedData = data.map(item => ({
          id: item.id,
          basvuru_tarihi: item.basvuruTarihi, // camelCase -> snake_case
          talep_durumu: item.talepDurumu,
          talep_turu: item.talepTuru,
          aciklama: item.aciklama,
          tercihler: item.tercihler.map(tercih => ({
            id: tercih.id,
            tercih_sirasi: tercih.tercihSirasi,
            adliye_adi: tercih.adliyeAdi,
            il_adi: tercih.ilAdi
          }))
        }));
        
        setTalepler(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Tayin talepleri yüklenirken hata:', err);
        setError('Tayin talepleri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchTalepler();
  }, [refreshData]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <div className="relative">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-100"></div>
        </div>
        <span className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Tayin talepleriniz yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 p-6 rounded-xl shadow-sm">
        <div className="flex items-center">
          <div className="bg-red-100 dark:bg-red-800/30 p-3 rounded-xl mr-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Hata Oluştu</h3>
            <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (talepler.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-gray-200 dark:border-gray-600 shadow-sm">
          <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Henüz Tayin Talebiniz Yok</h3>
          <p className="text-gray-600 dark:text-gray-300">Yeni bir tayin talebi oluşturmak için "Tayin Talebi Oluştur" sekmesini kullanabilirsiniz.</p>
        </div>
      </div>
    );
  };
  
  // Tayin talebi detaylarını göster
  const showTalepDetails = (talep) => {
    let tercihlerHtml = '';

    talep.tercihler.forEach((tercih, index) => {
      tercihlerHtml += `
        <div class="flex items-center p-3 bg-gradient-to-r from-primary-50 to-blue-50 ${isDarkMode ? 'dark:from-primary-900/20 dark:to-blue-900/20' : ''} rounded-lg border border-primary-200 ${isDarkMode ? 'dark:border-primary-700' : ''} mb-2">
          <div class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
            ${index + 1}
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-800 ${isDarkMode ? 'dark:text-gray-200' : ''}">${tercih.adliye_adi}</p>
            ${tercih.il_adi ? `<p class="text-xs text-gray-500 ${isDarkMode ? 'dark:text-gray-400' : ''}">${tercih.il_adi}</p>` : ''}
          </div>
        </div>
      `;
    });

    const statusColor =
      talep.talep_durumu === 'Beklemede' ? '#f59e0b' :
      talep.talep_durumu === 'Onaylandı' ? '#10b981' :
      talep.talep_durumu === 'Reddedildi' ? '#ef4444' : '#3b82f6';

    Swal.fire({
      title: `<div class="flex items-center"><div class="bg-primary-100 ${isDarkMode ? 'dark:bg-primary-900/30' : ''} p-3 rounded-xl mr-3"><svg class="w-6 h-6 text-primary-600 ${isDarkMode ? 'dark:text-primary-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></div><span class="${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Tayin Talebi Detayları</span></div>`,
      html: `
        <div class="text-left space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 ${isDarkMode ? 'dark:bg-gray-700' : ''} p-3 rounded-lg">
              <p class="text-xs text-gray-500 ${isDarkMode ? 'dark:text-gray-400' : ''} uppercase tracking-wide font-medium">Talep ID</p>
              <p class="text-sm font-semibold text-gray-800 ${isDarkMode ? 'dark:text-gray-200' : ''} mt-1">#${talep.id}</p>
            </div>
            <div class="bg-gray-50 ${isDarkMode ? 'dark:bg-gray-700' : ''} p-3 rounded-lg">
              <p class="text-xs text-gray-500 ${isDarkMode ? 'dark:text-gray-400' : ''} uppercase tracking-wide font-medium">Başvuru Tarihi</p>
              <p class="text-sm font-semibold text-gray-800 ${isDarkMode ? 'dark:text-gray-200' : ''} mt-1">${new Date(talep.basvuru_tarihi).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 ${isDarkMode ? 'dark:bg-gray-700' : ''} p-3 rounded-lg">
              <p class="text-xs text-gray-500 ${isDarkMode ? 'dark:text-gray-400' : ''} uppercase tracking-wide font-medium">Talep Türü</p>
              <p class="text-sm font-semibold text-gray-800 ${isDarkMode ? 'dark:text-gray-200' : ''} mt-1">${talep.talep_turu}</p>
            </div>
            <div class="bg-gray-50 ${isDarkMode ? 'dark:bg-gray-700' : ''} p-3 rounded-lg">
              <p class="text-xs text-gray-500 ${isDarkMode ? 'dark:text-gray-400' : ''} uppercase tracking-wide font-medium">Durum</p>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1" style="background-color: ${statusColor}20; color: ${statusColor};">
                ${talep.talep_durumu}
              </span>
            </div>
          </div>

          ${talep.aciklama ? `
            <div class="bg-gray-50 ${isDarkMode ? 'dark:bg-gray-700' : ''} p-3 rounded-lg">
              <p class="text-xs text-gray-500 ${isDarkMode ? 'dark:text-gray-400' : ''} uppercase tracking-wide font-medium">Açıklama</p>
              <p class="text-sm text-gray-800 ${isDarkMode ? 'dark:text-gray-200' : ''} mt-1">${talep.aciklama}</p>
            </div>
          ` : ''}

          <div>
            <p class="text-xs text-gray-500 ${isDarkMode ? 'dark:text-gray-400' : ''} uppercase tracking-wide font-medium mb-3">Tercihler</p>
            <div class="space-y-2">
              ${tercihlerHtml}
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Kapat',
      confirmButtonColor: '#2563eb',
      width: '600px',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f3f4f6' : '#1f2937',
      customClass: {
        container: 'swal-wide',
        title: 'text-lg font-bold mb-6',
        htmlContainer: 'text-base',
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        popup: 'rounded-2xl'
      }
    });
  };
  
  // Tayin talebini iptal etmeyi onayla
  const confirmCancelTalep = (talepId) => {
    Swal.fire({
      title: `<div class="flex items-center"><div class="bg-red-100 ${isDarkMode ? 'dark:bg-red-900/30' : ''} p-3 rounded-xl mr-3"><svg class="w-6 h-6 text-red-600 ${isDarkMode ? 'dark:text-red-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path></svg></div><span class="${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Tayin Talebini İptal Et</span></div>`,
      html: `
        <div class="text-center py-4">
          <p class="text-gray-700 ${isDarkMode ? 'dark:text-gray-300' : ''} text-base mb-4">Bu tayin talebini iptal etmek istediğinize emin misiniz?</p>
          <div class="bg-red-50 ${isDarkMode ? 'dark:bg-red-900/20' : ''} border border-red-200 ${isDarkMode ? 'dark:border-red-700' : ''} rounded-lg p-4">
            <p class="text-red-800 ${isDarkMode ? 'dark:text-red-300' : ''} text-sm font-medium">⚠️ Bu işlem geri alınamaz!</p>
            <p class="text-red-600 ${isDarkMode ? 'dark:text-red-400' : ''} text-sm mt-1">Talep iptal edildikten sonra tekrar aktif hale getirilemez.</p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<span class="flex items-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>Evet, İptal Et</span>',
      cancelButtonText: '<span class="flex items-center"><svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>Vazgeç</span>',
      background: isDarkMode ? '#1f2937' : '#ffffff',
      color: isDarkMode ? '#f3f4f6' : '#1f2937',
      customClass: {
        confirmButton: 'px-6 py-2 rounded-lg font-medium',
        cancelButton: 'px-6 py-2 rounded-lg font-medium',
        popup: 'rounded-2xl'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await tayinService.cancelTayinTalebi(talepId);

          Swal.fire({
            title: `<div class="flex items-center"><div class="bg-green-100 ${isDarkMode ? 'dark:bg-green-900/30' : ''} p-3 rounded-xl mr-3"><svg class="w-6 h-6 text-green-600 ${isDarkMode ? 'dark:text-green-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div><span class="${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Başarılı!</span></div>`,
            html: `<p class="text-gray-700 ${isDarkMode ? 'dark:text-gray-300' : ''}">Tayin talebi başarıyla iptal edildi.</p>`,
            confirmButtonText: 'Tamam',
            confirmButtonColor: '#10b981',
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#1f2937',
            customClass: {
              confirmButton: 'px-6 py-2 rounded-lg font-medium',
              popup: 'rounded-2xl'
            }
          });

          // Listeyi yenile
          setRefreshData(prev => !prev);
        } catch (err) {
          console.error('Tayin talebi iptal edilirken hata:', err);
          Swal.fire({
            title: `<div class="flex items-center"><div class="bg-red-100 ${isDarkMode ? 'dark:bg-red-900/30' : ''} p-3 rounded-xl mr-3"><svg class="w-6 h-6 text-red-600 ${isDarkMode ? 'dark:text-red-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></div><span class="${isDarkMode ? 'text-gray-200' : 'text-gray-800'}">Hata!</span></div>`,
            html: `<p class="text-gray-700 ${isDarkMode ? 'dark:text-gray-300' : ''}">Tayin talebi iptal edilirken bir hata oluştu. Lütfen tekrar deneyiniz.</p>`,
            confirmButtonText: 'Tamam',
            confirmButtonColor: '#dc2626',
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#1f2937',
            customClass: {
              confirmButton: 'px-6 py-2 rounded-lg font-medium',
              popup: 'rounded-2xl'
            }
          });
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {talepler.map((talep) => (
        <div key={talep.id} className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-700/30 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Card Header - Soft Design */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-800/80 px-6 py-4 border-b border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Tayin Talebi</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{new Date(talep.basvuru_tarihi).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  talep.talep_durumu === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                  talep.talep_durumu === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                  talep.talep_durumu === 'Reddedildi' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {talep.talep_durumu}
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sol Taraf - Talep Bilgileri */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Talep Türü</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium ml-9">{talep.talep_turu}</p>
                </div>

                {talep.aciklama && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-lg mr-3">
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Açıklama</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 ml-9 text-sm leading-relaxed">{talep.aciklama}</p>
                  </div>
                )}
              </div>

              {/* Sağ Taraf - Tercihler */}
              <div>
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-primary-200 dark:border-primary-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3">
                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Tercihler ({talep.tercihler.length})</h4>
                  </div>
                  <div className="space-y-3">
                    {talep.tercihler.map((tercih, index) => (
                      <div key={tercih.id} className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-primary-200/50 dark:border-primary-700/50 shadow-sm">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{tercih.adliye_adi}</p>
                          {tercih.il_adi && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{tercih.il_adi}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Talep ID: #{talep.id}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => showTalepDetails(talep)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Detayları Görüntüle
                </button>
                {talep.talep_durumu === 'Beklemede' && (
                  <button
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => confirmCancelTalep(talep.id)}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Talebi İptal Et
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TayinTalepleriList;
