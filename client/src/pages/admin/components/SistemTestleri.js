import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { TestTube, AlertTriangle, Database, Cpu, FileText, Play, CheckCircle, XCircle, Loader } from 'lucide-react';

const SistemTestleri = () => {
  const [testSonuclari, setTestSonuclari] = useState({});
  const [yukleniyor, setYukleniyor] = useState({});

  const testleriCalistir = async (testTipi, endpoint, aciklama) => {
    setYukleniyor(prev => ({ ...prev, [testTipi]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/TestHata/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestSonuclari(prev => ({
          ...prev,
          [testTipi]: { durum: 'basarili', mesaj: data.mesaj || 'Test başarıyla tamamlandı' }
        }));
        toast.success(`${aciklama} testi başarıyla tamamlandı`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setTestSonuclari(prev => ({
        ...prev,
        [testTipi]: { durum: 'hata', mesaj: error.message }
      }));
      toast.error(`${aciklama} testi sırasında hata oluştu: ${error.message}`);
    } finally {
      setYukleniyor(prev => ({ ...prev, [testTipi]: false }));
    }
  };

  const testButonlari = [
    {
      id: 'manuel-log',
      baslik: 'Manuel Log Oluştur',
      aciklama: 'Sistem loglarına manuel test kaydı ekler',
      icon: FileText,
      renk: 'blue',
      endpoint: 'log-olustur?mesaj=Test%20Mesaj',
    },
    {
      id: 'bolme-hatasi',
      baslik: 'Sıfıra Bölme Hatası',
      aciklama: 'Matematiksel hata simülasyonu yapar',
      icon: AlertTriangle,
      renk: 'orange',
      endpoint: 'bolme-hatasi?sayi=0',
    },
    {
      id: 'veritabani-hatasi',
      baslik: 'Veritabanı Hatası',
      aciklama: 'Veritabanı bağlantı hatası simülasyonu yapar',
      icon: Database,
      renk: 'red',
      endpoint: 'veritabani-hatasi',
    },
    {
      id: 'bellek-hatasi',
      baslik: 'Bellek Hatası',
      aciklama: 'Bellek yetersizliği hatası simülasyonu yapar',
      icon: Cpu,
      renk: 'purple',
      endpoint: 'bellek-hatasi',
    },
  ];

  const getRenkSinifi = (renk, tip = 'bg') => {
    const renkler = {
      blue: tip === 'bg' ? 'bg-blue-500' : 'text-blue-600',
      orange: tip === 'bg' ? 'bg-orange-500' : 'text-orange-600',
      red: tip === 'bg' ? 'bg-red-500' : 'text-red-600',
      purple: tip === 'bg' ? 'bg-purple-500' : 'text-purple-600',
    };
    return renkler[renk] || renkler.blue;
  };

  const getDurumIkonu = (durum) => {
    switch (durum) {
      case 'basarili':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'hata':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Açıklama */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-700">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 p-3 rounded-xl mr-4">
            <TestTube className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Sistem Test Araçları</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Sistem hatalarını test ederek log kayıtlarının doğru çalıştığını kontrol edin</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-1">Önemli Bilgi:</p>
              <p>Bu testler sistem hatalarını simüle eder ve log kayıtları oluşturur. Test sonuçlarını "Sistem Logları" bölümünden kontrol edebilirsiniz.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Butonları Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testButonlari.map((test) => {
          const Icon = test.icon;
          const yukleniyor_durum = yukleniyor[test.id];
          const sonuc = testSonuclari[test.id];

          return (
            <div key={test.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${getRenkSinifi(test.renk)}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{test.baslik}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{test.aciklama}</p>
                    </div>
                  </div>
                  {sonuc && getDurumIkonu(sonuc.durum)}
                </div>

                {/* Test Sonucu */}
                {sonuc && (
                  <div className={`mb-4 p-3 rounded-lg border ${
                    sonuc.durum === 'basarili'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-400'
                  }`}>
                    <p className="text-sm font-medium">
                      {sonuc.durum === 'basarili' ? 'Test Başarılı:' : 'Test Hatası:'}
                    </p>
                    <p className="text-sm mt-1">{sonuc.mesaj}</p>
                  </div>
                )}

                {/* Test Butonu */}
                <button
                  onClick={() => testleriCalistir(test.id, test.endpoint, test.baslik)}
                  disabled={yukleniyor_durum}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    yukleniyor_durum
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : `${getRenkSinifi(test.renk)} hover:opacity-90 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5`
                  }`}
                >
                  {yukleniyor_durum ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Test Çalışıyor...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Testi Çalıştır</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tüm Testleri Çalıştır */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Toplu Test İşlemi</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Tüm sistem testlerini sırayla çalıştırır</p>
          
          <button
            onClick={async () => {
              for (const test of testButonlari) {
                await testleriCalistir(test.id, test.endpoint, test.baslik);
                // Testler arasında kısa bir bekleme
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }}
            disabled={Object.values(yukleniyor).some(Boolean)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Tüm Testleri Çalıştır</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SistemTestleri;
