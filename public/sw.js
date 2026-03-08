// Service Worker for offline caching
const CACHE_NAME = 'codex-connector-v1';
const STATIC_CACHE_NAME = 'codex-connector-static-v1';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100 MB
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/manifest.json'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/modules/',
  '/api/courses/',
  '/api/discussions/'
];

// File types to cache
const CACHEABLE_EXTENSIONS = ['.pdf', '.mp4', '.mp3', '.jpg', '.jpeg', '.png', '.webp'];

// IndexedDB setup
const DB_NAME = 'CodexConnectorCache';
const DB_VERSION = 1;
const STORES = {
  modules: 'modules',
  files: 'files',
  metadata: 'metadata'
};

class CacheManager {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Modules store
        if (!db.objectStoreNames.contains(STORES.modules)) {
          const moduleStore = db.createObjectStore(STORES.modules, { keyPath: 'id' });
          moduleStore.createIndex('lastAccessed', 'lastAccessed');
          moduleStore.createIndex('size', 'size');
        }
        
        // Files store (PDFs, videos, etc.)
        if (!db.objectStoreNames.contains(STORES.files)) {
          const fileStore = db.createObjectStore(STORES.files, { keyPath: 'url' });
          fileStore.createIndex('lastAccessed', 'lastAccessed');
          fileStore.createIndex('size', 'size');
          fileStore.createIndex('type', 'type');
        }
        
        // Metadata store
        if (!db.objectStoreNames.contains(STORES.metadata)) {
          const metaStore = db.createObjectStore(STORES.metadata, { keyPath: 'key' });
        }
      };
    });
  }

  async getCurrentCacheSize() {
    if (!this.db) await this.initDB();
    
    let totalSize = 0;
    const stores = [STORES.modules, STORES.files];
    
    for (const storeName of stores) {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      const items = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
      
      totalSize += items.reduce((sum, item) => sum + (item.size || 0), 0);
    }
    
    return totalSize;
  }

  async evictLRU(targetSize) {
    if (!this.db) await this.initDB();
    
    const stores = [STORES.modules, STORES.files];
    const allItems = [];
    
    // Collect all items with their last accessed time
    for (const storeName of stores) {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      const items = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
      
      allItems.push(...items.map(item => ({ ...item, store: storeName })));
    }
    
    // Sort by last accessed (oldest first)
    allItems.sort((a, b) => a.lastAccessed - b.lastAccessed);
    
    let freedSize = 0;
    const itemsToDelete = [];
    
    for (const item of allItems) {
      if (freedSize >= targetSize) break;
      itemsToDelete.push(item);
      freedSize += item.size || 0;
    }
    
    // Delete items
    for (const item of itemsToDelete) {
      const transaction = this.db.transaction(item.store, 'readwrite');
      const store = transaction.objectStore(item.store);
      
      if (item.store === STORES.modules) {
        store.delete(item.id);
      } else {
        store.delete(item.url);
      }
    }
    
    return freedSize;
  }

  async ensureSpace(requiredSize) {
    const currentSize = await this.getCurrentCacheSize();
    const availableSpace = MAX_CACHE_SIZE - currentSize;
    
    if (availableSpace < requiredSize) {
      const targetEviction = requiredSize - availableSpace + (MAX_CACHE_SIZE * 0.1); // Extra 10%
      await this.evictLRU(targetEviction);
    }
  }

  async storeModule(moduleId, data) {
    if (!this.db) await this.initDB();
    
    const size = new Blob([JSON.stringify(data)]).size;
    await this.ensureSpace(size);
    
    const transaction = this.db.transaction(STORES.modules, 'readwrite');
    const store = transaction.objectStore(STORES.modules);
    
    const moduleData = {
      id: moduleId,
      data,
      size,
      lastAccessed: Date.now(),
      cached: Date.now()
    };
    
    store.put(moduleData);
    await this.updateLastSync();
  }

  async getModule(moduleId) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(STORES.modules, 'readwrite');
    const store = transaction.objectStore(STORES.modules);
    const request = store.get(moduleId);
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Update last accessed time
          result.lastAccessed = Date.now();
          store.put(result);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  async storeFile(url, blob, type) {
    if (!this.db) await this.initDB();
    
    const size = blob.size;
    await this.ensureSpace(size);
    
    const transaction = this.db.transaction(STORES.files, 'readwrite');
    const store = transaction.objectStore(STORES.files);
    
    const fileData = {
      url,
      blob,
      type,
      size,
      lastAccessed: Date.now(),
      cached: Date.now()
    };
    
    store.put(fileData);
    await this.updateLastSync();
  }

  async getFile(url) {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(STORES.files, 'readwrite');
    const store = transaction.objectStore(STORES.files);
    const request = store.get(url);
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Update last accessed time
          result.lastAccessed = Date.now();
          store.put(result);
          resolve(result.blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  async updateLastSync() {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(STORES.metadata, 'readwrite');
    const store = transaction.objectStore(STORES.metadata);
    
    store.put({
      key: 'lastSync',
      value: Date.now()
    });
  }

  async getLastSync() {
    if (!this.db) await this.initDB();
    
    const transaction = this.db.transaction(STORES.metadata, 'readonly');
    const store = transaction.objectStore(STORES.metadata);
    const request = store.get('lastSync');
    
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => resolve(null);
    });
  }
}

