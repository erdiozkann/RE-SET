import { useState, useEffect } from 'react';
import { youtubeApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import type { YouTubeVideo } from '../../../types';

export default function YouTubeTab() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeId: '',
    duration: '',
    category: 'Demartini Metodu'
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = await youtubeApi.getAll();
      setVideos(data);
    } catch (error) {
      toast.error('Videolar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (input: string): string => {
    // YouTube URL'den video ID çıkar
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    return input;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const youtubeId = extractYouTubeId(formData.youtubeId);

    try {
      if (editingVideo) {
        await youtubeApi.update(editingVideo.id, { ...formData, youtubeId });
        toast.success('Video güncellendi');
      } else {
        await youtubeApi.create({ ...formData, youtubeId });
        toast.success('Video eklendi');
      }
      resetForm();
      loadVideos();
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const handleEdit = (video: YouTubeVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      duration: video.duration,
      category: video.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu videoyu silmek istediğinize emin misiniz?')) return;

    try {
      await youtubeApi.delete(id);
      toast.success('Video silindi');
      loadVideos();
    } catch (error) {
      toast.error('Video silinirken hata oluştu');
    }
  };

  const handleTogglePublish = async (video: YouTubeVideo) => {
    try {
      await youtubeApi.update(video.id, { isPublished: !video.isPublished });
      toast.success(video.isPublished ? 'Video yayından kaldırıldı' : 'Video yayınlandı');
      loadVideos();
    } catch (error) {
      toast.error('İşlem sırasında hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', youtubeId: '', duration: '', category: 'Demartini Metodu' });
    setEditingVideo(null);
    setShowForm(false);
  };

  const categories = ['Demartini Metodu', 'Değer Belirleme', 'Breakthrough Experience', 'Yaşam Dengeleme', 'Genel'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">YouTube Videoları</h2>
          <p className="text-gray-600">YouTube videolarınızı yönetin</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Video Ekle
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {editingVideo ? 'Video Düzenle' : 'Yeni Video Ekle'}
              </h3>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube Video URL veya ID *
                </label>
                <input
                  type="text"
                  value={formData.youtubeId}
                  onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... veya video ID"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  YouTube linkini veya sadece video ID'yi yapıştırabilirsiniz
                </p>
              </div>

              {formData.youtubeId && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(formData.youtubeId)}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${extractYouTubeId(formData.youtubeId)}/hqdefault.jpg`;
                    }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Süre
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="12:45"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {editingVideo ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Videos List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <i className="ri-youtube-line text-5xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Henüz video yok</h3>
          <p className="text-gray-500 mb-4">İlk YouTube videonuzu ekleyin</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Video Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                  }}
                />
                {!video.isPublished && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Taslak
                  </div>
                )}
                {video.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                )}
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-red-600 mb-1 block">{video.category}</span>
                <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">{video.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.description}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(video)}
                    className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                  >
                    <i className="ri-edit-line mr-1"></i>Düzenle
                  </button>
                  <button
                    onClick={() => handleTogglePublish(video)}
                    className={`px-3 py-1.5 rounded text-sm ${video.isPublished
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                  >
                    {video.isPublished ? <i className="ri-eye-off-line"></i> : <i className="ri-eye-line"></i>}
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
