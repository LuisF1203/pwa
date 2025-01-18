'use client'
import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async function() {
        try {
          // Registrar el service worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          // Verificar si hay una actualización disponible
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Hay una nueva versión disponible
                if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
                  window.location.reload();
                }
              }
            });
          });

          // Solicitar permiso para notificaciones
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Permiso de notificaciones:', permission);
          }

          console.log('Service Worker registrado con éxito');
        } catch (error) {
          console.error('Error al registrar el Service Worker:', error);
        }
      });

      // Manejar la pérdida de conexión
      window.addEventListener('offline', () => {
        console.log('La aplicación está offline');
      });

      // Manejar la recuperación de conexión
      window.addEventListener('online', () => {
        console.log('La aplicación está online');
      });
    }
  }, []);

  return null;
} 