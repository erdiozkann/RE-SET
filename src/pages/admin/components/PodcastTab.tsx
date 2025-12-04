import { useEffect, useMemo, useState, useRef } from 'react';
import { podcastApi, storageApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { PodcastEpisode } from '../../../types';

const createEmptyForm = () => ({
  title: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  duration: '30 dk',
  episode: '',
  audioUrl: '',
  image: ''
});

export default function PodcastTab() {
  const toast = useToast();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<PodcastEpisode | null>(null);
  const [formData, setFormData] = useState(createEmptyForm());
  
  // File upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      setLoading(true);
      const data = await podcastApi.getAll();
      setEpisodes(data || []);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Podcast bölümleri alınamadı: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEpisode(null);
    setFormData(createEmptyForm());
    setShowModal(true);
  };

  const handleEdit = (episode: PodcastEpisode) => {
    setEditingEpisode(episode);
    setFormData({
      title: episode.title,
      description: episode.description,
      category: episode.category || '',
      date: episode.date || new Date().toISOString().split('T')[0],
      duration: episode.duration,
      episode: episode.episode || '',
      audioUrl: episode.audioUrl,
      image: episode.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (episode: PodcastEpisode) => {
    if (!confirm(`"${episode.title}" bölümünü silmek istiyor musunuz?`)) return;
    try {
      await podcastApi.delete(episode.id);
      toast.success('Podcast bölümü silindi');
      await loadEpisodes();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Silme işlemi başarısız: ${message}`);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description || !formData.audioUrl) {
      toast.error('Başlık, açıklama ve ses dosyası zorunludur');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        duration: formData.duration,
        episode: formData.episode,
        category: formData.category,
        audioUrl: formData.audioUrl,
        image: formData.image || 'https://via.placeholder.com/600x400?text=Podcast'
      };

      if (editingEpisode) {
        await podcastApi.update(editingEpisode.id, payload);
        toast.success('Podcast bölümü güncellendi');
      } else {
        await podcastApi.create(payload);
        toast.success('Podcast bölümü oluşturuldu');
      }
      setShowModal(false);
      await loadEpisodes();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Kaydetme başarısız: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const url = await storageApi.uploadFile('podcast-images', file);
      setFormData({ ...formData, image: url });
      toast.success('Görsel yüklendi');
    } catch (error) {
      toast.error('Görsel yüklenemedi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingAudio(true);
    try {
      const url = await storageApi.uploadFile('podcast-audio', file);
      setFormData({ ...formData, audioUrl: url });
      toast.success('Ses dosyası yüklendi');
    } catch (error) {
      toast.error('Ses dosyası yüklenemedi');
    } finally {
      setUploadingAudio(false);
    }
  };

  const filteredEpisodes = useMemo(() => {
    if (!searchTerm) return episodes;
    return episodes.filter((episode) =>
      episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (episode.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [episodes, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[#1A1A1A]">Podcast Yönetimi</h2>
          <p className="text-gray-500">{episodes.length} bölüm</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Bölüm veya kategori ara"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2E] transition-colors"
          >
            <i className="ri-add-line mr-2"></i>
            Yeni Bölüm
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Bölüm</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Süre</th>
                <th className="px-6 py-3">Tarih</th>
                <th className="px-6 py-3">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredEpisodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Gösterilecek bölüm bulunamadı
                  </td>
                </tr>
              ) : (
                filteredEpisodes.map((episode) => (
                  <tr key={episode.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1A1A1A]">{episode.title}</div>
                      <p className="text-sm text-gray-500 line-clamp-1">{episode.description}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{episode.category || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{episode.duration}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {episode.date ? new Date(episode.date).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={episode.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                          title="Dinle"
                        >
                          <i className="ri-headphone-line text-gray-600"></i>
                        </a>
                        <button
                          onClick={() => handleEdit(episode)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                          title="Düzenle"
                        >
                          <i className="ri-pencil-line text-gray-600"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(episode)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50"
                          title="Sil"
                        >
                          <i className="ri-delete-bin-line text-red-600"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 mt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1A1A1A]">
                  {editingEpisode ? 'Podcast Bölümünü Düzenle' : 'Yeni Podcast Bölümü'}
                </h3>
                <p className="text-sm text-gray-500">
                  Zorunlu alanlar * ile işaretlenmiştir
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Başlık *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Yayın Tarihi *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Süre *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Örn: 42 dk"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Bölüm #</label>
                  <input
                    type="text"
                    value={formData.episode}
                    onChange={(e) => setFormData({ ...formData, episode: e.target.value })}
                    placeholder="Örn: #12"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Kapak Görseli</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... veya dosya yükle"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <i className="ri-loader-4-line animate-spin"></i>
                    ) : (
                      <i className="ri-upload-2-line"></i>
                    )}
                  </button>
                </div>
                {formData.image && (
                  <img src={formData.image} alt="Önizleme" className="mt-2 h-20 w-32 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Ses Dosyası *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    placeholder="https://... veya dosya yükle"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    disabled={uploadingAudio}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {uploadingAudio ? (
                      <i className="ri-loader-4-line animate-spin"></i>
                    ) : (
                      <i className="ri-upload-2-line"></i>
                    )}
                  </button>
                </div>
                {formData.audioUrl && (
                  <audio src={formData.audioUrl} controls className="mt-2 w-full" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Açıklama *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2E] disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
