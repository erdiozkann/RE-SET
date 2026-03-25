import { useState, useEffect, useCallback } from 'react';
import { appointmentsApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { Appointment } from '../../../types';

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentsApi.getAll();
      setAppointments(data);
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleConfirm = async (id: string) => {
    try {
      await appointmentsApi.update(id, { status: 'CONFIRMED' });
      toast.success('Randevu onaylandı');
      await loadAppointments();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      try {
        await appointmentsApi.update(id, { status: 'CANCELLED' });
        toast.success('Randevu iptal edildi');
        await loadAppointments();
      } catch (error) {
        toast.error(getUserFriendlyErrorMessage(error));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    const labels = {
      PENDING: 'Bekliyor',
      CONFIRMED: 'Onaylandı',
      CANCELLED: 'İptal'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredAppointments = filter === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-serif text-[#1A1A1A]">Randevular</h2>
        <div className="flex items-center space-x-2">
          {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-semibold transition-all whitespace-nowrap ${filter === status
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {status === 'ALL' ? 'Tümü' : status === 'PENDING' ? 'Bekleyen' : status === 'CONFIRMED' ? 'Onaylı' : 'İptal'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Danışan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İletişim</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hizmet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tarih</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Saat</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {filter === 'ALL' ? 'Henüz randevu bulunmuyor' : `${filter === 'PENDING' ? 'Bekleyen' : filter === 'CONFIRMED' ? 'Onaylı' : 'İptal edilmiş'} randevu bulunmuyor`}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1A1A1A]">{appointment.clientName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{appointment.clientEmail}</div>
                      {appointment.clientPhone && (
                        <div className="text-sm text-gray-500">{appointment.clientPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{appointment.serviceTitle}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(appointment.date)}</td>
                    <td className="px-6 py-4 text-gray-700">{appointment.time}</td>
                    <td className="px-6 py-4">{getStatusBadge(appointment.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedAppointment(appointment)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                          title="Detay"
                        >
                          <i className="ri-eye-line text-gray-600"></i>
                        </button>
                        {appointment.status === 'PENDING' && (
                          <button
                            onClick={() => handleConfirm(appointment.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 transition-colors"
                            title="Onayla"
                          >
                            <i className="ri-check-line text-green-600"></i>
                          </button>
                        )}
                        {appointment.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                            title="İptal Et"
                          >
                            <i className="ri-close-line text-red-600"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif text-[#1A1A1A]">Randevu Detayı</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i className="ri-close-line text-gray-600"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Danışan</label>
                <p className="text-lg text-[#1A1A1A]">{selectedAppointment.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">E-posta</label>
                <p className="text-lg text-[#1A1A1A]">{selectedAppointment.clientEmail}</p>
              </div>
              {selectedAppointment.clientPhone && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Telefon</label>
                  <p className="text-lg text-[#1A1A1A]">{selectedAppointment.clientPhone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-600">Hizmet</label>
                <p className="text-lg text-[#1A1A1A]">{selectedAppointment.serviceTitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tarih</label>
                  <p className="text-lg text-[#1A1A1A]">{formatDate(selectedAppointment.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Saat</label>
                  <p className="text-lg text-[#1A1A1A]">{selectedAppointment.time}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Durum</label>
                <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Notlar</label>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4 mt-1">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
