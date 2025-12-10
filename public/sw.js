const CACHE_NAME = 'boks-web-ble-v2';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon.png',
  './screenshots/mobile.png',
  './screenshots/desktop.png'
];

self.addEventListener('install', (e) => {
  // Force this new service worker to become the active one, taking over from the old one immediately
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  // Claim control of all open clients immediately
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
