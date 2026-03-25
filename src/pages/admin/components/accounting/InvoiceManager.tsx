import { useState } from 'react';
import { financeService } from '../../../../lib/finance/service';
import type { Invoice } from '../../../../lib/finance/types';
import { useToast } from '../../../../components/ToastContainer';

interface InvoiceManagerProps {
    invoices: Invoice[];
    onRefresh: () => void;
    onQuickPayment: (invoice: Invoice) => void;
}

export default function InvoiceManager({ invoices, onRefresh, onQuickPayment }: InvoiceManagerProps) {
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        client_id: '',
        description: '',
        amount: '',
        due_date: ''
    });

    const handleCreate = async () => {
        if (!form.client_id || !form.description || !form.amount) {
            toast.error('Lütfen zorunlu alanları doldurun');
            return;
        }

        setSaving(true);
        try {
            await financeService.createInvoice({
                client_id: form.client_id,
                description: form.description,
                amount: parseFloat(form.amount),
                due_date: form.due_date || undefined,
                invoice_no: `INV-${Date.now()}` // Temporary generation
            } as any); // Type assertion until fully aligned

            toast.success('Fatura başarıyla oluşturuldu');
            setShowModal(false);
            setForm({ client_id: '', description: '', amount: '', due_date: '' });
            onRefresh();
        } catch (error) {
            console.error('Fatura oluşturma hatası:', error);
            toast.error('Fatura oluşturulamadı');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Tüm Faturalar ({invoices.length})</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                    <i className="ri-add-line"></i>
                    Yeni Fatura
                </button>
            </div>

            {invoices.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <i className="ri-file-list-3-line text-4xl mb-2"></i>
                    <p>Henüz fatura yok</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatura No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danışan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kalan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map(invoice => {
                                const remaining = invoice.amount - (invoice.paid_amount || 0);
                                return (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{invoice.invoice_no || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{(invoice as any).client_name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{invoice.description}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</td>
                                        <td className="px-4 py-3 text-sm text-red-600">{remaining > 0 ? formatCurrency(remaining) : '0'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${invoice.is_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {invoice.is_paid ? 'Ödendi' : 'Bekliyor'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {remaining > 0 && (
                                                <button
                                                    onClick={() => onQuickPayment(invoice)}
                                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                                >
                                                    Ödeme Al
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Basic Create Modal (Simplified for refactor step 1) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Yeni Fatura</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danışan ID</label>
                                <input
                                    type="text"
                                    value={form.client_id}
                                    onChange={e => setForm({ ...form, client_id: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="UUID"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : 'Oluştur'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
