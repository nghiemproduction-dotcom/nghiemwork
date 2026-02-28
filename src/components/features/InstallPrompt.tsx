import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if app is already installed (standalone mode)
  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as { standalone?: boolean }).standalone 
        || document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };
    
    checkStandalone();
    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  useEffect(() => {
    // Don't show if already in standalone mode
    if (isStandalone) return;
    
    const dismissed = localStorage.getItem('nw_install_dismissed');
    if (dismissed) return;

    // Only show if explicitly requested (not auto-show)
    // User can request via settings page
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Don't auto-show popup anymore
      // setShowPrompt(true); // Disabled - user must use settings instead
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no deferred prompt, show instructions
      alert('Trình duyệt của bạn không hỗ trợ cài đặt tự động.\n\nHướng dẫn cài đặt:\n1. Chrome: Bấm menu (3 chấm) → Thêm vào màn hình chính\n2. Safari (iOS): Bấm chia sẻ → Thêm vào màn hình chính\n3. Samsung: Bấm menu → Thêm ứng dụng vào màn hình chính');
      return;
    }
    
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

  // Don't render if already in standalone mode
  if (isStandalone) return null;
  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-black/60">
      <div className="w-full max-w-md glass-strong rounded-2xl p-5 animate-slide-up border border-[var(--accent-primary)]/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Cài đặt NghiemWork</h3>
              <p className="text-xs text-[var(--text-secondary)]">Thêm vào màn hình chính để dùng như app</p>
            </div>
          </div>
          <button onClick={handleDismiss}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--accent-primary)]">✓</span>
            <span>Mở nhanh từ màn hình chính</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--accent-primary)]">✓</span>
            <span>Không cần mở browser</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--accent-primary)]">✓</span>
            <span>Hoạt động offline</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleDismiss}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] active:opacity-70 min-h-[48px] transition-all">
            Để sau
          </button>
          <button onClick={handleInstall}
            className="flex-[2] py-3 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] hover:opacity-90 active:opacity-80 min-h-[48px] flex items-center justify-center gap-2 transition-all">
            <Download size={18} />
            Cài đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
