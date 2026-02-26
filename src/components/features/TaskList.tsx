import { useCallback, useMemo, useState, useRef } from 'react';
import { useTaskStore, useSettingsStore, useTemplateStore } from '@/stores';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { formatTimeRemaining, formatDeadlineDisplay } from '@/lib/notifications';
import { TaskViewModal } from '@/components/features/TaskViewModal';
import { TaskEditModal } from '@/components/features/TaskEditModal';
import {
  Play, CheckCircle2, GripVertical, RotateCcw, Trash2, Undo2,
  Clock, Calendar, AlertTriangle, ChevronDown, ChevronRight,
  DollarSign, ListTree, Link2, Lock, Search, X,
} from 'lucide-react';
import type { Task, TabType, EisenhowerQuadrant } from '@/types';
import { QUADRANT_LABELS } from '@/types';

const RECURRING_LABELS: Record<string, string> = {
  none: '', daily: 'Hàng ngày', weekdays: 'T2-T6', weekly: 'Hàng tuần', custom: 'Tùy chọn',
};

function formatDuration(secs: number) {
  if (secs === 0) return '0s';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function SubtaskList({ parentId }: { parentId: string }) {
  const tasks = useTaskStore(s => s.tasks);
  const completeTask = useTaskStore(s => s.completeTask);
  const subtasks = tasks.filter(t => t.parentId === parentId).sort((a, b) => a.order - b.order);
  if (subtasks.length === 0) return null;
  const done = subtasks.filter(s => s.status === 'done').length;
  const percent = Math.round((done / subtasks.length) * 100);

  return (
    <div className="mt-1.5 ml-5 space-y-1">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
        <span className="text-[9px] text-[var(--text-muted)]">
          {done}/{subtasks.length} việc đơn ({percent}%)
        </span>
        <div className="h-px flex-1 bg-[var(--border-subtle)]" />
      </div>
      {subtasks.map(sub => (
        <div key={sub.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          {sub.status !== 'done' ? (
            <button onClick={() => completeTask(sub.id)} className="size-4 rounded-full border border-[var(--text-muted)] flex-shrink-0" />
          ) : (
            <CheckCircle2 size={14} className="text-[var(--success)] flex-shrink-0" />
          )}
          <span className={`text-xs flex-1 ${sub.status === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>
            {sub.title}
          </span>
        </div>
      ))}
    </div>
  );
}

function TaskItem({ task, tab, onStartTimer, onView }: { task: Task; tab: TabType; onStartTimer: (id: string) => void; onView: (task: Task) => void }) {
  const completeTask = useTaskStore(s => s.completeTask);
  const restoreTask = useTaskStore(s => s.restoreTask);
  const removeTask = useTaskStore(s => s.removeTask);
  const timer = useTaskStore(s => s.timer);
  const tasks = useTaskStore(s => s.tasks);
  const canStartTask = useTaskStore(s => s.canStartTask);
  const hasChildren = useTaskStore(s => s.hasChildren);
  const timezone = useSettingsStore(s => s.timezone);
  const templates = useTemplateStore(s => s.templates);
  const [expanded, setExpanded] = useState(false);

  const isTimerActive = (timer.taskId === task.id) && (timer.isRunning || timer.isPaused);
  const qConfig = QUADRANT_LABELS[task.quadrant];
  const hasChildTasks = hasChildren(task.id);
  const childCount = tasks.filter(t => t.parentId === task.id).length;
  const childDone = tasks.filter(t => t.parentId === task.id && t.status === 'done').length;
  const canStart = canStartTask(task.id);
  const hasDeps = (task.dependsOn?.length || 0) > 0;
  const depsBlocked = hasDeps && !canStart;
  // Timer only on leaf tasks (no children) or parent tasks without children
  const isTimerRunnable = !hasChildTasks && canStart;
  const effectiveGroupId = task.groupTemplateId || ((task.templateId && templates.find(t => t.id === task.templateId)?.templateType === 'group') ? task.templateId : undefined);
  const groupTemplate = effectiveGroupId ? templates.find(t => t.id === effectiveGroupId) : null;

  const { swipeState, handlers } = useSwipeGesture({
    threshold: 80,
    onSwipeLeft: tab === 'pending' ? () => completeTask(task.id) : undefined,
  });

  const deadlineInfo = task.deadline ? formatTimeRemaining(task.deadline, timezone) : null;
  const deadlineDisplay = task.deadline ? formatDeadlineDisplay(task.deadline, timezone) : null;

  return (
    <div className="relative overflow-hidden rounded-xl mb-2"
      style={{
        transform: swipeState.isSwiping ? `translateX(${swipeState.offsetX}px)` : 'translateX(0)',
        transition: swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
      }}>
      {tab === 'pending' && (
        <div className="absolute inset-0 bg-[rgba(52,211,153,0.2)] flex items-center justify-end pr-6 rounded-xl">
          <CheckCircle2 size={24} className="text-[var(--success)]" />
        </div>
      )}

      <div {...handlers}
        className={`relative flex flex-col rounded-xl transition-colors ${
          isTimerActive ? 'bg-[var(--accent-dim)] border border-[var(--border-accent)]'
            : depsBlocked ? 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] opacity-60'
            : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
        } ${tab === 'done' ? 'opacity-70' : ''}`}>
        <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: qConfig.color }} />

        <div className="flex items-start gap-2.5 px-4 py-3 pl-5">
          {tab === 'pending' && (
            <div className="text-[var(--text-muted)] cursor-grab active:cursor-grabbing touch-none mt-1"><GripVertical size={14} /></div>
          )}

          {tab === 'pending' && (
            <button onClick={() => completeTask(task.id)}
              className="size-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 active:scale-90 mt-0.5"
              style={{ borderColor: qConfig.color }} aria-label="Hoàn thành" />
          )}
          {tab === 'done' && (
            <div className="size-6 rounded-full bg-[rgba(52,211,153,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 size={14} className="text-[var(--success)]" />
            </div>
          )}
          {tab === 'overdue' && (
            <div className="size-6 rounded-full bg-[rgba(248,113,113,0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={12} className="text-[var(--error)]" />
            </div>
          )}

          {/* Main content - clickable to VIEW (not edit) */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onView(task)}>
            <p className={`text-sm font-medium leading-relaxed break-words ${tab === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
              {depsBlocked && <Lock size={10} className="inline-block mr-1 text-[var(--warning)]" />}
              {task.title}
            </p>
            {groupTemplate && (
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                Thuộc nhóm: <span className="text-[var(--accent-primary)] font-medium">{groupTemplate.title}</span>
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] font-medium flex items-center gap-0.5" style={{ color: qConfig.color }}>
                {qConfig.icon} {qConfig.label}
              </span>
              {groupTemplate && (
                <span className="text-[10px] text-[var(--accent-primary)] bg-[rgba(0,229,204,0.10)] border border-[rgba(0,229,204,0.18)] px-1.5 py-0.5 rounded-full">
                  {groupTemplate.title}
                </span>
              )}
              {task.recurring.type !== 'none' && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--info)]"><RotateCcw size={9} /> {RECURRING_LABELS[task.recurring.type]}</span>
              )}
              {deadlineDisplay && (
                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${deadlineInfo?.urgent ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}>
                  <Calendar size={9} /> {deadlineDisplay}
                </span>
              )}
              {deadlineInfo && !deadlineInfo.overdue && (
                <span className={`text-[10px] font-mono tabular-nums ${deadlineInfo.urgent ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}>({deadlineInfo.text})</span>
              )}
              {task.duration && task.duration > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--text-muted)] font-mono tabular-nums"><Clock size={9} /> {formatDuration(task.duration)}</span>
              )}
              {task.finance && (
                <span className={`flex items-center gap-0.5 text-[10px] font-medium font-mono ${task.finance.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  <DollarSign size={9} /> {task.finance.type === 'income' ? '+' : '-'}{task.finance.amount.toLocaleString('vi-VN')}đ
                </span>
              )}
              {task.xpReward && task.xpReward > 0 && (
                <span className="text-[10px] text-[var(--accent-primary)] font-mono">+{task.xpReward}XP</span>
              )}
              {hasChildTasks && (
                <button onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
                  className="flex items-center gap-0.5 text-[10px] text-[var(--info)]">
                  <ListTree size={9} /> {childDone}/{childCount}
                  {expanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
                </button>
              )}
              {hasDeps && (
                <span className="flex items-center gap-0.5 text-[10px] text-[var(--warning)]"><Link2 size={9} /> Phụ thuộc</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {(tab === 'pending') && isTimerRunnable && !isTimerActive && (
              <button onClick={() => onStartTimer(task.id)}
                className="size-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent-primary)] active:opacity-70" aria-label="Bắt đầu">
                <Play size={16} fill="currentColor" />
              </button>
            )}
            {(tab === 'done' || tab === 'overdue') && (
              <>
                <button onClick={() => restoreTask(task.id)} className="size-9 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] active:opacity-70"><Undo2 size={16} /></button>
                <button onClick={() => removeTask(task.id)} className="size-9 rounded-lg bg-[rgba(248,113,113,0.1)] flex items-center justify-center text-[var(--error)] active:opacity-70"><Trash2 size={14} /></button>
              </>
            )}
          </div>
        </div>

        {expanded && hasChildTasks && <SubtaskList parentId={task.id} />}
      </div>
    </div>
  );
}

export function TaskList() {
  const tasks = useTaskStore(s => s.tasks);
  const templates = useTemplateStore(s => s.templates);
  const activeTab = useTaskStore(s => s.activeTab);
  const setActiveTab = useTaskStore(s => s.setActiveTab);
  const startTimer = useTaskStore(s => s.startTimer);
  const reorderTasks = useTaskStore(s => s.reorderTasks);
  const timer = useTaskStore(s => s.timer);
  const searchQuery = useTaskStore(s => s.searchQuery);
  const setSearchQuery = useTaskStore(s => s.setSearchQuery);
  const [quadrantFilter, setQuadrantFilter] = useState<EisenhowerQuadrant | 'all'>('all');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  const query = searchQuery.toLowerCase().trim();

  const filteredTasks = tasks
    .filter((t) => {
      if (t.parentId) return false;
      if (query && !t.title.toLowerCase().includes(query)) return false;
      if (activeTab === 'pending') {
        if (t.status !== 'pending' && t.status !== 'in_progress') return false;
        if (quadrantFilter !== 'all' && t.quadrant !== quadrantFilter) return false;
        return true;
      }
      if (activeTab === 'done') return t.status === 'done';
      return t.status === 'overdue';
    })
    .sort((a, b) => {
      if (activeTab === 'pending') {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
        const qOrder: Record<EisenhowerQuadrant, number> = { do_first: 0, schedule: 1, delegate: 2, eliminate: 3 };
        const qDiff = qOrder[a.quadrant] - qOrder[b.quadrant];
        if (qDiff !== 0) return qDiff;
        return a.order - b.order;
      }
      return (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt);
    });

  const getEffectiveGroupTemplateId = useCallback((t: Task) => {
    if (t.groupTemplateId) return t.groupTemplateId;
    if (!t.templateId) return undefined;
    const tmpl = templates.find(x => x.id === t.templateId);
    if (tmpl?.templateType === 'group') return tmpl.id;
    return undefined;
  }, [templates]);

  const groupStats = useCallback((groupTemplateId: string) => {
    const groupTasks = tasks.filter(t => !t.parentId && getEffectiveGroupTemplateId(t) === groupTemplateId);
    const total = groupTasks.length;
    const done = groupTasks.filter(t => t.status === 'done').length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
  }, [tasks, getEffectiveGroupTemplateId]);

  const groupedForRender = useMemo(() => {
    const groups: { groupTemplateId: string; items: Task[] }[] = [];
    const singles: Task[] = [];
    const seen = new Map<string, number>(); // groupId -> index

    filteredTasks.forEach(t => {
      const effectiveGroupId = getEffectiveGroupTemplateId(t);
      if (!effectiveGroupId) {
        singles.push(t);
        return;
      }
      const idx = seen.get(effectiveGroupId);
      if (idx === undefined) {
        seen.set(effectiveGroupId, groups.length);
        groups.push({ groupTemplateId: effectiveGroupId, items: [t] });
      } else {
        groups[idx].items.push(t);
      }
    });

    return { groups, singles };
  }, [filteredTasks, getEffectiveGroupTemplateId]);

  const pendingCount = tasks.filter(t => (t.status === 'pending' || t.status === 'in_progress') && !t.parentId).length;
  const doneCount = tasks.filter(t => t.status === 'done' && !t.parentId).length;
  const overdueCount = tasks.filter(t => t.status === 'overdue' && !t.parentId).length;

  const handleStartTimer = useCallback((taskId: string) => {
    if (timer.isRunning || timer.isPaused) return;
    startTimer(taskId);
  }, [timer.isRunning, timer.isPaused, startTimer]);

  const pendingRootsOrdered = useMemo(() => {
    if (activeTab !== 'pending') return [];
    return filteredTasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  }, [activeTab, filteredTasks]);

  const handleDragStart = (taskId: string) => setDragTaskId(taskId);
  const handleDragOver = (e: React.DragEvent, taskId: string) => { e.preventDefault(); setDragOverTaskId(taskId); };
  const handleDrop = (taskId: string) => {
    if (activeTab !== 'pending') return;
    if (!dragTaskId || dragTaskId === taskId) {
      setDragTaskId(null); setDragOverTaskId(null);
      return;
    }
    const fromIndex = pendingRootsOrdered.findIndex(t => t.id === dragTaskId);
    const toIndex = pendingRootsOrdered.findIndex(t => t.id === taskId);
    if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) reorderTasks(fromIndex, toIndex);
    setDragTaskId(null); setDragOverTaskId(null);
  };
  const handleDragEnd = () => { setDragTaskId(null); setDragOverTaskId(null); };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: 'Cần làm', count: pendingCount },
    { key: 'done', label: 'Hoàn thành', count: doneCount },
    { key: 'overdue', label: 'Quá hạn', count: overdueCount },
  ];

  const quadrantFilters: { key: EisenhowerQuadrant | 'all'; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'do_first', label: '🔴 Làm ngay' },
    { key: 'schedule', label: '🔵 Lên lịch' },
    { key: 'delegate', label: '🟡 Ủy thác' },
    { key: 'eliminate', label: '⚪ Loại bỏ' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1 p-1 bg-[var(--bg-elevated)] rounded-xl flex-1">
          {tabs.map(({ key, label, count }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                activeTab === key ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'
              }`}>
              {label}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${
                  activeTab === key
                    ? key === 'overdue' ? 'bg-[rgba(248,113,113,0.2)] text-[var(--error)]' : 'bg-[rgba(0,229,204,0.2)] text-[var(--accent-primary)]'
                    : 'bg-[var(--bg-base)] text-[var(--text-muted)]'
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => setShowSearch(!showSearch)}
          className={`size-11 rounded-xl flex items-center justify-center ${showSearch ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)]' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
          <Search size={16} />
        </button>
      </div>

      {showSearch && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm việc..." autoFocus
            className="w-full bg-[var(--bg-elevated)] rounded-xl pl-9 pr-9 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] min-h-[40px]" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><X size={14} /></button>
          )}
        </div>
      )}

      {activeTab === 'pending' && pendingCount > 0 && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
          {quadrantFilters.map(({ key, label }) => (
            <button key={key} onClick={() => setQuadrantFilter(key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium min-h-[32px] ${
                quadrantFilter === key
                  ? 'bg-[rgba(0,229,204,0.15)] text-[var(--accent-primary)] border border-[var(--border-accent)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-transparent'
              }`}>{label}</button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-32 -mx-1 px-1">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
              {activeTab === 'pending' && <span className="text-2xl">📋</span>}
              {activeTab === 'done' && <span className="text-2xl">✅</span>}
              {activeTab === 'overdue' && <span className="text-2xl">⏰</span>}
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-1">
              {query ? 'Không tìm thấy việc nào' : activeTab === 'pending' ? 'Chưa có việc nào' : activeTab === 'done' ? 'Chưa hoàn thành việc nào' : 'Không có việc quá hạn'}
            </p>
          </div>
        ) : (
          <>
            {groupedForRender.groups.map(g => {
              const tmpl = templates.find(t => t.id === g.groupTemplateId);
              const stats = groupStats(g.groupTemplateId);
              return (
                <div key={g.groupTemplateId} className="mb-3">
                  <div className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          {tmpl?.title || 'Nhóm việc'}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {stats.done}/{stats.total} việc đơn • {stats.percent}%
                        </p>
                      </div>
                      <div className="text-xs font-bold text-[var(--accent-primary)] tabular-nums">
                        {stats.percent}%
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-surface)] mt-2 overflow-hidden">
                      <div className="h-full bg-[var(--accent-primary)]" style={{ width: `${stats.percent}%` }} />
                    </div>
                  </div>

                  {g.items.map((task) => {
                    return (
                      <div key={task.id} draggable={activeTab === 'pending'}
                        onDragStart={() => handleDragStart(task.id)} onDragOver={(e) => handleDragOver(e, task.id)}
                        onDrop={() => handleDrop(task.id)} onDragEnd={handleDragEnd}
                        className={`transition-all ${dragTaskId === task.id ? 'opacity-40 scale-95' : ''} ${dragOverTaskId === task.id && dragTaskId !== task.id ? 'border-t-2 border-[var(--accent-primary)]' : ''}`}>
                        <TaskItem task={task} tab={activeTab} onStartTimer={handleStartTimer} onView={setViewingTask} />
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {groupedForRender.singles.map((task) => {
              return (
                <div key={task.id} draggable={activeTab === 'pending'}
                  onDragStart={() => handleDragStart(task.id)} onDragOver={(e) => handleDragOver(e, task.id)}
                  onDrop={() => handleDrop(task.id)} onDragEnd={handleDragEnd}
                  className={`transition-all ${dragTaskId === task.id ? 'opacity-40 scale-95' : ''} ${dragOverTaskId === task.id && dragTaskId !== task.id ? 'border-t-2 border-[var(--accent-primary)]' : ''}`}>
                  <TaskItem task={task} tab={activeTab} onStartTimer={handleStartTimer} onView={setViewingTask} />
                </div>
              );
            })}
          </>
        )}
      </div>

      {viewingTask && (
        <TaskViewModal task={viewingTask} onClose={() => setViewingTask(null)}
          onEdit={() => { setEditingTask(viewingTask); setViewingTask(null); }} />
      )}
      {editingTask && <TaskEditModal task={editingTask} onClose={() => setEditingTask(null)} />}
    </div>
  );
}
