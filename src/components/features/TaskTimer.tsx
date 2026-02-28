import { useState, useRef, useEffect, useCallback } from 'react';
import { useTaskStore, useSettingsStore } from '@/stores';
import { useTickSound } from '@/hooks/useTickSound';
import { useVietnameseVoice } from '@/hooks/useVietnameseVoice';
import { playChime, playCompletionSound, playBreakSound, getEncouragement } from '@/lib/soundEffects';
import { startTimerWorker, stopTimerWorker } from '@/lib/timerWorker';
import { Pause, Play, Square, CheckCircle2 } from 'lucide-react';

// Helper to handle WakeLock API with proper typing
function requestWakeLock(): Promise<WakeLock | null> {
  try {
    if ('wakeLock' in navigator) {
      return (navigator as any).wakeLock.request('screen');
    }
  } catch {
    return Promise.resolve(null);
  }
}

// Helper to release WakeLock safely
function releaseWakeLock(wakeLock: WakeLock | null): void {
  if (wakeLock) {
    try {
      (wakeLock as any).release();
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
  const completeTask = useTaskStore((s) => s.completeTask);
  const tickSoundEnabled = useSettingsStore((s) => s.tickSoundEnabled);
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled);
  const pomodoroSettings = useSettingsStore((s) => s.pomodoroSettings);

  // ── Hooks ──
  const { playTick } = useTickSound();
  const { speak, announceTime, announceCompletion } = useVietnameseVoice();

  // ── Local state ──
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionInfo, setCompletionInfo] = useState({ title: '', duration: 0 });
  const [showConfirmStop, setShowConfirmStop] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

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
  }, [timer.isRunning, timer.isPaused, tickTimer, playTick, announceTime, speak]);

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
  // Smart complete: double click or long press to complete
  const handleCompleteClick = useCallback(() => {
    if (!currentTask) return;
    // Just stop timer - require manual task completion from list
    stopTimerWorker();
    storeStopTimer();
  }, [currentTask, storeStopTimer]);

  // Long press handlers for complete
  const handleMouseDown = useCallback(() => {
    setIsLongPressing(true);
    const timeoutId = setTimeout(() => {
      const storeTimer = useTaskStore.getState().timer;
      if (currentTask && storeTimer.elapsed > 0) {
        setCompletionInfo({ title: currentTask.title, duration: storeTimer.elapsed });
        stopTimerWorker();
        completeTask(currentTask.id, storeTimer.elapsed);
        playCompletionSound();
        if (voiceEnabled) {
          setTimeout(() => announceCompletion(currentTask.title, storeTimer.elapsed), 300);
        }
        setShowCompletion(true);
        setTimeout(() => setShowCompletion(false), 4000);
      }
      setIsLongPressing(false);
    }, 1500); // 1.5 seconds long press
    setLongPressTimer(timeoutId);
  }, [currentTask, completeTask, voiceEnabled, announceCompletion]);

  const handleMouseUp = useCallback(() => {
    setIsLongPressing(false);
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleTouchStart = handleMouseDown;
  const handleTouchEnd = handleMouseUp;

  const handleStop = useCallback(() => {
    if (timer.elapsed > 30) {
      // Show confirmation for stopping after 30 seconds
      setShowConfirmStop(true);
      setTimeout(() => setShowConfirmStop(false), 3000);
    } else {
      // Stop immediately if less than 30 seconds
      stopTimerWorker();
      storeStopTimer();
    }
  }, [timer.elapsed, storeStopTimer]);

  const confirmStop = useCallback(() => {
    stopTimerWorker();
    storeStopTimer();
    setShowConfirmStop(false);
  }, [storeStopTimer]);

  const handlePauseResume = useCallback(() => {
    if (timer.isPaused) resumeTimer();
    else pauseTimer();
  }, [timer.isPaused, pauseTimer, resumeTimer]);

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
  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-6 bg-black/80">
        <div className="w-full max-w-sm glass-strong rounded-2xl p-6 text-center animate-slide-up">
          <div className="size-16 mx-auto mb-4 rounded-full bg-[rgba(52,211,153,0.2)] flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[var(--success)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Hoàn thành!</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-2">{completionInfo.title}</p>
          <p className="text-2xl font-mono font-bold text-[var(--accent-primary)] tabular-nums">
            {formatTime(completionInfo.duration)}
          </p>
        </div>
      </div>
    );
  }

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
          {showConfirmStop ? (
            <button
              onClick={confirmStop}
              className="px-3 h-10 rounded-xl bg-[rgba(248,113,113,0.3)] flex items-center justify-center text-[var(--error)] active:opacity-70 text-xs font-semibold animate-pulse"
            >
              Xác nhận dừng?
            </button>
          ) : (
            <button
              onClick={handleStop}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className={`size-10 rounded-xl flex items-center justify-center active:opacity-70 transition-all ${
                isLongPressing 
                  ? 'bg-[rgba(52,211,153,0.4)] text-[var(--success)] scale-95' 
                  : 'bg-[rgba(248,113,113,0.2)] text-[var(--error)]'
              }`}
              aria-label={isLongPressing ? 'Đang giữ để hoàn thành...' : 'Giữ 1.5s để hoàn thành, bấm để dừng'}
            >
              {isLongPressing ? <CheckCircle2 size={20} /> : <Square size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
