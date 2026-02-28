import { useState, useEffect, useMemo } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Droplets, Plus, Minus, Flame, Dumbbell, UtensilsCrossed, Clock, Check, Lock,
  Timer, ChevronDown, ChevronUp, GripVertical, AlertCircle, Loader2, X
} from 'lucide-react';
import { UserProfile, DailyLog, PlannedExercise } from '@/types';
import { exercises } from '@/data/exercises';
import { meals } from '@/data/meals';
import {
  getDailyLog, saveDailyLog, createDefaultDailyLog, getDailyPlan,
  getTodayString, getCurrentTime, isTimeInRange
} from '@/services/storageService';
import SmartTimer from '@/components/SmartTimer';
import { supabase } from '@/integrations/supabase/client';

// ─── Sortable Exercise Item ───────────────────────────────────────────────────
interface SortableExerciseProps {
  pe: PlannedExercise;
  locked: boolean;
  onTimer: (id: string) => void;
  onExpand: (id: string) => void;
  expanded: boolean;
}

function SortableExercise({ pe, locked, onTimer, onExpand, expanded }: SortableExerciseProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: pe.exerciseId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const ex = exercises.find(e => e.id === pe.exerciseId);
  if (!ex) return null;

  return (
    <div ref={setNodeRef} style={style} className={`cyber-card mb-2 overflow-hidden transition-all ${pe.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <button {...attributes} {...listeners} className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </button>
        {/* Action button */}
        <button
          onClick={() => { if (!locked && !pe.completed) onTimer(pe.exerciseId); }}
          disabled={locked}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            pe.completed ? 'bg-accent text-accent-foreground' :
            locked ? 'bg-muted text-muted-foreground cursor-not-allowed' :
            'bg-primary/10 text-primary hover:bg-primary/20'
          }`}>
          {pe.completed ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-3 h-3" /> : <Timer className="w-4 h-4" />}
        </button>
        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onExpand(pe.exerciseId)}>
          <p className={`text-sm font-medium truncate ${pe.completed ? 'line-through' : ''}`}>{ex.name}</p>
          <p className="text-xs text-muted-foreground">{ex.duration} phút • {ex.caloriesBurned} kcal</p>
        </div>
        <button onClick={() => onExpand(pe.exerciseId)} className="text-muted-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe
              src={`https://www.youtube.com/embed/${ex.youtubeId}`}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <ol className="text-xs text-muted-foreground space-y-1">
            {ex.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary font-bold">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ─── Exception AI Modal ───────────────────────────────────────────────────────
interface ExceptionModalProps {
  user: UserProfile;
  onClose: () => void;
  onApply: (updatedLog: Partial<DailyLog>) => void;
}

function ExceptionModal({ user, onClose, onApply }: ExceptionModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cyberfit-ai', {
        body: {
          mode: 'exception',
          exceptionText: text,
          userProfile: user,
        }
      });
      if (error) throw error;
      if (data?.plan) {
        onApply({ exercises: data.plan.exercises, meals: data.plan.meals });
        setResult('✅ Đã cập nhật lịch tập & thực đơn cho hôm nay!');
      } else {
        setResult(data?.message || 'AI đã phân tích xong.');
      }
    } catch (e) {
      setResult('❌ Lỗi kết nối AI. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-end p-4" onClick={onClose}>
      <div className="w-full cyber-card p-4 space-y-3 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-secondary glow-pink flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> XỬ LÝ NGOẠI LỆ AI
          </h3>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <p className="text-xs text-muted-foreground">Mô tả tình huống đặc biệt hôm nay để AI điều chỉnh kế hoạch phù hợp.</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ví dụ: Hôm nay trời mưa đau chân, tối phải đi nhậu với khách..."
          className="cyber-input w-full h-24 text-sm resize-none"
          rows={3}
        />
        {result && <p className="text-xs text-accent">{result}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 cyber-btn-outline py-2 text-sm">Huỷ</button>
          <button onClick={handleSubmit} disabled={loading || !text.trim()} className="flex-1 cyber-btn-pink py-2 text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
            {loading ? 'Đang phân tích...' : 'Phân tích AI'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main TodayTab ────────────────────────────────────────────────────────────
interface TodayTabProps { user: UserProfile; }

export default function TodayTab({ user }: TodayTabProps) {
  const today = getTodayString();
  const [log, setLog] = useState<DailyLog>(() => {
    const existing = getDailyLog(user.id, today);
    if (existing) return existing;
    const plan = getDailyPlan(user.id);
    return createDefaultDailyLog(user.id, today, plan, user.targetCalories || 2000);
  });
  const [subTab, setSubTab] = useState<'exercise' | 'meal'>('exercise');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [timerExercise, setTimerExercise] = useState<string | null>(null);
  const [showException, setShowException] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getCurrentTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { saveDailyLog(log); }, [log]);

  const calorieAvailable = log.targetCalories + log.caloriesBurned - log.caloriesConsumed;
  const caloriePercent = Math.min(100, Math.max(0, (log.caloriesConsumed / (log.targetCalories + log.caloriesBurned)) * 100));
  const waterPercent = Math.min(100, ((log.waterMl) / (user.targetWater || 2500)) * 100);

  const isInEatingWindow = useMemo(() => {
    if (!user.ifEatStart || !user.ifEatEnd) return true;
    return isTimeInRange(currentTime, user.ifEatStart, user.ifEatEnd);
  }, [currentTime, user.ifEatStart, user.ifEatEnd]);

  const isSessionLocked = (sessionId: string) => {
    const session = user.sessions.find(s => s.id === sessionId);
    if (!session) return false;
    return currentTime > session.endTime;
  };

  const handleDragEnd = (event: DragEndEvent, sessionId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setLog(prev => {
      const sessionExIds = prev.exercises
        .filter(e => e.sessionId === sessionId)
        .sort((a, b) => a.order - b.order)
        .map(e => e.exerciseId);
      const oldIndex = sessionExIds.indexOf(String(active.id));
      const newIndex = sessionExIds.indexOf(String(over.id));
      const newOrder = arrayMove(sessionExIds, oldIndex, newIndex);
      const updated = prev.exercises.map(e => {
        if (e.sessionId !== sessionId) return e;
        return { ...e, order: newOrder.indexOf(e.exerciseId) };
      });
      return { ...prev, exercises: updated };
    });
  };

  const toggleExercise = (exerciseId: string) => {
    setLog(prev => {
      const ex = prev.exercises.find(e => e.exerciseId === exerciseId);
      if (!ex) return prev;
      const exData = exercises.find(e => e.id === exerciseId);
      const calDelta = ex.completed ? -(exData?.caloriesBurned || 0) : (exData?.caloriesBurned || 0);
      return {
        ...prev,
        caloriesBurned: prev.caloriesBurned + calDelta,
        exercises: prev.exercises.map(e => e.exerciseId === exerciseId ? { ...e, completed: !e.completed } : e),
      };
    });
  };

  const toggleMeal = (mealId: string) => {
    if (!isInEatingWindow) return;
    setLog(prev => {
      const ml = prev.meals.find(m => m.mealId === mealId);
      if (!ml) return prev;
      const mealData = meals.find(m => m.id === mealId);
      const calDelta = ml.consumed ? -(mealData?.calories || 0) : (mealData?.calories || 0);
      return {
        ...prev,
        caloriesConsumed: prev.caloriesConsumed + calDelta,
        meals: prev.meals.map(m => m.mealId === mealId ? { ...m, consumed: !m.consumed } : m),
      };
    });
  };

  const applyException = (updates: Partial<DailyLog>) => {
    setLog(prev => ({ ...prev, ...updates }));
    setShowException(false);
  };

  const activeTimerExercise = timerExercise ? exercises.find(e => e.id === timerExercise) : null;
  if (activeTimerExercise) {
    return (
      <SmartTimer
        exercise={activeTimerExercise}
        onComplete={() => { toggleExercise(timerExercise!); setTimerExercise(null); }}
        onClose={() => setTimerExercise(null)}
      />
    );
  }

  return (
    <div className="p-4 pb-2 space-y-4 animate-slide-up">
      {showException && (
        <ExceptionModal user={user} onClose={() => setShowException(false)} onApply={applyException} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-primary glow-cyan">
            {new Date(today + 'T12:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p className="text-xs text-muted-foreground">{currentTime}</p>
        </div>
        <button
          onClick={() => setShowException(true)}
          className="cyber-btn-outline text-xs px-2 py-1 flex items-center gap-1 border-secondary/40 text-secondary hover:border-secondary">
          <AlertCircle className="w-3 h-3" /> Ngoại lệ AI
        </button>
      </div>

      {/* Body Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="cyber-card p-3">
          <label className="text-xs text-muted-foreground block mb-1">Cân nặng (kg)</label>
          <input type="number" step="0.1" value={log.weight || ''} onChange={e => { const w = parseFloat(e.target.value); if (!isNaN(w)) setLog(p => ({ ...p, weight: w })); }}
            placeholder={String(user.weight || '')} className="cyber-input text-center font-bold" />
        </div>
        <div className="cyber-card p-3">
          <label className="text-xs text-muted-foreground block mb-1">Vòng bụng (cm)</label>
          <input type="number" step="0.1" value={log.waist || ''} onChange={e => { const w = parseFloat(e.target.value); if (!isNaN(w)) setLog(p => ({ ...p, waist: w })); }}
            placeholder={String(user.waist || '')} className="cyber-input text-center font-bold" />
        </div>
      </div>

      {/* Water Tracker */}
      <div className="cyber-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Nước uống</span>
          </div>
          <span className="text-sm text-primary font-bold">{log.waterMl}ml / {user.targetWater || 2500}ml</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
          <div className="h-full progress-bar-cyan rounded-full transition-all duration-500" style={{ width: `${waterPercent}%` }} />
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={() => setLog(p => ({ ...p, waterMl: Math.max(0, p.waterMl - 250) }))} className="cyber-btn-outline px-3 py-1 text-xs">
            <Minus className="w-3 h-3 inline mr-1" />250ml
          </button>
          <button onClick={() => setLog(p => ({ ...p, waterMl: p.waterMl + 250 }))} className="cyber-btn px-3 py-1 text-xs">
            <Plus className="w-3 h-3 inline mr-1" />250ml
          </button>
        </div>
      </div>

      {/* Calorie Bar */}
      <div className="cyber-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold">Calo Khả Dụng</span>
          </div>
          <span className={`text-sm font-bold ${calorieAvailable >= 0 ? 'text-accent' : 'text-secondary'}`}>
            {calorieAvailable} kcal
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
          <div className={`h-full rounded-full transition-all duration-500 ${caloriePercent > 90 ? 'progress-bar-pink' : 'progress-bar-green'}`}
            style={{ width: `${caloriePercent}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Mục tiêu: {log.targetCalories}</span>
          <span>Đốt: +{log.caloriesBurned}</span>
          <span>Nạp: -{log.caloriesConsumed}</span>
        </div>
      </div>

      {/* IF Window */}
      {user.ifMode && (
        <div className={`rounded-lg px-3 py-2 text-xs font-medium text-center ${isInEatingWindow
          ? 'bg-accent/10 text-accent border border-accent/30'
          : 'bg-secondary/10 text-secondary border border-secondary/30'}`}>
          <Clock className="w-3 h-3 inline mr-1" />
          IF {user.ifMode} • {isInEatingWindow
            ? `🟢 Đang trong khung giờ ăn (${user.ifEatStart} - ${user.ifEatEnd})`
            : `🔴 Đang nhịn ăn (ăn lại lúc ${user.ifEatStart})`
          }
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button onClick={() => setSubTab('exercise')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${subTab === 'exercise' ? 'cyber-btn' : 'cyber-btn-outline'}`}>
          <Dumbbell className="w-4 h-4 inline mr-1" /> Lịch Tập
        </button>
        <button onClick={() => setSubTab('meal')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${subTab === 'meal' ? 'cyber-btn-pink' : 'cyber-btn-outline'}`}>
          <UtensilsCrossed className="w-4 h-4 inline mr-1" /> Thực Đơn
        </button>
      </div>

      {/* ── Exercise List with Drag & Drop ── */}
      {subTab === 'exercise' && (
        <div className="space-y-4">
          {user.sessions.map(session => {
            const locked = isSessionLocked(session.id);
            const sessionExercises = [...log.exercises.filter(e => e.sessionId === session.id)].sort((a, b) => a.order - b.order);
            const ids = sessionExercises.map(e => e.exerciseId);
            return (
              <div key={session.id}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">{session.name}</h3>
                  <span className="text-[10px] text-muted-foreground">{session.startTime}-{session.endTime}</span>
                  {locked && <Lock className="w-3 h-3 text-secondary" />}
                  {!locked && <span className="text-[10px] text-muted-foreground italic ml-auto">Kéo để sắp xếp</span>}
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => handleDragEnd(e, session.id)}>
                  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                    {sessionExercises.map(pe => (
                      <SortableExercise
                        key={pe.exerciseId}
                        pe={pe}
                        locked={locked}
                        onTimer={setTimerExercise}
                        onExpand={id => setExpandedId(expandedId === id ? null : id)}
                        expanded={expandedId === pe.exerciseId}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {sessionExercises.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">Chưa có bài tập cho buổi này</p>
                )}
              </div>
            );
          })}
          {user.sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Vào Cài Đặt → AI để lập lịch tập.</p>
          )}
        </div>
      )}

      {/* ── Meal List ── */}
      {subTab === 'meal' && (
        <div className="space-y-2">
          {log.meals.map(pm => {
            const meal = meals.find(m => m.id === pm.mealId);
            if (!meal) return null;
            const expanded = expandedId === pm.mealId;
            const mealLocked = !isInEatingWindow && !pm.consumed;
            return (
              <div key={pm.mealId} className={`${pm.consumed ? 'cyber-card-green opacity-70' : mealLocked ? 'cyber-card opacity-40' : 'cyber-card-pink'} overflow-hidden transition-all`}>
                <div className="flex items-center gap-3 p-3">
                  <button onClick={() => !mealLocked && toggleMeal(pm.mealId)} disabled={mealLocked}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      pm.consumed ? 'bg-accent text-accent-foreground' :
                      mealLocked ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                      'bg-secondary/10 text-secondary hover:bg-secondary/20'
                    }`}>
                    {pm.consumed ? <Check className="w-4 h-4" /> : mealLocked ? <Lock className="w-3 h-3" /> : <UtensilsCrossed className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(expanded ? null : pm.mealId)}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{pm.time}</span>
                      <p className={`text-sm font-medium truncate ${pm.consumed ? 'line-through' : ''}`}>{meal.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{meal.calories} kcal • P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</p>
                    {pm.aiReason && <p className="text-[10px] text-primary/70 mt-0.5 italic">💡 {pm.aiReason}</p>}
                  </div>
                  <button onClick={() => setExpandedId(expanded ? null : pm.mealId)} className="text-muted-foreground flex-shrink-0">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {expanded && (
                  <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Nguyên liệu:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">{meal.ingredients.map((ing, i) => <li key={i}>• {ing}</li>)}</ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-primary mb-1">Cách chế biến:</p>
                      <p className="text-xs text-muted-foreground">{meal.instructions}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">{meal.servingNote}</p>
                  </div>
                )}
              </div>
            );
          })}
          {log.meals.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Chưa có thực đơn. Vào Cài Đặt để AI lập kế hoạch.</p>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
