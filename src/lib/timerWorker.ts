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
let lastTick = Date.now();
let isRunning = false;

function tick() {
  lastTick = Date.now();
  self.postMessage({ type: 'tick', timestamp: lastTick });
}

// Keep worker alive even when page is hidden
function keepAlive() {
  if (isRunning) {
    // Send heartbeat every 30 seconds to prevent worker suspension
    self.postMessage({ type: 'heartbeat', timestamp: Date.now() });
  }
}

self.onmessage = function (e) {
  if (e.data === 'start') {
    if (id !== null) clearInterval(id);
    isRunning = true;
    // Use simple 1000ms interval - most reliable approach
    id = setInterval(tick, 1000);
    // Start heartbeat interval
    setInterval(keepAlive, 30000);
    // Immediate first tick
    tick();
  } else if (e.data === 'stop') {
    if (id !== null) { clearInterval(id); id = null; }
    isRunning = false;
  } else if (e.data === 'ping') {
    // Respond to ping to check if worker is still alive
    self.postMessage({ type: 'pong', timestamp: Date.now() });
  }
};

// Prevent worker from being suspended
self.addEventListener('online', () => {
  if (isRunning) {
    tick(); // Sync time when coming back online
  }
});
`;

function ensureWorker(): boolean {
  if (workerSupported === false) return false;
  if (worker) return true;

  try {
    const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    worker = new Worker(url);
    URL.revokeObjectURL(url);

    worker.onmessage = (e) => {
      if (e.data.type === 'tick' || e.data.type === 'heartbeat') {
        if (currentCallback) currentCallback();
      } else if (e.data.type === 'pong') {
        // Worker is alive, no action needed
      }
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

/** Start ticking – calls `onTick` every 1s via Worker (or setInterval fallback). */
export function startTimerWorker(onTick: TickCallback): void {
  currentCallback = onTick;

  if (ensureWorker() && worker) {
    worker.onmessage = (e) => {
      if (e.data.type === 'tick' || e.data.type === 'heartbeat') {
        if (currentCallback) currentCallback();
      } else if (e.data.type === 'pong') {
        // Worker is alive, no action needed
      }
    };
    worker.postMessage('start');
    // Immediate first tick for responsiveness
    onTick();
  } else {
    // Fallback with setInterval
    if (fallbackInterval !== null) clearInterval(fallbackInterval);
    // Immediate first tick
    onTick();
    fallbackInterval = setInterval(() => {
      if (currentCallback) currentCallback();
    }, 1000);
  }
}

/** Stop ticking (does not terminate the Worker so it can be restarted cheaply). */
export function stopTimerWorker(): void {
  if (worker) worker.postMessage('stop');
  if (fallbackInterval !== null) {
    clearInterval(fallbackInterval);
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
