import React, { useState, useEffect } from 'react';
import { sssService } from '../services/api';

const SSSPage = () => {
  const [sorular, setSorular] = useState([]);
  const [filteredSorular, setFilteredSorular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [kategoriler, setKategoriler] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // SSS verilerini yükle
  useEffect(() => {
    const fetchSSSData = async () => {
      try {
        setLoading(true);
        const data = await sssService.getSikcaSorulanSorular();
        
        // Soruları kaydet
        setSorular(data);
        setFilteredSorular(data);
        
        // Kategorileri çıkar
        const uniqueKategoriler = [...new Set(data.map(soru => soru.kategori))];
        setKategoriler(uniqueKategoriler);
        
        setLoading(false);
      } catch (err) {
        console.error('Sık sorulan sorular yüklenirken hata oluştu:', err);
        setError('Sık sorulan sorular yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };

    fetchSSSData();
  }, []);

  // Arama veya kategori filtreleme
  useEffect(() => {
    const filterSorular = async () => {
      try {
        if (searchTerm.trim() !== '') {
          // API üzerinden arama yap
          const searchResults = await sssService.searchSikcaSorulanSorular(searchTerm);
          
          // Eğer kategori filtresi de varsa, sonuçları filtrele
          if (selectedKategori) {
            setFilteredSorular(searchResults.filter(soru => soru.kategori === selectedKategori));
          } else {
            setFilteredSorular(searchResults);
          }
        } else if (selectedKategori) {
          // Sadece kategori filtresi varsa
          const kategoriResults = await sssService.getSikcaSorulanSorularByKategori(selectedKategori);
          setFilteredSorular(kategoriResults);
        } else {
          // Hiçbir filtre yoksa tüm soruları göster
          setFilteredSorular(sorular);
        }
      } catch (err) {
        console.error('Sorular filtrelenirken hata oluştu:', err);
        setError('Sorular filtrelenirken bir hata oluştu.');
      }
    };

    if (!loading) {
      filterSorular();
    }
  }, [searchTerm, selectedKategori, sorular, loading]);

  // Soruyu genişlet/daralt
  const toggleQuestion = (id) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Arama terimine göre metni vurgula
  const highlightText = (text, highlight) => {
    if (!highlight.trim() || !text) {
      return text;
    }
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? 
            <span key={i} className="bg-yellow-200 font-medium">{part}</span> : 
            <span key={i}>{part}</span>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <div className="relative">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-100"></div>
        </div>
        <span className="mt-4 text-gray-600 font-medium">Sık sorulan sorular yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-xl mr-4">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Hata Oluştu</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Arama ve Filtreleme */}
      <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-2xl border border-gray-200/50 shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="bg-primary-100 p-3 rounded-xl mr-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Arama ve Filtreleme</h3>
            <p className="text-sm text-gray-600">Sorular arasında arama yapın veya kategoriye göre filtreleyin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Soru veya cevaplarda arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 hover:border-gray-400"
              />
              <div className="absolute left-4 top-3.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <div className="relative">
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 appearance-none hover:border-gray-400"
              >
                <option value="">Tüm Kategoriler</option>
                {kategoriler.map((kategori, index) => (
                  <option key={index} value={kategori}>{kategori}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Sonuç Özeti */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 p-4 rounded-xl">
        <div className="flex items-center">
          <div className="bg-gray-100 p-2 rounded-lg mr-3">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
          <div>
            {filteredSorular.length === 0 ? (
              <div>
                <p className="text-gray-800 font-medium">Aramanıza uygun soru bulunamadı</p>
                <p className="text-gray-600 text-sm">Farklı anahtar kelimeler deneyebilir veya kategori filtresini değiştirebilirsiniz.</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 font-medium">
                  {filteredSorular.length} adet soru bulundu
                </p>
                <p className="text-gray-600 text-sm">
                  {selectedKategori && `"${selectedKategori}" kategorisinde`}
                  {searchTerm && ` "${searchTerm}" araması için`}
                  {!selectedKategori && !searchTerm && 'Tüm kategorilerden'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern SSS Listesi */}
      {filteredSorular.length > 0 && (
        <div className="space-y-4">
          {filteredSorular.map((soru) => (
            <div
              key={soru.id}
              className="bg-gradient-to-br from-white to-gray-50/30 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <button
                className={`w-full text-left p-6 flex justify-between items-start gap-4 transition-all duration-200 ${
                  expandedQuestions[soru.id]
                    ? 'bg-gradient-to-r from-primary-50 to-blue-50'
                    : 'hover:bg-gray-50/50'
                }`}
                onClick={() => toggleQuestion(soru.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-sm">
                      {soru.kategori}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {highlightText(soru.soru, searchTerm)}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className={`p-2 rounded-lg transition-all duration-200 ${
                    expandedQuestions[soru.id]
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                    <svg
                      className={`w-5 h-5 transform ${expandedQuestions[soru.id] ? 'rotate-180' : ''} transition-transform duration-200`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>

              {expandedQuestions[soru.id] && (
                <div className="px-6 pb-6 bg-white border-t border-gray-200/50">
                  <div className="pt-4">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-lg mr-4 mt-1">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Cevap:</h4>
                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                          <p>{highlightText(soru.cevap, searchTerm)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SSSPage;
