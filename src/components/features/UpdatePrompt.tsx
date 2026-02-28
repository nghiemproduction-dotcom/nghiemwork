import { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';

interface UpdatePromptProps {
  onUpdate?: () => void;
}

export function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ version?: string; message?: string }>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for update available event from service worker
    const handleUpdateAvailable = (event: Event) => {
      const customEvent = event as CustomEvent;
      setUpdateInfo({
        version: customEvent.detail?.version,
        message: customEvent.detail?.message || 'Đã có phiên bản mới với các cải tiến và sửa lỗi.'
      });
      setShowUpdate(true);
    };

    // Listen for update completed
    const handleUpdateCompleted = () => {
      setIsUpdating(false);
      setShowUpdate(false);
      // Reload the page to get the new version
      window.location.reload();
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-update-completed', handleUpdateCompleted);

    // Check for service worker updates periodically
    const checkForUpdates = async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Check for updates
        await registration.update();
        
        // Listen for new service worker waiting
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version is available
                setUpdateInfo({
                  message: 'Đã có phiên bản mới với các cải tiến và sửa lỗi.'
                });
                setShowUpdate(true);
              }
            });
          }
        });
      }
    };

    // Initial check after 5 seconds
    const timeout = setTimeout(checkForUpdates, 5000);

    // Periodic check every 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-update-completed', handleUpdateCompleted);
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // If there's a waiting worker, tell it to skip waiting
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Wait a moment for the new service worker to activate
      setTimeout(() => {
        onUpdate?.();
        window.location.reload();
      }, 1000);
    } else {
      // No service worker support, just reload
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Remind again in 1 hour
    setTimeout(() => {
      if (updateInfo.message) {
        setShowUpdate(true);
      }
    }, 60 * 60 * 1000);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-[90] animate-slide-down">
      <div className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-2xl p-4 shadow-lg shadow-[var(--accent-primary)]/20">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <RefreshCw size={20} className={`text-white ${isUpdating ? 'animate-spin' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              {isUpdating ? 'Đang cập nhật...' : 'Có phiên bản mới!'}
            </h3>
            <p className="text-xs text-white/90 mt-1 leading-relaxed">
              {updateInfo.message}
            </p>
            {updateInfo.version && (
              <p className="text-[10px] text-white/70 mt-0.5">
                Phiên bản: {updateInfo.version}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-[var(--accent-primary)] bg-white hover:bg-white/90 active:bg-white/80 disabled:opacity-50 transition-all"
          >
            <Download size={16} />
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật ngay'}
          </button>
          {!isUpdating && (
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 active:bg-white/20 transition-all"
            >
              Để sau
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdatePrompt;
