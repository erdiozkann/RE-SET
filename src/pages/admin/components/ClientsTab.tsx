import { useState, useEffect } from 'react';
import { clientsApi, appointmentsApi, progressApi } from '../../../lib/api';
import { financeService } from '../../../lib/finance/service';
import type { Invoice, Payment } from '../../../lib/finance/types';
import { useToast } from '../../../components/ToastContainer';
import { getUserFriendlyErrorMessage } from '../../../lib/errors';
import type { Client, Appointment, ProgressRecord } from '../../../types';
import { ClientDetailModal } from './clients/modals/ClientDetailModal';
import { InvoiceModal } from './clients/modals/InvoiceModal';
import { PaymentModal } from './clients/modals/PaymentModal';
import { DeleteConfirmModal } from './clients/modals/DeleteConfirmModal'; type BalanceFilter = 'all' | 'debt' | 'paid' | 'balanced';

export default function ClientsTab() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('all');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Selected client
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [clientProgress, setClientProgress] = useState<ProgressRecord[]>([]);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [detailTab, setDetailTab] = useState<'info' | 'appointments' | 'account'>('info');

  // Invoice/Payment modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    description: '',
    amount: '',
    due_date: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    invoice_id: '',
    payment_method: 'cash' as 'cash' | 'credit_card' | 'bank_transfer' | 'other',
    description: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll();
      setClients(data);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Danışanlar yüklenirken hata: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (client: Client) => {
    try {
      // Load appointments for this client
      const allAppointments = await appointmentsApi.getAll();
      const clientAppts = allAppointments.filter(a => a.clientEmail === client.email);
      setClientAppointments(clientAppts);

      // Load progress records
      try {
        const progress = await progressApi.getByClient(client.id);
        setClientProgress(progress);
      } catch {
        setClientProgress([]);
      }

      // Load invoices
      try {
        const invoices = await invoicesApi.getByClient(client.id);
        setClientInvoices(invoices);
      } catch {
        setClientInvoices([]);
      }

      // Load payments
      try {
        const payments = await paymentsApi.getByClient(client.id);
        setClientPayments(payments);
      } catch {
        setClientPayments([]);
      }
    } catch (error) {
      console.error('Error loading client details:', error);
    }
  };

  const handleAddClient = () => {
    setFormData({ name: '', email: '', phone: '', notes: '' });
    setShowAddModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      notes: client.notes || ''
    });
    setShowEditModal(true);
  };

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    setDetailTab('info');
    await loadClientDetails(client);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setShowDeleteConfirm(true);
  };

  // Fatura ekleme
  const handleAddInvoice = async () => {
    if (!selectedClient || !invoiceForm.description || !invoiceForm.amount) {
      toast.error('Açıklama ve tutar alanları zorunludur');
      return;
    }

    setSaving(true);
    try {
      await invoicesApi.create({
        client_id: selectedClient.id,
        description: invoiceForm.description,
        amount: parseFloat(invoiceForm.amount),
        due_date: invoiceForm.due_date || undefined
      });
      toast.success('Fatura başarıyla eklendi');
      setShowInvoiceModal(false);
      setInvoiceForm({ description: '', amount: '', due_date: '' });
      await loadClientDetails(selectedClient);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Fatura eklenemedi: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Ödeme ekleme
  const handleAddPayment = async () => {
    if (!selectedClient || !paymentForm.amount) {
      toast.error('Tutar alanı zorunludur');
      return;
    }

    setSaving(true);
    try {
      await paymentsApi.create({
        client_id: selectedClient.id,
        amount: parseFloat(paymentForm.amount),
        invoice_id: paymentForm.invoice_id || undefined,
        payment_method: paymentForm.payment_method,
        description: paymentForm.description || undefined
      });
      toast.success('Ödeme başarıyla kaydedildi');
      setShowPaymentModal(false);
      setPaymentForm({ amount: '', invoice_id: '', payment_method: 'cash', description: '' });
      await loadClientDetails(selectedClient);
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Ödeme kaydedilemedi: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Hesap bakiyesi hesaplama
  const calculateBalance = () => {
    const totalDebt = clientInvoices
      .filter(inv => inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = clientPayments.reduce((sum, pmt) => sum + pmt.amount, 0);
    return { totalDebt, totalPaid, balance: totalDebt - totalPaid };
  };

  const handleSaveClient = async (isEdit: boolean) => {
    if (!formData.name || !formData.email) {
      toast.error('İsim ve e-posta alanları zorunludur');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && selectedClient) {
        await clientsApi.update(selectedClient.id, formData);
        toast.success('Danışan başarıyla güncellendi');
      } else {
        await clientsApi.create(formData);
        toast.success('Danışan başarıyla eklendi');
      }
      // Başarılı olunca modalları kapat ve formu sıfırla
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({ name: '', email: '', phone: '', notes: '' });
      await loadClients();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`İşlem başarısız: ${message}`);
      // Hata durumunda da modalı kapat
      setShowAddModal(false);
      setShowEditModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;

    setSaving(true);
    try {
      await clientsApi.delete(selectedClient.id);
      toast.success('Danışan başarıyla silindi');
      setShowDeleteConfirm(false);
      setSelectedClient(null);
      await loadClients();
    } catch (error) {
      const message = getUserFriendlyErrorMessage(error);
      toast.error(`Silme işlemi başarısız: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  // Bakiye formatla
  const formatBalance = (balance: number) => {
    if (balance > 0) return { text: `${balance.toLocaleString('tr-TR')} ₺ Borç`, color: 'text-red-600', bg: 'bg-red-50' };
    if (balance < 0) return { text: `${Math.abs(balance).toLocaleString('tr-TR')} ₺ Alacak`, color: 'text-green-600', bg: 'bg-green-50' };
    return { text: 'Dengeli', color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  // Danışan istatistikleri
  const stats = {
    total: clients.length,
    debtors: clients.filter(c => (c.balance || 0) > 0).length,
    balanced: clients.filter(c => (c.balance || 0) === 0).length,
    creditors: clients.filter(c => (c.balance || 0) < 0).length,
    totalDebt: clients.reduce((sum, c) => sum + ((c.balance || 0) > 0 ? (c.balance || 0) : 0), 0),
    totalCredit: clients.reduce((sum, c) => sum + ((c.balance || 0) < 0 ? Math.abs(c.balance || 0) : 0), 0)
  };

  const filteredClients = clients.filter(client => {
    // İsim, email, telefon filtresi
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm));

    // Bakiye filtresi
    const balance = client.balance || 0;
    const matchesBalance =
      balanceFilter === 'all' ||
      (balanceFilter === 'debt' && balance > 0) ||
      (balanceFilter === 'paid' && balance < 0) ||
      (balanceFilter === 'balanced' && balance === 0);

    return matchesSearch && matchesBalance;
  });

  // Loading is now handled within the data grid directly via skeleton loaders.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Danışanlar</h2>
          <p className="text-gray-600 mt-1">Toplam {clients.length} danışan</p>
        </div>
        <button
          onClick={handleAddClient}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C4A030] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-200"
        >
          <i className="ri-user-add-line text-lg"></i>
          Yeni Danışan Ekle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-xl text-[#D4AF37]"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Toplam Danışan</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-down-circle-line text-xl text-red-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.debtors}</p>
              <p className="text-xs text-gray-500">Borçlu ({stats.totalDebt.toLocaleString('tr-TR')} ₺)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-circle-line text-xl text-green-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.creditors}</p>
              <p className="text-xs text-gray-500">Alacaklı ({stats.totalCredit.toLocaleString('tr-TR')} ₺)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-xl text-gray-500"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.balanced}</p>
              <p className="text-xs text-gray-500">Dengeli</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="İsim, e-posta veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBalanceFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${balanceFilter === 'all'
                ? 'bg-[#D4AF37] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setBalanceFilter('debt')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${balanceFilter === 'debt'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
            >
              <i className="ri-arrow-down-line mr-1"></i>Borçlu
            </button>
            <button
              onClick={() => setBalanceFilter('paid')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${balanceFilter === 'paid'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
                }`}
            >
              <i className="ri-arrow-up-line mr-1"></i>Alacaklı
            </button>
            <button
              onClick={() => setBalanceFilter('balanced')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${balanceFilter === 'balanced'
                ? 'bg-gray-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Dengeli
            </button>
          </div>
        </div>
      </div>

      {/* Clients List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-user-line text-4xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Henüz danışan yok</h3>
          <p className="text-gray-600 mb-6">İlk danışanınızı ekleyerek başlayın</p>
          <button
            onClick={handleAddClient}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl font-medium hover:bg-[#C4A030] transition-colors"
          >
            <i className="ri-user-add-line"></i>
            Danışan Ekle
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <i className="ri-search-line text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-600">"{searchTerm}" için sonuç bulunamadı</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Danışan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">İletişim</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bakiye</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-desktop-${i}`} className="animate-pulse bg-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="w-16 h-3 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-20 h-3 bg-gray-100 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredClients.map((client) => {
                  const balanceInfo = formatBalance(client.balance || 0);
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C4A030] flex items-center justify-center text-white font-semibold">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            {client.notes && (
                              <p className="text-sm text-gray-500 truncate max-w-[200px]">{client.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{client.email}</p>
                        <p className="text-sm text-gray-500">{client.phone || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${balanceInfo.bg} ${balanceInfo.color}`}>
                          {(client.balance || 0) > 0 && <i className="ri-arrow-down-s-fill mr-1"></i>}
                          {(client.balance || 0) < 0 && <i className="ri-arrow-up-s-fill mr-1"></i>}
                          {balanceInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">
                          {new Date(client.createdAt || '').toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewClient(client)}
                            className="p-2 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                            title="Detayları Görüntüle"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(client)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={`skel-mobile-${i}`} className="p-4 animate-pulse bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="w-32 h-3 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    <div className="h-8 flex-1 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 flex-1 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 flex-1 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              ))
            ) : filteredClients.map((client) => {
              const balanceInfo = formatBalance(client.balance || 0);
              return (
                <div key={client.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C4A030] flex items-center justify-center text-white font-semibold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${balanceInfo.bg} ${balanceInfo.color}`}>
                      {balanceInfo.text}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewClient(client)}
                      className="flex-1 py-2 text-center text-sm text-gray-600 hover:text-[#D4AF37] bg-gray-50 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                    >
                      <i className="ri-eye-line mr-1"></i> Detay
                    </button>
                    <button
                      onClick={() => handleEditClient(client)}
                      className="flex-1 py-2 text-center text-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <i className="ri-edit-line mr-1"></i> Düzenle
                    </button>
                    <button
                      onClick={() => handleDeleteClick(client)}
                      className="flex-1 py-2 text-center text-sm text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <i className="ri-delete-bin-line mr-1"></i> Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-xl font-semibold text-gray-900">
                {showEditModal ? 'Danışan Düzenle' : 'Yeni Danışan Ekle'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-500"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  İsim Soyisim <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="Örn: Ayşe Yılmaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-posta <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                  placeholder="0532 123 45 67"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all resize-none"
                  placeholder="Danışan hakkında notlar..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => handleSaveClient(showEditModal)}
                disabled={saving}
                className="px-5 py-2.5 bg-[#D4AF37] text-white rounded-xl font-medium hover:bg-[#C4A030] disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line"></i>
                    {showEditModal ? 'Güncelle' : 'Ekle'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals extracted to components */}
      <ClientDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        client={selectedClient}
        invoices={clientInvoices}
        payments={clientPayments}
        appointments={clientAppointments}
        onAddInvoice={() => setShowInvoiceModal(true)}
        onAddPayment={() => setShowPaymentModal(true)}
        onEditClient={handleEditClient}
      />

      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        client={selectedClient}
        invoiceForm={invoiceForm}
        setInvoiceForm={setInvoiceForm}
        onSave={handleAddInvoice}
        saving={saving}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        client={selectedClient}
        invoices={clientInvoices}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        onSave={handleAddPayment}
        saving={saving}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setSelectedClient(null); }}
        client={selectedClient}
        onConfirm={handleDeleteClient}
        saving={saving}
      />
    </div>
  );
}
