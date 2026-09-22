// Declaración para el evento beforeinstallprompt de PWA
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

export const pwaService = {
  init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      listeners.forEach(fn => fn(true));
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      listeners.forEach(fn => fn(false));
      console.log('🎉 Bogad PWA instalada exitosamente');
    });
  },

  subscribe(callback: (canInstall: boolean) => void): () => void {
    listeners.add(callback);
    callback(deferredPrompt !== null);
    return () => {
      listeners.delete(callback);
    };
  },

  async promptInstall(): Promise<boolean> {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach(fn => fn(false));
    return choice.outcome === 'accepted';
  },

  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
    );
  },

  isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
  }
};
