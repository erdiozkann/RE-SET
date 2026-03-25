import React from 'react';
import type { Client, Invoice } from '../../../../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    invoices: Invoice[];
    paymentForm: { amount: string; payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'other'; invoice_id: string; description: string };
    setPaymentForm: (form: any) => void;
    onSave: () => void;
    saving: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    client,
    invoices,
    paymentForm,
    setPaymentForm,
    onSave,
    saving
}) => {
    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">Ödeme Al</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <i className="ri-close-line text-xl text-gray-500"></i>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tutar (₺) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ödeme Yöntemi
                        </label>
                        <select
                            value={paymentForm.payment_method}
                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                        >
                            <option value="cash">Nakit</option>
                            <option value="credit_card">Kredi Kartı</option>
                            <option value="bank_transfer">Havale/EFT</option>
                            <option value="other">Diğer</option>
                        </select>
                    </div>

                    {invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Faturaya Bağla (Opsiyonel)
                            </label>
                            <select
                                value={paymentForm.invoice_id}
                                onChange={(e) => setPaymentForm({ ...paymentForm, invoice_id: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                            >
                                <option value="">Seçiniz...</option>
                                {invoices
                                    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
                                    .map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.invoice_no} - {inv.description} ({(inv.amount - inv.paid_amount).toLocaleString('tr-TR')} ₺ kalan)
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Açıklama (Opsiyonel)
                        </label>
                        <input
                            type="text"
                            value={paymentForm.description}
                            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                            placeholder="Örn: Aralık ayı ödemesi"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        disabled={saving}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
                        Ödeme Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
};
