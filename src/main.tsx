import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';

// En la app nativa (Capacitor Android/iOS) los archivos ya residen localmente en el APK.
// Un Service Worker en Capacitor causa caché residual y hace parpadear versiones previas.
if (!Capacitor.isNativePlatform()) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('🚀 Nueva versión de Bogad disponible');
    },
    onOfflineReady() {
      console.log('⚡ Bogad listo para funcionar sin conexión');
    },
  });
} else {
  // Limpiar cualquier Service Worker residual dentro del WebView de Android
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
