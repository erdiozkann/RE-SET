import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { blogApi, storageApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { BlogPost } from '../../../types';

const createEmptyForm = () => ({
  title: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  readTime: '5 dk',
  excerpt: '',
  content: '',
  image: '',
  featured: false
});

export default function BlogTab() {
  const toast = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(createEmptyForm());
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await storageApi.uploadFile('blog-images', file);
      setFormData({ ...formData, image: url });
      toast.success('Görsel yüklendi');
    } catch {
      toast.error('Görsel yüklenemedi. Supabase Storage bucket kontrol edin.');
    } finally {
      setUploadingImage(false);
    }
  };

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await blogApi.getAll();
      setPosts(data || []);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Blog yazıları çekilemedi: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleAdd = () => {
    setEditingPost(null);
    setFormData(createEmptyForm());
    setShowModal(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      category: post.category || '',
      date: post.date || new Date().toISOString().split('T')[0],
      readTime: post.readTime || '5 dk',
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      featured: Boolean(post.featured)
    });
    setShowModal(true);
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`"${post.title}" yazısını silmek istiyor musunuz?`)) return;
    try {
      await blogApi.delete(post.id);
      toast.success('Blog yazısı silindi');
      await loadPosts();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Silme işlemi başarısız: ${message}`);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error('Başlık, özet ve içerik zorunludur');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        image: formData.image || 'https://via.placeholder.com/600x400?text=Blog',
        date: formData.date,
        category: formData.category,
        readTime: formData.readTime,
        featured: formData.featured
      };

      if (editingPost) {
        await blogApi.update(editingPost.id, payload);
        toast.success('Blog yazısı güncellendi');
      } else {
        await blogApi.create(payload);
        toast.success('Blog yazısı oluşturuldu');
      }
      setShowModal(false);
      await loadPosts();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Kaydetme başarısız: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    return posts.filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[#1A1A1A]">Blog Yönetimi</h2>
          <p className="text-gray-500">{posts.length} yazı</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Başlık veya kategori ara"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2E] transition-colors"
          >
            <i className="ri-add-line mr-2"></i>
            Yeni Yazı
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">Başlık</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Tarih</th>
                <th className="px-6 py-3">Öne Çıkan</th>
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
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Gösterilecek yazı bulunamadı
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1A1A1A]">{post.title}</div>
                      <p className="text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{post.category || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {post.date ? new Date(post.date).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {post.featured ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                          Öne Çıkan
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                          title="Düzenle"
                        >
                          <i className="ri-pencil-line text-gray-600"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
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
                  {editingPost ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı'}
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
                  <label className="block text-sm font-medium text-gray-600 mb-1">Tarih *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Okuma Süresi</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="Örn: 7 dk"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-[#D4AF37] border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-600">
                    Öne çıkan yazı
                  </label>
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
                <label className="block text-sm font-medium text-gray-600 mb-1">Özet *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">İçerik *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
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
