import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { Mail, KeyRound } from 'lucide-react';

type AuthStep = 'email' | 'otp';

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setUser = useAuthStore((s) => s.setUser);

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (otpError) throw otpError;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Không gửi được mã đăng nhập');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (verifyError) throw verifyError;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
        });
      }
    } catch (err: any) {
      setError(err.message === 'Token has expired or is invalid' ? 'Mã OTP không đúng hoặc đã hết hạn' : err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--bg-base)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="size-16 mx-auto mb-4 rounded-2xl bg-[var(--accent-dim)] flex items-center justify-center border border-[var(--border-accent)]">
            <span className="text-3xl font-bold text-[var(--accent-primary)]">N</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">NghiemWork</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Quản lý công việc thông minh</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.2)]">
            <p className="text-xs text-[var(--error)]">{error}</p>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                placeholder="Email của bạn"
                className="w-full bg-[var(--bg-elevated)] rounded-xl pl-11 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] min-h-[48px]"
                autoComplete="email"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading || !email.trim()}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-40 active:opacity-80 min-h-[48px]"
            >
              {loading ? 'Đang gửi mã...' : 'Gửi mã đăng nhập'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)] text-center mb-2">
              Nhập mã 4 số đã gửi đến <span className="text-[var(--accent-primary)] font-medium">{email}</span>
            </p>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                placeholder="Mã OTP"
                className="w-full bg-[var(--bg-elevated)] rounded-xl pl-11 pr-4 py-3.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] min-h-[48px] text-center tracking-[0.5em] font-mono text-lg"
                maxLength={4}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 4}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-40 active:opacity-80 min-h-[48px]"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </button>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2 text-xs text-[var(--text-muted)]"
            >
              Gửi lại mã
            </button>
            <div className="text-center pt-1">
              <button
                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="text-xs text-[var(--text-muted)]"
              >
                Đổi email đăng nhập
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

