const CACHE_NAME = 'nghiemwork-v2';
const BUILD_VERSION = '2.0.0'; // Increment this on each deploy
const STATIC_CACHE = 'nghiemwork-static-v2';
const DATA_CACHE = 'nghiemwork-data-v2';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/og-image.jpg',
  '/placeholder.svg'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', BUILD_VERSION);
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(STATIC_ASSETS)
      ),
      caches.open(DATA_CACHE).then(cache =>
        cache.addAll([]) // Initialize data cache
      )
    ]).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version:', BUILD_VERSION);
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== DATA_CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

// Listen for skip waiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting triggered');
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external requests for caching
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    // Still handle API requests for offline sync
    if (url.pathname.startsWith('/api/') || url.pathname.includes('/functions/v1/')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Cache successful API responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DATA_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Return cached version if offline
            return caches.match(request);
          })
      );
      return;
    }
    return;
  }

  // Handle static assets - cache first strategy
  if (STATIC_ASSETS.some(asset => asset === url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html').then(r => r || new Response('Offline', { status: 503, statusText: 'Offline' }))
      )
    );
    return;
  }

  // Handle other requests with network first, then cache strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if offline
        return caches.match(request);
      })
  );
});

// Push notification support
self.addEventListener('push', (event) => {
  let data = { title: 'NghiemWork', body: 'Bạn có thông báo mới' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/og-image.jpg',
      badge: '/og-image.jpg',
      vibrate: [200, 100, 200],
      tag: data.tag || 'nghiemwork-push',
      renotify: true,
      requireInteraction: false,
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Get all pending sync data from IndexedDB
      getPendingSyncData()
        .then((syncData) => {
          console.log('[SW] Processing', syncData.length, 'pending sync operations');
          // Process each pending sync operation
          return Promise.all(
            syncData.map((data) => {
              return fetch(data.url, {
                method: data.method,
                headers: data.headers,
                body: data.body
              })
              .then((response) => {
                if (response.ok) {
                  console.log('[SW] Sync successful for', data.id);
                  // Remove successful sync from IndexedDB
                  return removeSyncData(data.id);
                }
                throw new Error('Sync failed');
              })
              .catch((error) => {
                console.error('[SW] Sync error for', data.id, ':', error);
                // Keep failed items for retry
              });
            })
          );
        })
        .then(() => {
          console.log('[SW] Background sync completed');
        })
    );
  }
});

// Helper functions for IndexedDB operations
function getPendingSyncData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NghiemWorkSyncDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncData'], 'readonly');
      const store = transaction.objectStore('syncData');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('syncData')) {
        db.createObjectStore('syncData', { keyPath: 'id' });
      }
    };
  });
}

function removeSyncData(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NghiemWorkSyncDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncData'], 'readwrite');
      const store = transaction.objectStore('syncData');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}
