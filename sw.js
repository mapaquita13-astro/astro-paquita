/* ASTRO PAQUITA — Service Worker Mobile Pro V27
   Objectif : éviter qu'une ancienne version de index.html reste figée sur mobile. */
const VERSION = 'astro-paquita-mobile-pro-v27-20260811';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Toujours aller au réseau pour les pages HTML/navigation afin de récupérer la dernière version.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => caches.match(request))
    );
    return;
  }

  // Pour les autres ressources : réseau d'abord, cache uniquement en secours.
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
