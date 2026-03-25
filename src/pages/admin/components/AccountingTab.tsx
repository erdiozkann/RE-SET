import { useState, useEffect, useCallback } from 'react';
import { financeService } from '../../../lib/finance/service';
import type {
  Invoice,
  Payment,
  ClientBalance,
  MonthlyRevenue
} from '../../../lib/finance/types';
import { useToast } from '../../../components/ToastContainer';

// Sub-components
import InvoiceManager from './accounting/InvoiceManager';
import PaymentManager from './accounting/PaymentManager';
import ReportViewer from './accounting/ReportViewer';

type SubTab = 'overview' | 'invoices' | 'payments' | 'clients' | 'reports';

export default function AccountingTab() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [summary, setSummary] = useState<any>(null);
  const [clientBalances, setClientBalances] = useState<ClientBalance[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        summaryData,
        balancesData,
        revenueData,
        invoicesData,
        paymentsData
      ] = await Promise.all([
        financeService.getSummary(),
        financeService.getClientBalances(),
        financeService.getMonthlyRevenue(),
        financeService.getInvoices(),
        financeService.getPayments()
      ]);

      setSummary(summaryData);
      setClientBalances(balancesData);
      setMonthlyRevenue(revenueData as any);
      setInvoices(invoicesData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickPayment = (invoice: Invoice) => {
    toast.info('Lütfen Ödemeler sekmesinden yeni ödeme ekleyin.');
    setActiveSubTab('payments');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subTabs = [
    { id: 'overview', label: 'Genel Bakış', icon: 'ri-pie-chart-line' },
    { id: 'invoices', label: 'Faturalar', icon: 'ri-file-list-3-line' },
    { id: 'payments', label: 'Ödemeler', icon: 'ri-money-dollar-circle-line' },
    { id: 'clients', label: 'Cari Hesaplar', icon: 'ri-wallet-3-line' },
    { id: 'reports', label: 'Raporlar', icon: 'ri-bar-chart-box-line' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Muhasebe & Cari</h2>
          <p className="text-gray-600 mt-1">Fatura, ödeme ve cari hesap yönetimi</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as SubTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSubTab === tab.id
              ? 'bg-[#D4AF37] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeSubTab === 'overview' && (
        <ReportViewer monthlyRevenue={monthlyRevenue} summary={summary} />
      )}

      {activeSubTab === 'invoices' && (
        <InvoiceManager
          invoices={invoices}
          onRefresh={loadData}
          onQuickPayment={handleQuickPayment}
        />
      )}

      {activeSubTab === 'payments' && (
        <PaymentManager
          payments={payments}
          onRefresh={loadData}
        />
      )}

      {activeSubTab === 'clients' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Cari Hesaplar</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Danışan</th>
                  <th className="px-4 py-3 text-left">Bakiye</th>
                  <th className="px-4 py-3 text-left">Son Ödeme</th>
                  <th className="px-4 py-3 text-left">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientBalances.map(c => (
                  <tr key={c.client_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.client_name}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">{formatCurrency(c.balance)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {c.last_payment_date ? new Date(c.last_payment_date).toLocaleDateString('tr-TR') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${c.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {c.balance > 0 ? 'Borçlu' : 'Dengeli/Alacaklı'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'reports' && (
        <ReportViewer monthlyRevenue={monthlyRevenue} summary={summary} />
      )}
    </div>
  );
}
