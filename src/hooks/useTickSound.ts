import { useCallback, useRef } from 'react';

export function useTickSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playTick = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;

      // AudioContext gets suspended when the tab goes to background.
      // Resume it so sounds play again when the tab is active.
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);

      // Disconnect nodes after playback to prevent memory leaks.
      // Without this, thousands of orphan AudioNodes accumulate over hours.
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch {
          // Already disconnected
        }
      };
    } catch {
      // Ignore audio errors (e.g. AudioContext not allowed)
    }
  }, []);

  return { playTick };
}
