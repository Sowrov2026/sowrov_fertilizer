export const SFPWA = {
  async init() {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', reg.scope);
    }
    this.setupInstallPrompt();
    this.setupUpdatePrompt();
  },

  deferredPrompt: null,

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
  },

  showInstallButton() {
    // Show install banner/button
  },

  async installApp() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log('Install:', outcome);
    this.deferredPrompt = null;
  },

  setupUpdatePrompt() {
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      // Show update available message
    });
  },

  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches;
  },

  canInstall() {
    return !!this.deferredPrompt;
  },
};
