import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../../services/api';
import { HelpCircle, Edit2, Trash2, Plus, Search, Check, X, Save, ChevronUp, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

const SSSYonetimi = () => {
  const [sorular, setSorular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentSSS, setCurrentSSS] = useState(null);
  const [formData, setFormData] = useState({
    soru: '',
    cevap: '',
    kategori: '',
    siraNo: 0,
    aktifMi: true
  });
  const [kategoriler, setKategoriler] = useState([]);
  const [yeniKategori, setYeniKategori] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // SSS'leri yükle
  useEffect(() => {
    fetchSSS();
    fetchKategoriler();
  }, []);

  // SSS listesini getir
  const fetchSSS = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllSSS();
      setSorular(data);
    } catch (error) {
      toast.error('Sık sorulan sorular yüklenirken bir hata oluştu.');
      console.error('SSS yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kategorileri getir
  const fetchKategoriler = async () => {
    try {
      const data = await adminService.getSSSKategorileri();
      setKategoriler(data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  // Form alanı değişikliklerini izle
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Yeni SSS ekle
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Kategori kontrolü - yeni kategori girildiyse onu kullan
      const kategori = formData.kategori === 'yeni' ? yeniKategori : formData.kategori;
      
      if (editMode && currentSSS) {
        // Güncelleme
        // Backend modeliyle uyumlu olacak şekilde veri yapısını oluştur
        const updateData = {
          id: currentSSS.id,
          soru: formData.soru,
          cevap: formData.cevap,
          kategori: kategori,
          siraNo: parseInt(formData.siraNo),
          aktifMi: formData.aktifMi,
          // EklenmeTarihi ve GuncellenmeTarihi backend'de otomatik ayarlanacak
          eklenmeTarihi: currentSSS.eklenmeTarihi // Mevcut eklenme tarihini koru
        };
        
        await adminService.updateSSS(currentSSS.id, updateData);
        toast.success('Sık sorulan soru başarıyla güncellendi.');
      } else {
        // Yeni ekleme
        const createData = {
          soru: formData.soru,
          cevap: formData.cevap,
          kategori: kategori,
          siraNo: parseInt(formData.siraNo),
          aktifMi: formData.aktifMi
          // EklenmeTarihi backend'de otomatik ayarlanacak
        };
        
        await adminService.createSSS(createData);
        toast.success('Sık sorulan soru başarıyla eklendi.');
      }
      
      // Formu sıfırla ve listeyi yenile
      resetForm();
      await fetchSSS();
      await fetchKategoriler();
    } catch (error) {
      toast.error(editMode ? 'Soru güncellenirken hata oluştu.' : 'Soru eklenirken hata oluştu.');
      console.error('SSS işlemi sırasında hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      soru: '',
      cevap: '',
      kategori: '',
      siraNo: 0,
      aktifMi: true
    });
    setYeniKategori('');
    setEditMode(false);
    setCurrentSSS(null);
    setShowForm(false);
  };

  // SSS düzenleme modunu aç
  const handleEdit = (sss) => {
    setCurrentSSS(sss);
    setFormData({
      soru: sss.soru,
      cevap: sss.cevap,
      kategori: sss.kategori,
      siraNo: sss.siraNo,
      aktifMi: sss.aktifMi
    });
    setEditMode(true);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // SSS'yi sil
  const handleDelete = async (id) => {
    // Modern SweetAlert2 ile onay al
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu soruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil!',
      cancelButtonText: 'İptal',
      reverseButtons: true
    });
    
    if (result.isConfirmed) {
      try {
        setLoading(true);
        await adminService.deleteSSS(id);
        
        // Başarılı işlem bildirimi
        Swal.fire({
          title: 'Silindi!',
          text: 'Sık sorulan soru başarıyla silindi.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        await fetchSSS();
      } catch (error) {
        // Hata bildirimi
        Swal.fire({
          title: 'Hata!',
          text: 'Soru silinirken bir hata oluştu.',
          icon: 'error'
        });
        console.error('SSS silinirken hata:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // SSS durumunu değiştir (aktif/pasif)
  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      const response = await adminService.toggleSSSStatus(id);
      
      // SweetAlert2 ile başarı bildirimi
      Swal.fire({
        title: 'Başarılı!',
        text: `Soru durumu ${response.aktifMi ? 'aktif' : 'pasif'} olarak değiştirildi.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      await fetchSSS();
    } catch (error) {
      // SweetAlert2 ile hata bildirimi
      Swal.fire({
        title: 'Hata!',
        text: 'Durum değiştirilirken bir hata oluştu.',
        icon: 'error'
      });
      console.error('SSS durumu değiştirilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş SSS listesi
  const filteredSorular = sorular.filter(soru => 
    soru.soru.toLowerCase().includes(searchTerm.toLowerCase()) ||
    soru.cevap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    soru.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Kontrol Alanı */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Soru veya kategori ara..."
              className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full md:w-80 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            if (editMode) resetForm();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
          {showForm ? (
            <>
              <X size={20} /> İptal
            </>
          ) : (
            <>
              <Plus size={20} /> Yeni Soru
            </>
          )}
        </button>
      </div>
      
      {/* Modern Ekleme/Düzenleme Formu */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8 animate-fadeIn">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
              <div className="bg-primary-100 p-3 rounded-xl mr-4">
                <Save className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {editMode ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              {/* Soru */}
              <div className="col-span-full">
                <label htmlFor="soru" className="block text-sm font-semibold text-gray-700 mb-2">Soru</label>
                <input
                  type="text"
                  id="soru"
                  name="soru"
                  required
                  value={formData.soru}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors shadow-sm"
                  placeholder="Soru metnini giriniz..."
                />
              </div>

              {/* Cevap */}
              <div className="col-span-full">
                <label htmlFor="cevap" className="block text-sm font-semibold text-gray-700 mb-2">Cevap</label>
                <textarea
                  id="cevap"
                  name="cevap"
                  required
                  rows="5"
                  value={formData.cevap}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors shadow-sm resize-none"
                  placeholder="Cevap metnini giriniz..."
                ></textarea>
              </div>
              
              {/* Kategori */}
              <div>
                <label htmlFor="kategori" className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                <select
                  id="kategori"
                  name="kategori"
                  required
                  value={formData.kategori}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors shadow-sm">
                  <option value="">Kategori Seçin</option>
                  {kategoriler.map((kategori, index) => (
                    <option key={index} value={kategori}>{kategori}</option>
                  ))}
                  <option value="yeni">+ Yeni Kategori Ekle</option>
                </select>

                {formData.kategori === 'yeni' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Yeni kategori adı"
                      value={yeniKategori}
                      onChange={(e) => setYeniKategori(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors shadow-sm"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Sıra No */}
              <div>
                <label htmlFor="siraNo" className="block text-sm font-semibold text-gray-700 mb-2">Sıra No</label>
                <input
                  type="number"
                  id="siraNo"
                  name="siraNo"
                  min="0"
                  value={formData.siraNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 focus:bg-white transition-colors shadow-sm"
                  placeholder="0"
                />
              </div>

              {/* Aktiflik Durumu */}
              <div className="col-span-full">
                <div className="flex items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <input
                    type="checkbox"
                    id="aktifMi"
                    name="aktifMi"
                    checked={formData.aktifMi}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="aktifMi" className="ml-3 text-sm font-medium text-gray-700">
                    Aktif (Bu soru kullanıcılara gösterilir)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium">
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl font-medium">
                <Save size={20} />
                {editMode ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Modern SSS Listesi */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg">
        {loading && !sorular.length ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-2"></div>
            <p className="text-gray-600">Sorular yükleniyor...</p>
          </div>
        ) : filteredSorular.length === 0 ? (
          <div className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">Soru Bulunamadı</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Arama kriterlerinize uygun soru bulunamadı.' : 'Henüz eklenmiş soru bulunmuyor.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Soru
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sıra No
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Eklenme Tarihi
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredSorular.map((soru) => (
                  <tr key={soru.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(soru.id)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${soru.aktifMi
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {soru.aktifMi ? (
                          <>
                            <Check size={14} className="mr-1.5" /> Aktif
                          </>
                        ) : (
                          <>
                            <X size={14} className="mr-1.5" /> Pasif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="max-w-md">
                        <div className="font-semibold text-gray-900 truncate text-sm">{soru.soru}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{soru.cevap}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="px-3 py-1.5 bg-primary-100 text-primary-800 rounded-xl text-xs font-semibold">
                        {soru.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                      {soru.siraNo}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {new Date(soru.eklenmeTarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(soru)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(soru.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredSorular.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 text-sm text-gray-600 border-t border-gray-200 font-medium">
            Toplam {filteredSorular.length} soru {searchTerm && 'filtrelenmiş sonuçlarda'} gösteriliyor
          </div>
        )}
      </div>
    </div>
  );
};

export default SSSYonetimi;
