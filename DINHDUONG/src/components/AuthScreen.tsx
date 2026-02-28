import { useState } from 'react';
import { Lock, Zap } from 'lucide-react';
import cyberBg from '@/assets/cyber-bg.jpg';

interface AuthScreenProps {
  onLogin: (passcode: string) => boolean;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(passcode);
    if (!success) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={cyberBg} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(hsl(185 100% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(185 100% 50% / 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Login Card */}
      <div className={`relative z-10 w-full max-w-sm mx-4 animate-slide-up ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-primary" style={{ filter: 'drop-shadow(0 0 8px hsl(185 100% 50% / 0.6))' }} />
            <h1 className="text-4xl font-black tracking-wider text-primary glow-cyan">
              CYBERFIT
            </h1>
          </div>
          <p className="text-muted-foreground text-sm tracking-widest uppercase">
            Theo Dõi Dinh Dưỡng & Thể Chất
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="cyber-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-foreground font-semibold">Đăng nhập</h2>
              <p className="text-muted-foreground text-xs">Nhập mã truy cập của bạn</p>
            </div>
          </div>

          <input
            type="password"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            placeholder="Nhập passcode..."
            className="cyber-input text-center text-lg tracking-widest"
            autoFocus
          />

          {error && (
            <p className="text-secondary text-xs text-center glow-pink">
              ⚠ Mã truy cập không đúng
            </p>
          )}

          <button type="submit" className="cyber-btn w-full py-3 text-base">
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              TRUY CẬP HỆ THỐNG
            </span>
          </button>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-4 opacity-50">
          v1.0 • CyberFit PWA
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
