import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/api';
import PersonelDuzenleModal from './PersonelDuzenleModal';
import Swal from 'sweetalert2';

const PersonelListesi = () => {
  const [personeller, setPersoneller] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredPersoneller, setFilteredPersoneller] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdliye, setSelectedAdliye] = useState('');
  const [selectedUnvan, setSelectedUnvan] = useState('');
  const [selectedPersonelId, setSelectedPersonelId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Personelleri getir
  const fetchPersoneller = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPersoneller();
      setPersoneller(data);
      setFilteredPersoneller(data);
    } catch (error) {
      console.error('Personeller alınamadı:', error);
      toast.error('Personeller yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersoneller();
  }, []);
  
  // Personel düzenleme modalını aç
  // Personel düzenleme modalını aç (tıklama sorunlarını önlemek için event.preventDefault ve stopPropagation eklendi)
  const handleEditPersonel = (event, id) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('Düzenle butonuna tıklandı, ID:', id);
    setSelectedPersonelId(id);
    setIsModalOpen(true);
  };

  const handleDeletePersonel = (id, adSoyad) => {
    // Silme işlemi için onay iste
    Swal.fire({
      title: 'Emin misiniz?',
      text: `${adSoyad} isimli personeli silmek istediğinize emin misiniz?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Silme işlemini gerçekleştir
        adminService.deletePersonel(id)
          .then(response => {
            toast.success('Personel başarıyla silindi');
            // Personel listesini güncelle
            fetchPersoneller();
          })
          .catch(error => {
            console.error('Personel silinirken hata:', error);
            toast.error('Personel silinirken bir hata oluştu');
          });
      }
    });
  };
  
  // Modal kapandığında 
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPersonelId(null);
  };
  
  // Personel güncellendiğinde
  const handlePersonelUpdated = () => {
    // Listeyi yenile
    fetchPersoneller();
  };
  
  // Filtreleme işlemi
  useEffect(() => {
    let filtered = [...personeller];
    
    // İsim, soyisim veya sicil no ile ara
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.ad.toLowerCase().includes(term) || 
        p.soyad.toLowerCase().includes(term) ||
        p.sicilNo.toLowerCase().includes(term)
      );
    }
    
    // Adliye ile filtrele
    if (selectedAdliye) {
      filtered = filtered.filter(p => 
        p.mevcutAdliye && p.mevcutAdliye.id === parseInt(selectedAdliye)
      );
    }
    
    // Unvan ile filtrele
    if (selectedUnvan) {
      filtered = filtered.filter(p => p.unvan === selectedUnvan);
    }
    
    setFilteredPersoneller(filtered);
  }, [searchTerm, selectedAdliye, selectedUnvan, personeller]);
  
  // Unvan listesini oluştur
  const unvanlar = [...new Set(personeller.map(p => p.unvan))].sort();
  
  // Adliye listesini oluştur
  const adliyeler = [...new Set(
    personeller
      .filter(p => p.mevcutAdliye)
      .map(p => JSON.stringify({id: p.mevcutAdliye.id, adi: p.mevcutAdliye.adliyeAdi}))
  )]
    .map(item => JSON.parse(item))
    .sort((a, b) => a.adi.localeCompare(b.adi));

  if (loading && personeller.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <span className="ml-2 text-blue-500 dark:text-blue-400">Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Başlık ve Arama */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 md:mb-0">Personel Listesi</h2>
          <button 
            onClick={fetchPersoneller}
            className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenile
          </button>
        </div>
        
        {/* Filtreleme Araçları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ara</label>
            <input
              type="text"
              id="search"
              placeholder="İsim, soyisim veya sicil no"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="adliye" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adliye</label>
            <select
              id="adliye"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedAdliye}
              onChange={(e) => setSelectedAdliye(e.target.value)}
            >
              <option value="">Tümü</option>
              {adliyeler.map(adliye => (
                <option key={adliye.id} value={adliye.id}>{adliye.adi}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="unvan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unvan</label>
            <select
              id="unvan"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={selectedUnvan}
              onChange={(e) => setSelectedUnvan(e.target.value)}
            >
              <option value="">Tümü</option>
              {unvanlar.map(unvan => (
                <option key={unvan} value={unvan}>{unvan}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Personel Tablosu */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sicil No</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ad Soyad</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unvan</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Adliye</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İletişim</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Başlama Tarihi</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPersoneller.length > 0 ? (
              filteredPersoneller.map((personel) => (
                <tr key={personel.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{personel.sicilNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{personel.ad} {personel.soyad}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{personel.unvan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {personel.mevcutAdliye ? personel.mevcutAdliye.adliyeAdi : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>{personel.email || '-'}</div>
                    <div>{personel.telefon || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {personel.baslamaTarihi ? new Date(personel.baslamaTarihi).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleEditPersonel(e, personel.id)}
                        className="inline-flex items-center px-3 py-1 border border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeletePersonel(personel.id, `${personel.ad} ${personel.soyad}`)}
                        className="inline-flex items-center px-3 py-1 border border-red-500 dark:border-red-400 text-red-500 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Yükleniyor...' : 'Personel bulunamadı'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Sonuç Sayısı */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Toplam <span className="font-medium">{filteredPersoneller.length}</span> personel gösteriliyor.
          {searchTerm || selectedAdliye || selectedUnvan ?
            ` (Filtre uygulandı: ${personeller.length} personel içinden)` : ''}
        </p>
      </div>
      
      {/* Personel Düzenleme Modalı */}
      {isModalOpen && selectedPersonelId && (
        <PersonelDuzenleModal
          personelId={selectedPersonelId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handlePersonelUpdated}
        />
      )}
    </div>
  );
};

export default PersonelListesi;
