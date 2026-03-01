// ==================== ENHANCED STATS PAGE ====================
import { useMemo, useState } from 'react';
import { useTaskStore, useGamificationStore, useSettingsStore, useHealthStore } from '@/stores';
import { getNowInTimezone } from '@/lib/notifications';
import { generateDailySummary } from '@/lib/dataUtils';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  TrendingUp, Clock, Award, BarChart3, Target, Flame, Share2, Check, 
  Calendar, Zap, Activity, PieChart as PieIcon,
  Timer, CheckCircle2, AlertTriangle, TrendingDown, Sparkles, Brain, Crown,
  Lightbulb, ArrowUpRight, Clock3, Trophy, Heart, Droplets, Weight, Ruler
} from 'lucide-react';
import type { Task, EisenhowerQuadrant } from '@/types';
import { QUADRANT_LABELS } from '@/types';
import { subDays, format, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

const COLORS = {
  do_first: '#F87171',
  schedule: '#00E5CC', 
  delegate: '#FBBF24',
  eliminate: '#5A5A6E',
  accent: '#00E5CC',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  info: '#60A5FA'
};

type TimeRange = '7days' | '30days' | '90days' | 'all';
type StatsTab = 'overview' | 'trends' | 'tasks' | 'health' | 'quadrants' | 'insights';

const formatDurationShort = (seconds: number): string => {
  if (seconds === 0) return '0';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

// Productivity Score Component
function ProductivityScore({ tasks }: { tasks: Task[] }) {
  const score = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    if (total === 0) return 0;
    const onTime = tasks.filter(t => t.status === 'done' && t.completedAt && t.deadline && t.completedAt <= t.deadline).length;
    const hasTime = tasks.filter(t => t.duration && t.duration > 0).length;
    const completionRate = completed / total;
    const punctualityRate = completed > 0 ? onTime / completed : 0;
    const trackingRate = total > 0 ? hasTime / total : 0;
    return Math.round((completionRate * 0.5 + punctualityRate * 0.3 + trackingRate * 0.2) * 100);
  }, [tasks]);

  const getLabel = (s: number) => {
    if (s >= 90) return { label: 'Xuất sắc', color: COLORS.success, emoji: '🏆' };
    if (s >= 75) return { label: 'Tốt', color: COLORS.accent, emoji: '✨' };
    if (s >= 60) return { label: 'Khá', color: COLORS.warning, emoji: '👍' };
    if (s >= 40) return { label: 'Trung bình', color: COLORS.info, emoji: '📊' };
    return { label: 'Cần cải thiện', color: COLORS.danger, emoji: '💪' };
  };

  const { label, color, emoji } = getLabel(score);

  return (
    <div className="bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] rounded-2xl p-4 border border-[var(--border-accent)] mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-[var(--accent-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Điểm năng suất</h3>
        </div>
        <span className="text-2xl">{emoji}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg className="size-20 -rotate-90">
            <circle cx="40" cy="40" r="36" stroke="var(--bg-surface)" strokeWidth="6" fill="none" />
            <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={`${score * 2.26} 226`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[var(--text-primary)] font-mono">{score}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-lg font-semibold" style={{ color }}>{label}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Dựa trên tỷ lệ hoàn thành & đúng hạn</p>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, subValue, icon: Icon, color }: { title: string; value: string; subValue?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)] active:scale-95 transition-transform">
      <div className="flex items-center gap-2 mb-2">
        <div className="size-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <span className="text-xs text-[var(--text-muted)]">{title}</span>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] font-mono">{value}</p>
      {subValue && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{subValue}</p>}
    </div>
  );
}

