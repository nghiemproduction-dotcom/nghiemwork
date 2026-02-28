import { useState, useRef, useEffect, useCallback } from 'react';
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react';

// Generate cyberpunk ambient using Web Audio API
function createAmbientTrack(ctx: AudioContext): { start: () => void; stop: () => void } {
  const master = ctx.createGain();
  master.gain.value = 0.12;
  master.connect(ctx.destination);

  const nodes: OscillatorNode[] = [];

  const createDrone = (freq: number, type: OscillatorType, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(master);
    nodes.push(osc);
    return { osc, gain };
  };

  // Deep bass drone
  const bass = createDrone(55, 'sawtooth', 0.15);
  // Mid atmospheric pad
  const pad1 = createDrone(220, 'sine', 0.08);
  const pad2 = createDrone(330, 'sine', 0.05);
  // High shimmer
  const shimmer = createDrone(880, 'sine', 0.02);

  // LFO for movement
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.1;
  lfoGain.gain.value = 8;
  lfo.connect(lfoGain);
  lfoGain.connect(pad1.osc.frequency);
  nodes.push(lfo);

  // Filter sweep
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 2;
  bass.gain.disconnect();
  bass.gain.connect(filter);
  filter.connect(master);

  const filterLfo = ctx.createOscillator();
  const filterLfoGain = ctx.createGain();
  filterLfo.frequency.value = 0.05;
  filterLfoGain.gain.value = 200;
  filterLfo.connect(filterLfoGain);
  filterLfoGain.connect(filter.frequency);
  nodes.push(filterLfo);

  return {
    start: () => nodes.forEach(n => n.start()),
    stop: () => {
      master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch {} }), 1100);
    }
  };
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const trackRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const toggle = useCallback(() => {
    if (playing) {
      trackRef.current?.stop();
      trackRef.current = null;
      ctxRef.current?.close();
      ctxRef.current = null;
      setPlaying(false);
    } else {
      try {
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const track = createAmbientTrack(ctx);
        trackRef.current = track;
        track.start();
        setPlaying(true);
      } catch (e) {
        console.error('Music error:', e);
      }
    }
  }, [playing]);

  useEffect(() => {
    return () => {
      trackRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

  return (
    <button
      onClick={toggle}
      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        playing ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
      title={playing ? 'Tắt nhạc' : 'Bật nhạc nền'}
    >
      {playing ? (
        <>
          <Music className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </>
      ) : (
        <Music className="w-4 h-4" />
      )}
    </button>
  );
}
