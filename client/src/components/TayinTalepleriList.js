import React, { useState, useEffect } from 'react';
import { tayinService } from '../services/api';
import Swal from 'sweetalert2';

const TayinTalepleriList = () => {
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
      <div className="flex justify-center items-center p-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        <span className="ml-2">Yükleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (talepler.length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-blue-700">Henüz bir tayin talebiniz bulunmamaktadır.</p>
      </div>
    );
  };
  
  // Tayin talebi detaylarını göster
  const showTalepDetails = (talep) => {
    let tercihlerHtml = '';
    
    talep.tercihler.forEach((tercih, index) => {
      tercihlerHtml += `<li>${index + 1}. Tercih: ${tercih.adliye_adi} (${tercih.il_adi})</li>`;
    });
    
    Swal.fire({
      title: 'Tayin Talebi Detayları',
      html: `
        <div class="text-left">
          <p><strong>Talep ID:</strong> ${talep.id}</p>
          <p><strong>Başvuru Tarihi:</strong> ${new Date(talep.basvuru_tarihi).toLocaleDateString('tr-TR')}</p>
          <p><strong>Talep Türü:</strong> ${talep.talep_turu}</p>
          <p><strong>Durum:</strong> ${talep.talep_durumu}</p>
          <p><strong>Açıklama:</strong> ${talep.aciklama || 'Belirtilmemiş'}</p>
          <p><strong>Tercihler:</strong></p>
          <ul class="list-disc list-inside pl-4">
            ${tercihlerHtml}
          </ul>
        </div>
      `,
      confirmButtonText: 'Kapat',
      confirmButtonColor: '#3085d6',
      customClass: {
        container: 'swal-wide',
        title: 'text-xl font-bold mb-4',
        htmlContainer: 'text-base',
        confirmButton: 'px-4 py-2 rounded',
      }
    });
  };
  
  // Tayin talebini iptal etmeyi onayla
  const confirmCancelTalep = (talepId) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu tayin talebini iptal etmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, iptal et!',
      cancelButtonText: 'Vazgeç',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          await tayinService.cancelTayinTalebi(talepId);
          
          Swal.fire(
            'Başarılı!',
            'Tayin talebi başarıyla iptal edildi.',
            'success'
          );
          
          // Listeyi yenile
          setRefreshData(prev => !prev);
        } catch (err) {
          console.error('Tayin talebi iptal edilirken hata:', err);
          Swal.fire(
            'Hata!',
            'Tayin talebi iptal edilirken bir hata oluştu.',
            'error'
          );
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Başvuru Tarihi
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Talep Türü
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tercihler
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {talepler.map((talep) => (
            <tr key={talep.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(talep.basvuru_tarihi).toLocaleDateString('tr-TR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {talep.talep_turu}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  talep.talep_durumu === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                  talep.talep_durumu === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                  talep.talep_durumu === 'Reddedildi' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {talep.talep_durumu}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <ul className="list-disc list-inside">
                  {talep.tercihler.map((tercih) => (
                    <li key={tercih.id}>
                      {tercih.adliye_adi} ({tercih.il_adi})
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  className="text-primary-600 hover:text-primary-900 mr-3"
                  onClick={() => showTalepDetails(talep)}
                >
                  Detay
                </button>
                {talep.talep_durumu === 'Beklemede' && (
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => confirmCancelTalep(talep.id)}
                  >
                    İptal
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TayinTalepleriList;
