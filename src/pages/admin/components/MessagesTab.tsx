import { useState, useEffect } from 'react';
import { messagesApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { ContactMessage } from '../../../types';

export default function MessagesTab() {
  const toast = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const sortMessages = (list: ContactMessage[]) =>
    [...list].sort((a, b) => {
      if (a.read === b.read) {
        return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
      }
      return a.read ? 1 : -1;
    });

  const loadMessages = async () => {
    try {
      const data = await messagesApi.getAll();
      setMessages(sortMessages(data));
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Mesajlar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await messagesApi.markRead(id);
      toast.success('Mesaj okundu olarak işaretlendi');
      setMessages((prev) => sortMessages(prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))));
      setSelectedMessage((prev) => (prev?.id === id ? { ...prev, read: true } : prev));
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Güncelleme sırasında hata: ${message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

    try {
      await messagesApi.delete(id);
      toast.success('Mesaj başarılı şekilde silindi');
      setSelectedMessage(null);
      await loadMessages();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Silme sırasında hata: ${message}`);
    }
  };

  const unreadCount = messages.filter((msg) => !msg.read).length;

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-serif text-[#1A1A1A]">İletişim Mesajları</h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center px-4 h-10 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
            Toplam {messages.length}
          </span>
          <span className={`inline-flex items-center justify-center px-4 h-10 rounded-full text-sm font-semibold ${unreadCount ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {unreadCount ? `${unreadCount} okunmadı` : 'Hepsi okundu'}
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-mail-line text-5xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-600">Mesaj bulunmuyor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedMessage?.id === msg.id
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                      : msg.read
                        ? 'bg-white border-gray-200 hover:border-gray-300'
                        : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{msg.name}</p>
                    {!msg.read && <span className="text-xs font-semibold text-[#B45309]">Yeni</span>}
                  </div>
                  <p className="text-sm truncate opacity-75">{msg.email}</p>
                  <p className="text-xs truncate opacity-50 mt-1">{msg.message}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-4 pb-4 border-b">
                  <h3 className="text-xl font-semibold text-[#1A1A1A]">{selectedMessage.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedMessage.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(selectedMessage.date || '').toLocaleString('tr-TR')}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedMessage.read ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {selectedMessage.read ? 'Okundu' : 'Okunmadı'}
                  </span>
                  {!selectedMessage.read && (
                    <button
                      onClick={() => handleMarkRead(selectedMessage.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold cursor-pointer"
                    >
                      <i className="ri-check-line mr-2"></i>
                      Okundu olarak işaretle
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold cursor-pointer"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Sil
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <i className="ri-mail-open-line text-5xl text-gray-300 mb-4 block"></i>
                <p className="text-gray-600">Mesaj seçiniz</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
