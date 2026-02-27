import { useEffect, useState } from 'react';
import { RefreshCw, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update().then(() => {
            // If new service worker is waiting, show update prompt
            if (registration.waiting) {
              setUpdateAvailable(true);
              setShowPrompt(true);
            }
          });
        };

        // Check immediately and then every 5 minutes
        checkForUpdates();
        const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setShowPrompt(true);
              }
            });
          }
        });

        return () => clearInterval(interval);
      });
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Send message to service worker to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      });
    }
    setShowPrompt(false);
    toast.success('Đang cập nhật...');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !updateAvailable) return null;

  return (
    <div className="fixed inset-0 z-[101] flex items-end justify-center p-4 bg-black/60">
      <div className="w-full max-w-md glass-strong rounded-2xl p-5 animate-slide-up border border-[var(--accent-primary)]/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center relative">
              <Sparkles size={20} className="text-[var(--accent-primary)]" />
              <div className="absolute -top-1 -right-1 size-3 rounded-full bg-[var(--success)] animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Có bản cập nhật mới!</h3>
              <p className="text-xs text-[var(--text-secondary)]">NghiemWork vừa được nâng cấp</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-[var(--text-muted)] min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-[var(--bg-surface)]" 
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>
        
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Đã có phiên bản mới của ứng dụng với các cải tiến và tính năng mới. 
          Nhấn "Cập nhật ngay" để trải nghiệm ngay!
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] active:opacity-70 min-h-[44px] transition-colors"
          >
            Để sau
          </button>
          <button 
            onClick={handleUpdate}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] hover:opacity-90 active:opacity-80 min-h-[44px] flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw size={16} />
            Cập nhật ngay
          </button>
        </div>
      </div>
    </div>
  );
}
