// Offline storage management and cleanup utilities

interface StorageQuota {
  usage: number;
  quota: number;
  usagePercentage: number;
}

interface StorageStats {
  localStorage: StorageQuota;
  indexedDB: StorageQuota;
  cache: StorageQuota;
}

class OfflineStorageManager {
  private readonly STORAGE_KEYS = {
    TASKS: /^nw_tasks(_.*)?$/,
    DELETED_TASKS: /^nw_deleted_tasks(_.*)?$/,
    CHAT: /^nw_chat(_.*)?$/,
    GAMIFICATION: /^nw_gamification(_.*)?$/,
    TEMPLATES: /^nw_templates(_.*)?$/,
    SETTINGS: 'nw_settings',
    TIMER_STATE: /^nw_timer_state(_.*)?$/
  };

  private readonly CACHE_NAMES = [
    'nghiemwork-static-v2',
    'nghiemwork-data-v2',
    'nghiemwork-v2'
  ];

  async getStorageStats(): Promise<StorageStats> {
    const localStorageQuota = this.getLocalStorageQuota();
    const indexedDBQuota = await this.getIndexedDBQuota();
    const cacheQuota = await this.getCacheQuota();

    return {
      localStorage: localStorageQuota,
      indexedDB: indexedDBQuota,
      cache: cacheQuota
    };
  }

  private getLocalStorageQuota(): StorageQuota {
    let totalSize = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    // Estimate localStorage quota (typically 5-10MB)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB
    const usagePercentage = (totalSize / estimatedQuota) * 100;

    return {
      usage: totalSize,
      quota: estimatedQuota,
      usagePercentage
    };
  }

  private async getIndexedDBQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usagePercentage: estimate.usage && estimate.quota ? (estimate.usage / estimate.quota) * 100 : 0
      };
    }
    
    return {
      usage: 0,
      quota: 0,
      usagePercentage: 0
    };
  }

  private async getCacheQuota(): Promise<StorageQuota> {
    let totalSize = 0;
    
    for (const cacheName of this.CACHE_NAMES) {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      } catch (error) {
        console.warn(`Failed to get cache size for ${cacheName}:`, error);
      }
    }

    // Cache quota is part of the total storage quota
    const storageQuota = await this.getIndexedDBQuota();
    
    return {
      usage: totalSize,
      quota: storageQuota.quota,
      usagePercentage: storageQuota.quota > 0 ? (totalSize / storageQuota.quota) * 100 : 0
    };
  }

  async cleanupOldUserData(maxAgeDays: number = 30): Promise<void> {
    const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
    
    // Clean up old localStorage data
    this.cleanupLocalStorage(cutoffTime);
    
    // Clean up old cache data
    await this.cleanupCache(cutoffTime);
    
    // Clean up old IndexedDB data
    await this.cleanupIndexedDB(cutoffTime);
  }

  private cleanupLocalStorage(cutoffTime: number): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Check if it's user-specific data
      const userSpecificKeys = [
        this.STORAGE_KEYS.TASKS,
        this.STORAGE_KEYS.DELETED_TASKS,
        this.STORAGE_KEYS.CHAT,
        this.STORAGE_KEYS.GAMIFICATION,
        this.STORAGE_KEYS.TEMPLATES,
        this.STORAGE_KEYS.TIMER_STATE
      ];
      
      const isUserData = userSpecificKeys.some(pattern => pattern.test(key));
      
      if (isUserData) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          // Remove old deleted tasks
          if (this.STORAGE_KEYS.DELETED_TASKS.test(key)) {
            const filteredData = (data as Array<{ deletedAt?: number }>).filter((item) => 
              !item.deletedAt || item.deletedAt > cutoffTime
            );
            localStorage.setItem(key, JSON.stringify(filteredData));
          }
          
          // Remove old chat messages
          if (this.STORAGE_KEYS.CHAT.test(key)) {
            const filteredData = (data as Array<{ timestamp: number }>).filter((item) => 
              item.timestamp > cutoffTime
            );
            localStorage.setItem(key, JSON.stringify(filteredData));
          }
        } catch (error) {
          // If we can't parse the data, mark it for removal
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove corrupted data
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private async cleanupCache(cutoffTime: number): Promise<void> {
    for (const cacheName of this.CACHE_NAMES) {
      try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
              const responseDate = new Date(dateHeader).getTime();
              if (responseDate < cutoffTime) {
                await cache.delete(request);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to cleanup cache ${cacheName}:`, error);
      }
    }
  }

  private async cleanupIndexedDB(cutoffTime: number): Promise<void> {
    try {
      // Clean up sync data
      const syncDB = await this.openSyncDB();
      if (syncDB) {
        const transaction = syncDB.transaction(['syncData'], 'readwrite');
        const store = transaction.objectStore('syncData');
        const request = store.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const data = cursor.value;
            if (data.timestamp < cutoffTime) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      }
    } catch (error) {
      console.warn('Failed to cleanup IndexedDB:', error);
    }
  }

  private openSyncDB(): Promise<IDBDatabase | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('NghiemWorkSyncDB', 1);
      
      request.onerror = () => resolve(null);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('syncData')) {
          db.createObjectStore('syncData', { keyPath: 'id' });
        }
      };
    });
  }

  async clearAllUserData(): Promise<void> {
    // Clear localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nw_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear caches
    for (const cacheName of this.CACHE_NAMES) {
      try {
        await caches.delete(cacheName);
      } catch (error) {
        console.warn(`Failed to delete cache ${cacheName}:`, error);
      }
    }
    
    // Clear IndexedDB
    try {
      await indexedDB.deleteDatabase('NghiemWorkSyncDB');
    } catch (error) {
      console.warn('Failed to delete IndexedDB:', error);
    }
  }

  async optimizeStorage(): Promise<void> {
    // Clean up data older than 90 days
    await this.cleanupOldUserData(90);
    
    // Compact localStorage by removing empty/invalid entries
    this.compactLocalStorage();
    
    // Clear old cache entries
    await this.optimizeCache();
  }

  private compactLocalStorage(): void {
    const keysToCheck: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nw_')) {
        keysToCheck.push(key);
      }
    }
    
    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (!value || value === 'null' || value === 'undefined') {
          localStorage.removeItem(key);
        } else {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length === 0) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Remove invalid JSON
        localStorage.removeItem(key);
      }
    });
  }

  private async optimizeCache(): Promise<void> {
    for (const cacheName of this.CACHE_NAMES) {
      try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        // Remove cache entries that are too large or old
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            // Remove entries larger than 5MB
            if (blob.size > 5 * 1024 * 1024) {
              await cache.delete(request);
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to optimize cache ${cacheName}:`, error);
      }
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const offlineStorageManager = new OfflineStorageManager();

// Auto-cleanup on app start
export async function initializeStorageManagement(): Promise<void> {
  try {
    // Get storage stats
    const stats = await offlineStorageManager.getStorageStats();
    console.log('Storage stats:', stats);
    
    // Optimize storage if usage is high
    if (stats.localStorage.usagePercentage > 80 || stats.indexedDB.usagePercentage > 80) {
      console.log('High storage usage detected, optimizing...');
      await offlineStorageManager.optimizeStorage();
    }
    
    // Schedule regular cleanup
    setInterval(async () => {
      await offlineStorageManager.cleanupOldUserData(30);
    }, 24 * 60 * 60 * 1000); // Daily cleanup
    
  } catch (error) {
    console.error('Failed to initialize storage management:', error);
  }
}
