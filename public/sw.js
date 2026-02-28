const CACHE_NAME = 'nghiemwork-v1';
const BUILD_VERSION = '1.0.0'; // Increment this for new deployments

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx'
];

// Listen for skip waiting message from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  // Notify the app that a new version is available
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: BUILD_VERSION,
          message: 'Đã có phiên bản mới với các cải tiến và sửa lỗi.'
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  
  // Notify all clients that the new service worker is active
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_COMPLETED',
          version: BUILD_VERSION
        });
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Simple fetch - no complex caching to avoid issues
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline', { status: 503 });
  }));
});

// Check for updates every 30 minutes
setInterval(() => {
  self.registration.update();
}, 30 * 60 * 1000);
