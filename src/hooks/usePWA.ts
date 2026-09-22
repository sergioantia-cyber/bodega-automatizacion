import { useState, useEffect, useCallback } from 'react';
import { pwaService } from '../services/pwaService';

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const isIOS = pwaService.isIOS();
  const isStandalone = pwaService.isStandalone();

  useEffect(() => {
    pwaService.init();
    setIsInstalled(isStandalone);

    const unsubscribe = pwaService.subscribe((canInstall) => {
      setIsInstallable(canInstall && !isStandalone);
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isStandalone]);

  const promptInstall = useCallback(async () => {
    const installed = await pwaService.promptInstall();
    if (installed) {
      setIsInstalled(true);
      setIsInstallable(false);
    }
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isStandalone,
    isOffline,
    promptInstall
  };
}
