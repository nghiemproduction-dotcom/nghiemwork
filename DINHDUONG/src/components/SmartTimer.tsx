import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';
import { Exercise } from '@/types';

interface SmartTimerProps {
  exercise: Exercise;
  onComplete: () => void;
  onClose: () => void;
}

export default function SmartTimer({ exercise, onComplete, onClose }: SmartTimerProps) {
  const totalSeconds = exercise.duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [voiceInterval, setVoiceInterval] = useState(60); // seconds
  const tickRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastVoiceRef = useRef(totalSeconds);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;

  // Tick sound using Web Audio API
  const playTick = useCallback(() => {
    if (!soundOn) return;
    try {
      if (!tickRef.current) tickRef.current = new AudioContext();
      const ctx = tickRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }, [soundOn]);

  // Completion sound
  const playComplete = useCallback(() => {
    try {
      if (!tickRef.current) tickRef.current = new AudioContext();
      const ctx = tickRef.current;
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.4);
        osc.start(ctx.currentTime + i * 0.2);
        osc.stop(ctx.currentTime + i * 0.2 + 0.4);
      });
    } catch {}
  }, []);

  // TTS voice countdown
  const speakTime = useCallback((secs: number) => {
    if (!voiceOn || !('speechSynthesis' in window)) return;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    let text = '';
    if (secs <= 0) {
      text = 'Hoàn thành! Tuyệt vời!';
    } else if (secs <= 10) {
      text = `${secs}`;
    } else if (m > 0 && s === 0) {
      text = `Còn ${m} phút`;
    } else if (m > 0) {
      text = `Còn ${m} phút ${s} giây`;
    } else {
      text = `Còn ${s} giây`;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'vi-VN';
    utter.rate = 1.1;
    utter.pitch = 1.2;
    // Try to pick a female voice
    const voices = speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.startsWith('vi') && v.name.toLowerCase().includes('female')) ||
                    voices.find(v => v.lang.startsWith('vi')) ||
                    voices[0];
    if (viVoice) utter.voice = viVoice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }, [voiceOn]);

  // Timer logic
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setRunning(false);
          playComplete();
          speakTime(0);
          setTimeout(() => onComplete(), 1500);
          return 0;
        }
        // Tick every second
        playTick();
        // Voice at intervals
        if (next <= 10 || (lastVoiceRef.current - next >= voiceInterval)) {
          speakTime(next);
          lastVoiceRef.current = next;
        }
        return next;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, playTick, playComplete, speakTime, voiceInterval, onComplete]);

  // Cleanup audio context
  useEffect(() => {
    return () => { tickRef.current?.close(); speechSynthesis.cancel(); };
  }, []);

  const reset = () => {
    setRunning(false);
    setRemaining(totalSeconds);
    lastVoiceRef.current = totalSeconds;
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-sm font-bold text-primary truncate flex-1 text-center px-2">{exercise.name}</h2>
        <div className="flex gap-1">
          <button onClick={() => setSoundOn(!soundOn)} className={`p-1.5 rounded ${soundOn ? 'text-primary' : 'text-muted-foreground'}`}>
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* YouTube Video */}
      <div className="aspect-video w-full bg-muted">
        <iframe
          src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=0&rel=0`}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Circular Progress */}
        <div className="relative w-48 h-48 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(225 18% 16%)" strokeWidth="6" />
            <circle cx="100" cy="100" r="90" fill="none"
              stroke={remaining <= 10 ? 'hsl(340 100% 57%)' : 'hsl(185 100% 50%)'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
              style={{ filter: `drop-shadow(0 0 8px ${remaining <= 10 ? 'hsl(340 100% 57% / 0.5)' : 'hsl(185 100% 50% / 0.5)'})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-black tracking-wider ${remaining <= 10 ? 'text-secondary glow-pink' : 'text-primary glow-cyan'}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground mt-1">{exercise.duration} phút • {exercise.caloriesBurned} kcal</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button onClick={reset} className="cyber-btn-outline px-4 py-2 rounded-full">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={() => {
            if (!running && tickRef.current?.state === 'suspended') tickRef.current.resume();
            setRunning(!running);
          }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
              running ? 'cyber-btn-pink' : 'cyber-btn'
            }`}
            style={{ boxShadow: running ? '0 0 30px hsl(340 100% 57% / 0.5)' : '0 0 30px hsl(185 100% 50% / 0.5)' }}>
            {running ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
          <button onClick={() => setVoiceOn(!voiceOn)}
            className={`px-3 py-2 rounded-full text-xs font-semibold ${voiceOn ? 'cyber-btn' : 'cyber-btn-outline'}`}>
            🎤 {voiceOn ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Voice interval selector */}
        {voiceOn && (
          <div className="flex gap-2 mt-3">
            {[30, 60, 180].map(s => (
              <button key={s} onClick={() => setVoiceInterval(s)}
                className={`px-2 py-1 rounded text-[10px] font-semibold ${voiceInterval === s ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                {s < 60 ? `${s}s` : `${s / 60}p`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="px-4 pb-4 max-h-32 overflow-y-auto">
        <ol className="text-xs text-muted-foreground space-y-0.5">
          {exercise.steps.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary font-bold">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