const cacheManager = new CacheManager();

// Helper functions
function shouldCacheRequest(request) {
  const url = new URL(request.url);
  
  // Cache API requests for modules
  if (CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
    return true;
  }
  
  // Cache files with specific extensions
  if (CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
    return true;
  }
  
  return false;
}

function isModuleAPI(url) {
  return url.pathname.startsWith('/api/modules/');
}

function isFileRequest(url) {
  return CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
}

// Service Worker event listeners
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle static assets
  if (request.method === 'GET' && url.origin === self.location.origin) {
    if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
      event.respondWith(
        caches.match(request)
          .then((response) => response || fetch(request))
      );
      return;
    }
  }
  
  // Handle cacheable requests
  if (request.method === 'GET' && shouldCacheRequest(request)) {
    event.respondWith(handleCacheableRequest(request));
    return;
  }
  
  // Default: network first
  event.respondWith(fetch(request));
});

async function handleCacheableRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache the response
      if (isModuleAPI(url)) {
        const moduleId = url.pathname.split('/').pop();
        const data = await response.clone().json();
        await cacheManager.storeModule(moduleId, data);
      } else if (isFileRequest(url)) {
        const blob = await response.clone().blob();
        await cacheManager.storeFile(request.url, blob, response.headers.get('content-type'));
      }
      
      return response;
    }
  } catch (error) {
    // Network failed, try cache
    console.log('Network failed, trying cache for:', request.url);
  }
  
  // Try cache
  if (isModuleAPI(url)) {
    const moduleId = url.pathname.split('/').pop();
    const cachedData = await cacheManager.getModule(moduleId);
    
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } else if (isFileRequest(url)) {
    const cachedBlob = await cacheManager.getFile(request.url);
    
    if (cachedBlob) {
      return new Response(cachedBlob);
    }
  }
  
  // Return offline fallback
  return new Response(JSON.stringify({ 
    error: 'Content not available offline',
    offline: true 
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Message handling for cache status
self.addEventListener('message', async (event) => {
  if (event.data.type === 'GET_CACHE_STATUS') {
    const cacheSize = await cacheManager.getCurrentCacheSize();
    const lastSync = await cacheManager.getLastSync();
    
    event.ports[0].postMessage({
      cacheSize,
      lastSync,
      maxSize: MAX_CACHE_SIZE
    });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    await cacheManager.clearAll();
    event.ports[0].postMessage({ success: true });
  }
});