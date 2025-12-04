import { useState, useEffect } from 'react';
import { clientsApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { Client } from '../../../types';

export default function AccountsTab() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientForm, setClientForm] = useState({ phone: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Hesaplar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      setClientForm({
        phone: selectedClient.phone || '',
        notes: selectedClient.notes || ''
      });
    } else {
      setClientForm({ phone: '', notes: '' });
    }
  }, [selectedClient]);

  const filteredClients = clients
    .filter((client) => {
      if (!searchTerm) return true;
      const needle = searchTerm.toLowerCase();
      return (
        client.name.toLowerCase().includes(needle) ||
        client.email.toLowerCase().includes(needle)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const stats = {
    total: clients.length,
    withPhone: clients.filter((c) => !!c.phone).length,
    withNotes: clients.filter((c) => !!c.notes).length,
    newThisMonth: clients.filter((c) => {
      if (!c.createdAt) return false;
      const created = new Date(c.createdAt);
      const daysDiff = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    }).length
  };

  const handleSave = async () => {
    if (!selectedClient) return;

    setSaving(true);
    try {
      const updated = await clientsApi.update(selectedClient.id, {
        phone: clientForm.phone.trim() ? clientForm.phone.trim() : undefined,
        notes: clientForm.notes.trim() ? clientForm.notes.trim() : undefined
      });
      setClients((prev) => prev.map((client) => (client.id === updated.id ? updated : client)));
      setSelectedClient(updated);
      toast.success('Müşteri bilgileri güncellendi');
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Güncelleme sırasında hata: ${message}`);
    } finally {
      setSaving(false);
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-serif text-[#1A1A1A]">Müşteri Hesapları</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="İsim veya e-posta ara"
          className="w-full md:w-64 px-4 py-2 border border-gray-200 rounded-lg focus:border-[#D4AF37] focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{
          label: 'Toplam Danışan',
          value: stats.total,
          icon: 'ri-team-line',
          bg: 'bg-teal-50',
          color: 'text-teal-700'
        }, {
          label: 'Telefon Paylaşanlar',
          value: stats.withPhone,
          icon: 'ri-phone-line',
          bg: 'bg-blue-50',
          color: 'text-blue-700'
        }, {
          label: 'Notu Olanlar',
          value: stats.withNotes,
          icon: 'ri-file-text-line',
          bg: 'bg-amber-50',
          color: 'text-amber-700'
        }, {
          label: 'Son 30 Günde',
          value: stats.newThisMonth,
          icon: 'ri-calendar-event-line',
          bg: 'bg-purple-50',
          color: 'text-purple-700'
        }].map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4 border border-gray-100`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${card.color} bg-white/80`}>
              <i className={`${card.icon}`}></i>
            </div>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-semibold text-[#1A1A1A]">{card.value}</p>
          </div>
        ))}
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-team-line text-5xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-600">Henüz müşteri eklenmedi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredClients.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500 border border-dashed border-gray-200 rounded-lg">
                  Aramanızla eşleşen müşteri bulunamadı
                </div>
              )}
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedClient?.id === client.id
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold truncate">{client.name}</p>
                  <p className="text-sm truncate opacity-75">{client.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedClient ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-[#1A1A1A]">{selectedClient.name}</h3>
                    <p className="text-sm text-gray-500">{selectedClient.email}</p>
                  </div>
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold cursor-pointer"
                  >
                    <i className="ri-mail-send-line"></i>
                    E-posta gönder
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:outline-none"
                      placeholder="0(5xx) ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kayıt Tarihi</label>
                    <p className="px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-gray-700">
                      {selectedClient.createdAt
                        ? new Date(selectedClient.createdAt).toLocaleDateString('tr-TR')
                        : '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">İç Notlar</label>
                  <textarea
                    value={clientForm.notes}
                    onChange={(e) => setClientForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:outline-none"
                    placeholder="Görüşme notları, ödeme bilgileri vb."
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3">
                  <p className="text-sm text-gray-500">
                    <i className="ri-information-line mr-1"></i>
                    Yalnızca ekip içinde görünür notlar
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#C19B2E] disabled:opacity-50"
                  >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <i className="ri-folder-open-line text-5xl text-gray-300 mb-4 block"></i>
                <p className="text-gray-600">Müşteri seçiniz</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
