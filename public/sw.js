const CACHE_NAME = 'nghiemwork-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch - no complex caching to avoid issues
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline', { status: 503 });
  }));
});
