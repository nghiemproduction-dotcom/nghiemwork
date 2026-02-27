// Service Worker registration for PWA functionality

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    return navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                if (confirm('Phiên bản mới có sẵn! Tải lại để cập nhật?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });

        return registration;
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
        return null;
      });
  }
  return Promise.resolve(null);
}

export function unregisterServiceWorker(): Promise<void> {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    return navigator.serviceWorker.ready
      .then((registration) => {
        return registration.unregister();
      })
      .then(() => {
        console.log('Service Worker unregistered successfully');
      })
      .catch((error) => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
  return Promise.resolve();
}

// Initialize service worker and offline sync
export async function initializePWA(): Promise<void> {
  try {
    // Register service worker
    const registration = await registerServiceWorker();
    
    if (registration) {
      console.log('PWA initialized successfully');
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  } catch (error) {
    console.error('PWA initialization failed:', error);
  }
}
