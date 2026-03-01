import { useState, useRef, useEffect, useCallback } from 'react';
import { useTaskStore, useSettingsStore } from '@/stores';
import { useTickSound } from '@/hooks/useTickSound';
import { useVietnameseVoice } from '@/hooks/useVietnameseVoice';
import { playChime, playCompletionSound, playBreakSound, getEncouragement } from '@/lib/soundEffects';
import { startTimerWorker, stopTimerWorker } from '@/lib/timerWorker';
import { Pause, Play, Square, Moon, Sun } from 'lucide-react';

// Helper to handle screen brightness with proper typing
interface ScreenAPI {
  brightness?: number;
  setBrightness?(brightness: number): Promise<void>;
}

// Helper to handle WakeLock API with proper typing
function requestWakeLock(): Promise<WakeLock | null> {
  try {
    if ('wakeLock' in navigator) {
      const nav = navigator as Navigator & { wakeLock: { request(type: string): Promise<unknown> } };
      return nav.wakeLock.request('screen').then((result): WakeLock | null => result as unknown as WakeLock);
    }
  } catch {
    return Promise.resolve(null);
  }
}

// Helper to release WakeLock safely
function releaseWakeLock(wakeLock: WakeLock | null): void {
  if (wakeLock) {
    try {
      const wl = wakeLock as WakeLock & { release(): Promise<void> };
      wl.release();
    } catch {
      // Ignore release errors
    }
  }
}