export default function StatsPage() {
  const tasks = useTaskStore(s => s.tasks);
  const gamState = useGamificationStore(s => s.state);
  const [activeTab, setActiveTab] = useState<StatsTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [copied, setCopied] = useState(false);
  const timezone = useSettingsStore(s => s.timezone);

  const filteredTasks = useMemo(() => {
    if (timeRange === 'all') return tasks;
    const now = getNowInTimezone(timezone);
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const cutoff = subDays(now, days).getTime();
    return tasks.filter(t => (t.completedAt || t.createdAt) >= cutoff);
  }, [tasks, timeRange, timezone]);

  const stats = useMemo(() => {
    const done = filteredTasks.filter(t => t.status === 'done' && !t.parentId).length;
    const total = filteredTasks.filter(t => !t.parentId).length;
    const totalTime = filteredTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.duration || 0), 0);
    return { 
      done, 
      total, 
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      totalTime,
      avgTime: done > 0 ? Math.round(totalTime / done) : 0
    };
  }, [filteredTasks]);

  const handleShare = async () => {
    const text = generateDailySummary(tasks, gamState, timezone);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* ignore */ }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: PieIcon },
    { id: 'trends', label: 'Xu hướng', icon: TrendingUp },
    { id: 'tasks', label: 'Công việc', icon: CheckCircle2 },
    { id: 'health', label: 'Sức khỏe', icon: Activity },
    { id: 'quadrants', label: 'Ma trận', icon: Target },
    { id: 'insights', label: 'Phân tích', icon: Brain },
  ];

  const timeRanges = [
    { id: '7days', label: '7 ngày' },
    { id: '30days', label: '30 ngày' },
    { id: '90days', label: '90 ngày' },
    { id: 'all', label: 'Tất cả' },
  ];

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <BarChart3 size={24} className="text-[var(--accent-primary)]" />
          Thống kê Pro
        </h1>
        <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--accent-dim)] text-[var(--accent-primary)]">
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? 'Đã copy' : 'Chia sẻ'}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 p-1 bg-[var(--bg-elevated)] rounded-xl">
        {timeRanges.map(range => (
          <button
            key={range.id}
            onClick={() => setTimeRange(range.id as TimeRange)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              timeRange === range.id ? 'bg-[var(--accent-primary)] text-[var(--bg-base)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as StatsTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap ${
              activeTab === tab.id ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--border-accent)]' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'overview' && (
          <>
            <ProductivityScore tasks={filteredTasks} />
            <div className="grid grid-cols-2 gap-3">
              <StatsCard icon={CheckCircle2} title="Hoàn thành" value={stats.done.toString()} subValue={`${stats.completionRate}% tỷ lệ`} color={COLORS.success} />
              <StatsCard icon={Clock} title="Thời gian" value={formatDurationShort(stats.totalTime)} subValue={`TB ${formatDurationShort(stats.avgTime)}/việc`} color={COLORS.accent} />
              <StatsCard icon={Flame} title="Streak" value={gamState.streak.toString()} subValue="ngày liên tiếp" color={COLORS.warning} />
              <StatsCard icon={Target} title="Tổng" value={stats.total.toString()} subValue={`${stats.completionRate}% hoàn thành`} color={COLORS.info} />
            </div>
          </>
        )}
        
        {activeTab === 'trends' && <TrendsPanel tasks={filteredTasks} timeRange={timeRange} />}
        {activeTab === 'tasks' && <TasksPanel tasks={filteredTasks} />}
        {activeTab === 'health' && <HealthPanel timeRange={timeRange} />}
        {activeTab === 'quadrants' && <QuadrantsPanel tasks={filteredTasks} />}
        {activeTab === 'insights' && <InsightsPanel tasks={filteredTasks} />}
      </div>
    </div>
  );
}

const PIE_COLORS = ['#F87171', '#00E5CC', '#FBBF24', '#5A5A6E'];

