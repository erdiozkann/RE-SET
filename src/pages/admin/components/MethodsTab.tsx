
import { useState, useEffect, useCallback } from 'react';
import { methodsApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';

interface Method {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string;
}

export default function MethodsTab() {
  const toast = useToast();
  const [methods, setMethods] = useState<Method[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<Method | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'ri-lightbulb-line',
    details: ''
  });

  const iconOptions = [
    { value: 'ri-lightbulb-line', label: 'Ampul' },
    { value: 'ri-brain-line', label: 'Beyin' },
    { value: 'ri-heart-pulse-line', label: 'Kalp Nabız' },
    { value: 'ri-mental-health-line', label: 'Mental Sağlık' },
    { value: 'ri-leaf-line', label: 'Yaprak' },
    { value: 'ri-compass-line', label: 'Pusula' },
    { value: 'ri-focus-line', label: 'Odak' },
    { value: 'ri-eye-line', label: 'Göz' },
    { value: 'ri-hand-heart-line', label: 'El Kalp' },
    { value: 'ri-seedling-line', label: 'Fide' },
    { value: 'ri-star-line', label: 'Yıldız' },
    { value: 'ri-sun-line', label: 'Güneş' },
    { value: 'ri-moon-line', label: 'Ay' },
    { value: 'ri-flower-line', label: 'Çiçek' },
    { value: 'ri-plant-line', label: 'Bitki' }
  ];

  const loadMethods = useCallback(async () => {
    try {
      const data = await methodsApi.getAll();
      setMethods(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Yöntemler yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const handleAdd = () => {
    setEditingMethod(null);
    setFormData({
      title: '',
      description: '',
      icon: 'ri-lightbulb-line',
      details: ''
    });
    setShowModal(true);
  };

  const handleEdit = (method: Method) => {
    setEditingMethod(method);
    setFormData({
      title: method.title,
      description: method.description,
      icon: method.icon,
      details: method.details
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.details) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      if (editingMethod) {
        await methodsApi.update(editingMethod.id, formData);
        toast.success('Yöntem başarılı şekilde güncellendi');
      } else {
        await methodsApi.create(formData);
        toast.success('Yöntem başarılı şekilde oluşturuldu');
      }

      await loadMethods();
      setShowModal(false);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Yöntem kaydedilirken hata: ${message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu yöntemi silmek istediğinizden emin misiniz?')) {
      try {
        await methodsApi.delete(id);
        toast.success('Yöntem başarılı şekilde silindi');
        await loadMethods();
      } catch (error) {
        const message = getUserFriendlyErrorMessage(error);
        toast.error(`Yöntem silinirken hata: ${message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-[#D4AF37] animate-spin mb-4"></i>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">Methodlar</h2>
          <p className="text-gray-600 mt-1">Uyguladığınız methodları yönetin</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line"></i>
          Yeni Method Ekle
        </button>
      </div>

      {/* Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((method) => (
          <div key={method.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-[#D4AF37]/10 rounded-full">
                <i className={`${method.icon} text-2xl text-[#D4AF37]`}></i>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(method)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 text-blue-600 rounded transition-colors cursor-pointer"
                  title="Düzenle"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(method.id)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-red-50 text-red-600 rounded transition-colors cursor-pointer"
                  title="Sil"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              {method.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
              {method.description}
            </p>
            <p className="text-xs text-gray-500 line-clamp-3">
              {method.details}
            </p>
          </div>
        ))}
      </div>

      {methods.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
            <i className="ri-information-line text-4xl text-gray-400"></i>
          </div>
          <p className="text-gray-500">
            Henüz method eklenmemiş. Yeni method eklemek için yukarıdaki butona tıklayın.
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">
                {editingMethod ? 'Method Düzenle' : 'Yeni Method Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-2xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method Adı *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Örn: Bilişsel Davranışçı Terapi (CBT)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon Seçin *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: icon.value })}
                      className={`w-full h-12 flex items-center justify-center border-2 rounded-lg transition-all cursor-pointer ${formData.icon === icon.value
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                          : 'border-gray-200 hover:border-[#D4AF37]'
                        }`}
                      title={icon.label}
                    >
                      <i className={`${icon.value} text-2xl ${formData.icon === icon.value ? 'text-[#D4AF37]' : 'text-gray-600'
                        }`}></i>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kısa Açıklama *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                  placeholder="Method hakkında kısa bir açıklama yazın (1-2 cümle)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detaylı Açıklama *
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                  placeholder="Method hakkında detaylı bilgi verin. Nasıl uygulandığını, faydalarını ve kimlere uygun olduğunu açıklayın."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors whitespace-nowrap cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
