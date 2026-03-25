import { useState } from 'react';
import { financeService } from '../../../../lib/finance/service';
import type { Payment } from '../../../../lib/finance/types';
import { useToast } from '../../../../components/ToastContainer';

interface PaymentManagerProps {
    payments: Payment[];
    onRefresh: () => void;
}

export default function PaymentManager({ payments, onRefresh }: PaymentManagerProps) {
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        client_id: '',
        invoice_id: '',
        amount: '',
        payment_method: 'cash'
    });

    const handleCreate = async () => {
        if (!form.client_id || !form.amount) {
            toast.error('Lütfen zorunlu alanları doldurun');
            return;
        }

        setSaving(true);
        try {
            await financeService.createPayment({
                client_id: form.client_id,
                invoice_id: form.invoice_id || undefined,
                amount: parseFloat(form.amount),
                payment_method: form.payment_method as any,
                description: 'Manuel Ödeme',
                payment_date: new Date().toISOString()
            });

            toast.success('Ödeme başarıyla kaydedildi');
            setShowModal(false);
            setForm({ client_id: '', invoice_id: '', amount: '', payment_method: 'cash' });
            onRefresh();
        } catch (error) {
            console.error('Ödeme kaydetme hatası:', error);
            toast.error('Ödeme kaydedilemedi');
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
                <h3 className="font-semibold text-gray-900">Tüm Ödemeler ({payments.length})</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                    <i className="ri-add-line"></i>
                    Yeni Ödeme
                </button>
            </div>

            {payments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <i className="ri-money-dollar-circle-line text-4xl mb-2"></i>
                    <p>Henüz ödeme yok</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danışan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yöntem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(payment.payment_date)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{(payment as any).client_name || '-'}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-green-600">+{formatCurrency(payment.amount)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {payment.payment_method === 'cash' ? 'Nakit' : 'Diğer'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Basic Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Yeni Ödeme</h3>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
                                <select
                                    value={form.payment_method}
                                    onChange={e => setForm({ ...form, payment_method: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="cash">Nakit</option>
                                    <option value="credit_card">Kredi Kartı</option>
                                    <option value="bank_transfer">Havale</option>
                                </select>
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
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
