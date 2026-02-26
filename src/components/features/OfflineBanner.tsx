import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="sticky top-0 z-[60] flex items-center justify-center gap-2 py-2 px-4 bg-amber-500/20 border-b border-amber-500/40 text-amber-200 text-sm"
      role="status"
      aria-live="polite"
    >
      <WifiOff size={18} aria-hidden />
      <span>Bạn đang offline. Một số tính năng có thể không hoạt động.</span>
    </div>
  );
}
