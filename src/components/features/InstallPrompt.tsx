import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem('nw_install_dismissed');
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User installed PWA');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('nw_install_dismissed', '1');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('nw_install_dismissed', '1');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60">
      <div className="w-full max-w-md glass-strong rounded-2xl p-5 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center">
              <Download size={20} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Cài đặt NghiemWork</h3>
              <p className="text-xs text-[var(--text-secondary)]">Thêm vào màn hình chính để dùng như app</p>
            </div>
          </div>
          <button onClick={handleDismiss}
            className="p-1.5 rounded-lg text-[var(--text-muted)] min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Cài app để sử dụng nhanh hơn, không cần mở browser.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] active:opacity-70 min-h-[44px]">
            Để sau
          </button>
          <button onClick={handleInstall}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] active:opacity-80 min-h-[44px]">
            Cài ngay
          </button>
        </div>
      </div>
    </div>
  );
}
