import { useSettingsStore, useTaskStore } from '@/stores';
import { CheckSquare, BarChart3, Sparkles, Settings, Trophy, FileText, DollarSign, CalendarDays } from 'lucide-react';
import type { PageType } from '@/types';

const NAV_ITEMS: { page: PageType; icon: typeof CheckSquare; label: string }[] = [
  { page: 'tasks', icon: CheckSquare, label: 'Việc' },
  { page: 'templates', icon: FileText, label: 'Mẫu' },
  { page: 'stats', icon: BarChart3, label: 'Thống kê' },
  { page: 'ai', icon: Sparkles, label: 'Lucy' },
  { page: 'achievements', icon: Trophy, label: 'Thành tích' },
  { page: 'settings', icon: Settings, label: 'Cài đặt' },
];

export function BottomNav() {
  const currentPage = useSettingsStore(s => s.currentPage);
  const setCurrentPage = useSettingsStore(s => s.setCurrentPage);
  const fontScale = useSettingsStore(s => s.fontScale);
  const overdueCount = useTaskStore(s => s.tasks.filter(t => t.status === 'overdue').length);

  // Calculate scaled sizes based on font scale
  const iconSize = Math.max(20, Math.round(20 * fontScale));
  const minHeight = Math.max(60, Math.round(60 * fontScale));
  const fontSize = Math.max(10, Math.round(10 * fontScale));
  const badgeSize = Math.max(18, Math.round(16 * fontScale));
  const badgeFontSize = Math.max(9, Math.round(8 * fontScale));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex items-center w-full">
        {NAV_ITEMS.map(({ page, icon: Icon, label }) => {
          const isActive = currentPage === page;
          return (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`flex-1 flex flex-col items-center justify-center gap-1.5 relative transition-colors ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'
              }`} 
              style={{ minHeight: `${minHeight}px`, paddingTop: '8px', paddingBottom: '8px' }}
              aria-label={label}>
              <div className="relative">
                <Icon size={iconSize} />
                {page === 'tasks' && overdueCount > 0 && (
                  <div className="absolute -top-1.5 -right-2 rounded-full bg-[var(--error)] flex items-center justify-center"
                    style={{ width: `${badgeSize}px`, height: `${badgeSize}px` }}>
                    <span className="font-bold text-white" style={{ fontSize: `${badgeFontSize}px` }}>
                      {overdueCount > 9 ? '9+' : overdueCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="font-medium leading-tight" style={{ fontSize: `${fontSize}px` }}>{label}</span>
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[var(--accent-primary)]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
