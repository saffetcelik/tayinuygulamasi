import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Database,
  Cpu,
  MemoryStick,
  Activity,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  Server,
  HardDrive,
  Wifi,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../../services/api';
import { toast } from 'react-toastify';

const SistemSagligi = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [errorPage, setErrorPage] = useState(1);
  const errorsPerPage = 3;

  // Sistem sağlığı verilerini getir
  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      console.log('Sistem sağlığı verileri getiriliyor...');
      const data = await adminService.getSystemHealth();
      console.log('Sistem sağlığı verileri alındı:', data);
      console.log('State güncelleniyor...');
      setSystemHealth(data);
      setLastUpdate(new Date());
      setErrorPage(1); // Yeni veriler geldiğinde hata sayfasını sıfırla
      console.log('State güncellendi, systemHealth:', data);
    } catch (error) {
      console.error('Sistem sağlığı verileri alınırken hata:', error);
      console.error('Hata detayları:', error.response || error.message || error);
      toast.error(`Sistem sağlığı verileri alınamadı: ${error.message || 'Bilinmeyen hata'}`);

      // Hata durumunda mock veri göster
      setSystemHealth({
        Status: 'Error',
        SystemInfo: null,
        DatabaseHealth: { Status: 'Error' },
        ApiHealth: { Status: 'Error' },
        PerformanceMetrics: null,
        RecentErrors: { TotalErrors: 0 }
      });
    } finally {
      console.log('Loading false yapılıyor...');
      setLoading(false);
      console.log('Loading state güncellendi');
    }
  };

  // Component mount olduğunda ve otomatik yenileme ayarlandığında
  useEffect(() => {
    fetchSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchSystemHealth, 30000); // 30 saniyede bir yenile
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh]);

  // Component unmount olduğunda interval'i temizle
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Durum rengini belirle
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
      case 'unhealthy':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Durum ikonu
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'error':
      case 'unhealthy':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Durum metnini Türkçe'ye çevir
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return 'Sağlıklı';
      case 'warning':
        return 'Uyarı';
      case 'error':
      case 'unhealthy':
        return 'Hata';
      case 'available':
        return 'Çalışıyor';
      default:
        return status || 'Kontrol Ediliyor';
    }
  };

  // Uptime formatı
  const formatUptime = (uptime) => {
    if (!uptime) return 'Bilinmiyor';
    
    const match = uptime.match(/(\d+)\.(\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, days, hours, minutes, seconds] = match;
      return `${days} gün, ${hours}:${minutes}:${seconds}`;
    }
    return uptime;
  };

  if (loading && !systemHealth) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
          <span className="mt-2 text-gray-600 dark:text-gray-400">Sistem sağlığı kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Sistem Sağlığı Monitörü
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sistem performansı ve sağlığını gerçek zamanlı olarak izleyin
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Otomatik yenileme toggle */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Otomatik Yenile</span>
          </label>
          
          {/* Manuel yenileme butonu */}
          <button
            onClick={fetchSystemHealth}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Son güncelleme zamanı */}
      {lastUpdate && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock size={16} />
          <span>Son güncelleme: {lastUpdate.toLocaleString('tr-TR')}</span>
        </div>
      )}

      {/* Genel Durum Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sistem Durumu */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sistem Durumu</p>
              <p className={`text-lg font-bold ${getStatusColor(systemHealth?.status)}`}>
                {getStatusText(systemHealth?.status)}
              </p>
            </div>
            {getStatusIcon(systemHealth?.status)}
          </div>
        </div>

        {/* Veritabanı Durumu */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Veritabanı</p>
              <p className={`text-lg font-bold ${getStatusColor(systemHealth?.databaseHealth?.status)}`}>
                {getStatusText(systemHealth?.databaseHealth?.status)}
              </p>
              {systemHealth?.databaseHealth?.responseTime && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {systemHealth.databaseHealth.responseTime}ms
                </p>
              )}
            </div>
            <Database className={`w-8 h-8 ${getStatusColor(systemHealth?.databaseHealth?.status)}`} />
          </div>
        </div>

        {/* API Durumu */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Servisleri</p>
              <p className={`text-lg font-bold ${getStatusColor(systemHealth?.apiHealth?.status)}`}>
                {getStatusText(systemHealth?.apiHealth?.status)}
              </p>
              {systemHealth?.apiHealth?.endpointCount && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {systemHealth.apiHealth.endpointCount} endpoint
                </p>
              )}
            </div>
            <Wifi className={`w-8 h-8 ${getStatusColor(systemHealth?.apiHealth?.status)}`} />
          </div>
        </div>

        {/* Hata Sayısı */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Son 24 Saat Hata</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {systemHealth?.recentErrors?.totalErrors || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">hata kaydı</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Detaylı Bilgiler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistem Bilgileri */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Sistem Bilgileri
          </h3>
          
          {systemHealth?.systemInfo && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">İşletim Sistemi:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {systemHealth.systemInfo.operatingSystem}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Mimari:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {systemHealth.systemInfo.architecture}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">İşlemci Sayısı:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {systemHealth.systemInfo.processorCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Makine Adı:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {systemHealth.systemInfo.machineName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">.NET Sürümü:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {systemHealth.systemInfo.dotNetVersion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Çalışma Süresi:</span>
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {formatUptime(systemHealth.systemInfo.applicationUptime)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Performans Metrikleri */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Performans Metrikleri
          </h3>
          
          {systemHealth?.performanceMetrics && (
            <div className="space-y-4">
              {/* CPU Kullanımı */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600 dark:text-gray-400">CPU Kullanımı</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {systemHealth.performanceMetrics.cpuUsage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(systemHealth.performanceMetrics.cpuUsage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Bellek Kullanımı */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Çalışma Belleği:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {systemHealth.performanceMetrics.memoryUsage?.workingSet}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Özel Bellek:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {systemHealth.performanceMetrics.memoryUsage?.privateMemory}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Thread Sayısı:</span>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {systemHealth.performanceMetrics.threadCount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Veritabanı İstatistikleri */}
      {systemHealth?.databaseHealth?.tableStatistics && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Veritabanı İstatistikleri
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {systemHealth.databaseHealth.tableStatistics.personelCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Personel</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {systemHealth.databaseHealth.tableStatistics.adliyeCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adliye</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {systemHealth.databaseHealth.tableStatistics.tayinTalebiCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tayin Talebi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {systemHealth.databaseHealth.tableStatistics.logCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Log Kaydı</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {systemHealth.databaseHealth.tableStatistics.adminCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {systemHealth.databaseHealth.tableStatistics.sssCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">SSS</p>
            </div>
          </div>
        </div>
      )}

      {/* Son Hatalar */}
      {systemHealth?.recentErrors?.recentErrors && systemHealth.recentErrors.recentErrors.length > 0 && (() => {
        const totalErrors = systemHealth.recentErrors.recentErrors.length;
        const totalPages = Math.ceil(totalErrors / errorsPerPage);
        const startIndex = (errorPage - 1) * errorsPerPage;
        const endIndex = startIndex + errorsPerPage;
        const currentErrors = systemHealth.recentErrors.recentErrors.slice(startIndex, endIndex);

        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
              Son Hatalar (24 Saat)
            </h3>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Hata Detayları İçin Sistem Logları Menüsünü Kullanınız
                  </h4>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    Detaylı hata bilgileri ve analiz için sol menüden "Sistem Kayıtları" bölümüne gidiniz.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {currentErrors.map((error, index) => (
                <div key={error.id || index} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-red-800 dark:text-red-200">
                        {error.islemTuru || error.IslemTuru || 'Sistem Hatası'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {error.islemZamani || error.IslemZamani ?
                          new Date(error.islemZamani || error.IslemZamani).toLocaleString('tr-TR') :
                          'Tarih bilinmiyor'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Sayfa {errorPage} / {totalPages} ({totalErrors} toplam hata)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setErrorPage(prev => Math.max(1, prev - 1))}
                    disabled={errorPage === 1}
                    className={`p-2 rounded-md ${
                      errorPage === 1
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {errorPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setErrorPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={errorPage === totalPages}
                    className={`p-2 rounded-md ${
                      errorPage === totalPages
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* API Endpoint'leri */}
      {systemHealth?.apiHealth?.endpoints && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Wifi className="w-5 h-5 mr-2" />
            API Endpoint Durumu
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemHealth.apiHealth.endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {endpoint.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {endpoint.path}
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(endpoint.status)}
                  <span className={`ml-2 text-sm font-medium ${getStatusColor(endpoint.status)}`}>
                    {getStatusText(endpoint.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemSagligi;
