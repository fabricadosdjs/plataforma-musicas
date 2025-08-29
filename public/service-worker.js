self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Cache-first strategy for static assets
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open('pwa-cache-v1').then((cache) =>
        cache.match(event.request).then((cachedResponse) =>
          cachedResponse || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
        )
      )
    );
  }
});
