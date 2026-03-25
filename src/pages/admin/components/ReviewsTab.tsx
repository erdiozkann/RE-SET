import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { Review } from '../../../types';

export default function ReviewsTab() {
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    rating: 5
  });

  const loadReviews = useCallback(async () => {
    try {
      const data = await reviewsApi.getAll(true); // Admin view - tüm yorumları getir
      setReviews(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Yorumlar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleAdd = () => {
    setFormData({ name: '', text: '', rating: 5 });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.text) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setSaving(true);
    try {
      await reviewsApi.create({
        name: formData.name,
        text: formData.text,
        rating: formData.rating,
        date: new Date().toISOString().split('T')[0],
        approved: true
      });
      toast.success('Yorum başarıyla eklendi');
      setShowAddModal(false);
      await loadReviews();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Yorum eklenirken hata: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleApproval = async (id: string) => {
    try {
      await reviewsApi.toggleApproval(id);
      toast.success('Yorum durumu güncellendi');
      await loadReviews();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Durum güncellenirken hata: ${message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      await reviewsApi.delete(id);
      toast.success('Yorum başarılı şekilde silindi');
      await loadReviews();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Silme sırasında hata: ${message}`);
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
        <h2 className="text-2xl font-serif text-[#1A1A1A]">Yorumlar</h2>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
            {reviews.length}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors"
          >
            <i className="ri-add-line"></i>
            Yeni Yorum Ekle
          </button>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <i className="ri-star-line text-5xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-600 mb-4">Henüz yorum eklenmedi</p>
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors"
          >
            İlk Yorumu Ekle
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-xl border p-6 hover:shadow-md transition-shadow ${review.approved ? 'border-gray-200' : 'border-yellow-300 bg-yellow-50'
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[#1A1A1A]">{review.name}</h3>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`ri-star-${i < Math.round(review.rating || 0) ? 'fill' : 'line'} text-yellow-400`}
                        ></i>
                      ))}
                    </div>
                    {!review.approved && (
                      <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                        Onay Bekliyor
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{review.text}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(review.date || '').toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleApproval(review.id)}
                    className={`px-3 py-2 rounded-lg transition-colors ${review.approved
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    title={review.approved ? 'Onayı Kaldır' : 'Onayla'}
                  >
                    <i className={review.approved ? 'ri-eye-off-line' : 'ri-check-line'}></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Sil"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yorum Ekleme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-md w-full my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-4">Yeni Yorum Ekle</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İsim *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
                  placeholder="Danışan adı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puan *
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <i
                        className={`text-2xl ${star <= formData.rating
                          ? 'ri-star-fill text-yellow-400'
                          : 'ri-star-line text-gray-300'
                          }`}
                      ></i>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yorum *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-none"
                  placeholder="Danışan yorumu..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C4A137] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Kaydediliyor...
                  </>
                ) : (
                  'Kaydet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
