'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const registerSW = async () => {
      try {
        if ('serviceWorker' in navigator) {
          // Registrar el service worker inmediatamente
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
            immediate: true
          });

          // Forzar la activación
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Registrar sincronización periódica
          if ('periodicSync' in registration) {
            try {
              await registration.periodicSync.register('update-cache', {
                minInterval: 24 * 60 * 60 * 1000 // 24 horas
              });
            } catch (err) {
              console.log('Periodic sync could not be registered:', err);
            }
          }

          // Registrar sincronización en segundo plano
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

    // Registrar inmediatamente
    registerSW();

    // También registrar en la carga de la página
    window.addEventListener('load', registerSW);

    return () => {
      window.removeEventListener('load', registerSW);
    };
  }, []);

  return null;
} 