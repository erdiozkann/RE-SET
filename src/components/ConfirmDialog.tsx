import { useCallback, useEffect, useRef, useState } from 'react';

// Native window.confirm yerine erişilebilir, markalı onay diyaloğu.
// UX kuralları (araştırma-dayanaklı): eylem başlıkta yeniden ifade edilir,
// yıkıcı buton KIRMIZI ve eylemi adıyla söyler ("Sil"), varsayılan odak
// İPTAL'dedir (yanlışlıkla onayı önler), Escape=iptal.
//
// Kullanım (hook gerekmez — modül-seviyesi promise API):
//   import { confirmDialog } from '../../components/ConfirmDialog';
//   if (!(await confirmDialog('Bu yazıyı silmek istediğinizden emin misiniz?'))) return;
// Host bileşeni App'te bir kez mount edilir: <ConfirmDialogHost />

type PendingConfirm = {
  message: string;
  confirmText: string;
  resolve: (ok: boolean) => void;
};

let enqueue: ((p: PendingConfirm) => void) | null = null;

export function confirmDialog(message: string, confirmText = 'Sil'): Promise<boolean> {
  if (!enqueue) {
    // Host mount edilmemişse güvenli düşüş: native confirm.
    return Promise.resolve(window.confirm(message));
  }
  return new Promise<boolean>((resolve) => {
    enqueue!({ message, confirmText, resolve });
  });
}

export function ConfirmDialogHost() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    enqueue = (p) => setPending(p);
    return () => {
      enqueue = null;
    };
  }, []);

  // Varsayılan odak İptal'de (a11y: yanlışlıkla yıkıcı onayı önler)
  useEffect(() => {
    if (pending) cancelRef.current?.focus();
  }, [pending]);

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending],
  );

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, close]);

  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
      onClick={() => close(false)}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <i className="ri-error-warning-line text-xl text-red-600" aria-hidden="true"></i>
          </div>
          <div>
            <h3 id="confirm-title" className="font-semibold text-[#1A1A1A]">
              Emin misiniz?
            </h3>
            <p id="confirm-message" className="text-sm text-gray-600 mt-1">
              {pending.message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => close(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            {pending.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
