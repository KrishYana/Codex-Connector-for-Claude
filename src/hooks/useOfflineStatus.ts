import { useState, useEffect, useCallback } from 'react';

interface CacheStatus {
  cacheSize: number;
  lastSync: number | null;
  maxSize: number;
  isOnline: boolean;
  isServiceWorkerReady: boolean;
}

interface OfflineStatusHook {
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  cacheStatus: CacheStatus | null;
  refreshCacheStatus: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useOfflineStatus = (): OfflineStatusHook => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker with environment check
  useEffect(() => {
    // Check if we're in StackBlitz or other environments that don't support service workers
    const isStackBlitz = window.location.hostname.includes('stackblitz') || 
                        window.location.hostname.includes('webcontainer');
    
    if ('serviceWorker' in navigator && !isStackBlitz) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          setIsServiceWorkerReady(true);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('New service worker version available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('Service Worker registration failed (this is expected in some environments):', error.message);
          // Don't set as ready, but don't throw error
        });
    } else {
      console.log('Service Worker not supported or disabled in this environment');
      // Set mock cache status for environments without service worker support
      setCacheStatus({
        cacheSize: 0,
        lastSync: null,
        maxSize: 0,
        isOnline,
        isServiceWorkerReady: false
      });
    }
  }, [isOnline]);

  // Get cache status from service worker
  const refreshCacheStatus = useCallback(async () => {
    if (!isServiceWorkerReady || !navigator.serviceWorker.controller) {
      // Provide mock status when service worker is not available
      setCacheStatus({
        cacheSize: 0,
        lastSync: null,
        maxSize: 0,
        isOnline,
        isServiceWorkerReady: false
      });
      return;
    }

    try {
      const messageChannel = new MessageChannel();
      
      const response = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Service worker communication timeout'));
        }, 5000);

        messageChannel.port1.onmessage = (event) => {
          clearTimeout(timeout);
          resolve(event.data);
        };
        
        navigator.serviceWorker.controller?.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );
      });

      setCacheStatus({
        ...response,
        isOnline,
        isServiceWorkerReady
      });
    } catch (error) {
      console.warn('Failed to get cache status:', error);
      // Provide fallback status
      setCacheStatus({
        cacheSize: 0,
        lastSync: null,
        maxSize: 0,
        isOnline,
        isServiceWorkerReady: false
      });
    }
  }, [isServiceWorkerReady, isOnline]);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!isServiceWorkerReady || !navigator.serviceWorker.controller) {
      console.log('Cache clear not available - service worker not ready');
      return;
    }

    try {
      const messageChannel = new MessageChannel();
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Service worker communication timeout'));
        }, 5000);

        messageChannel.port1.onmessage = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        navigator.serviceWorker.controller?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });

      await refreshCacheStatus();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [isServiceWorkerReady, refreshCacheStatus]);

  // Initial cache status load
  useEffect(() => {
    refreshCacheStatus();
  }, [refreshCacheStatus]);

  // Refresh cache status when coming back online
  useEffect(() => {
    if (isOnline) {
      refreshCacheStatus();
    }
  }, [isOnline, refreshCacheStatus]);

  return {
    isOnline,
    isServiceWorkerReady,
    cacheStatus,
    refreshCacheStatus,
    clearCache
  };
};