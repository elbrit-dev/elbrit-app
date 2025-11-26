// Import OneSignal SDK for push notifications
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// PWA offline caching functionality
const CACHE_NAME = 'app-cache-v2';
const ALLOWED_ORIGINS = [
  'https://app.elbrit.org',
  'https://plamsic-app.netlify.app',
  'http://localhost:3000',
  self.location.origin
];
const PRE_CACHE_URLS = [
  '/',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/elbrit one logo.gif'
];

// Install event - pre-cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE_URLS))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  // Skip OneSignal and external API requests
  if (request.url.includes('onesignal.com') || 
      request.url.includes('firebase') ||
      request.url.includes('googleapis.com')) {
    return;
  }

  // Only handle requests from allowed origins
  const isAllowedOrigin = ALLOWED_ORIGINS.some(origin => 
    request.url.startsWith(origin) || requestUrl.origin === self.location.origin
  );

  if (!isAllowedOrigin) {
    return; // Let the browser handle external requests
  }

  // Network-first for navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache-first for static assets, then fall back to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Stale-while-revalidate
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then((response) => {
        if (response && response.status === 200 && request.method === 'GET') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
