// Nombre de la caché
const CACHE_NAME = 'offline-cache-v1';

// Recursos que queremos que estén disponibles offline
const OFFLINE_URLS = [
  '/',
  '/manifest.json',
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

// Instalar el Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(OFFLINE_URLS);
      })
      .then(() => self.skipWaiting()) // Fuerza la activación inmediata
  );
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma el control inmediatamente
  );
});

// Estrategia de caché: Network First, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, la guardamos en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentamos recuperar de la caché
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response; // Retornamos el recurso de la caché
            }
            // Si no está en caché y estamos offline, podríamos mostrar una página offline
            return caches.match('/');
          });
      })
  );
});

// Manejo de sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'syncData') {
    event.waitUntil(
      // Aquí puedes implementar la lógica de sincronización
      Promise.resolve()
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
