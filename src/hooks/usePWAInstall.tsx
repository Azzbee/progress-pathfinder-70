import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false
  });

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    setState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isInstalled
    }));

    // Listen for install prompt (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState(prev => ({ ...prev, isInstallable: false }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install prompt error:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    if (state.isIOS) {
      return {
        title: 'Install on iPhone/iPad',
        steps: [
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install'
        ]
      };
    }
    
    if (state.isAndroid) {
      return {
        title: 'Install on Android',
        steps: [
          'Tap the menu button (three dots)',
          'Tap "Add to Home screen" or "Install app"',
          'Tap "Add" to install'
        ]
      };
    }

    return {
      title: 'Install App',
      steps: [
        'Click the install button in the address bar',
        'Or use the browser menu to install'
      ]
    };
  };

  return {
    ...state,
    promptInstall,
    getInstallInstructions,
    canPromptInstall: !!deferredPrompt
  };
}