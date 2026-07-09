import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Native window.confirm yerine erişilebilir, markalı onay diyaloğu.
// UX kuralları (araştırma-dayanaklı): eylem başlıkta yeniden ifade edilir,
// yıkıcı buton KIRMIZI ve eylemi adıyla söyler ("Sil"), varsayılan odak
// İPTAL'dedir (yanlışlıkla onayı önler), Escape=iptal, Tab diyalog içinde
// döner (focus trap — arka plandaki butonlara kaçamaz).
//
// Sağlamlık garantileri (code-review bulguları sonrası):
// - Bekleyen bir onay varken yeni çağrı gelirse ESKİSİ false ile çözülür
//   (asılı await kalmaz).
// - Host unmount olursa veya rota değişirse bekleyen onay false ile çözülür
//   (hayalet diyalog / bayat handler tetiklenmesi olmaz).
//
// Kullanım (hook gerekmez — modül-seviyesi promise API):
//   import { confirmDialog } from '../../components/ConfirmDialog';
//   if (!(await confirmDialog('Bu yazıyı silmek istediğinizden emin misiniz?'))) return;
//   // Silme değilse eylemi adlandır: confirmDialog(mesaj, 'Reddet')
// Host, App'te BrowserRouter İÇİNDE bir kez mount edilir: <ConfirmDialogHost />

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
  const pendingRef = useRef<PendingConfirm | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  pendingRef.current = pending;

  useEffect(() => {
    enqueue = (p) => {
      // Üst üste çağrı: öncekini asla asılı bırakma — iptal say.
      pendingRef.current?.resolve(false);
      setPending(p);
    };
    return () => {
      enqueue = null;
      // Host unmount: bekleyen onayı iptalle çöz (sonsuz await olmasın).
      pendingRef.current?.resolve(false);
      pendingRef.current = null;
    };
  }, []);

  const close = useCallback((ok: boolean) => {
    pendingRef.current?.resolve(ok);
    pendingRef.current = null;
    setPending(null);
  }, []);

  // Rota değişti → diyalog artık bağlamsız; iptalle kapat.
  useEffect(() => {
    if (pendingRef.current) close(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Varsayılan odak İptal'de (a11y: yanlışlıkla yıkıcı onayı önler)
  useEffect(() => {
    if (pending) cancelRef.current?.focus();
  }, [pending]);

  // Escape=iptal + Tab focus trap (odak diyalog içinde döner)
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close(false);
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (!dialogRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
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
        ref={dialogRef}
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
