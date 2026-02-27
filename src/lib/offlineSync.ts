interface SyncOperation {
  id: string;
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount?: number;
}

class OfflineSyncManager {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'NghiemWorkSyncDB';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'syncData';
  private readonly MAX_RETRIES = 3;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async addSyncOperation(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<string> {
    if (!this.db) await this.init();
    
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const syncOp: SyncOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(syncOp);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingOperations(): Promise<SyncOperation[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async removeSyncOperation(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateRetryCount(id: string, retryCount: number): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const operation = getRequest.result;
        if (operation) {
          operation.retryCount = retryCount;
          const updateRequest = store.put(operation);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Operation not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async syncPendingOperations(): Promise<{ success: number; failed: number }> {
    const operations = await this.getPendingOperations();
    let success = 0;
    let failed = 0;

    for (const operation of operations) {
      try {
        const response = await fetch(operation.url, {
          method: operation.method,
          headers: operation.headers,
          body: operation.body
        });

        if (response.ok) {
          await this.removeSyncOperation(operation.id);
          success++;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        const retryCount = (operation.retryCount || 0) + 1;
        
        if (retryCount >= this.MAX_RETRIES) {
          await this.removeSyncOperation(operation.id);
          console.error('Sync operation failed after max retries:', operation.id);
        } else {
          await this.updateRetryCount(operation.id, retryCount);
        }
        failed++;
      }
    }

    return { success, failed };
  }

  async cleanupOldOperations(olderThanDays: number = 7): Promise<number> {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const operations = await this.getPendingOperations();
    let removed = 0;

    for (const operation of operations) {
      if (operation.timestamp < cutoffTime) {
        await this.removeSyncOperation(operation.id);
        removed++;
      }
    }

    return removed;
  }

  async requestBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      try {
        // Type assertion for background sync API
        const reg = registration as ServiceWorkerRegistration & {
          sync: { register(tag: string): Promise<void> };
        };
        await reg.sync.register('background-sync');
      } catch (error) {
        console.error('Background sync registration failed:', error);
        // Fallback to immediate sync
        await this.syncPendingOperations();
      }
    } else {
      // Fallback for browsers without background sync
      await this.syncPendingOperations();
    }
  }
}

export const offlineSyncManager = new OfflineSyncManager();

// Helper function to queue API calls for offline sync
export function queueApiCall(
  url: string,
  method: string = 'GET',
  data?: unknown,
  headers?: Record<string, string>
): Promise<string> {
  const body = data ? JSON.stringify(data) : undefined;
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  return offlineSyncManager.addSyncOperation({
    url,
    method,
    headers: finalHeaders,
    body
  });
}

// Initialize offline sync on app load
export async function initializeOfflineSync(): Promise<void> {
  try {
    await offlineSyncManager.init();
    
    // Clean up old operations
    const removed = await offlineSyncManager.cleanupOldOperations();
    if (removed > 0) {
      console.log(`Cleaned up ${removed} old sync operations`);
    }

    // Request background sync if online
    if (navigator.onLine) {
      await offlineSyncManager.requestBackgroundSync();
    }

    // Set up online/offline event listeners
    window.addEventListener('online', async () => {
      console.log('Back online - triggering sync');
      await offlineSyncManager.requestBackgroundSync();
    });

  } catch (error) {
    console.error('Failed to initialize offline sync:', error);
  }
}
