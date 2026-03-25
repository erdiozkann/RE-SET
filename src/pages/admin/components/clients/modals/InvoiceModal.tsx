import React from 'react';
import type { Client } from '../../../../types';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    invoiceForm: { description: string; amount: string; due_date: string };
    setInvoiceForm: (form: any) => void;
    onSave: () => void;
    saving: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
    isOpen,
    onClose,
    client,
    invoiceForm,
    setInvoiceForm,
    onSave,
    saving
}) => {
    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">Fatura/Borç Ekle</h3>
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
                            Açıklama <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={invoiceForm.description}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                            placeholder="Örn: Bireysel Seans - Aralık 2025"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tutar (₺) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={invoiceForm.amount}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Vade Tarihi (Opsiyonel)
                        </label>
                        <input
                            type="date"
                            value={invoiceForm.due_date}
                            onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all"
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
                        className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-add-line"></i>}
                        Borç Ekle
                    </button>
                </div>
            </div>
        </div>
    );
};
