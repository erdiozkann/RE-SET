import { useState, useEffect, useCallback } from 'react';
import { appointmentsApi } from '@/lib/api';
import { useToast } from '@/components/ToastContainer';
import { getUserFriendlyErrorMessage } from '@/lib/errors';
import type { Appointment } from '@/types';

export default function DashboardTab() {
  const toast = useToast();
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    today: 0,
    thisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const allAppointments = await appointmentsApi.getAll();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Haftanın sonu
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      // Bekleyen randevular
      const pending = allAppointments.filter(a => a.status === 'PENDING');
      setPendingAppointments(pending);

      // Yaklaşan onaylanmış randevular (bugün ve sonrası)
      const upcoming = allAppointments
        .filter(a => a.status === 'CONFIRMED' && a.date >= todayStr)
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.time.localeCompare(b.time);
        })
        .slice(0, 10);
      setUpcomingAppointments(upcoming);

      // İstatistikler
      setStats({
        pending: pending.length,
        confirmed: allAppointments.filter(a => a.status === 'CONFIRMED').length,
        today: allAppointments.filter(a => a.date === todayStr && a.status === 'CONFIRMED').length,
        thisWeek: allAppointments.filter(a =>
          a.date >= todayStr && a.date <= weekEndStr && a.status === 'CONFIRMED'
        ).length
      });
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Randevular yüklenirken hata: ${message}`);
      setPendingAppointments([]);
      setUpcomingAppointments([]);
      setStats({ pending: 0, confirmed: 0, today: 0, thisWeek: 0 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await appointmentsApi.updateStatus(id, 'CONFIRMED');
      toast.success('Randevu onaylandı!');
      await loadData();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Onaylama hatası: ${message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      await appointmentsApi.updateStatus(id, 'CANCELLED');
      toast.success('Randevu iptal edildi.');
      await loadData();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`İptal hatası: ${message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Yarın';
    }
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-yellow-500 rounded-xl flex items-center justify-center">
              <i className="ri-time-line text-xl text-white"></i>
            </div>
            <span className="text-3xl font-bold text-yellow-800">{stats.pending}</span>
          </div>
          <h3 className="text-sm font-medium text-yellow-900 mt-2">Onay Bekleyen</h3>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center">
              <i className="ri-calendar-event-line text-xl text-white"></i>
            </div>
            <span className="text-3xl font-bold text-blue-800">{stats.today}</span>
          </div>
          <h3 className="text-sm font-medium text-blue-900 mt-2">Bugün</h3>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center">
              <i className="ri-calendar-check-line text-xl text-white"></i>
            </div>
            <span className="text-3xl font-bold text-green-800">{stats.thisWeek}</span>
          </div>
          <h3 className="text-sm font-medium text-green-900 mt-2">Bu Hafta</h3>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center">
              <i className="ri-check-double-line text-xl text-white"></i>
            </div>
            <span className="text-3xl font-bold text-teal-800">{stats.confirmed}</span>
          </div>
          <h3 className="text-sm font-medium text-teal-900 mt-2">Toplam Onaylı</h3>
        </div>
      </div>

      {/* Onay Bekleyenler */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i className="ri-alarm-warning-line text-lg text-yellow-600"></i>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Onay Bekleyenler</h2>
            <p className="text-xs text-gray-500">{pendingAppointments.length} randevu bekliyor</p>
          </div>
        </div>

        {pendingAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-check-double-line text-2xl text-green-600"></i>
            </div>
            <p className="text-gray-600">Bekleyen randevu yok</p>
            <p className="text-sm text-gray-400 mt-1">Tüm randevular güncel</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingAppointments.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 truncate">{apt.clientName || 'İsimsiz'}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500 truncate">{apt.clientEmail}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <i className="ri-service-line text-gray-400"></i>
                        {apt.serviceTitle || 'Belirtilmemiş'}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-calendar-line text-gray-400"></i>
                        {formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line text-gray-400"></i>
                        {apt.time}
                      </span>
                      {apt.clientPhone && (
                        <span className="flex items-center gap-1">
                          <i className="ri-phone-line text-gray-400"></i>
                          {apt.clientPhone}
                        </span>
                      )}
                    </div>
                    {apt.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">"{apt.notes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(apt.id)}
                      disabled={actionLoading === apt.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === apt.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <i className="ri-check-line"></i>
                      )}
                      Onayla
                    </button>
                    <button
                      onClick={() => handleReject(apt.id)}
                      disabled={actionLoading === apt.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      <i className="ri-close-line"></i>
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Yaklaşan Randevular */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
            <i className="ri-calendar-check-line text-lg text-green-600"></i>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Yaklaşan Randevular</h2>
            <p className="text-xs text-gray-500">Onaylanmış gelecek randevular</p>
          </div>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-calendar-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-600">Yaklaşan randevu yok</p>
            <p className="text-sm text-gray-400 mt-1">Onaylanmış gelecek randevu bulunmuyor</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{apt.clientName || 'İsimsiz'}</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {apt.serviceTitle || 'Seans'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm shrink-0">
                    <span className={`font-medium ${formatDate(apt.date) === 'Bugün' ? 'text-green-600' :
                      formatDate(apt.date) === 'Yarın' ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                      {formatDate(apt.date)}
                    </span>
                    <span className="text-gray-900 font-medium">{apt.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
