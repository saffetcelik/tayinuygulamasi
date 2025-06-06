import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Globe, Server, Database } from 'lucide-react';

const APIDokumantasyon = () => {
  const [swaggerLoaded, setSwaggerLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking');
  const [iframeKey, setIframeKey] = useState(0);

  // API durumunu kontrol et
  const checkApiStatus = async () => {
    setApiStatus('checking');
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    }
  };

  // Component yüklendiğinde API durumunu kontrol et
  useEffect(() => {
    checkApiStatus();
  }, []);

  // Swagger sayfasını yenile
  const refreshSwagger = () => {
    setIframeKey(prev => prev + 1);
    setSwaggerLoaded(false);
  };

  // Swagger sayfasını yeni sekmede aç
  const openSwaggerInNewTab = () => {
    window.open('http://localhost:5000/', '_blank');
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'online':
        return 'API Çevrimiçi';
      case 'offline':
        return 'API Çevrimdışı';
      case 'checking':
        return 'Kontrol Ediliyor...';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Durum */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-xl mr-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">API Dokümantasyonu</h2>
              <p className="text-gray-600 text-sm">Swagger/OpenAPI arayüzü ile API endpoint'lerini keşfedin</p>
            </div>
          </div>
          
          {/* API Durum Göstergesi */}
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="font-medium text-sm">{getStatusText()}</span>
          </div>
        </div>

        {/* Kontrol Butonları */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={checkApiStatus}
            disabled={apiStatus === 'checking'}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} />
            <span>Durumu Kontrol Et</span>
          </button>
          
          <button
            onClick={refreshSwagger}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Swagger'ı Yenile</span>
          </button>
          
          <button
            onClick={openSwaggerInNewTab}
            className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Yeni Sekmede Aç</span>
          </button>
        </div>
      </div>

      {/* API Bilgileri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-3">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">API Sunucusu</h3>
              <p className="text-gray-600 text-sm">Backend API durumu</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">URL:</span>
              <span className="font-mono text-sm">localhost:5000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Protokol:</span>
              <span className="font-mono text-sm">HTTP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Versiyon:</span>
              <span className="font-mono text-sm">v1.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg mr-3">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Swagger UI</h3>
              <p className="text-gray-600 text-sm">Interaktif API dokümantasyonu</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Swagger URL:</span>
              <span className="font-mono text-sm">/swagger</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">JSON URL:</span>
              <span className="font-mono text-sm">/swagger/v1/swagger.json</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-mono text-sm">OpenAPI 3.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-lg mr-3">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Veritabanı</h3>
              <p className="text-gray-600 text-sm">PostgreSQL bağlantısı</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Tür:</span>
              <span className="font-mono text-sm">PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Host:</span>
              <span className="font-mono text-sm">localhost</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Veritabanı:</span>
              <span className="font-mono text-sm">tayin</span>
            </div>
          </div>
        </div>
      </div>

      {/* JWT Token Kullanım Rehberi - Minimal */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-4">
        <div className="flex items-center">
          <div className="bg-amber-500 p-2 rounded-lg mr-3 flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-800 mb-2">
              🔐 API Test Rehberi
            </h3>
            <div className="text-sm text-amber-700 space-y-1">
              <p>
                <strong>1.</strong> <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">/api/Admin/login</code> ile giriş yapın
                <strong className="mx-2">→</strong>
                <strong>2.</strong> Token'ı kopyalayın
                <strong className="mx-2">→</strong>
                <strong>3.</strong> <strong>"Authorize"</strong> butonuna tıklayıp <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">Bearer &#123;token&#125;</code> yapıştırın
              </p>
              <p className="text-xs text-amber-600">
                💡 Token süresi: 8 saat | Artık tüm API'leri test edebilirsiniz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger Iframe */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Swagger UI - API Dokümantasyonu</h3>
            <div className="flex items-center space-x-2">
              {!swaggerLoaded && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Yükleniyor...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative" style={{ height: '800px' }}>
          {apiStatus === 'offline' ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">API Sunucusu Çevrimdışı</h3>
                <p className="text-gray-600 mb-4">
                  Swagger dokümantasyonunu görüntülemek için API sunucusunun çalışıyor olması gerekir.
                </p>
                <button
                  onClick={checkApiStatus}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              src="http://localhost:5000/"
              className="w-full h-full border-0"
              title="Swagger API Dokümantasyonu"
              onLoad={() => setSwaggerLoaded(true)}
              onError={() => setSwaggerLoaded(false)}
            />
          )}
        </div>
      </div>

      {/* Kullanım Bilgileri */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Kullanım Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">API Endpoint'leri</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/Admin</code> - Admin işlemleri</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/Personel</code> - Personel işlemleri</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/TayinTalebi</code> - Tayin talepleri</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/Log</code> - Sistem logları</li>
              <li>• <code className="bg-gray-100 px-2 py-1 rounded">/api/Health</code> - Sistem sağlığı</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Kimlik Doğrulama</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• JWT Bearer Token kullanılır</li>
              <li>• Admin ve Personel için ayrı token'lar</li>
              <li>• Token süresi: 8 saat</li>
              <li>• Authorization header gereklidir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDokumantasyon;
