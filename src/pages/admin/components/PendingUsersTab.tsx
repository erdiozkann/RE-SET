import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../../lib/api';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { User } from '../../../types';

export default function PendingUsersTab() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPendingUsers = useCallback(async () => {
    try {
      const data = await usersApi.getPending();
      setUsers(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Bekleyen kullanıcılar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPendingUsers();
  }, [loadPendingUsers]);

  const handleApprove = async (email: string) => {
    try {
      await usersApi.approve(email);
      toast.success(`${email} başarılı şekilde onaylandı`);
      await loadPendingUsers();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Onaylama sırasında hata: ${message}`);
    }
  };

  const handleReject = async (email: string) => {
    if (!confirm(`${email} adresini reddetmek istediğinizden emin misiniz?`)) return;

    try {
      await usersApi.reject(email);
      toast.success(`${email} reddedildi`);
      await loadPendingUsers();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Red sırasında hata: ${message}`);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-[#1A1A1A]">Onay Bekleyen Kullanıcılar</h2>
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-semibold">
          {users.length}
        </span>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-user-check-line text-5xl text-gray-300 mb-4 block"></i>
          <p className="text-gray-600">Onay bekleyen kullanıcı yok</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.email}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1A1A1A]">{user.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-600">
                      <i className="ri-phone-line mr-1"></i>
                      {user.phone || 'Belirtilmedi'}
                    </span>
                    <span className="text-gray-600">
                      <i className="ri-calendar-line mr-1"></i>
                      {new Date(user.registeredAt || '').toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user.email)}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-sm cursor-pointer"
                  >
                    <i className="ri-check-line mr-1"></i>
                    Onayla
                  </button>
                  <button
                    onClick={() => handleReject(user.email)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm cursor-pointer"
                  >
                    <i className="ri-close-line mr-1"></i>
                    Reddet
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
