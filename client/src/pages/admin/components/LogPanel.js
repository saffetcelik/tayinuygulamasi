import React, { useState, useEffect } from 'react';
import { AlertTriangle, XCircle, Clock, RefreshCw, ListFilter, CheckCircle, XOctagon, FileText, Loader2, Trash2 } from 'lucide-react';
import { adminService } from '../../../services/api';
import { toast } from 'react-toastify';

// Tarih formatlama
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateString; // Geçersiz tarih ise orijinal dizeyi döndür
  }
};

// Log seviyelerine göre stil (basariliMi durumuna göre uyarlanabilir)
const statusStyles = {
  Evet: { icon: <CheckCircle size={18} className="text-green-600 dark:text-green-400" />, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-700' },
  Hayır: { icon: <XOctagon size={18} className="text-red-600 dark:text-red-400" />, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-700' },
  Belirsiz: { icon: <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-200 dark:border-amber-700' },
};

// Tek bir log satırını gösteren bileşen
const LogEntryItem = ({ log, onShowDetail }) => {
  const style = statusStyles[log.basariliMi] || statusStyles['Belirsiz'];

  return (
    <div className={`border-l-4 ${style.borderColor} ${style.bgColor} p-4 mb-3 rounded-md shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          {style.icon}
          <span className={`font-semibold ${style.color} w-24 text-xs uppercase`}>{log.basariliMi}</span>
          <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center"><Clock size={12} className="mr-1"/>{formatDate(log.islemZamani)}</span>
        </div>
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Detay butonuna tıklandı, Log ID:', log.id);
                onShowDetail(log);
            }}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition-colors duration-150 flex items-center self-start sm:self-center cursor-pointer"
        >
            <FileText size={12} className="mr-1"/> Detay
        </button>
      </div>
      <div className="mt-2 pl-1 sm:pl-0">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium break-words">
          <span className="text-gray-500 dark:text-gray-400">İşlem:</span> {log.islemTuru}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 break-words">
          <span className="text-gray-500 dark:text-gray-400">Kullanıcı:</span> {log.kullaniciAdi || 'N/A'} ({log.kullaniciSicilNo || 'N/A'})
        </p>
         {log.ipAdresi && <p className="text-xs text-gray-500 dark:text-gray-400"><span className="text-gray-500 dark:text-gray-400">IP:</span> {log.ipAdresi}</p>}
      </div>
    </div>
  );
};

const LogDetailModal = ({ log, show, onClose }) => {
  if (!show || !log) return null;
  const style = statusStyles[log.basariliMi] || statusStyles['Belirsiz'];

  console.log('Log detay modalı açılıyor');
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300" 
      style={{ zIndex: 9999, overflow: 'hidden' }}
    >
      <div className="relative w-full h-full max-w-2xl mx-auto flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
              {style.icon} <span className="ml-2">Log Detayı</span>
            </h2>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <XCircle size={24} />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">ID:</strong> <span className="text-gray-800 dark:text-gray-200">{log.id}</span></p>
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">İşlem Türü:</strong> <span className="text-gray-800 dark:text-gray-200">{log.islemTuru}</span></p>
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">Tarih:</strong> <span className="text-gray-800 dark:text-gray-200">{formatDate(log.islemZamani)}</span></p>
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">Durum:</strong> <span className={`${style.color} font-semibold`}>{log.basariliMi}</span></p>
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">Kullanıcı:</strong> <span className="text-gray-800 dark:text-gray-200">{log.kullaniciAdi || '-'}</span></p>
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">Sicil No:</strong> <span className="text-gray-800 dark:text-gray-200">{log.kullaniciSicilNo || '-'}</span></p>
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">IP Adresi:</strong> <span className="text-gray-800 dark:text-gray-200">{log.ipAdresi || '-'}</span></p>
              <p><strong className="text-gray-600 dark:text-gray-400 w-28 inline-block">Tarayıcı:</strong> <span className="text-gray-800 dark:text-gray-200 break-all">{log.tarayiciBilgisi || '-'}</span></p>
            </div>
            <div>
              <h6 className="text-gray-700 dark:text-gray-300 font-semibold mt-3 mb-1">Detay Bilgi:</h6>
              <p className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 text-xs whitespace-pre-wrap break-all border border-gray-200 dark:border-gray-600">{log.detayBilgi || '-'}</p>
            </div>
            {log.hataBilgisi && (
              <div>
                <h6 className="text-red-600 dark:text-red-400 font-semibold mt-3 mb-1">Hata Bilgisi:</h6>
                <p className="p-3 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400 text-xs whitespace-pre-wrap break-all border border-red-200 dark:border-red-700">{log.hataBilgisi}</p>
              </div>
            )}
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    islemTuru: '',
    kullaniciSicilNo: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    basariliMi: ''
  });
  const [logOzeti, setLogOzeti] = useState(null);
  const [loadingOzeti, setLoadingOzeti] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);

  // Sayfalama için state değişkenleri
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5); // Sayfa başına 5 log varsayılan olarak

  useEffect(() => {
    fetchLogs();
    fetchLogOzeti();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      let queryParams = new URLSearchParams();
      if (filters.islemTuru) queryParams.append('islemTuru', filters.islemTuru);
      if (filters.kullaniciSicilNo) queryParams.append('kullaniciSicilNo', filters.kullaniciSicilNo);
      if (filters.baslangicTarihi) queryParams.append('baslangicTarihi', filters.baslangicTarihi);
      if (filters.bitisTarihi) queryParams.append('bitisTarihi', filters.bitisTarihi);
      if (filters.basariliMi) queryParams.append('basariliMi', filters.basariliMi);
      const response = await adminService.getLoglar(queryParams);
      setLogs(response);
      setCurrentPage(1); // Filtreleme yapıldığında ilk sayfaya dön
    } catch (error) {
      console.error('Loglar alınırken hata:', error);
      setError('Loglar alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogOzeti = async () => {
    try {
      setLoadingOzeti(true);
      const ozet = await adminService.getLogOzeti();
      setLogOzeti(ozet);
    } catch (error) {
      console.error('Log özeti alınırken hata:', error);
    } finally {
      setLoadingOzeti(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const resetFilters = () => {
    setFilters({
      islemTuru: '',
      kullaniciSicilNo: '',
      baslangicTarihi: '',
      bitisTarihi: '',
      basariliMi: ''
    });
    setTimeout(() => fetchLogs(), 0);
  };

  const showLogDetail = (log) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  const handleClearLogs = async () => {
    const confirmClear = window.confirm(
      'Tüm sistem kayıtları silinecek. Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?'
    );

    if (!confirmClear) return;

    try {
      setClearingLogs(true);
      const response = await adminService.temizleLoglar();

      toast.success(`${response.silinenKayitSayisi} sistem kaydı başarıyla temizlendi!`);

      // Verileri yenile
      await fetchLogs();
      await fetchLogOzeti();

    } catch (error) {
      console.error('Loglar temizlenirken hata:', error);
      toast.error('Loglar temizlenirken bir hata oluştu!');
    } finally {
      setClearingLogs(false);
    }
  };

  // Sayfalama hesaplamaları
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  // Sayfa değiştirme işlevi
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Sayfayı yukarı kaydır
      window.scrollTo({
        top: document.getElementById('logPanelTop').offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  // Sayfa başına log sayısını değiştirme işlevi
  const handleLogsPerPageChange = (e) => {
    setLogsPerPage(Number(e.target.value));
    setCurrentPage(1); // İlk sayfaya dön
  };

  const SummaryCard = ({ title, value, icon, colorClass = 'text-blue-600', bgColorClass = 'bg-white dark:bg-gray-800' }) => (
    <div className={`${bgColorClass} p-4 rounded-lg shadow-md flex items-center space-x-3 border border-gray-200 dark:border-gray-700`}>
      <div className={`p-2 rounded-full ${colorClass.replace('text-', 'bg-')}/10`}>
        {React.cloneElement(icon, { size: 24, className: colorClass })}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{value}</p>
      </div>
    </div>
  );

  // Sayfalama bileşeni
  const Pagination = () => {
    const pageNumbers = [];
    
    // 5 sayfadan fazla varsa, akıllı sayfalama göster
    if (totalPages > 5) {
      // Her zaman ilk sayfayı göster
      pageNumbers.push(1);
      
      // Eğer aktif sayfa 4'ten büyükse, '...' göster
      if (currentPage > 3) {
        pageNumbers.push('...');
      }
      
      // Aktif sayfanın etrafındaki sayfaları göster
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Eğer aktif sayfa sondan 3'ten yakınsa, '...' göster
      if (currentPage < totalPages - 2) {
        pageNumbers.push('...');
      }
      
      // Her zaman son sayfayı göster
      pageNumbers.push(totalPages);
    } else {
      // 5 veya daha az sayfa varsa, hepsini göster
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <select
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md p-1 text-sm"
            value={logsPerPage}
            onChange={handleLogsPerPageChange}
          >
            <option value="5">5 kayıt</option>
            <option value="10">10 kayıt</option>
            <option value="20">20 kayıt</option>
            <option value="50">50 kayıt</option>
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Toplam {logs.length} kayıttan {indexOfFirstLog + 1}-{Math.min(indexOfLastLog, logs.length)} arası gösteriliyor
          </span>
        </div>
        
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Önceki
          </button>

          {pageNumbers.map((number, index) => (
            <button
              key={index}
              onClick={() => number !== '...' ? paginate(number) : null}
              className={`px-3 py-1 rounded-md ${number === '...' ? 'text-gray-600 dark:text-gray-400 cursor-default' : number === currentPage ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            Sonraki
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div id="logPanelTop" className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-6 font-sans text-gray-800 dark:text-gray-200">

      {/* Log Özeti */}
      {loadingOzeti ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse border border-gray-200 dark:border-gray-700">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
            ))}
        </div>
      ) : logOzeti ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard title="Toplam Log" value={logOzeti.toplamLogSayisi} icon={<ListFilter />} />
          <SummaryCard title="Başarılı İşlemler" value={logOzeti.toplamBasariliSayisi} icon={<CheckCircle />} colorClass="text-green-600" />
          <SummaryCard title="Başarısız İşlemler" value={logOzeti.toplamBasarisizSayisi} icon={<XOctagon />} colorClass="text-red-600" />
          <SummaryCard title="Son 24 Saat" value={logOzeti.sonYirmiDortSaatOzeti?.reduce((acc, curr) => acc + curr.toplamSayi, 0) || 0} icon={<Clock />} colorClass="text-blue-600" />
        </div>
      ) : null}

      {/* Filtreleme Bölümü */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <form onSubmit={applyFilters}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            {/* İşlem Türü */}
            <div>
              <label htmlFor="islemTuru" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İşlem Türü</label>
              <select id="islemTuru" name="islemTuru" value={filters.islemTuru} onChange={handleFilterChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="">Tümü</option>
                <option value="Giriş">Giriş</option>
                <option value="Giriş Denemesi">Giriş Denemesi</option>
                <option value="Şifre Değiştirme">Şifre Değiştirme</option>
                <option value="Log Görüntüleme">Log Görüntüleme</option>
                <option value="Veri Güncelleme">Veri Güncelleme</option>
              </select>
            </div>
            {/* Kullanıcı Sicil No */}
            <div>
              <label htmlFor="kullaniciSicilNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kullanıcı Sicil No</label>
              <input type="text" id="kullaniciSicilNo" name="kullaniciSicilNo" value={filters.kullaniciSicilNo} onChange={handleFilterChange} placeholder="Sicil No" className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500" />
            </div>
            {/* Başlangıç Tarihi */}
            <div>
              <label htmlFor="baslangicTarihi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Başlangıç Tarihi</label>
              <input type="date" id="baslangicTarihi" name="baslangicTarihi" value={filters.baslangicTarihi} onChange={handleFilterChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            {/* Bitiş Tarihi */}
            <div>
              <label htmlFor="bitisTarihi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bitiş Tarihi</label>
              <input type="date" id="bitisTarihi" name="bitisTarihi" value={filters.bitisTarihi} onChange={handleFilterChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            {/* Durum */}
            <div>
              <label htmlFor="basariliMi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durum</label>
              <select id="basariliMi" name="basariliMi" value={filters.basariliMi} onChange={handleFilterChange} className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                <option value="">Tümü</option>
                <option value="Evet">Başarılı</option>
                <option value="Hayır">Başarısız</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button type="button" onClick={resetFilters} className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors">
              Filtreleri Sıfırla
            </button>
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-50">
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              Filtrele
            </button>
            <button
              type="button"
              onClick={() => { fetchLogs(); fetchLogOzeti(); }}
              disabled={loading || loadingOzeti}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${loading || loadingOzeti ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              disabled={clearingLogs || loading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} className={`mr-2 ${clearingLogs ? 'animate-spin' : ''}`} />
              {clearingLogs ? 'Temizleniyor...' : 'Logları Temizle'}
            </button>
          </div>
        </form>
      </div>

      {/* Loglar */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center">
            <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span className="mt-2 text-gray-600 dark:text-gray-400">Loglar yükleniyor...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
          <AlertTriangle size={20} className="inline mr-2" />
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md text-center border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle size={20} className="inline mr-2" />
          Belirtilen kriterlere uygun log bulunamadı.
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center text-gray-800 dark:text-gray-200">
              <FileText size={18} className="mr-2" /> Log Kayıtları
              <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">({logs.length} kayıt)</span>
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sayfa {currentPage} / {totalPages || 1}
            </div>
          </div>
          
          {/* Sadece mevcut sayfadaki logları göster */}
          <div className="space-y-2">
            {currentLogs.map((log) => (
              <LogEntryItem key={log.id} log={log} onShowDetail={showLogDetail} />
            ))}
          </div>
          
          {/* Sayfalama */}
          {logs.length > 0 && <Pagination />}
        </div>
      )}
      
      <LogDetailModal log={selectedLog} show={showLogModal} onClose={() => setShowLogModal(false)} />

      <footer className="mt-12 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Adalet Bakanlığı. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default LogPanel;
