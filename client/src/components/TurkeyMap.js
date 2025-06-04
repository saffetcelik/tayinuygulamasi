import React, { useState, useEffect } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Annotation
} from 'react-simple-maps';
import './TurkeyMap.css';

// GeoJSON dosyasının yolu
const geoUrl = '/turkey-provinces.json';

// Türkiye illerinin isimleri ve haritadaki koordinatları
const turkeyProvinces = [
  { name: "Adana", coordinates: [35.3, 37.0] },
  { name: "Adıyaman", coordinates: [38.3, 37.8] },
  { name: "Afyonkarahisar", coordinates: [30.5, 38.8] },
  { name: "Ağrı", coordinates: [43.05, 39.7] },
  { name: "Amasya", coordinates: [35.85, 40.65] },
  { name: "Ankara", coordinates: [32.85, 39.9] },
  { name: "Antalya", coordinates: [30.7, 36.9] },
  { name: "Artvin", coordinates: [41.8, 41.2] },
  { name: "Aydın", coordinates: [27.85, 37.85] },
  { name: "Balıkesir", coordinates: [27.9, 39.65] },
  { name: "Bilecik", coordinates: [29.95, 40.15] },
  { name: "Bingöl", coordinates: [40.5, 39.05] },
  { name: "Bitlis", coordinates: [42.1, 38.4] },
  { name: "Bolu", coordinates: [31.6, 40.75] },
  { name: "Burdur", coordinates: [30.3, 37.7] },
  { name: "Bursa", coordinates: [29.05, 40.2] },
  { name: "Çanakkale", coordinates: [26.4, 40.15] },
  { name: "Çankırı", coordinates: [33.6, 40.6] },
  { name: "Çorum", coordinates: [34.95, 40.55] },
  { name: "Denizli", coordinates: [29.1, 37.75] },
  { name: "Diyarbakır", coordinates: [40.25, 37.9] },
  { name: "Edirne", coordinates: [26.55, 41.65] },
  { name: "Elazığ", coordinates: [39.2, 38.65] },
  { name: "Erzincan", coordinates: [39.5, 39.75] },
  { name: "Erzurum", coordinates: [41.3, 39.9] },
  { name: "Eskişehir", coordinates: [30.5, 39.8] },
  { name: "Gaziantep", coordinates: [37.4, 37.05] },
  { name: "Giresun", coordinates: [38.4, 40.9] },
  { name: "Gümüşhane", coordinates: [39.5, 40.45] },
  { name: "Hakkari", coordinates: [43.75, 37.55] },
  { name: "Hatay", coordinates: [36.2, 36.2] },
  { name: "Isparta", coordinates: [30.55, 37.75] },
  { name: "İçel", coordinates: [34.6, 36.8] },
  { name: "İstanbul", coordinates: [29.0, 41.1] },
  { name: "İzmir", coordinates: [27.15, 38.4] },
  { name: "Kars", coordinates: [43.1, 40.6] },
  { name: "Kastamonu", coordinates: [33.75, 41.4] },
  { name: "Kayseri", coordinates: [35.5, 38.7] },
  { name: "Kırklareli", coordinates: [27.2, 41.75] },
  { name: "Kırşehir", coordinates: [34.15, 39.15] },
  { name: "Kocaeli", coordinates: [29.95, 40.75] },
  { name: "Konya", coordinates: [32.5, 37.85] },
  { name: "Kütahya", coordinates: [29.95, 39.4] },
  { name: "Malatya", coordinates: [38.3, 38.35] },
  { name: "Manisa", coordinates: [27.45, 38.6] },
  { name: "K.Maraş", coordinates: [36.95, 37.5] },
  { name: "Mardin", coordinates: [40.75, 37.3] },
  { name: "Muğla", coordinates: [28.35, 37.2] },
  { name: "Muş", coordinates: [41.5, 38.75] },
  { name: "Nevşehir", coordinates: [34.7, 38.6] },
  { name: "Niğde", coordinates: [34.7, 37.95] },
  { name: "Ordu", coordinates: [37.85, 40.95] },
  { name: "Rize", coordinates: [40.5, 41.0] },
  { name: "Sakarya", coordinates: [30.4, 40.75] },
  { name: "Samsun", coordinates: [36.35, 41.3] },
  { name: "Siirt", coordinates: [41.95, 37.95] },
  { name: "Sinop", coordinates: [35.15, 42.0] },
  { name: "Sivas", coordinates: [37.0, 39.75] },
  { name: "Tekirdağ", coordinates: [27.5, 41.0] },
  { name: "Tokat", coordinates: [36.55, 40.3] },
  { name: "Trabzon", coordinates: [39.75, 41.0] },
  { name: "Tunceli", coordinates: [39.55, 39.1] },
  { name: "Şanlıurfa", coordinates: [38.8, 37.15] },
  { name: "Uşak", coordinates: [29.4, 38.7] },
  { name: "Van", coordinates: [43.4, 38.5] },
  { name: "Yozgat", coordinates: [34.8, 39.8] },
  { name: "Zonguldak", coordinates: [31.8, 41.45] },
  { name: "Aksaray", coordinates: [34.0, 38.35] },
  { name: "Bayburt", coordinates: [40.2, 40.25] },
  { name: "Karaman", coordinates: [33.2, 37.2] },
  { name: "Kırıkkale", coordinates: [33.5, 39.85] },
  { name: "Batman", coordinates: [41.15, 37.9] },
  { name: "Şırnak", coordinates: [42.45, 37.5] },
  { name: "Bartın", coordinates: [32.35, 41.65] },
  { name: "Ardahan", coordinates: [42.7, 41.1] },
  { name: "Iğdır", coordinates: [44.05, 39.9] },
  { name: "Yalova", coordinates: [29.25, 40.65] },
  { name: "Karabük", coordinates: [32.6, 41.2] },
  { name: "Kilis", coordinates: [37.1, 36.7] },
  { name: "Osmaniye", coordinates: [36.25, 37.1] },
  { name: "Düzce", coordinates: [31.15, 40.85] }
];

