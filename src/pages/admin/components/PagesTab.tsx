import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { sitePagesApi } from '../../../lib/api';
import type { SitePage } from '../../../types';

const empty = () => ({
  slug: '',
  title: '',
  description: '',
  content: '',
  isPublished: false,
  sortOrder: 0,
});

// Panelden yönetilen içerik sayfaları (site_pages). slug = URL (/slug).
export default function PagesTab() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SitePage | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setPages(await sitePagesApi.getAllAdmin());
    } catch (e) {
      toast.error('Sayfalar yüklenemedi (site_pages tablosu kurulu mu?)');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(empty());
    setShowModal(true);
  };
  const openEdit = (p: SitePage) => {
    setEditing(p);
    setForm({
      slug: p.slug,
      title: p.title,
      description: p.description,
      content: p.content,
      isPublished: p.isPublished,
      sortOrder: p.sortOrder,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.slug || !form.title) {
      toast.error('Slug ve başlık zorunlu');
      return;
    }
    const slug = form.slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setSaving(true);
    try {
      if (editing) await sitePagesApi.update(editing.id, { ...form, slug });
      else await sitePagesApi.create({ ...form, slug });
      toast.success('Kaydedildi');
      setShowModal(false);
      await load();
    } catch (e) {
      toast.error(`Kaydetme başarısız: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const del = async (p: SitePage) => {
    if (!confirm(`"${p.title}" sayfasını silmek istiyor musunuz?`)) return;
    try {
      await sitePagesApi.remove(p.id);
      await load();
    } catch (e) {
      toast.error('Silinemedi');
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif text-[#1A1A1A]">Sayfalar</h2>
          <p className="text-sm text-gray-500">{pages.length} içerik sayfası · URL: re-set.com.tr/slug</p>
        </div>
        <button onClick={openNew} className="px-4 py-2 bg-[#D4AF37] text-[#1A1A1A] font-medium rounded-lg">
          + Yeni Sayfa
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Yükleniyor…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Başlık</th>
                <th className="px-4 py-3">Slug (URL)</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500">/{p.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.isPublished ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-[#D4AF37]" title="Düzenle">
                      <i className="ri-pencil-line"></i>
                    </button>
                    <button onClick={() => del(p)} className="text-gray-500 hover:text-red-500" title="Sil">
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Henüz sayfa yok. "Yeni Sayfa" ile ekleyin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editing ? 'Sayfayı Düzenle' : 'Yeni Sayfa'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL) *</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ör: demartini-seansi" className="w-full border rounded-lg px-3 py-2" />
                <p className="text-xs text-gray-400 mt-1">Sayfa adresi: re-set.com.tr/{form.slug || 'slug'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama (meta description, 150-160 karakter)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">İçerik (Markdown — ## başlık, **kalın**, - liste)</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={14} className="w-full border rounded-lg px-3 py-2 font-mono text-sm" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                  Yayında
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Sıra:
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="w-20 border rounded px-2 py-1" />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">İptal</button>
                <button onClick={save} disabled={saving} className="px-4 py-2 bg-[#D4AF37] text-[#1A1A1A] font-medium rounded-lg disabled:opacity-50">
                  {saving ? 'Kaydediliyor…' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
