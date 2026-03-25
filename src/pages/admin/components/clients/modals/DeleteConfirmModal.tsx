import React from 'react';
import type { Client } from '../../../../types';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    onConfirm: () => void;
    saving: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    client,
    onConfirm,
    saving
}) => {
    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl my-auto animate-fade-in-up">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-delete-bin-line text-3xl text-red-600"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Danışanı Sil</h3>
                    <p className="text-gray-600">
                        <strong>{client.name}</strong> isimli danışanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </p>
                </div>

                <div className="flex items-center gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="flex-1 px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={saving}
                        className="flex-1 px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <i className="ri-loader-4-line animate-spin"></i>
                                Siliniyor...
                            </>
                        ) : (
                            <>
                                <i className="ri-delete-bin-line"></i>
                                Sil
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
