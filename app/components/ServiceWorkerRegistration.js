'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerSW = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          // Forzar la activación inmediata
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Registrar para sincronización en segundo plano
          if ('sync' in registration) {
            try {
              await registration.sync.register('precache');
            } catch (err) {
              console.log('Sync registration failed:', err);
            }
          }

          console.log('Service Worker registrado con éxito');
        }
      } catch (error) {
        console.error('Error al registrar el Service Worker:', error);
      }
    };

    // Registrar el SW inmediatamente y también cuando la página se carga
    registerSW();
    window.addEventListener('load', registerSW);

    return () => {
      window.removeEventListener('load', registerSW);
    };
  }, []);

  return null;
} 