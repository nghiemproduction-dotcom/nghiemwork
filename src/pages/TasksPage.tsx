import { useTaskStore, useSettingsStore } from '@/stores';
import { TaskList } from '@/components/features/TaskList';
import { AddTaskInput } from '@/components/features/AddTaskInput';
import { CalendarDays, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type {} from '@/types';
import { getNowInTimezone } from '@/lib/notifications';

export default function TasksPage() {
  const timer = useTaskStore((s) => s.timer);
  const timezone = useSettingsStore((s) => s.timezone);
  
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
    <div className="flex flex-col h-full px-4" style={{ paddingTop: hasTimer ? '72px' : '0' }}>
      {/* Header - Ngày tháng và đồng hồ */}
      <div className="flex items-center justify-between pt-4 pb-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] font-medium">{dayName}</p>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">{dateStr}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)]">
          <Clock size={14} className="text-[var(--accent-primary)]" />
          <span className="text-sm font-semibold text-[var(--accent-primary)] tabular-nums font-mono">{timeStr}</span>
        </div>
      </div>

      <TaskList />
      <AddTaskInput />
    </div>
  );
}
