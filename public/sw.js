const CACHE_NAME = 'boks-controller-v3';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './ble-utils.js',
  './locales.js',
  './mock-boks.js',
  './manifest.json',
  './icon-192.png',
  './icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Exclude PR Previews from Caching
  // Pattern: /pr-{number}/
  if (/\/pr-\d+\//.test(url.pathname)) {
    // PR Preview: Network Only
    return; // Fallback to browser default (network)
  }

  // 2. Exclude API/Non-GET requests (if any)
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. Stale-While-Revalidate Strategy for App Shell
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update cache with new version if valid
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });

      // Return cached response immediately if available, else wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
