/**
 * Inline Web Worker for accurate background timer ticking.
 *
 * Browsers throttle main-thread setInterval to ≤1/min (or stop it entirely)
 * when a tab is hidden.  Web Workers are NOT subject to the same throttling,
 * so we run a 1-second interval inside a Worker to keep the timer alive
 * even when the user switches apps or locks the screen.
 *
 * Falls back to setInterval when Workers are unavailable.
 */

type TickCallback = () => void;

let worker: Worker | null = null;
let fallbackInterval: ReturnType<typeof setInterval> | null = null;
let currentCallback: TickCallback | null = null;
let workerSupported: boolean | null = null;

const WORKER_CODE = `
let id = null;
let lastTick = 0;

function scheduleNextTick() {
  const now = Date.now();
  const nextSecond = Math.ceil(now / 1000) * 1000;
  const delay = Math.max(0, nextSecond - now);
  
  id = setTimeout(function() {
    self.postMessage(1);
    lastTick = Date.now();
    // Schedule next tick to align with wall clock seconds
    scheduleNextTick();
  }, delay);
}

self.onmessage = function (e) {
  if (e.data === 'start') {
    if (id !== null) clearTimeout(id);
    lastTick = Date.now();
    scheduleNextTick();
  } else if (e.data === 'stop') {
    if (id !== null) { clearTimeout(id); id = null; }
  }
};
`;

function ensureWorker(): boolean {
  if (workerSupported === false) return false;
  if (worker) return true;

  try {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    worker = new Worker(url);
    URL.revokeObjectURL(url);

    worker.onmessage = () => {
      if (currentCallback) currentCallback();
    };
    worker.onerror = () => {
      workerSupported = false;
    };

    workerSupported = true;
    return true;
  } catch {
    workerSupported = false;
    return false;
  }
}

/** Start ticking – calls `onTick` every ~1 s via Worker (or precise fallback). */
export function startTimerWorker(onTick: TickCallback): void {
  currentCallback = onTick;

  if (ensureWorker() && worker) {
    worker.onmessage = () => {
      if (currentCallback) currentCallback();
    };
    worker.postMessage('start');
  } else {
    // Fallback with precise timing
    if (fallbackInterval !== null) clearTimeout(fallbackInterval);
    
    const scheduleNext = () => {
      const now = Date.now();
      const nextSecond = Math.ceil(now / 1000) * 1000;
      const delay = Math.max(0, nextSecond - now);
      
      fallbackInterval = setTimeout(() => {
        if (currentCallback) currentCallback();
        scheduleNext();
      }, delay);
    };
    
    scheduleNext();
  }
}

/** Stop ticking (does not terminate the Worker so it can be restarted cheaply). */
export function stopTimerWorker(): void {
  if (worker) worker.postMessage('stop');
  if (fallbackInterval !== null) {
    clearTimeout(fallbackInterval);
    fallbackInterval = null;
  }
  currentCallback = null;
}

/** Terminate the Worker completely (call on unmount). */
export function destroyTimerWorker(): void {
  stopTimerWorker();
  if (worker) {
    worker.terminate();
    worker = null;
  }
}
