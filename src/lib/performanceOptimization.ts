// Performance optimization utilities

import { useEffect, useCallback } from 'react';

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

  // Memory cleanup - simplified to prevent memory issues
  cleanupMemory(): void {
    const now = Date.now();
    if (now - this.lastCleanup < this.CLEANUP_INTERVAL) {
      return;
    }

    console.log('Performing memory cleanup...');
    
    // Only optimize localStorage, skip aggressive cleanup
    this.optimizeLocalStorage();

    this.lastCleanup = now;
  }

  private optimizeLocalStorage(): void {
    try {
      const keysToRemove: string[] = [];
      const maxKeys = 50; // Limit to prevent blocking
      
      for (let i = 0; i < localStorage.length && keysToRemove.length < maxKeys; i++) {
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
      
      // Remove keys one by one to prevent blocking
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

  // Monitor performance - simplified
  monitorPerformance(): void {
    if ('performance' in window && 'memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      if (memory) {
        const usedMemory = memory.usedJSHeapSize / 1024 / 1024;
        const totalMemory = memory.totalJSHeapSize / 1024 / 1024;
        
        // Only log if memory usage is high
        if (usedMemory > totalMemory * 0.8) {
          console.log(`High memory usage: ${usedMemory.toFixed(2)}MB / ${totalMemory.toFixed(2)}MB`);
          this.cleanupMemory();
        }
      }
    }
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Performance monitoring hook - simplified
export function usePerformanceMonitor() {
  useEffect(() => {
    const interval = setInterval(() => {
      performanceOptimizer.monitorPerformance();
    }, 60000); // Check every minute instead of 30 seconds

    return () => clearInterval(interval);
  }, []);
}

// Debounced storage operations - simplified
export const debouncedSave = PerformanceOptimizer.debounce((key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}, 2000); // Increased debounce time

// Throttled timer updates - simplified
export const throttledTimerUpdate = PerformanceOptimizer.throttle((callback: () => void) => {
  callback();
}, 2000); // Increased throttle time
