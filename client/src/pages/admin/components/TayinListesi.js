import React, { useState } from 'react';
import { toast } from 'react-toastify';

const TayinListesi = ({ tayinTalepleri, loading, updateTayinDurumu, onRefresh }) => {
  const [filterDurum, setFilterDurum] = useState('Tümü');
  const [searchText, setSearchText] = useState('');
  const [siralama, setSiralama] = useState('newest');

  // Hızlı durum güncelleme işlemi
  const handleQuickDurumUpdate = async (tayin, yeniDurum) => {
    try {
      await updateTayinDurumu(tayin.id, yeniDurum, '');
      // Toast bildirimi kaldırıldı - AdminPanel'deki updateTayinDurumu zaten bildirim gösteriyor
    } catch (error) {
      console.error('Durum güncellenirken bir hata oluştu:', error);
      toast.error('Durum güncellenirken bir hata oluştu.');
    }
  };

  // Filtreleme işlemi
  const filteredTayinler = tayinTalepleri.filter(tayin => {
    // Durum filtresi
    if (filterDurum !== 'Tümü' && tayin.durum !== filterDurum) {
      return false;
    }
    
    // Arama filtresi
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        tayin.personel?.ad?.toLowerCase().includes(searchLower) ||
        tayin.personel?.soyad?.toLowerCase().includes(searchLower) ||
        tayin.personel?.sicilNo?.toLowerCase().includes(searchLower) ||
        tayin.tercihEdilenYer1?.toLowerCase().includes(searchLower) ||
        tayin.talepNedeni?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Sıralama işlemi
  const sortedTayinler = [...filteredTayinler].sort((a, b) => {
    if (siralama === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (siralama === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return 0;
  });

  // Durum renklerini belirleme
  const getDurumRenk = (durum) => {
    switch (durum) {
      case 'Beklemede':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
      case 'Onaylandı':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-300 dark:border-green-700';
      case 'Reddedildi':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-300 dark:border-red-700';
      case 'İncelemede':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 md:mb-0">Tayin Talepleri</h2>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          {/* Yenile butonu */}
          <button
            onClick={() => onRefresh(true, true)}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenile
          </button>
          
          {/* Sıralama */}
          <select
            value={siralama}
            onChange={(e) => setSiralama(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
          </select>
          
          {/* Durum filtresi */}
          <select
            value={filterDurum}
            onChange={(e) => setFilterDurum(e.target.value)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tümü">Tüm Durumlar</option>
            <option value="Beklemede">Beklemede</option>
            <option value="İncelemede">İncelemede</option>
            <option value="Onaylandı">Onaylandı</option>
            <option value="Reddedildi">Reddedildi</option>
          </select>
        </div>
      </div>
      
      {/* Arama */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Personel adı, sicil no veya tercih edilen yer ile arayın..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Tayin talepleri yükleniyor...</p>
        </div>
      ) : (
        <>
          {sortedTayinler.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Personel Bilgileri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Talep Nedeni
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tercih Edilen Yerler
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedTayinler.map((tayin) => (
                    <tr key={tayin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {tayin.personel?.ad} {tayin.personel?.soyad}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Sicil: {tayin.personel?.sicilNo}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {tayin.personel?.unvan} - {tayin.personel?.mevcutAdliye?.adliyeAdi || 'Belirtilmemiş'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{tayin.talepNedeni}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {tayin.talepAciklamasi}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{tayin.tercihEdilenYer1}</div>
                        {tayin.tercihEdilenYer2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tayin.tercihEdilenYer2}</div>
                        )}
                        {tayin.tercihEdilenYer3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{tayin.tercihEdilenYer3}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDurumRenk(tayin.durum)}`}>
                          {tayin.durum || 'Beklemede'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(tayin.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* Hızlı Durum Butonları */}
                          {tayin.durum !== 'Onaylandı' && (
                            <button
                              onClick={() => handleQuickDurumUpdate(tayin, 'Onaylandı')}
                              className="inline-flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors"
                              title="Onayla"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Onayla
                            </button>
                          )}

                          {tayin.durum !== 'Reddedildi' && (
                            <button
                              onClick={() => handleQuickDurumUpdate(tayin, 'Reddedildi')}
                              className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                              title="Reddet"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              Reddet
                            </button>
                          )}

                          {tayin.durum !== 'İncelemede' && (
                            <button
                              onClick={() => handleQuickDurumUpdate(tayin, 'İncelemede')}
                              className="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
                              title="İncelemeye Al"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                              İncele
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Tayin talebi bulunamadı</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Filtreleme kriterlerinize uygun tayin talebi bulunmamaktadır.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setFilterDurum('Tümü');
                    setSearchText('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default TayinListesi;
