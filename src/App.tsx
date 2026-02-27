import { useEffect, lazy, Suspense } from 'react';
import { useSettingsStore, useAuthStore, useTaskStore, useChatStore, useGamificationStore, useTemplateStore } from '@/stores';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { checkDeadlineNotifications } from '@/lib/notifications';
import { Toaster } from 'sonner';
import { BottomNav } from '@/components/layout/BottomNav';
import { TaskTimer } from '@/components/features/TaskTimer';
import TasksPage from '@/pages/TasksPage';
import AIPage from '@/pages/AIPage';
import SettingsPage from '@/pages/SettingsPage';
import AuthPage from '@/pages/AuthPage';
import TemplatesPage from '@/pages/TemplatesPage';

const StatsPage = lazy(() => import('@/pages/StatsPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));

export default function App() {
  const currentPage = useSettingsStore(s => s.currentPage);
  const fontScale = useSettingsStore(s => s.fontScale);
  const timezone = useSettingsStore(s => s.timezone);
  const notificationSettings = useSettingsStore(s => s.notificationSettings);
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  const setUser = useAuthStore(s => s.setUser);
  const setLoading = useAuthStore(s => s.setLoading);
  const initTasks = useTaskStore(s => s.initForUser);
  const initChat = useChatStore(s => s.initForUser);
  const initGamification = useGamificationStore(s => s.initForUser);
  const initTemplates = useTemplateStore(s => s.initForUser);
  const tasks = useTaskStore(s => s.tasks);
  const markOverdue = useTaskStore(s => s.markOverdue);

  // Initialize stores per user
  useEffect(() => {
    if (user) {
      initTasks(user.id);
      initChat(user.id);
      initGamification(user.id);
      initTemplates(user.id);
    }
  }, [user, initTasks, initChat, initGamification, initTemplates]);
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale));
  }, [fontScale]);

  // Preload voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Nếu thiếu cấu hình Supabase (VD: chưa set env trên Vercel), báo và dừng loading
  useEffect(() => {
    if (!isSupabaseConfigured) setLoading(false);
  }, [setLoading]);

  // Auth session (chỉ chạy khi đã cấu hình Supabase)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let mounted = true;
    
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted && session?.user) {
          const u = session.user;
          setUser({ id: u.id, email: u.email!, username: u.user_metadata?.username || u.email!.split('@')[0] });
        } else if (mounted) {
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        setUser({ id: u.id, email: u.email!, username: u.user_metadata?.username || u.email!.split('@')[0] });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        const u = session.user;
        setUser({ id: u.id, email: u.email!, username: u.user_metadata?.username || u.email!.split('@')[0] });
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [setLoading, setUser]);

  // Init stores per user
  useEffect(() => {
    if (user) {
      const userId = user.id;
      initTasks(userId);
      initChat(userId);
      initGamification(userId);
      initTemplates(userId);
    }
  }, [user, initTasks, initChat, initGamification, initTemplates]);

  // Mark overdue + notifications - simplified to prevent memory issues
  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const notifiedSet = new Set<string>();
    
    const check = () => {
      if (!isMounted) return;
      
      try {
        markOverdue();
        if (notificationSettings.enabled) {
          checkDeadlineNotifications(tasks, timezone, notificationSettings.beforeDeadline, notifiedSet);
        }
      } catch (error) {
        console.warn('Error in notification check:', error);
      }
    };
    
    // Initial check
    check();
    
    // Less frequent interval
    const interval = setInterval(check, 60000); // 1 minute instead of 30 seconds
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, tasks, markOverdue, timezone, notificationSettings.enabled, notificationSettings.beforeDeadline]);

  // Handle navigation events from template AI editor
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetPage = customEvent.detail;
      const validPages = ['tasks', 'stats', 'achievements', 'ai', 'settings', 'templates'] as const;
      if (targetPage && validPages.includes(targetPage as typeof validPages[number])) {
        useSettingsStore.getState().setCurrentPage(targetPage as typeof validPages[number]);
      }
    };
    window.addEventListener('navigate-to-page', handleNavigate);
    return () => window.removeEventListener('navigate-to-page', handleNavigate);
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-base)] p-6">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="size-14 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
            <span className="text-2xl">⚙️</span>
          </div>
          <h1 className="text-lg font-semibold text-[var(--text)]">Thiếu cấu hình</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Ứng dụng cần biến môi trường Supabase. Trong Vercel: Settings → Environment Variables, thêm <code className="bg-[var(--bg-elevated)] px-1 rounded">VITE_SUPABASE_URL</code> và <code className="bg-[var(--bg-elevated)] px-1 rounded">VITE_SUPABASE_ANON_KEY</code> (lấy từ Supabase Dashboard), rồi redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-2xl bg-[var(--accent-dim)] flex items-center justify-center border border-[var(--border-accent)] animate-pulse">
            <span className="text-xl font-bold text-[var(--accent-primary)]">N</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'tasks': return <TasksPage />;
      case 'stats': return <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-pulse text-[var(--text-muted)] text-sm">Đang tải...</div></div>}><StatsPage /></Suspense>;
      case 'achievements': return <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-pulse text-[var(--text-muted)] text-sm">Đang tải...</div></div>}><AchievementsPage /></Suspense>;
      case 'ai': return <AIPage />;
      case 'settings': return <SettingsPage />;
      case 'templates': return <TemplatesPage />;
      default: return <TasksPage />;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-lg mx-auto flex flex-col bg-[var(--bg-base)] overflow-x-hidden pb-[env(safe-area-inset-bottom)] landscape:max-w-none landscape:w-full landscape:px-4">
      <Toaster theme="dark" position="top-center" richColors closeButton />
      <TaskTimer />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[calc(4rem+env(safe-area-inset-bottom,0px))] landscape:w-full landscape:max-w-4xl landscape:mx-auto">{renderPage()}</main>
      <BottomNav />
    </div>
  );
}

