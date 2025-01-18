// Nombre de la caché
const CACHE_NAME = 'offline-cache-v2';

// Recursos que queremos que estén disponibles offline
const OFFLINE_URLS = [
  '/',
  '/manifest.json',
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/index.js',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon.ico',
  '/next.svg',
  '/vercel.svg',
  '/file.svg',
  '/globe.svg',
  '/window.svg'
];

// Instalar el Service Worker y cachear todos los recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(OFFLINE_URLS);
      }),
      self.skipWaiting() // Fuerza la activación inmediata
    ])
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Toma el control inmediatamente
    ])
  );
});

// Estrategia de caché: Cache First, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Si encontramos el recurso en caché, lo devolvemos
          return response;
        }

        // Si no está en caché, intentamos obtenerlo de la red
        return fetch(event.request)
          .then((networkResponse) => {
            // Verificamos si la respuesta es válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clonamos la respuesta porque se consume al usarla
            const responseToCache = networkResponse.clone();

            // Guardamos la nueva respuesta en caché
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Si falla la red y no está en caché, devolvemos la página principal
            return caches.match('/');
          });
      })
  );
});

// Precachear recursos cuando hay conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'precache') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(OFFLINE_URLS);
        })
    );
  }
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/android-chrome-192x192.png',
    badge: '/icons/android-chrome-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Mi PWA', options)
  );
});
