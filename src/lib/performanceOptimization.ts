// Performance optimization utilities

import { useEffect } from 'react';

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private lastCleanup = 0;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Debounce function to prevent excessive calls
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function to limit call frequency
  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Memory cleanup
  cleanupMemory(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    console.log('Performing memory cleanup...');
    
    // Force garbage collection if available
    if ('gc' in window) {
      (window as { gc?: () => void }).gc?.();
    }

    // Clear unused event listeners
    this.clearUnusedEventListeners();

    // Optimize localStorage
    this.optimizeLocalStorage();

    this.lastCleanup = now;
  }

  private clearUnusedEventListeners(): void {
    // This is a placeholder for more sophisticated cleanup
    // In practice, you'd track registered listeners and clean them up
    console.log('Clearing unused event listeners...');
  }

  private optimizeLocalStorage(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nw_')) {
          try {
            const value = localStorage.getItem(key);
            if (!value || value === 'null' || value === 'undefined' || value === '[]') {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore errors during cleanup
        }
      });

      if (keysToRemove.length > 0) {
        console.log(`Cleaned up ${keysToRemove.length} localStorage entries`);
      }
    } catch (error) {
      console.warn('Failed to optimize localStorage:', error);
    }
  }

  // Monitor performance
  monitorPerformance(): void {
    if ('performance' in window && 'memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      if (memory) {
        const usedMemory = memory.usedJSHeapSize / 1024 / 1024;
        const totalMemory = memory.totalJSHeapSize / 1024 / 1024;
        
        console.log(`Memory usage: ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB`);
        
        // Trigger cleanup if memory usage is high
        if (usedMemory > totalMemory * 0.8) {
          this.cleanupMemory();
        }
      }
    }
  }

  // Reduce re-renders with memoization
  static memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Performance monitoring hook
export function usePerformanceMonitor() {
  useEffect(() => {
    const interval = setInterval(() => {
      performanceOptimizer.monitorPerformance();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);
}

// Debounced storage operations
export const debouncedSave = PerformanceOptimizer.debounce((key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}, 1000);

// Throttled timer updates
export const throttledTimerUpdate = PerformanceOptimizer.throttle((callback: () => void) => {
  callback();
}, 1000);
