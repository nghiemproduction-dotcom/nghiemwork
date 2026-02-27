import { useState, useEffect } from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  const [showOfflineMode, setShowOfflineMode] = useState(false);

  useEffect(() => {
    const onOnline = () => {
      setIsOffline(false);
      setShowOfflineMode(false);
    };
    const onOffline = () => {
      setIsOffline(true);
      setShowOfflineMode(true);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!isOffline && !showOfflineMode) return null;

  return (
    <div
      className={`sticky top-0 z-[60] flex items-center justify-center gap-2 py-2 px-4 border-b text-sm ${
        isOffline 
          ? 'bg-amber-500/20 border-amber-500/40 text-amber-200' 
          : 'bg-green-500/20 border-green-500/40 text-green-200'
      }`}
      role="status"
      aria-live="polite"
    >
      {isOffline ? (
        <>
          <WifiOff size={18} aria-hidden />
          <span>Chế độ offline - Đã bật chế độ làm việc không cần mạng</span>
        </>
      ) : (
        <>
          <AlertCircle size={18} aria-hidden />
          <span>Đã kết nối lại mạng</span>
        </>
      )}
    </div>
  );
}
