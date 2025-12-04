
import { useState, useEffect } from 'react';
import { configApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { WorkingConfig } from '../../../types';

export default function ConfigTab() {
  const toast = useToast();
  const [config, setConfig] = useState<WorkingConfig>({
    startHour: '10:00',
    endHour: '19:00',
    slotDuration: 60,
    offDays: [0, 6]
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configApi.get();
      setConfig(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Ayarlar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await configApi.update(config);
      toast.success('Ayarlar başarıyla kaydedildi');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Ayarlar kaydedilirken hata: ${message}`);
    }
  };

  const toggleOffDay = (day: number) => {
    if (config.offDays.includes(day)) {
      setConfig({
        ...config,
        offDays: config.offDays.filter(d => d !== day)
      });
    } else {
      setConfig({
        ...config,
        offDays: [...config.offDays, day]
      });
    }
  };

  const days = [
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
    { value: 0, label: 'Pazar' }
  ];

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
    <div className="max-w-2xl">
      <h2 className="text-2xl font-serif text-[#1A1A1A] mb-6">Takvim Ayarları</h2>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <i className="ri-check-line text-green-600 text-xl"></i>
          <span className="text-green-800 font-semibold">Ayarlar başarıyla kaydedildi</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Çalışma Saatleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={config.startHour}
                onChange={(e) => setConfig({ ...config, startHour: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Bitiş Saati
              </label>
              <input
                type="time"
                value={config.endHour}
                onChange={(e) => setConfig({ ...config, endHour: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Randevu Süresi</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Slot Süresi (dakika)
            </label>
            <div className="relative">
              <select
                value={config.slotDuration}
                onChange={(e) => setConfig({ ...config, slotDuration: Number(e.target.value) })}
                className="w-full px-4 py-3 pr-8 rounded-xl border-2 border-gray-200 focus:border-[#D4AF37] focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
              >
                <option value={60}>60 dakika</option>
                <option value={75}>75 dakika</option>
                <option value={90}>90 dakika</option>
              </select>
              <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Kapalı Günler</h3>
          <div className="space-y-2">
            {days.map((day) => (
              <label
                key={day.value}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={config.offDays.includes(day.value)}
                  onChange={() => toggleOffDay(day.value)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                />
                <span className="text-gray-700 font-medium">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white py-4 rounded-full font-semibold hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
        >
          Ayarları Kaydet
        </button>
      </form>
    </div>
  );
}
