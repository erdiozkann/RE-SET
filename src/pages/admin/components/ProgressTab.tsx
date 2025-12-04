import { useState, useEffect } from 'react';
import { progressApi, clientsApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { ProgressRecord, Client } from '../../../types';
import type { CreateProgressRecordInput } from '../../../types/api';

const createEmptyRecord = (clientId: string): CreateProgressRecordInput => ({
  clientId,
  sessionDate: new Date().toISOString().split('T')[0],
  metrics: {},
  emotionalClarity: 50,
  mentalClarity: 50,
  centeredness: 50,
  summary: ''
});

type MetricKey = 'emotionalClarity' | 'mentalClarity' | 'centeredness';

export default function ProgressTab() {
  const toast = useToast();
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creationForm, setCreationForm] = useState<CreateProgressRecordInput>(createEmptyRecord(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProgressRecord | null>(null);
  const [editForm, setEditForm] = useState<CreateProgressRecordInput>(createEmptyRecord(''));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const clientsData = await clientsApi.getAll();
      setClients(clientsData);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Danışanlar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProgressRecords = async (clientId: string) => {
    try {
      const data = await progressApi.getByClient(clientId);
      setRecords(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`İlerleme kayıtları yüklenirken hata: ${message}`);
    }
  };

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setCreationForm(createEmptyRecord(clientId));
    if (clientId) {
      loadProgressRecords(clientId);
    } else {
      setRecords([]);
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedClientId) {
      toast.error('Önce bir danışan seçmelisiniz');
      return;
    }

    if (!creationForm.sessionDate) {
      toast.error('Seans tarihi gereklidir');
      return;
    }

    const payload: CreateProgressRecordInput = {
      clientId: selectedClientId,
      sessionDate: creationForm.sessionDate,
      metrics: {
        emotional_clarity: Math.min(100, Math.max(0, Number(creationForm.emotionalClarity) || 0)),
        mental_clarity: Math.min(100, Math.max(0, Number(creationForm.mentalClarity) || 0)),
        centeredness: Math.min(100, Math.max(0, Number(creationForm.centeredness) || 0))
      },
      emotionalClarity: Math.min(100, Math.max(0, Number(creationForm.emotionalClarity) || 0)),
      mentalClarity: Math.min(100, Math.max(0, Number(creationForm.mentalClarity) || 0)),
      centeredness: Math.min(100, Math.max(0, Number(creationForm.centeredness) || 0)),
      summary: creationForm.summary?.trim() || ''
    };

    if (!payload.summary) {
      toast.error('Kısa bir seans özeti ekleyiniz');
      return;
    }

    setIsSubmitting(true);
    try {
      await progressApi.create(payload);
      toast.success('İlerleme kaydı eklendi');
      setCreationForm(createEmptyRecord(selectedClientId));
      await loadProgressRecords(selectedClientId);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Kayıt oluşturulamadı: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRecord = (record: ProgressRecord) => {
    setEditingRecord(record);
    setEditForm({
      clientId: selectedClientId,
      sessionDate: record.sessionDate || new Date().toISOString().split('T')[0],
      metrics: record.metrics || {},
      emotionalClarity: record.emotionalClarity || 50,
      mentalClarity: record.mentalClarity || 50,
      centeredness: record.centeredness || 50,
      summary: record.summary || ''
    });
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    const payload: Partial<CreateProgressRecordInput> = {
      sessionDate: editForm.sessionDate,
      metrics: {
        emotional_clarity: Math.min(100, Math.max(0, Number(editForm.emotionalClarity) || 0)),
        mental_clarity: Math.min(100, Math.max(0, Number(editForm.mentalClarity) || 0)),
        centeredness: Math.min(100, Math.max(0, Number(editForm.centeredness) || 0))
      },
      emotionalClarity: Math.min(100, Math.max(0, Number(editForm.emotionalClarity) || 0)),
      mentalClarity: Math.min(100, Math.max(0, Number(editForm.mentalClarity) || 0)),
      centeredness: Math.min(100, Math.max(0, Number(editForm.centeredness) || 0)),
      summary: editForm.summary?.trim() || ''
    };

    if (!payload.summary) {
      toast.error('Kısa bir seans özeti ekleyiniz');
      return;
    }

    setIsSubmitting(true);
    try {
      await progressApi.update(editingRecord.id, payload);
      toast.success('İlerleme kaydı güncellendi');
      setEditingRecord(null);
      await loadProgressRecords(selectedClientId);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Kayıt güncellenemedi: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Bu ilerleme kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await progressApi.delete(id);
      toast.success('İlerleme kaydı silindi');
      await loadProgressRecords(selectedClientId);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Kayıt silinemedi: ${message}`);
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
      <h2 className="text-2xl font-serif text-[#1A1A1A]">İlerleme Kayıtları</h2>

      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
          Danışan Seç
        </label>
        <select
          value={selectedClientId}
          onChange={(e) => handleClientChange(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:outline-none"
        >
          <option value="">-- Danışan Seçiniz --</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClientId && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Yeni Seans Kaydı</h3>
              <p className="text-sm text-gray-500">Seçili danışan için ilerleme ekleyin</p>
            </div>
            <span className="text-sm text-gray-500">
              {clients.find((c) => c.id === selectedClientId)?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Seans Tarihi</label>
              <input
                type="date"
                value={creationForm.sessionDate}
                onChange={(e) => setCreationForm((prev) => ({ ...prev, sessionDate: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Seans Özeti</label>
              <textarea
                value={creationForm.summary}
                onChange={(e) => setCreationForm((prev) => ({ ...prev, summary: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#D4AF37] focus:outline-none"
                placeholder="Kısa bir not bırakın"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              {
                label: 'Duygusal Açıklık',
                key: 'emotionalClarity' as MetricKey,
                color: 'bg-blue-500'
              },
              {
                label: 'Zihinsel Açıklık',
                key: 'mentalClarity' as MetricKey,
                color: 'bg-green-500'
              },
              {
                label: 'Merkeziyetlilik',
                key: 'centeredness' as MetricKey,
                color: 'bg-purple-500'
              }
            ]).map((metric) => (
              <div key={metric.key}>
                <label className="block text-sm font-semibold text-gray-600 mb-1">{metric.label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={creationForm[metric.key]}
                    onChange={(e) =>
                      setCreationForm((prev) => ({
                        ...prev,
                        [metric.key]: Number(e.target.value)
                      }))
                    }
                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-center"
                  />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`${metric.color} h-2`}
                      style={{ width: `${creationForm[metric.key]}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateRecord}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-black disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydı Ekle'}
            </button>
          </div>
        </div>
      )}

      {!selectedClientId ? (
        <div className="text-center py-12">
          <i className="ri-folder-open-line text-5xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-600">Ilerleme kayıtlarını görmek için danışan seçiniz</p>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-line-chart-line text-5xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-600">Bu danışanın ilerleme kaydı yok</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => {
            const isEditing = editingRecord?.id === record.id;
            const emotionalPercent = Math.max(0, Math.min(100, 
              isEditing ? (editForm.emotionalClarity ?? 0) : (record.emotionalClarity ?? 0)
            ));
            const mentalPercent = Math.max(0, Math.min(100, 
              isEditing ? (editForm.mentalClarity ?? 0) : (record.mentalClarity ?? 0)
            ));
            const centeredPercent = Math.max(0, Math.min(100, 
              isEditing ? (editForm.centeredness ?? 0) : (record.centeredness ?? 0)
            ));

            return (
              <div
                key={record.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="date"
                        value={editForm.sessionDate}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, sessionDate: e.target.value }))}
                        className="px-3 py-1 rounded border border-gray-300 focus:border-[#D4AF37] focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">
                        {new Date(record.sessionDate || '').toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleUpdateRecord}
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                        >
                          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button
                          onClick={() => setEditingRecord(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                        >
                          İptal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Düzenle"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {isEditing ? (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Duygusal Açıklık</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editForm.emotionalClarity}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                emotionalClarity: Number(e.target.value)
                              }))
                            }
                            className="w-16 px-2 py-1 rounded border border-gray-300 text-center text-sm"
                          />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${emotionalPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Zihinsel Açıklık</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editForm.mentalClarity}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                mentalClarity: Number(e.target.value)
                              }))
                            }
                            className="w-16 px-2 py-1 rounded border border-gray-300 text-center text-sm"
                          />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${mentalPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Merkeziyetlilik</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={editForm.centeredness}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                centeredness: Number(e.target.value)
                              }))
                            }
                            className="w-16 px-2 py-1 rounded border border-gray-300 text-center text-sm"
                          />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${centeredPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">%</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Duygusal Açıklık</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${emotionalPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{emotionalPercent}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Zihinsel Açıklık</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${mentalPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{mentalPercent}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Merkeziyetlilik</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${centeredPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{centeredPercent}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Özet</p>
                  {isEditing ? (
                    <textarea
                      value={editForm.summary}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, summary: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:border-[#D4AF37] focus:outline-none text-sm"
                      placeholder="Seans özeti"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{record.summary}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
