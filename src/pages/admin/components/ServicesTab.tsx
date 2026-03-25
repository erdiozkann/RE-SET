
import { useState, useEffect, useCallback } from 'react';
import { servicesApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { ServiceType } from '../../../types';

export default function ServicesTab() {
  const toast = useToast();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    price: ''
  });

  const loadServices = useCallback(async () => {
    try {
      const data = await servicesApi.getAll();
      setServices(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Hizmetler yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleAdd = () => {
    setEditingService(null);
    setFormData({ title: '', description: '', duration: '', price: '' });
    setShowModal(true);
  };

  const handleEdit = (service: ServiceType) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      duration: service.duration,
      price: service.price || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) {
      try {
        await servicesApi.delete(id);
        await loadServices();
        toast.success('Hizmet başarılı şekilde silindi');
      } catch (error) {
        const message = getUserFriendlyErrorMessage(error);
        toast.error(`Hizmet silinirken hata: ${message}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingService) {
        await servicesApi.update(editingService.id, formData);
        toast.success('Hizmet başarılı şekilde güncellendi');
      } else {
        await servicesApi.create(formData);
        toast.success('Hizmet başarılı şekilde eklendi');
      }

      setShowModal(false);
      await loadServices();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Hizmet kaydedilirken hata: ${message}`);
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
        <h2 className="text-2xl font-serif text-[#1A1A1A]">Hizmetler</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white rounded-full font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line"></i>
          <span>Yeni Hizmet</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A]">{service.title}</h3>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleEdit(service)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <i className="ri-edit-line text-gray-600"></i>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(service.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-red-600"></i>
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-gray-700">
                <i className="ri-time-line mr-1 text-[#D4AF37]"></i>
                {service.duration} dakika
              </span>
              {service.price && (
                <span className="flex items-center font-semibold text-[#D4AF37]">
                  <i className="ri-money-dollar-circle-line mr-1"></i>
                  {service.price} ₺
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-serif text-[#1A1A1A] mb-6">
              {editingService ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Başlık *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Açıklama *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Süre (dakika) *</label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Fiyat (₺)</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white rounded-full font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
