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
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sık Sorulan Sorular</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {/* Arama ve Filtreleme */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Soru veya cevaplarda arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="md:w-72">
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tüm Kategoriler</option>
            {kategoriler.map((kategori, index) => (
              <option key={index} value={kategori}>{kategori}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Sonuç özeti */}
      <div className="mb-6 text-sm text-gray-600">
        {filteredSorular.length === 0 ? (
          <p>Aramanıza uygun soru bulunamadı.</p>
        ) : (
          <p>
            {filteredSorular.length} adet soru bulundu
            {selectedKategori && ` "${selectedKategori}" kategorisinde`}
            {searchTerm && ` "${searchTerm}" araması için`}.
          </p>
        )}
      </div>
      
      {/* SSS Listesi */}
      <div className="space-y-4">
        {filteredSorular.map((soru) => (
          <div 
            key={soru.id} 
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
          >
            <button
              className={`w-full text-left p-4 flex justify-between items-start gap-4 ${
                expandedQuestions[soru.id] ? 'bg-primary-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleQuestion(soru.id)}
            >
              <div className="flex-1">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full mb-2">
                  {soru.kategori}
                </span>
                <h3 className="text-lg font-medium text-gray-900">
                  {highlightText(soru.soru, searchTerm)}
                </h3>
              </div>
              <div className="text-gray-500">
                <svg 
                  className={`w-5 h-5 transform ${expandedQuestions[soru.id] ? 'rotate-180' : ''} transition-transform duration-200`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            
            {expandedQuestions[soru.id] && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="prose max-w-none text-gray-700">
                  <p>{highlightText(soru.cevap, searchTerm)}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SSSPage;
