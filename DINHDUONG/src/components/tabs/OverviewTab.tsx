import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Flame, Droplets, ChevronLeft, ChevronRight, X, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { UserProfile, DailyLog } from '@/types';
import { getDailyLog, getHistoryDates } from '@/services/storageService';
import { exercises } from '@/data/exercises';
import { meals } from '@/data/meals';

interface OverviewTabProps { user: UserProfile; }

// ── History Day Detail Modal ──────────────────────────────────────────────────
function DayDetailModal({ log, date, onClose }: { log: DailyLog; date: string; onClose: () => void }) {
  const d = new Date(date + 'T12:00:00');
  const dateLabel = d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-slide-up">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-sm font-bold text-primary glow-cyan capitalize">{dateLabel}</h2>
          <p className="text-xs text-muted-foreground">
            {log.completed ? '✅ Đã hoàn thành' : '⏸ Chưa hoàn thành'} • +{log.exp} EXP
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Mục tiêu', value: `${log.targetCalories}`, unit: 'kcal', color: 'text-primary' },
            { label: 'Đốt cháy', value: `${log.caloriesBurned}`, unit: 'kcal', color: 'text-accent' },
            { label: 'Nạp vào', value: `${log.caloriesConsumed}`, unit: 'kcal', color: 'text-secondary' },
            { label: 'Nước', value: `${log.waterMl}`, unit: 'ml', color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="cyber-card p-2 text-center">
              <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.unit}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {log.weight && (
          <div className="cyber-card p-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Cân nặng</span>
            <span className="font-bold text-primary">{log.weight} kg</span>
            {log.waist && <><span className="text-muted-foreground">Vòng bụng</span><span className="font-bold text-accent">{log.waist} cm</span></>}
          </div>
        )}

        {/* Exercises */}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2 mb-2">
            <Dumbbell className="w-3 h-3" /> Lịch Tập
          </h3>
          {log.exercises.length === 0
            ? <p className="text-xs text-muted-foreground">Không có bài tập.</p>
            : log.exercises.map(pe => {
              const ex = exercises.find(e => e.id === pe.exerciseId);
              return ex ? (
                <div key={pe.exerciseId} className={`flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0 ${pe.completed ? '' : 'opacity-40'}`}>
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${pe.completed ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                    {pe.completed ? '✓' : '○'}
                  </span>
                  <span className="text-sm flex-1">{ex.name}</span>
                  <span className="text-xs text-muted-foreground">{ex.caloriesBurned} kcal</span>
                </div>
              ) : null;
            })
          }
        </div>

        {/* Meals */}
        <div>
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2 mb-2">
            <UtensilsCrossed className="w-3 h-3" /> Thực Đơn
          </h3>
          {log.meals.length === 0
            ? <p className="text-xs text-muted-foreground">Không có thực đơn.</p>
            : log.meals.map(pm => {
              const meal = meals.find(m => m.id === pm.mealId);
              return meal ? (
                <div key={pm.mealId} className={`flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0 ${pm.consumed ? '' : 'opacity-40'}`}>
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${pm.consumed ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                    {pm.consumed ? '✓' : '○'}
                  </span>
                  <span className="text-sm flex-1">{meal.name}</span>
                  <span className="text-xs text-muted-foreground">{meal.calories} kcal</span>
                </div>
              ) : null;
            })
          }
        </div>
      </div>
    </div>
  );
}

// ── Calendar Component ────────────────────────────────────────────────────────
function HistoryCalendar({ userId, onSelectDate }: { userId: string; onSelectDate: (date: string) => void }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const historyDates = useMemo(() => new Set(getHistoryDates(userId)), [userId]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = today.toISOString().split('T')[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="cyber-card p-3">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="text-muted-foreground hover:text-primary p-1"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-semibold text-primary capitalize">{monthLabel}</span>
        <button onClick={nextMonth} disabled={viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth >= today.getMonth())}
          className="text-muted-foreground hover:text-primary p-1 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const hasLog = historyDates.has(dateStr);
          const isFuture = dateStr > todayStr;
          return (
            <button
              key={i}
              onClick={() => !isFuture && hasLog && onSelectDate(dateStr)}
              disabled={isFuture || !hasLog}
              className={`
                aspect-square rounded-md text-xs font-medium flex items-center justify-center transition-all
                ${isToday ? 'ring-1 ring-primary text-primary' : ''}
                ${hasLog && !isFuture ? 'bg-accent/20 text-accent hover:bg-accent/40 cursor-pointer' : 'text-muted-foreground/40'}
                ${isFuture ? 'cursor-not-allowed' : ''}
              `}
            >
              {day}
              {hasLog && !isFuture && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-accent hidden" />}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">🟢 Ngày có dữ liệu - Bấm để xem chi tiết</p>
    </div>
  );
}

// ── Main OverviewTab ──────────────────────────────────────────────────────────
export default function OverviewTab({ user }: OverviewTabProps) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const data = useMemo(() => {
    const today = new Date();
    const days = view === 'week' ? 7 : 30;
    const result: { date: string; label: string; consumed: number; burned: number; water: number; weight?: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = getDailyLog(user.id, dateStr);
      result.push({
        date: dateStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        consumed: log?.caloriesConsumed || 0,
        burned: log?.caloriesBurned || 0,
        water: log?.waterMl || 0,
        weight: log?.weight,
      });
    }
    return result;
  }, [user.id, view]);

  const totalExp = useMemo(() => {
    const dates = getHistoryDates(user.id);
    return dates.reduce((acc, date) => acc + (getDailyLog(user.id, date)?.exp || 0), 0);
  }, [user.id]);

  const streakDays = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const log = getDailyLog(user.id, d.toISOString().split('T')[0]);
      if (log?.completed) streak++;
      else break;
    }
    return streak;
  }, [user.id]);

  const selectedLog = selectedDate ? getDailyLog(user.id, selectedDate) : null;

  return (
    <div className="p-4 space-y-4 animate-slide-up">
      {selectedLog && selectedDate && (
        <DayDetailModal log={selectedLog} date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}

      <h2 className="text-lg font-bold text-accent glow-green text-center">TỔNG QUAN</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="cyber-card-green p-3 text-center">
          <Award className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-lg font-bold text-accent">{totalExp}</p>
          <p className="text-[10px] text-muted-foreground">EXP</p>
        </div>
        <div className="cyber-card p-3 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-primary">{streakDays}</p>
          <p className="text-[10px] text-muted-foreground">Ngày liên tiếp</p>
        </div>
        <div className="cyber-card p-3 text-center">
          <Award className="w-5 h-5 text-secondary mx-auto mb-1" />
          <p className="text-lg font-bold text-secondary">{getHistoryDates(user.id).length}</p>
          <p className="text-[10px] text-muted-foreground">Tổng ngày</p>
        </div>
      </div>

      {/* History Calendar */}
      <HistoryCalendar userId={user.id} onSelectDate={setSelectedDate} />

      {/* Period Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView('week')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${view === 'week' ? 'cyber-btn' : 'cyber-btn-outline'}`}>7 Ngày</button>
        <button onClick={() => setView('month')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${view === 'month' ? 'cyber-btn' : 'cyber-btn-outline'}`}>30 Ngày</button>
      </div>

      {/* Calorie Chart */}
      <div className="cyber-card p-3">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold">Calo Nạp / Đốt</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 18% 16%)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(220 12% 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220 12% 50%)' }} />
            <Tooltip contentStyle={{ background: 'hsl(225 22% 10%)', border: '1px solid hsl(185 25% 16%)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'hsl(185 100% 50%)' }} />
            <Bar dataKey="consumed" name="Nạp vào" fill="hsl(340 100% 57%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="burned" name="Đốt cháy" fill="hsl(155 100% 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Water Chart */}
      <div className="cyber-card p-3">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Nước uống (ml)</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 18% 16%)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(220 12% 50%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(220 12% 50%)' }} />
            <Tooltip contentStyle={{ background: 'hsl(225 22% 10%)', border: '1px solid hsl(185 25% 16%)', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="water" stroke="hsl(185 100% 50%)" strokeWidth={2} dot={{ fill: 'hsl(185 100% 50%)', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Weight chart if data exists */}
      {data.some(d => d.weight) && (
        <div className="cyber-card p-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">Cân nặng (kg)</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={data.filter(d => d.weight)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 18% 16%)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(220 12% 50%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220 12% 50%)' }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: 'hsl(225 22% 10%)', border: '1px solid hsl(185 25% 16%)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(155 100% 45%)" strokeWidth={2} dot={{ fill: 'hsl(155 100% 45%)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