export function TaskTimer() {
  // ── Store selectors ──
  const timer = useTaskStore((s) => s.timer);
  const tasks = useTaskStore((s) => s.tasks);
  const tickTimer = useTaskStore((s) => s.tickTimer);
  const storeStopTimer = useTaskStore((s) => s.stopTimer);
  const pauseTimer = useTaskStore((s) => s.pauseTimer);
  const resumeTimer = useTaskStore((s) => s.resumeTimer);
  const tickSoundEnabled = useSettingsStore((s) => s.tickSoundEnabled);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const pomodoroSettings = useSettingsStore((s) => s.pomodoroSettings);

  // ── Hooks ──
  const { playTick } = useTickSound();
  const { speak, announceTime, announceCompletion } = useVietnameseVoice();

  // ── Local state ──
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [screenOff, setScreenOff] = useState(false);
  const wakeLockRef = useRef<WakeLock | null>(null);

  const currentTask = tasks.find((t) => t.id === timer.taskId);

  // ── Refs: keep latest values available inside the Worker tick callback
  //    without restarting the Worker on every settings change. ──
  const tickSoundRef = useRef(tickSoundEnabled);
  const voiceRef = useRef(voiceEnabled);
  const taskRef = useRef(currentTask);
  const pomodoroRef = useRef(pomodoroSettings);
  const lastAnnouncedRef = useRef(0);
  const lastEncourageRef = useRef(0);
  const encourageThresholdRef = useRef(120 + Math.floor(Math.random() * 60));
  const pomodoroTriggeredRef = useRef(false);

  useEffect(() => { tickSoundRef.current = tickSoundEnabled; }, [tickSoundEnabled]);
  useEffect(() => { voiceRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { taskRef.current = currentTask; }, [currentTask]);
  useEffect(() => { pomodoroRef.current = pomodoroSettings; }, [pomodoroSettings]);

  // ═══════════════════════════════════════════════════════════════════════
  //  MAIN TIMER — Web Worker ticks every 1 s even when the tab is hidden
  // ═══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!timer.isRunning || timer.isPaused) {
      stopTimerWorker();
      return;
    }

    // Reset tracking on a fresh timer start (elapsed is 0 and just started)
    if (timer.elapsed === 0 && timer.startTime) {
      lastAnnouncedRef.current = 0;
      lastEncourageRef.current = 0;
      encourageThresholdRef.current = 120 + Math.floor(Math.random() * 60);
      pomodoroTriggeredRef.current = false;
    }

    startTimerWorker(() => {
      // 1. Tick — recalculate elapsed from wall clock
      useTaskStore.getState().tickTimer();

      const currentTimer = useTaskStore.getState().timer;
      const elapsed = currentTimer.elapsed;

      // 2. Tick sound (only when tab visible)
      if (!document.hidden && tickSoundRef.current) {
        playTick();
      }

      // 3. Chime every 30 seconds
      if (elapsed > 0 && elapsed % 30 === 0 && elapsed !== lastAnnouncedRef.current) {
        lastAnnouncedRef.current = elapsed;
        if (!document.hidden) {
          playChime();
        }
        // Voice announcement
        if (voiceRef.current && !document.hidden) {
          setTimeout(() => announceTime(elapsed), 300);
        }
      }

      // 4. AI encouragement every 2–3 minutes
      if (!document.hidden && elapsed > 0) {
        const timeSinceLast = elapsed - lastEncourageRef.current;
        if (timeSinceLast >= encourageThresholdRef.current) {
          lastEncourageRef.current = elapsed;
          encourageThresholdRef.current = 120 + Math.floor(Math.random() * 60);
          const task = taskRef.current;
          if (voiceRef.current && task) {
            const msg = `Bạn đang làm "${task.title}". ${getEncouragement()}`;
            setTimeout(() => speak(msg), 500);
          }
        }
      }

      // 5. Pomodoro phase check
      const pomo = pomodoroRef.current;
      if (pomo.enabled && currentTimer.pomodoroPhase === 'work' && !pomodoroTriggeredRef.current) {
        const workSeconds = pomo.workMinutes * 60;
        if (elapsed >= workSeconds) {
          pomodoroTriggeredRef.current = true;
          const isLongBreak = currentTimer.pomodoroSession % pomo.sessionsBeforeLongBreak === 0;
          playBreakSound();
          if (voiceRef.current) {
            speak(isLongBreak ? 'Nghỉ dài nhé! Bạn đã làm rất tốt!' : 'Nghỉ ngắn thôi, sắp tiếp tục!');
          }
        }
      }
    });

    return () => stopTimerWorker();
  }, [timer.isRunning, timer.isPaused, timer.startTime, timer.elapsed, tickTimer, playTick, announceTime, speak]);

  // ═══════════════════════════════════════════════════════════════
  //  WAKE LOCK — prevent the screen from sleeping while timing
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!timer.isRunning && !timer.isPaused) return;

    let wakeLock: WakeLock | null = null;

    const requestWakeLockHandler = async () => {
      try {
        wakeLock = await requestWakeLock();
      } catch {
        // Not supported or permission denied — ignore
      }
    };

    requestWakeLock();

    // Wake Lock is released when the tab goes hidden.
    // Re-acquire it when the tab becomes visible again.
    const handleVisibility = () => {
      if (!document.hidden) {
        const t = useTaskStore.getState().timer;
        if (t.isRunning || t.isPaused) {
          requestWakeLock();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      releaseWakeLock(wakeLock);
    };
  }, [timer.isRunning, timer.isPaused]);

  // ── Handlers ──
  // STOP: Just stop timer, save accumulated duration to task, but DON'T complete
  const handleStop = useCallback(() => {
    if (!currentTask) return;
    
    // Stop the timer worker
    stopTimerWorker();
    
    // Save accumulated duration to the task (for resume later)
    // This is different from complete - task remains pending
    const storeTimer = useTaskStore.getState().timer;
    if (storeTimer.elapsed > 0) {
      // Update task with accumulated duration but don't mark as done
      useTaskStore.getState().updateTask(currentTask.id, {
        duration: (currentTask.duration || 0) + storeTimer.elapsed
      });
    }
    
    // Stop timer in store
    storeStopTimer();
  }, [currentTask, storeStopTimer]);

  // No complete button in timer - user must complete from task list manually
  // This prevents accidental completion when just taking a break

  const handlePauseResume = useCallback(() => {
    if (timer.isPaused) resumeTimer();
    else pauseTimer();
  }, [timer.isPaused, pauseTimer, resumeTimer]);

  const toggleScreenOff = useCallback(async () => {
    if (screenOff) {
      // Turn screen back on
      setScreenOff(false);
      // Release wake lock
      releaseWakeLock(wakeLockRef.current);
      wakeLockRef.current = null;
      // Remove screen off overlay
      const overlay = document.getElementById('screen-off-overlay');
      if (overlay) {
        overlay.remove();
      }
      // Wake up screen using WakeLock API
      try {
        if ('wakeLock' in navigator) {
          const nav = navigator as Navigator & { wakeLock: { request(type: string): Promise<unknown> } };
          await nav.wakeLock.request('screen');
          // Immediately release to just wake up screen
          setTimeout(() => {
            const lock = wakeLockRef.current;
            if (lock) {
              releaseWakeLock(lock);
            }
          }, 100);
        }
      } catch {
        // Fallback: just remove overlay
      }
    } else {
      // Turn screen off completely
      setScreenOff(true);
      // Request wake lock to keep timer running
      wakeLockRef.current = await requestWakeLock();
      
      // Create full screen black overlay
      const overlay = document.createElement('div');
      overlay.id = 'screen-off-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: black;
        z-index: 99999;
        pointer-events: auto;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      `;
      
      // Add click to wake up functionality
      overlay.addEventListener('click', () => {
        setScreenOff(false);
        overlay.remove();
        releaseWakeLock(wakeLockRef.current);
        wakeLockRef.current = null;
      });
      
      document.body.appendChild(overlay);
      
      // Try to use Screen Wake Lock API to keep app running
      try {
        if ('wakeLock' in navigator) {
          const nav = navigator as Navigator & { wakeLock: { request(type: string): Promise<unknown> } };
          await nav.wakeLock.request('screen');
        }
      } catch {
        // WakeLock not supported, but timer should still run with Web Worker
      }
    }
  }, [screenOff]);

  // Clean up screen off overlay on unmount
  useEffect(() => {
    return () => {
      const overlay = document.getElementById('screen-off-overlay');
      if (overlay) {
        overlay.remove();
      }
      releaseWakeLock(wakeLockRef.current);
    };
  }, []);

  // ── Formatting ──
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPomodoroLabel = () => {
    if (!pomodoroSettings.enabled || timer.pomodoroPhase === 'none') return null;
    const phase =
      timer.pomodoroPhase === 'work'
        ? 'Làm việc'
        : timer.pomodoroPhase === 'break'
          ? 'Nghỉ ngắn'
          : 'Nghỉ dài';
    return `🍅 ${phase} #${timer.pomodoroSession}`;
  };

  // ── Render ──
  if ((!timer.isRunning && !timer.isPaused) || !currentTask) return null;

  const pomodoroLabel = getPomodoroLabel();

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[80] glass-strong border-b ${
        timer.isPaused ? 'border-[var(--warning)]' : 'border-[var(--border-accent)]'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p
              className={`text-xs font-medium truncate ${
                timer.isPaused ? 'text-[var(--warning)]' : 'text-[var(--accent-primary)]'
              }`}
            >
              {timer.isPaused ? 'Tạm dừng' : 'Đang đếm giờ'}
            </p>
            {pomodoroLabel && (
              <span className="text-[10px] text-[var(--warning)] font-medium">
                {pomodoroLabel}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {currentTask.title}
          </p>
        </div>
        <div
          className={`font-mono text-xl font-bold tabular-nums ${
            timer.isPaused
              ? 'text-[var(--warning)]'
              : 'text-[var(--accent-primary)] animate-timer-pulse'
          }`}
        >
          {formatTime(timer.elapsed)}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePauseResume}
            className={`size-10 rounded-xl flex items-center justify-center active:opacity-70 ${
              timer.isPaused
                ? 'bg-[rgba(0,229,204,0.2)] text-[var(--accent-primary)]'
                : 'bg-[rgba(251,191,36,0.2)] text-[var(--warning)]'
            }`}
            aria-label={timer.isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {timer.isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          
          {/* Screen Off button */}
          <button
            onClick={toggleScreenOff}
            className={`size-10 rounded-xl flex items-center justify-center active:opacity-70 ${
              screenOff
                ? 'bg-[rgba(255,255,255,0.2)] text-white'
                : 'bg-[rgba(0,0,0,0.2)] text-[var(--text-primary)]'
            }`}
            aria-label={screenOff ? 'Bật màn hình' : 'Tắt màn hình'}
            title={screenOff ? 'Bật màn hình' : 'Tắt màn hình - Timer vẫn chạy'}
          >
            {screenOff ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {/* STOP button - only stops timer, does NOT complete task */}
          {showStopConfirm ? (
            <button
              onClick={handleStop}
              className="px-3 h-10 rounded-xl bg-[rgba(248,113,113,0.3)] flex items-center justify-center text-[var(--error)] active:opacity-70 text-xs font-semibold animate-pulse"
            >
              Xác nhận dừng?
            </button>
          ) : (
            <button
              onClick={() => timer.elapsed > 30 ? setShowStopConfirm(true) : handleStop()}
              className="size-10 rounded-xl bg-[rgba(248,113,113,0.2)] flex items-center justify-center text-[var(--error)] active:opacity-70 transition-all hover:bg-[rgba(248,113,113,0.3)]"
              aria-label="Dừng - Lưu thời gian nhưng chưa hoàn thành"
              title="Dừng để nghỉ - Việc chưa hoàn thành"
            >
              <Square size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