// İl isimlerini normalize etmek için yardımcı fonksiyon
const normalizeIlAdi = (ilAdi) => {
    if (!ilAdi) return '';
    
    // Bazı il isimleri için özel eşleştirmeler
    const specialCases = {
        'afyon': 'afyonkarahisar',
        'afyonkarahisar': 'afyonkarahisar',
        'içel': 'mersin',
        'k.maraş': 'kahramanmaras',
        'kahramanmaraş': 'kahramanmaras'
    };
    
    const normalized = ilAdi.toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/\s+/g, '');
    
    // Özel durumları kontrol et
    return specialCases[normalized] || normalized;
};

// Adliye adından il adını çıkaran yardımcı fonksiyon
const extractIlFromAdliye = (adliyeAdi) => {
    // Adliye adı genelde "Ankara Adliyesi", "İstanbul Anadolu Adliyesi" gibi formatlarda olur
    // İlk kelime genelde il adıdır
    if (!adliyeAdi) return '';
    const firstWord = adliyeAdi.split(' ')[0];
    return firstWord;
};

function TurkeyMap({ tercihler = [], onIlSelect = null, maxTercih = 3 }) {
    const [errorMessage, setErrorMessage] = React.useState('');
    const [animatingProvinces, setAnimatingProvinces] = useState(new Set());
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    // İlk yüklemede enerji dalgası animasyonu
    useEffect(() => {
        if (isInitialLoad) {
            // 1 saniye bekle sonra dalga animasyonunu başlat
            setTimeout(() => {
                // Tüm şehirleri koordinatlarına göre soldan sağa sırala
                const sortedProvinces = [...turkeyProvinces]
                    .sort((a, b) => a.coordinates[0] - b.coordinates[0])
                    .map(p => normalizeIlAdi(p.name));

                // Optimize edilmiş dalga efekti - lag'sız
                let waveIndex = 0;
                const waveSize = Math.ceil(sortedProvinces.length / 12); // 12 dalga grubu (daha az state değişikliği)

                const waveInterval = setInterval(() => {
                    const startIndex = waveIndex * waveSize;
                    const endIndex = Math.min(startIndex + waveSize, sortedProvinces.length);
                    const currentWaveProvinces = sortedProvinces.slice(startIndex, endIndex);

                    // Batch state update - tek seferde güncelle
                    setAnimatingProvinces(prev => {
                        const newSet = new Set(prev);

                        // Yeni dalga grubunu ekle
                        currentWaveProvinces.forEach(province => newSet.add(province));

                        // Önceki dalga grubunu kaldır (aynı anda)
                        if (waveIndex > 2) {
                            const prevStartIndex = (waveIndex - 3) * waveSize;
                            const prevEndIndex = Math.min(prevStartIndex + waveSize, sortedProvinces.length);
                            const prevWaveProvinces = sortedProvinces.slice(prevStartIndex, prevEndIndex);
                            prevWaveProvinces.forEach(province => newSet.delete(province));
                        }

                        return newSet;
                    });

                    waveIndex++;

                    // Dalga tamamlandığında
                    if (waveIndex >= 12) {
                        clearInterval(waveInterval);

                        // 1800ms sonra tüm animasyonu temizle
                        setTimeout(() => {
                            setAnimatingProvinces(new Set());
                            setIsInitialLoad(false);
                        }, 1800);
                    }
                }, 100); // Her 100ms'de bir dalga grubu (daha az frequent update)
            }, 1000);
        }
    }, [isInitialLoad]);

    // Seçilen illerin listesini oluştur
    const selectedIller = tercihler
        .filter(tercih => tercih && tercih.label) // Geçerli tercihleri filtrele
        .map(tercih => {
            const ilAdi = extractIlFromAdliye(tercih.label);
            return normalizeIlAdi(ilAdi);
        });
    

    
    // İl tıklama işleyicisi
    const handleIlClick = (geo) => {
        if (!onIlSelect) return; // Eğer tıklama işlevi verilmemişse hiçbir şey yapma
        
        const ilAdi = geo.properties.name;
        const normalizedIlAdi = normalizeIlAdi(ilAdi);
        
        // Eğer bu il zaten seçiliyse, işlem yapma
        if (selectedIller.includes(normalizedIlAdi)) {
            return;
        }
        
        // Eğer maksimum tercih sayısına ulaşıldıysa uyarı göster
        if (selectedIller.length >= maxTercih) {
            setErrorMessage(`Maksimum ${maxTercih} tercih yapabilirsiniz!`);
            // 3 saniye sonra hata mesajını temizle
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }
        

        
        // İl adını form bileşenine ilet
        onIlSelect(ilAdi);
    };

    return (
        <div className="modern-turkey-map-container">
            {/* Modern Header */}
            <div className="modern-map-header">
                <div className="header-content">
                    <div className="header-icon">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    </div>
                    <div className="header-text">
                        <h3 className="header-title">Türkiye Haritası</h3>
                        <p className="header-subtitle">Haritadan doğrudan tercih yapabilirsiniz</p>
                    </div>
                </div>

                {/* Interactive Stats */}
                <div className="map-stats">
                    <div className="stat-item">
                        <span className="stat-number">{selectedIller.length}</span>
                        <span className="stat-label">Seçilen</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">{maxTercih - selectedIller.length}</span>
                        <span className="stat-label">Kalan</span>
                    </div>
                </div>
            </div>
            
            {errorMessage && (
                <div className="mt-2 mb-2 flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md border-l-4 border-red-500 animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{errorMessage}</span>
                </div>
            )}
            

            
            {/* Tüm tooltip'ler tamamen kaldırıldı */}

            {/* Modern Map Container */}
            <div className="modern-map-wrapper">
                <div className="map-background-pattern"></div>

                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        scale: 5500,
                        center: [35.5, 39]
                    }}
                    width={1800}
                    height={1000}
                    className="modern-composable-map"
                >
                    {/* Modern SVG Gradients */}
                    <defs>
                        <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                        </linearGradient>

                        <linearGradient id="selectedHoverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#4f46e5" stopOpacity="1" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.9" />
                        </linearGradient>

                        <linearGradient id="selectedPressedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="1" />
                            <stop offset="50%" stopColor="#4338ca" stopOpacity="1" />
                            <stop offset="100%" stopColor="#6d28d9" stopOpacity="1" />
                        </linearGradient>

                        <filter id="modernShadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.1"/>
                        </filter>

                        <filter id="selectedShadow">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.3"/>
                        </filter>

                        {/* Modern Professional Wave Gradients */}
                        <linearGradient id="professionalWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f8fafc" stopOpacity="1"/>
                            <stop offset="20%" stopColor="#e2e8f0" stopOpacity="0.9"/>
                            <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.3"/>
                            <stop offset="60%" stopColor="#6366f1" stopOpacity="0.5"/>
                            <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#f8fafc" stopOpacity="1"/>
                        </linearGradient>

                        <linearGradient id="subtleHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.8"/>
                            <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.6"/>
                            <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.4"/>
                        </linearGradient>

                        {/* Lightweight Professional Glow Filter */}
                        <filter id="professionalGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map(geo => {
                            const cityId = geo.properties.name ? normalizeIlAdi(geo.properties.name) : '';
                            const isSelected = selectedIller.includes(cityId);
                            const isAnimating = animatingProvinces.has(cityId);

                            // Modern profesyonel dalga efekti
                            const getProfessionalWaveFill = () => {
                                return 'url(#subtleHighlight)';
                            };
                            
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onClick={() => handleIlClick(geo)}
                                    className="modern-province"
                                    style={{
                                        default: {
                                            fill: isAnimating
                                                ? getProfessionalWaveFill()
                                                : isSelected
                                                ? 'url(#selectedGradient)'
                                                : '#f8fafc',
                                            stroke: isAnimating
                                                ? '#6366f1'
                                                : isSelected ? '#3b82f6' : '#94a3b8',
                                            strokeWidth: isAnimating
                                                ? 1.3
                                                : isSelected ? 1.5 : 1.2,
                                            outline: 'none',
                                            transition: 'fill 0.3s ease-out, stroke 0.3s ease-out, filter 0.3s ease-out',
                                            filter: isAnimating
                                                ? 'url(#professionalGlow)'
                                                : isSelected
                                                ? 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))'
                                                : 'none'
                                        },
                                        hover: {
                                            fill: isSelected
                                                ? 'url(#selectedHoverGradient)'
                                                : '#f1f5f9',
                                            stroke: isSelected ? '#2563eb' : '#64748b',
                                            strokeWidth: isSelected ? 1.8 : 1.5,
                                            outline: 'none',
                                            cursor: 'pointer',
                                            filter: isSelected
                                                ? 'drop-shadow(0 6px 8px rgba(59, 130, 246, 0.4))'
                                                : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                                        },
                                        pressed: {
                                            fill: isSelected
                                                ? 'url(#selectedPressedGradient)'
                                                : '#e2e8f0',
                                            stroke: isSelected ? '#1d4ed8' : '#64748b',
                                            strokeWidth: isSelected ? 2 : 1.5,
                                            outline: 'none',
                                            filter: isSelected
                                                ? 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.5))'
                                                : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                                        }
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
                
                {/* Sabit il konumları ve isimleri için */}
                {turkeyProvinces.map(province => {
                    const { name, coordinates } = province;
                    const cityId = name ? normalizeIlAdi(name) : '';
                    const isSelected = selectedIller.includes(cityId);
                    
                    return (
                        <Annotation
                            key={`annotation-${name}`}
                            subject={coordinates}
                            dx={0}
                            dy={0}
                            connectorProps={{
                                stroke: "transparent",
                                strokeWidth: 0,
                            }}
                        >
                            <text
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                className="modern-province-label"
                                style={{
                                    fontSize: isSelected ? "1.5rem" : "1.3rem",
                                    fontWeight: isSelected ? "600" : "500",
                                    fill: isSelected ? "#1e40af" : "#64748b",
                                    pointerEvents: "none",
                                    textShadow: isSelected
                                        ? "0px 0px 6px rgba(255,255,255,1), 0px 2px 4px rgba(59,130,246,0.4), 0px 0px 2px rgba(255,255,255,1)"
                                        : "0px 0px 4px rgba(255,255,255,1), 0px 1px 2px rgba(0,0,0,0.2), 0px 0px 2px rgba(255,255,255,0.9)",
                                    transition: "all 0.3s ease",
                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
                                }}
                            >
                                {name}
                            </text>

                            {/* Selected Province Indicator */}
                            {isSelected && (
                                <circle
                                    cx={0}
                                    cy={-12}
                                    r={3}
                                    fill="#3b82f6"
                                    className="modern-selection-indicator"
                                    style={{
                                        filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.4))"
                                    }}
                                >
                                    <animate
                                        attributeName="r"
                                        values="2;4;2"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0.6;1;0.6"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}
                        </Annotation>
                    );
                })}
            </ComposableMap>
            </div>


        </div>
    );
}

export default TurkeyMap;
