import { ReactNode } from 'react';
import { CalendarDays, Dumbbell, UtensilsCrossed, BarChart3, Settings, LogOut, Zap } from 'lucide-react';
import { UserProfile } from '@/types';
import MusicPlayer from '@/components/MusicPlayer';
import FloatingAI from '@/components/FloatingAI';

interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
}

const tabs: Tab[] = [
  { id: 'today', label: 'Hôm Nay', icon: <CalendarDays className="w-5 h-5" /> },
  { id: 'exercises', label: 'Bài Tập', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'meals', label: 'Thực Đơn', icon: <UtensilsCrossed className="w-5 h-5" /> },
  { id: 'overview', label: 'Tổng Quan', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'settings', label: 'Cài Đặt', icon: <Settings className="w-5 h-5" /> },
];

interface CyberLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  user: UserProfile;
  children: ReactNode;
}

export default function CyberLayout({ activeTab, onTabChange, onLogout, user, children }: CyberLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" style={{ filter: 'drop-shadow(0 0 6px hsl(185 100% 50% / 0.5))' }} />
          <span className="text-primary font-bold text-sm tracking-wider">CYBERFIT</span>
        </div>
        <div className="flex items-center gap-2">
          <MusicPlayer />
          <span className="text-xs text-muted-foreground">{user.name}</span>
          <button onClick={onLogout} className="text-muted-foreground hover:text-secondary transition-colors" title="Đăng xuất">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Floating AI Assistant */}
      <FloatingAI />

      {/* Bottom Navigation */}
      <nav className="flex items-center border-t border-border bg-card/80 backdrop-blur-sm safe-area-bottom">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 gap-0.5 transition-all duration-200 ${
                isActive ? 'cyber-tab-active' : 'text-muted-foreground'
              }`}
            >
              <div className={isActive ? 'scale-110 transition-transform' : 'transition-transform'}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="w-6 h-0.5 rounded-full bg-primary mt-0.5"
                  style={{ boxShadow: '0 0 8px hsl(185 100% 50% / 0.6)' }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
