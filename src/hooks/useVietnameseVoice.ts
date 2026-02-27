import { useCallback, useRef } from 'react';

/**
 * Safety timeout: cancel any speech that takes longer than this.
 * On some platforms (Android Chrome) speechSynthesis.speak() can hang
 * the main thread indefinitely — this prevents that freeze.
 */
const SPEECH_TIMEOUT_MS = 10_000;

/**
 * Minimum gap between consecutive speak() calls.
 * Calling cancel() + speak() in quick succession triggers a race-condition
 * in Chromium that can freeze the UI.  A short delay avoids this.
 */
const CANCEL_DELAY_MS = 80;

export function useVietnameseVoice() {
  const isSpeakingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    // Cancel any previous speech safely
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel errors
    }

    // Clear pending timers
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (delayRef.current) { clearTimeout(delayRef.current); delayRef.current = null; }

    // Small delay after cancel() to let Chromium settle
    delayRef.current = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.1;
        utterance.pitch = 1.2;

        const voices = window.speechSynthesis.getVoices();
        const viVoice =
          voices.find(v => v.lang.startsWith('vi') && v.name.toLowerCase().includes('female')) ||
          voices.find(v => v.lang.startsWith('vi')) ||
          voices.find(v => v.lang.startsWith('vi-VN'));

        if (viVoice) utterance.voice = viVoice;

        isSpeakingRef.current = true;

        const cleanup = () => {
          isSpeakingRef.current = false;
          if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
        };

        utterance.onend = cleanup;
        utterance.onerror = cleanup;

        window.speechSynthesis.speak(utterance);

        // Safety timeout — force-cancel if speech hangs
        timeoutRef.current = setTimeout(() => {
          if (isSpeakingRef.current) {
            try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
            isSpeakingRef.current = false;
          }
        }, SPEECH_TIMEOUT_MS);
      } catch {
        isSpeakingRef.current = false;
      }
    }, CANCEL_DELAY_MS);
  }, []);

  const announceTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    let text = '';
    if (mins === 0) {
      text = `${secs} giây`;
    } else if (secs === 0) {
      text = `${mins} phút`;
    } else {
      text = `${mins} phút ${secs} giây`;
    }
    speak(text);
  }, [speak]);

  const announceCompletion = useCallback((taskTitle: string, seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    let timeText = '';
    if (mins === 0) {
      timeText = `${secs} giây`;
    } else if (secs === 0) {
      timeText = `${mins} phút`;
    } else {
      timeText = `${mins} phút ${secs} giây`;
    }
    speak(`Tuyệt vời! Đã hoàn thành ${taskTitle} trong ${timeText}`);
  }, [speak]);

  return { speak, announceTime, announceCompletion };
}