// ==================== TRENDS TAB COMPONENTS ====================
function TrendsPanel({ tasks, timeRange }: { tasks: Task[]; timeRange: TimeRange }) {
  const timezone = useSettingsStore(s => s.timezone);
  const now = getNowInTimezone(timezone);
  
  const trendData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const dayEnd = dayStart + 86400000;
      
      const dayTasks = tasks.filter(t => 
        t.status === 'done' && 
        t.completedAt && 
        t.completedAt >= dayStart && 
        t.completedAt < dayEnd
      );
      
      const count = dayTasks.length;
      const time = dayTasks.reduce((s, t) => s + (t.duration || 0), 0);
      
      data.push({
        date: format(date, 'dd/MM'),
        fullDate: format(date, 'EEEE', { locale: vi }),
        count,
        time: Math.round(time / 60), // minutes
      });
    }
    
    return data;
  }, [tasks, timeRange, now]);

  const avgTasks = Math.round(trendData.reduce((s, d) => s + d.count, 0) / trendData.length) || 0;
  const avgTime = Math.round(trendData.reduce((s, d) => s + d.time, 0) / trendData.length) || 0;
  const bestDay = trendData.reduce((best, d) => d.count > best.count ? d : best, trendData[0] || { date: '-', count: 0 });
  const totalCompleted = trendData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-[var(--accent-primary)]" />
            <span className="text-xs text-[var(--text-muted)]">TB việc/ngày</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{avgTasks}</p>
          <p className="text-[10px] text-[var(--text-muted)]">Tổng: {totalCompleted} việc</p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <Clock3 size={14} className="text-[var(--warning)]" />
            <span className="text-xs text-[var(--text-muted)]">TB thời gian</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{avgTime}p</p>
          <p className="text-[10px] text-[var(--text-muted)]">/ngày</p>
        </div>
      </div>

      {/* Task Count Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Số việc hoàn thành</h3>
        <p className="text-[10px] text-[var(--text-muted)] mb-3">Ngày tốt nhất: {bestDay.date} ({bestDay.count} việc)</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={Math.floor(trendData.length / 6)} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number, name: string) => [value + ' việc', 'Hoàn thành']}
              />
              <Area type="monotone" dataKey="count" stroke={COLORS.accent} strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Thời gian làm việc (phút)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={Math.floor(trendData.length / 6)} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => [value + ' phút', 'Thời gian']}
              />
              <Bar dataKey="time" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ==================== QUADRANTS TAB COMPONENTS ====================
function QuadrantsPanel({ tasks }: { tasks: Task[] }) {
  const quadrantData = useMemo(() => {
    const quadrants: EisenhowerQuadrant[] = ['do_first', 'schedule', 'delegate', 'eliminate'];
    
    return quadrants.map(q => {
      const qTasks = tasks.filter(t => t.quadrant === q && !t.parentId);
      const completed = qTasks.filter(t => t.status === 'done');
      const totalTime = completed.reduce((s, t) => s + (t.duration || 0), 0);
      
      return {
        name: QUADRANT_LABELS[q].label,
        icon: QUADRANT_LABELS[q].icon,
        color: QUADRANT_LABELS[q].color,
        quadrant: q,
        total: qTasks.length,
        completed: completed.length,
        rate: qTasks.length > 0 ? Math.round((completed.length / qTasks.length) * 100) : 0,
        time: totalTime,
        avgTime: completed.length > 0 ? Math.round(totalTime / completed.length) : 0
      };
    });
  }, [tasks]);

  const radarData = quadrantData.map(d => ({
    subject: d.name.split(' ')[0],
    A: d.rate,
    fullMark: 100
  }));

  const totalTasks = quadrantData.reduce((s, q) => s + q.total, 0);

  return (
    <div className="space-y-4">
      {/* Radar Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <Target size={16} className="text-[var(--accent-primary)]" />
          Phân bố Ma trận Eisenhower
        </h3>
        <p className="text-[10px] text-[var(--text-muted)] mb-3">Tỷ lệ hoàn thành theo nhóm</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Radar name="Tỷ lệ" dataKey="A" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.3} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => [value + '%', 'Hoàn thành']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Phân bố số lượng việc</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={quadrantData} 
                cx="50%" cy="50%" 
                innerRadius={40} 
                outerRadius={70} 
                dataKey="total" 
                nameKey="name"
                strokeWidth={0}
              >
                {quadrantData.map((q, index) => (
                  <Cell key={q.quadrant} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number, name: string) => [value + ' việc', name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {quadrantData.map((q, i) => (
            <div key={q.quadrant} className="flex items-center gap-1">
              <div className="size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-[10px] text-[var(--text-muted)]">{q.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quadrant Cards */}
      <div className="grid grid-cols-2 gap-3">
        {quadrantData.map(q => (
          <div key={q.quadrant} className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: q.color }} />
            <div className="flex items-center gap-2 mb-2 pl-2">
              <span className="text-lg">{q.icon}</span>
              <span className="text-xs font-medium text-[var(--text-primary)] truncate">{q.name}</span>
            </div>
            <div className="flex items-end justify-between pl-2">
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{q.completed}/{q.total}</p>
                <p className="text-[9px] text-[var(--text-muted)]">việc</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono" style={{ color: q.color }}>{q.rate}%</p>
                <p className="text-[9px] text-[var(--text-muted)]">hoàn thành</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== INSIGHTS TAB COMPONENTS ====================
function InsightsPanel({ tasks }: { tasks: Task[] }) {
  const insights = useMemo(() => {
    const result = [];
    
    // Completion rate insight
    const completed = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    const rate = total > 0 ? (completed / total) * 100 : 0;
    
    if (rate >= 80) {
      result.push({ type: 'success', icon: Trophy, title: 'Xuất sắc!', message: `Tỷ lệ hoàn thành của bạn là ${Math.round(rate)}%. Cứ tiếp tục phát huy!` });
    } else if (rate < 50 && total > 10) {
      result.push({ type: 'warning', icon: AlertTriangle, title: 'Cần cải thiện', message: `Tỷ lệ hoàn thành chỉ ${Math.round(rate)}%. Hãy ưu tiên việc quan trọng hơn!` });
    }
    
    // Overdue insight
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    if (overdue > 5) {
      result.push({ type: 'danger', icon: Clock, title: 'Cảnh báo', message: `Có ${overdue} việc quá hạn. Hãy xem xét lại lịch trình hoặc ủy thác bớt!` });
    }
    
    // Time tracking insight
    const tracked = tasks.filter(t => t.duration && t.duration > 0).length;
    const trackingRate = total > 0 ? (tracked / total) * 100 : 0;
    if (trackingRate < 30 && total > 5) {
      result.push({ type: 'info', icon: Timer, title: 'Theo dõi thời gian', message: 'Chỉ ' + Math.round(trackingRate) + '% việc có theo dõi thời gian. Hãy bật timer để phân tích năng suất tốt hơn!' });
    } else if (trackingRate >= 70) {
      result.push({ type: 'success', icon: Activity, title: 'Tuyệt vời!', message: `Bạn đang theo dõi thời gian rất tốt (${Math.round(trackingRate)}%).` });
    }
    
    // Quadrant balance
    const doFirst = tasks.filter(t => t.quadrant === 'do_first').length;
    const eliminate = tasks.filter(t => t.quadrant === 'eliminate').length;
    if (eliminate > doFirst && total > 10) {
      result.push({ type: 'warning', icon: Target, title: 'Cân bằng Ma trận', message: 'Bạn có nhiều việc "Loại bỏ" hơn "Làm ngay". Hãy xem lại ưu tiên!' });
    }
    
    // Best performing quadrant
    const quadrants = ['do_first', 'schedule', 'delegate', 'eliminate'] as const;
    const qStats = quadrants.map(q => {
      const qTasks = tasks.filter(t => t.quadrant === q && t.status === 'done');
      return { q, count: qTasks.length };
    });
    const bestQ = qStats.reduce((best, curr) => curr.count > best.count ? curr : best, qStats[0]);
    if (bestQ && bestQ.count > 0) {
      const qLabel = QUADRANT_LABELS[bestQ.q].label;
      result.push({ type: 'success', icon: Zap, title: 'Điểm mạnh', message: `Bạn làm tốt nhất ở nhóm "${qLabel}" với ${bestQ.count} việc hoàn thành.` });
    }
    
    return result;
  }, [tasks]);

  const tips = [
    { icon: Lightbulb, title: 'Mẹo: Rule 2 phút', desc: 'Nếu việc gì đó chỉ mất dưới 2 phút, hãy làm ngay lập tức.' },
    { icon: ArrowUpRight, title: 'Mẹo: Pomodoro', desc: 'Làm việc 25 phút, nghỉ 5 phút giúp duy trì tập trung lâu dài.' },
    { icon: Target, title: 'Mẹo: Một việc', desc: 'Tập trung làm một việc hoàn chỉnh thay vì nhiều việc nửa vời.' },
  ];

  return (
    <div className="space-y-4">
      {/* AI Analysis Header */}
      <div className="bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] rounded-2xl p-4 border border-[var(--border-accent)]">
        <div className="flex items-center gap-2 mb-2">
          <Brain size={20} className="text-[var(--accent-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Phân tích thông minh</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Dựa trên dữ liệu của bạn, đây là những phân tích và gợi ý để cải thiện năng suất:
        </p>
      </div>

      {/* Insights */}
      {insights.length > 0 ? (
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-3 p-3 rounded-xl border ${
                insight.type === 'success' ? 'bg-[rgba(52,211,153,0.08)] border-[rgba(52,211,153,0.3)]' :
                insight.type === 'warning' ? 'bg-[rgba(251,191,36,0.08)] border-[rgba(251,191,36,0.3)]' :
                insight.type === 'danger' ? 'bg-[rgba(248,113,113,0.08)] border-[rgba(248,113,113,0.3)]' :
                'bg-[rgba(96,165,250,0.08)] border-[rgba(96,165,250,0.3)]'
              }`}
            >
              <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                insight.type === 'success' ? 'bg-[rgba(52,211,153,0.15)] text-[var(--success)]' :
                insight.type === 'warning' ? 'bg-[rgba(251,191,36,0.15)] text-[var(--warning)]' :
                insight.type === 'danger' ? 'bg-[rgba(248,113,113,0.15)] text-[var(--error)]' :
                'bg-[rgba(96,165,250,0.15)] text-[var(--info)]'
              }`}>
                <insight.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  insight.type === 'success' ? 'text-[var(--success)]' :
                  insight.type === 'warning' ? 'text-[var(--warning)]' :
                  insight.type === 'danger' ? 'text-[var(--error)]' :
                  'text-[var(--info)]'
                }`}>{insight.title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--bg-elevated)] rounded-xl p-6 border border-[var(--border-subtle)] text-center">
          <Sparkles size={32} className="mx-auto mb-3 text-[var(--accent-primary)]" />
          <p className="text-sm text-[var(--text-muted)]">Tiếp tục phát huy! Chưa có cảnh báo nào.</p>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Lightbulb size={16} className="text-[var(--warning)]" />
          Mẹo năng suất
        </h3>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-3">
              <div className="size-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center shrink-0">
                <tip.icon size={14} className="text-[var(--accent-primary)]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{tip.title}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== TASKS TAB COMPONENT ====================
function TasksPanel({ tasks }: { tasks: Task[] }) {
  const taskStats = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    
    return { pending, inProgress, done, overdue };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return tasks
      .filter(t => t.status === 'done')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .slice(0, 10);
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Task Status Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
            <span className="text-xs text-[var(--text-muted)]">Đang làm</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{taskStats.inProgress}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[var(--info)]" />
            <span className="text-xs text-[var(--text-muted)]">Chờ làm</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{taskStats.pending}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
            <span className="text-xs text-[var(--text-muted)]">Hoàn thành</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{taskStats.done}</p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-[var(--error)]" />
            <span className="text-xs text-[var(--text-muted)]">Quá hạn</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{taskStats.overdue}</p>
        </div>
      </div>

      {/* Recent Completed Tasks */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[var(--success)]" />
          Việc hoàn thành gần đây
        </h3>
        <div className="space-y-2">
          {recentTasks.length > 0 ? (
            recentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {task.quadrant && `${QUADRANT_LABELS[task.quadrant].label} • `}
                    {task.duration && `${formatDurationShort(task.duration)}`}
                  </p>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {task.completedAt && format(new Date(task.completedAt), 'dd/MM HH:mm', { locale: vi })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-muted)]">Chưa có việc nào hoàn thành</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== HEALTH TAB COMPONENT ====================
function HealthPanel({ timeRange }: { timeRange: TimeRange }) {
  const healthEntries = useHealthStore(s => s.entries);
  const timezone = useSettingsStore(s => s.timezone);
  const now = getNowInTimezone(timezone);
  
  const healthData = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const entry = healthEntries.find(e => e.date === dateStr);
      
      data.push({
        date: format(date, 'dd/MM'),
        fullDate: dateStr,
        weight: entry?.weight || null,
        waist: entry?.waist || null,
        water: entry?.water || null,
        calories: entry?.calories || null,
      });
    }
    
    return data;
  }, [healthEntries, timeRange, now]);

  const latest = healthData[healthData.length - 1] || {};
  const hasAnyData = healthEntries.length > 0;

  if (!hasAnyData) {
    return (
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-8 border border-[var(--border-subtle)] text-center">
        <Activity size={48} className="mx-auto mb-4 text-[var(--success)]" />
        <p className="text-sm text-[var(--text-muted)] mb-2">Chưa có dữ liệu sức khỏe</p>
        <p className="text-xs text-[var(--text-muted)]">
          Tạo VIỆC ĐƠN với chủ đề "SỨC KHỎE" và nhập số liệu khi hoàn thành
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Latest Values Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚖️</span>
            <span className="text-xs text-[var(--text-muted)]">Cân nặng</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)] font-mono">
            {latest.weight ? `${latest.weight} kg` : '--'}
          </p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📏</span>
            <span className="text-xs text-[var(--text-muted)]">Vòng bụng</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)] font-mono">
            {latest.waist ? `${latest.waist} cm` : '--'}
          </p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">💧</span>
            <span className="text-xs text-[var(--text-muted)]">Nước uống</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)] font-mono">
            {latest.water ? `${latest.water} ml` : '--'}
          </p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <span className="text-xs text-[var(--text-muted)]">Calo tiêu hao</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)] font-mono">
            {latest.calories ? `${latest.calories} kcal` : '--'}
          </p>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <span>⚖️</span> Cân nặng (kg)
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={Math.floor(healthData.length / 6)} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => value ? [`${value} kg`, 'Cân nặng'] : ['Không có dữ liệu', '']}
              />
              <Line type="monotone" dataKey="weight" stroke={COLORS.success} strokeWidth={2} dot={{ fill: COLORS.success, strokeWidth: 0, r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Waist Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <span>📏</span> Vòng bụng (cm)
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={Math.floor(healthData.length / 6)} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => value ? [`${value} cm`, 'Vòng bụng'] : ['Không có dữ liệu', '']}
              />
              <Line type="monotone" dataKey="waist" stroke={COLORS.warning} strokeWidth={2} dot={{ fill: COLORS.warning, strokeWidth: 0, r: 3 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <span>💧</span> Lượng nước uống (ml)
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={Math.floor(healthData.length / 6)} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => value ? [`${value} ml`, 'Nước uống'] : ['Không có dữ liệu', '']}
              />
              <Bar dataKey="water" fill={COLORS.info} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="bg-[var(--bg-elevated)] rounded-2xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <span>🔥</span> Calo tiêu hao (kcal)
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} interval={Math.floor(healthData.length / 6)} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '11px' }}
                formatter={(value: number) => value ? [`${value} kcal`, 'Calo'] : ['Không có dữ liệu', '']}
              />
              <Bar dataKey="calories" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
