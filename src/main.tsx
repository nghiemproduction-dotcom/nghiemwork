import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-[#0f0f0f] text-[#e0e0e0] p-6">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="size-14 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/40">!</div>
            <h1 className="text-lg font-semibold">Đã xảy ra lỗi</h1>
            <p className="text-sm text-[#999] break-all">{this.state.error.message}</p>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-[#333] hover:bg-[#444]"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Thử lại
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register service worker for PWA install
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
