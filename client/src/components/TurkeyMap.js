import React from 'react';
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
    // GeoJSON verisini state olarak tutalım
    const [geographies, setGeographies] = React.useState([]);
    const [errorMessage, setErrorMessage] = React.useState('');
    // Tooltip tamamen kaldırıldı
    const [selectedTercih, setSelectedTercih] = React.useState(null);
    
    // GeoJSON verisini component mount olduğunda yükleyelim
    React.useEffect(() => {
        fetch(geoUrl)
            .then(res => res.json())
            .then(data => {
                setGeographies(data);
            })
            .catch(error => console.error("Harita verileri yüklenirken hata oluştu:", error));
    }, []);
    
    // Seçilen illerin listesini oluştur
    const selectedIller = tercihler
        .filter(tercih => tercih && tercih.label) // Geçerli tercihleri filtrele
        .map(tercih => {
            const ilAdi = extractIlFromAdliye(tercih.label);
            return normalizeIlAdi(ilAdi);
        });
    
    // Kullanıcıya hangi tercih sırasında olduğunu gösterme fonksiyonu
    const getNextTercihSirasi = () => {
        // Seçilen il sayısı + 1 = bir sonraki tercih sırası
        return selectedIller.length + 1;
    };
    
    // Tooltip'ler tamamen kaldırıldığı için fare olayları boş fonksiyonlar
    const handleMouseMove = (geo, event) => { };
    
    // Haritadan fare çıkışı işleyicisi
    const handleMouseLeave = () => { };
    
    // İl tıklama işleyicisi
    const handleIlClick = (geo, event) => {
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
        
        // Hangi tercih sırasında olduğunu göster
        const tercihSirasi = getNextTercihSirasi();
        setSelectedTercih({
            il: ilAdi,
            sira: tercihSirasi
        });
        
        // 2 saniye sonra seçilen tercihi temizle
        setTimeout(() => setSelectedTercih(null), 2000);
        
        // İl adını form bileşenine ilet
        onIlSelect(ilAdi);
    };

    return (
        <div className="turkey-map-container relative">
            <div className="turkey-map-title mb-1">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Tercih Ettiğiniz İller</span>
            </div>
            
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Haritadan doğrudan tercih yapabilirsiniz</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Haritada istediğiniz ile tıklayarak tercih listesine ekleyebilirsiniz</li>
                            </ul>
                        </div>
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
            
            {/* Seçim bilgisi bildirimi */}
            {selectedTercih && (
                <div className="absolute top-40 right-4 z-10 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in">
                    <div className="flex items-center">
                        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <div>
                            <p className="font-bold">{selectedTercih.il}</p>
                            <p className="text-sm">{selectedTercih.sira}. tercihiniz olarak eklendi</p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Tüm tooltip'ler tamamen kaldırıldı */}
            
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 2200,
                    center: [35.5, 39]
                }}
                width={800}
                height={450}
                style={{ 
                    width: "100%", 
                    height: "auto", 
                    maxWidth: "100%",
                    borderRadius: "0.5rem",
                    overflow: "visible"
                }}
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map(geo => {
                            const cityId = geo.properties.name ? normalizeIlAdi(geo.properties.name) : '';
                            const isSelected = selectedIller.includes(cityId);
                            
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onClick={(event) => handleIlClick(geo, event)}
                                    className="il-hover"
                                    style={{
                                        default: {
                                            fill: isSelected ? '#10b981' : '#e5e7eb',
                                            stroke: '#FFFFFF',
                                            strokeWidth: 0.75,
                                            outline: 'none',
                                            transition: 'all 0.3s ease'
                                        },
                                        hover: {
                                            fill: isSelected ? '#059669' : '#d1d5db',
                                            stroke: '#FFFFFF',
                                            strokeWidth: 0.75,
                                            outline: 'none',
                                            cursor: 'pointer'
                                        },
                                        pressed: {
                                            fill: isSelected ? '#047857' : '#9ca3af',
                                            stroke: '#FFFFFF',
                                            strokeWidth: 0.75,
                                            outline: 'none'
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
                                style={{
                                    fontSize: "0.65rem",
                                    fontWeight: isSelected ? "bold" : "normal",
                                    fill: isSelected ? "#000" : "#555",
                                    pointerEvents: "none",
                                    textShadow: "0px 0px 3px #ffffff, 0px 0px 3px #ffffff"
                                }}
                            >
                                {name}
                            </text>
                        </Annotation>
                    );
                })}
            </ComposableMap>
            
            <div className="map-legend">
                <div className="legend-item">
                    <div className="legend-color selected-color"></div>
                    <span>Tercih Edilen İller</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color unselected-color"></div>
                    <span>Diğer İller</span>
                </div>
            </div>
        </div>
    );
}

export default TurkeyMap;
