import React, { useState } from 'react';
import { toast } from 'react-toastify';

const TayinListesi = ({ tayinTalepleri, loading, updateTayinDurumu, onRefresh }) => {
  const [selectedTayin, setSelectedTayin] = useState(null);
  const [durumModalOpen, setDurumModalOpen] = useState(false);
  const [durumAciklamasi, setDurumAciklamasi] = useState('');
  const [filterDurum, setFilterDurum] = useState('Tümü');
  const [searchText, setSearchText] = useState('');
  const [siralama, setSiralama] = useState('newest');

  // Durum güncelleme modalını aç (tıklama sorunlarını önlemek için event.preventDefault ve stopPropagation eklendi)
  const openDurumModal = (event, tayin, initialDurum) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Durumu Değiştir butonuna tıklandı, Tayin ID:', tayin.id);
    setSelectedTayin({...tayin, durum: initialDurum || tayin.durum});
    setDurumAciklamasi(tayin.durumAciklamasi || '');
    setDurumModalOpen(true);
  };

  // Durum güncelleme işlemi
  const handleDurumUpdate = async () => {
    if (!selectedTayin || !selectedTayin.durum) {
      toast.error('Lütfen bir durum seçiniz.');
      return;
    }

    try {
      await updateTayinDurumu(
        selectedTayin.id,
        selectedTayin.durum,
        durumAciklamasi
      );
      setDurumModalOpen(false);
      setSelectedTayin(null);
      setDurumAciklamasi('');
    } catch (error) {
      console.error('Durum güncellenirken bir hata oluştu:', error);
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Onaylandı':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Reddedildi':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'İncelemede':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Tayin Talepleri</h2>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
          {/* Yenile butonu */}
          <button 
            onClick={() => onRefresh(true, true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
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
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
          </select>
          
          {/* Durum filtresi */}
          <select
            value={filterDurum}
            onChange={(e) => setFilterDurum(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Personel adı, sicil no veya tercih edilen yer ile arayın..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-700">Tayin talepleri yükleniyor...</p>
        </div>
      ) : (
        <>
          {sortedTayinler.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel Bilgileri
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Talep Nedeni
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tercih Edilen Yerler
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedTayinler.map((tayin) => (
                    <tr key={tayin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {tayin.personel?.ad} {tayin.personel?.soyad}
                            </div>
                            <div className="text-sm text-gray-500">
                              Sicil: {tayin.personel?.sicilNo}
                            </div>
                            <div className="text-xs text-gray-500">
                              {tayin.personel?.unvan} - {tayin.personel?.mevcutAdliye?.adliyeAdi || 'Belirtilmemiş'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{tayin.talepNedeni}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {tayin.talepAciklamasi}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{tayin.tercihEdilenYer1}</div>
                        {tayin.tercihEdilenYer2 && (
                          <div className="text-xs text-gray-500">{tayin.tercihEdilenYer2}</div>
                        )}
                        {tayin.tercihEdilenYer3 && (
                          <div className="text-xs text-gray-500">{tayin.tercihEdilenYer3}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDurumRenk(tayin.durum)}`}>
                          {tayin.durum || 'Beklemede'}
                        </span>
                        {tayin.durumAciklamasi && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {tayin.durumAciklamasi}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tayin.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => openDurumModal(e, tayin)}
                          className="text-blue-600 hover:text-blue-900 mr-3 cursor-pointer"
                        >
                          Durumu Değiştir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Tayin talebi bulunamadı</h3>
              <p className="mt-1 text-gray-500">
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
      
      {/* Durum Güncelleme Modal */}
      {durumModalOpen && selectedTayin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999, overflow: 'hidden' }}>
          {console.log('Durum güncelleme modalı açılıyor')}
          <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Tayin Talebi Durumunu Güncelle
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Personel:</span> {selectedTayin.personel?.ad} {selectedTayin.personel?.soyad}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Talep Nedeni:</span> {selectedTayin.talepNedeni}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  value={selectedTayin.durum}
                  onChange={(e) => setSelectedTayin({...selectedTayin, durum: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Beklemede">Beklemede</option>
                  <option value="İncelemede">İncelemede</option>
                  <option value="Onaylandı">Onaylandı</option>
                  <option value="Reddedildi">Reddedildi</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum Açıklaması (Opsiyonel)
                </label>
                <textarea
                  value={durumAciklamasi}
                  onChange={(e) => setDurumAciklamasi(e.target.value)}
                  rows="3"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Durum hakkında ek bilgi girebilirsiniz..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setDurumModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  İptal
                </button>
                <button
                  onClick={handleDurumUpdate}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TayinListesi;
