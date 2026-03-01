import { useTaskStore, useSettingsStore } from '@/stores';
import { TaskList } from '@/components/features/TaskList';
import { AddTaskInput } from '@/components/features/AddTaskInput';
import { CalendarDays, Clock, Heart, Activity, Bot, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import type {} from '@/types';
import { getNowInTimezone } from '@/lib/notifications';

export default function TasksPage() {
  const timer = useTaskStore((s) => s.timer);
  const tasks = useTaskStore(s => s.tasks);
  const setCurrentPage = useSettingsStore(s => s.setCurrentPage);
  const timezone = useSettingsStore((s) => s.timezone);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const now = getNowInTimezone(timezone);
  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const dayName = dayNames[now.getDay()];
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  
  // Format time based on timezone
  const timeStr = currentTime.toLocaleTimeString('vi-VN', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const hasTimer = timer.isRunning || timer.isPaused;

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">VIỆC</h1>
          <p className="text-sm text-[var(--text-muted)]">{timeStr}</p>
        </div>
        <button
          onClick={() => setCurrentPage('ai')}
          className="px-3 py-2 bg-[var(--accent-dim)] text-[var(--accent-primary)] rounded-lg text-sm font-medium flex items-center gap-2 active:scale-95"
        >
          <Bot size={16} />
          AI Helper
        </button>
      </div>

      {/* Ngày tháng và đồng hồ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium">{dayName}</p>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{dateStr}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)]">
          <Clock size={14} className="text-[var(--accent-primary)]" />
          <span className="text-sm font-semibold text-[var(--accent-primary)] tabular-nums font-mono">{timeStr}</span>
        </div>
      </div>

      {/* Health Tracking Quick Access */}
      <div className="px-4 pb-4">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <Heart size={16} className="text-[var(--accent-primary)]" />
            Sức khỏe nhanh
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => useSettingsStore.getState().setCurrentPage('health')}
              className="flex items-center gap-2 p-2 bg-[var(--accent-dim)] text-[var(--accent-primary)] rounded-lg text-xs font-medium hover:bg-[var(--accent-primary)] hover:text-[var(--bg-base)] transition-colors"
            >
              <Activity size={14} />
              Bài tập
            </button>
            <button
              onClick={() => useSettingsStore.getState().setCurrentPage('health')}
              className="flex items-center gap-2 p-2 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-lg text-xs font-medium hover:bg-[var(--border-subtle)] transition-colors"
            >
              <Heart size={14} />
              Dinh dưỡng
            </button>
          </div>
        </div>
      </div>

      <TaskList />
      <AddTaskInput />
    </div>
  );
}
