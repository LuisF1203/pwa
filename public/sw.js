// Nombre de la caché
const CACHE_NAME = 'offline-cache-v3';
const OFFLINE_URL = '/offline';

// Recursos que queremos que estén disponibles offline
const OFFLINE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/_next/static/**/*',
  '/icons/*',
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
      // Forzar la activación inmediata
      self.skipWaiting(),
      
      // Cachear recursos críticos
      caches.open(CACHE_NAME).then((cache) => {
        // Primero cachear la página offline
        cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        
        // Luego cachear el resto de recursos
        return cache.addAll(OFFLINE_URLS);
      })
    ])
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      caches.keys().then((keys) => 
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      ),
      // Tomar control inmediatamente
      self.clients.claim()
    ])
  );
});

// Estrategia de caché: Cache First, fallback to network
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      try {
        // Intentar obtener de la caché primero
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si no está en caché, intentar la red
        const networkResponse = await fetch(event.request);
        
        // Verificar que la respuesta es válida
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }

        throw new Error('Invalid response');
      } catch (error) {
        // Si todo falla, mostrar la página offline
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })()
  );
});

// Precachear cuando hay conexión
self.addEventListener('sync', (event) => {
  if (event.tag === 'precache') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => 
        cache.addAll(OFFLINE_URLS)
      )
    );
  }
});

// Mantener la caché actualizada
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => 
        cache.addAll(OFFLINE_URLS)
      )
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
