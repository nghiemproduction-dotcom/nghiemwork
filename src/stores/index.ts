import { create } from 'zustand';
import type {
  Task, ChatMessage, TimerState, TabType, PageType,
  EisenhowerQuadrant, RecurringConfig, UserProfile,
  GamificationState, NotificationSettings, Reward,
  TaskTemplate, MediaBlock, TaskFinance, Achievement,
  PomodoroSettings, DailyHealthEntry,
} from '@/types';
import { calculateLevel, checkAchievement, getDefaultGamificationState } from '@/lib/gamification';
import { getNowInTimezone } from '@/lib/notifications';
import { getNextRecurrence } from '@/lib/recurrence';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getUserKey(base: string, userId?: string): string {
  if (userId) return `${base}_${userId}`;
  return base;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch { return fallback; }
  }
  return fallback;
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

// ──────────── TIMER STATE PERSISTENCE ────────────
const TIMER_STATE_KEY = 'nw_timer_state';

// ──────────── AUTH STORE ────────────
interface AuthStore {
  user: { id: string; email: string; username: string } | null;
  isLoading: boolean;
  setUser: (user: { id: string; email: string; username: string } | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}


export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));

// ──────────── TASK STORE ────────────
interface TaskStore {
  tasks: Task[];
  deletedTasks: Task[]; // Trash/Recycle bin
  activeTab: TabType;
  timer: TimerState;
  searchQuery: string;
  _userId: string | undefined;
  initForUser: (userId?: string) => void;
  setActiveTab: (tab: TabType) => void;
  setSearchQuery: (q: string) => void;
  addTask: (title: string, quadrant?: EisenhowerQuadrant, deadline?: number, recurring?: RecurringConfig, deadlineDate?: string, deadlineTime?: string, parentId?: string, media?: MediaBlock[], finance?: TaskFinance, templateId?: string, xpReward?: number, groupTemplateId?: string, topic?: string) => string;
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'quadrant' | 'deadline' | 'recurring' | 'notes' | 'deadlineDate' | 'deadlineTime' | 'finance' | 'parentId' | 'dependsOn' | 'xpReward' | 'groupTemplateId' | 'templateId' | 'topic'>>) => void;
  removeTask: (id: string) => void; // Move to trash
  deletePermanently: (id: string) => void; // Delete from trash
  restoreFromTrash: (id: string) => void; // Restore from trash
  clearTrash: () => void; // Empty trash
  completeTask: (id: string, duration?: number) => void;
  restoreTask: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
  clearAllData: () => void;
  markOverdue: () => void;
  startTask: (id: string) => void;
  getSubtasks: (parentId: string) => Task[];
  addSubtask: (parentId: string, title: string, quadrant?: EisenhowerQuadrant) => string;
  assignAsSubtask: (taskId: string, parentId: string) => void;
  unassignSubtask: (taskId: string) => void;
  canStartTask: (taskId: string) => boolean;
  hasChildren: (taskId: string) => boolean;
  // Counters for 4 quadrants
  getQuadrantCounts: () => { do_first: number; schedule: number; delegate: number; eliminate: number; };
}

// ──────────── TIMER PERSISTENCE ────────────

// Save timer state to localStorage for persistence across reloads / app kills
function saveTimerState(timer: TimerState) {
  try {
    const key = getUserKey('nw_timer_state', useTaskStore.getState()._userId);
    localStorage.setItem(key, JSON.stringify({
      ...timer,
      savedAt: Date.now()
    }));
  } catch {
    // Ignore save errors
  }
}

// Load timer state from localStorage.
// Accepts an explicit userId so it works inside initForUser (before _userId is set).
function loadTimerState(userIdOverride?: string): TimerState | null {
  try {
    const userId = userIdOverride !== undefined
      ? userIdOverride
      : useTaskStore.getState()._userId;
    const key = getUserKey('nw_timer_state', userId);
    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const data = JSON.parse(saved);

    // If timer was running, recalculate elapsed from wall clock
    // so the timer "catches up" after the app was killed / closed.
    if (data.isRunning && !data.isPaused && data.startTime) {
      const totalElapsed = Math.floor((Date.now() - data.startTime) / 1000);
      const elapsed = totalElapsed - (data.totalPausedDuration || 0);
      return {
        ...data,
        elapsed: Math.max(0, elapsed),
        savedAt: undefined
      };
    }

    return {
      ...data,
      savedAt: undefined
    };
  } catch {
    return null;
  }
}

// Clear saved timer state
function clearTimerState() {
  try {
    const key = getUserKey('nw_timer_state', useTaskStore.getState()._userId);
    localStorage.removeItem(key);
  } catch {
    // Ignore clear errors
  }
}

// ── Visibility change: save state going to bg, recalculate coming back ──
let visibilityChangeHandler: (() => void) | null = null;

if (typeof document !== 'undefined') {
  visibilityChangeHandler = () => {
    // Guard: store may not be initialized yet at module load time.
    // useTaskStore is defined below; this listener fires later so it's safe.
    try {
      const timer = useTaskStore.getState().timer;
      if (document.hidden) {
        if ((timer.isRunning || timer.isPaused) && timer.startTime) {
          saveTimerState(timer);
        }
      } else {
        // Recalculate elapsed from wall clock immediately when the tab
        // becomes visible, so the UI shows the correct value right away.
        if (timer.isRunning && !timer.isPaused && timer.startTime) {
          useTaskStore.getState().tickTimer();
        }
      }
    } catch {
      // Store not ready yet — ignore
    }
  };
  
  document.addEventListener('visibilitychange', visibilityChangeHandler);
}

// ── Page unload: persist timer so it survives app kill / refresh ──
let beforeUnloadHandler: (() => void) | null = null;

if (typeof window !== 'undefined') {
  beforeUnloadHandler = () => {
    try {
      const timer = useTaskStore.getState().timer;
      if ((timer.isRunning || timer.isPaused) && timer.startTime) {
        saveTimerState(timer);
      }
    } catch {
      // Store not ready yet — ignore
    }
  };
  
  window.addEventListener('beforeunload', beforeUnloadHandler);
}

const defaultTimer: TimerState = {
  taskId: null, isRunning: false, isPaused: false, elapsed: 0,
  startTime: null, pausedAt: null, totalPausedDuration: 0,
  pomodoroSession: 0, pomodoroPhase: 'none',
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: loadFromStorage<Task[]>('nw_tasks', []),
  deletedTasks: loadFromStorage<Task[]>('nw_deleted_tasks', []), // Trash
  activeTab: 'pending',
  timer: { ...defaultTimer },
  searchQuery: '',
  _userId: undefined,

  initForUser: (userId) => {
    const key = getUserKey('nw_tasks', userId);
    const tasks = loadFromStorage<Task[]>(key, []);
    
    // Try to restore timer state (pass userId explicitly since _userId
    // isn't set yet at this point in the store lifecycle).
    const savedTimer = loadTimerState(userId);
    const timer = savedTimer || { ...defaultTimer };
    
    set({ tasks, _userId: userId, timer });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  addTask: (title, quadrant = 'do_first', deadline, recurring = { type: 'none' }, deadlineDate, deadlineTime, parentId, _media, finance, templateId, xpReward, groupTemplateId, topic) => {
    const tasks = get().tasks;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
    const id = generateId();
    const newTask: Task = {
      id, title, status: 'pending', quadrant,
      createdAt: Date.now(), deadline, deadlineDate, deadlineTime,
      order: pendingTasks.length,
      recurring: recurring || { type: 'none' },
      recurringLabel: recurring && recurring.type !== 'none' ? title : undefined,
      parentId, finance, templateId, xpReward, groupTemplateId, topic,
    };

    let updated = [...tasks, newTask];
    if (parentId) {
      updated = updated.map(t => {
        if (t.id === parentId) {
          return { ...t, children: [...(t.children || []), id] };
        }
        return t;
      });
    }

    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    set({ tasks: updated });
    return id;
  },

  updateTask: (id, updates) => {
    const timezone = useSettingsStore.getState().timezone;
    const now = getNowInTimezone(timezone);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000;

    const updated = get().tasks.map(t => {
      if (t.id !== id) return t;
      
      let newUpdates = { ...updates };
      
      // Smart quadrant logic: If deadline is moved to another day
      if (updates.deadline !== undefined && t.quadrant === 'do_first') {
        const newDeadline = updates.deadline;
        // If new deadline is not today, automatically change to 'schedule'
        if (newDeadline && (newDeadline < todayStart || newDeadline >= todayEnd)) {
          newUpdates = { ...newUpdates, quadrant: 'schedule' };
        }
        // If no deadline is set for a do_first task, change to schedule
        if (!newDeadline) {
          newUpdates = { ...newUpdates, quadrant: 'schedule' };
        }
      }
      
      return { ...t, ...newUpdates };
    });
    
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    set({ tasks: updated });
  },

  removeTask: (id) => {
    // Move task to trash instead of permanently deleting
    const tasks = get().tasks;
    const taskToRemove = tasks.find(t => t.id === id);
    if (!taskToRemove) return;
    
    const idsToRemove = new Set<string>();
    const collectIds = (taskId: string) => {
      idsToRemove.add(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task?.children) {
        task.children.forEach(childId => collectIds(childId));
      }
    };
    collectIds(id);

    const tasksToTrash = tasks.filter(t => idsToRemove.has(t.id));
    let updated = tasks.filter(t => !idsToRemove.has(t.id));
    
    if (taskToRemove?.parentId) {
      updated = updated.map(t => {
        if (t.id === taskToRemove.parentId) {
          return { ...t, children: (t.children || []).filter(cid => cid !== id) };
        }
        return t;
      });
    }
    // Remove from dependsOn of other tasks
    updated = updated.map(t => {
      if (t.dependsOn?.includes(id)) {
        return { ...t, dependsOn: t.dependsOn.filter(d => d !== id) };
      }
      return t;
    });

    // Add to trash with deletedAt timestamp
    const trashedTasks = tasksToTrash.map(t => ({ ...t, deletedAt: Date.now() }));
    const newDeletedTasks = [...get().deletedTasks, ...trashedTasks];

    const key = getUserKey('nw_tasks', get()._userId);
    const trashKey = getUserKey('nw_deleted_tasks', get()._userId);
    saveToStorage(key, updated);
    saveToStorage(trashKey, newDeletedTasks);
    set({ tasks: updated, deletedTasks: newDeletedTasks });
  },

  deletePermanently: (id) => {
    const updated = get().deletedTasks.filter(t => t.id !== id);
    const trashKey = getUserKey('nw_deleted_tasks', get()._userId);
    saveToStorage(trashKey, updated);
    set({ deletedTasks: updated });
  },

  restoreFromTrash: (id) => {
    const taskToRestore = get().deletedTasks.find(t => t.id === id);
    if (!taskToRestore) return;
    
    const { deletedAt, ...restoredTask } = taskToRestore;
    const updatedTrash = get().deletedTasks.filter(t => t.id !== id);
    const updatedTasks = [...get().tasks, restoredTask];
    
    const key = getUserKey('nw_tasks', get()._userId);
    const trashKey = getUserKey('nw_deleted_tasks', get()._userId);
    saveToStorage(key, updatedTasks);
    saveToStorage(trashKey, updatedTrash);
    set({ tasks: updatedTasks, deletedTasks: updatedTrash });
  },

  clearTrash: () => {
    const trashKey = getUserKey('nw_deleted_tasks', get()._userId);
    localStorage.removeItem(trashKey);
    set({ deletedTasks: [] });
  },

  completeTask: (id, duration) => {
    const timer = get().timer;
    const timerElapsed = timer.taskId === id ? timer.elapsed : 0;
    const finalDuration = duration || timerElapsed || 0;

    const updated = get().tasks.map(t =>
      t.id === id ? {
        ...t,
        status: 'done' as const,
        completedAt: Date.now(),
        duration: (t.duration || 0) + finalDuration,
      } : t
    );
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);

    if (timer.taskId === id) {
      set({ tasks: updated, timer: { ...defaultTimer } });
    } else {
      set({ tasks: updated });
    }

    const completedTask = updated.find(t => t.id === id);
    const timezone = loadFromStorage<string>('nw_timezone', 'Asia/Ho_Chi_Minh');
    if (completedTask) {
      const gamStore = useGamificationStore.getState();
      const xpFromTemplate = completedTask.xpReward || 0;
      gamStore.onTaskCompleted(completedTask.quadrant, finalDuration, timezone, xpFromTemplate);

      // Record health data if template has healthMetrics
      if (completedTask.templateId) {
        const templateStore = useTemplateStore.getState();
        const template = templateStore.templates.find(t => t.id === completedTask.templateId);
        if (template?.healthMetrics && Object.keys(template.healthMetrics).length > 0) {
          const healthStore = useHealthStore.getState();
          healthStore.addEntry({
            weight: template.healthMetrics.weight,
            waist: template.healthMetrics.waist,
            water: template.healthMetrics.water,
            calories: template.healthMetrics.calories,
            taskId: completedTask.id,
            taskTitle: completedTask.title,
          });
        }
      }

      if (completedTask.recurring?.type !== 'none') {
        const next = getNextRecurrence(completedTask.recurring, Date.now(), timezone);
        if (next) {
          get().addTask(
            completedTask.recurringLabel ?? completedTask.title,
            completedTask.quadrant,
            next.deadline,
            completedTask.recurring,
            next.deadlineDate,
            next.deadlineTime,
            undefined,
            undefined,
            completedTask.finance,
            completedTask.templateId,
            completedTask.xpReward,
            completedTask.groupTemplateId
          );
        }
      }
    }
  },

  restoreTask: (id) => {
    const updated = get().tasks.map(t =>
      t.id === id ? { ...t, status: 'pending' as const, completedAt: undefined } : t
    );
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    set({ tasks: updated });
  },

  reorderTasks: (fromIndex, toIndex) => {
    const tasks = [...get().tasks];
    const pending = tasks.filter(t => (t.status === 'pending' || t.status === 'in_progress') && !t.parentId).sort((a, b) => a.order - b.order);
    if (fromIndex < 0 || fromIndex >= pending.length || toIndex < 0 || toIndex >= pending.length) return;
    const [moved] = pending.splice(fromIndex, 1);
    pending.splice(toIndex, 0, moved);
    pending.forEach((t, i) => { t.order = i; });
    const rest = tasks.filter(t => (t.status !== 'pending' && t.status !== 'in_progress') || t.parentId);
    const updated = [...pending, ...rest];
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    set({ tasks: updated });
  },

  startTask: (id) => {
    const updated = get().tasks.map(t =>
      t.id === id ? { ...t, status: 'in_progress' as const } : t
    );
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    set({ tasks: updated });
  },

  startTimer: (taskId) => {
    const pomodoroSettings = useSettingsStore.getState().pomodoroSettings;
    const updated = get().tasks.map(t =>
      t.id === taskId ? { ...t, status: 'in_progress' as const } : t
    );
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    
    const newTimer: TimerState = {
      taskId, isRunning: true, isPaused: false, elapsed: 0,
      startTime: Date.now(), pausedAt: null, totalPausedDuration: 0,
      pomodoroSession: pomodoroSettings.enabled ? 1 : 0,
      pomodoroPhase: pomodoroSettings.enabled ? 'work' : 'none',
    };
    
    set({
      tasks: updated,
      timer: newTimer,
    });
    
    // Save timer state immediately
    saveTimerState(newTimer);
  },

  pauseTimer: () => {
    const timer = get().timer;
    if (timer.isRunning && !timer.isPaused) {
      set({ timer: { ...timer, isPaused: true, isRunning: false, pausedAt: Date.now() } });
    }
  },

  resumeTimer: () => {
    const timer = get().timer;
    if (timer.isPaused && timer.pausedAt) {
      const pausedDuration = Math.floor((Date.now() - timer.pausedAt) / 1000);
      set({ timer: { ...timer, isPaused: false, isRunning: true, pausedAt: null, totalPausedDuration: timer.totalPausedDuration + pausedDuration } });
    }
  },

  stopTimer: () => {
    const timer = get().timer;
    if (timer.taskId) {
      const updated = get().tasks.map(t =>
        t.id === timer.taskId && t.status === 'in_progress' ? { ...t, status: 'pending' as const } : t
      );
      const key = getUserKey('nw_tasks', get()._userId);
      saveToStorage(key, updated);
      set({ tasks: updated, timer: { ...defaultTimer } });
      clearTimerState();
    } else {
      set({ timer: { ...defaultTimer } });
      clearTimerState();
    }
  },

  tickTimer: () => {
    const timer = get().timer;
    if (timer.isRunning && timer.startTime && !timer.isPaused) {
      const totalElapsed = Math.floor((Date.now() - timer.startTime) / 1000);
      const elapsed = totalElapsed - timer.totalPausedDuration;
      const newTimer = { ...timer, elapsed };
      set({ timer: newTimer });
      
      // Save timer state every 30 seconds instead of 10 to reduce I/O
      if (elapsed % 30 === 0) {
        saveTimerState(newTimer);
      }
    }
  },

  clearAllData: () => {
    const userId = get()._userId;
    localStorage.removeItem(getUserKey('nw_tasks', userId));
    localStorage.removeItem(getUserKey('nw_chat', userId));
    localStorage.removeItem(getUserKey('nw_gamification', userId));
    localStorage.removeItem(getUserKey('nw_templates', userId));
    localStorage.removeItem('nw_settings');
    set({ tasks: [], timer: { ...defaultTimer } });
  },

  markOverdue: () => {
    const timezone = useSettingsStore.getState().timezone;
    const now = getNowInTimezone(timezone).getTime();
    let changed = false;
    const updated = get().tasks.map(t => {
      if ((t.status === 'pending') && t.deadline && t.deadline < now) {
        changed = true;
        return { ...t, status: 'overdue' as const };
      }
      return t;
    });
    if (changed) {
      const key = getUserKey('nw_tasks', get()._userId);
      saveToStorage(key, updated);
      set({ tasks: updated });
    }
  },

  getSubtasks: (parentId) => {
    return get().tasks.filter(t => t.parentId === parentId).sort((a, b) => a.order - b.order);
  },

  addSubtask: (parentId, title, quadrant = 'do_first') => {
    return get().addTask(title, quadrant, undefined, { type: 'none' }, undefined, undefined, parentId);
  },

  assignAsSubtask: (taskId, parentId) => {
    const updated = get().tasks.map(t => {
      if (t.id === taskId) return { ...t, parentId };
      if (t.id === parentId) return { ...t, children: [...(t.children || []), taskId] };
      return t;
    });
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    set({ tasks: updated });
  },

  unassignSubtask: (taskId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task?.parentId) return;
    const parentId = task.parentId;
    const updated = get().tasks.map(t => {
      if (t.id === taskId) return { ...t, parentId: undefined };
      if (t.id === parentId) return { ...t, children: (t.children || []).filter(c => c !== taskId) };
      return t;
    });
    const key = getUserKey('nw_tasks', get()._userId);
    saveToStorage(key, updated);
    set({ tasks: updated });
  },

  canStartTask: (taskId) => {
    const tasks = get().tasks;
    const task = tasks.find(t => t.id === taskId);
    if (!task?.dependsOn || task.dependsOn.length === 0) return true;
    return task.dependsOn.every(depId => {
      const dep = tasks.find(t => t.id === depId);
      return dep?.status === 'done';
    });
  },

  hasChildren: (taskId) => {
    return get().tasks.some(t => t.parentId === taskId);
  },

  getQuadrantCounts: () => {
    const tasks = get().tasks.filter(t => t.status !== 'done' && !t.deletedAt);
    return {
      do_first: tasks.filter(t => t.quadrant === 'do_first').length,
      schedule: tasks.filter(t => t.quadrant === 'schedule').length,
      delegate: tasks.filter(t => t.quadrant === 'delegate').length,
      eliminate: tasks.filter(t => t.quadrant === 'eliminate').length,
    };
  },
}));

// ──────────── TEMPLATE STORE ────────────
interface TemplateStore {
  templates: TaskTemplate[];
  _userId: string | undefined;
  initForUser: (userId?: string) => void;
  addTemplate: (template: Omit<TaskTemplate, 'id' | 'createdAt'>) => string;
  updateTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
  removeTemplate: (id: string) => void;
  createTaskFromTemplate: (templateId: string, financeOverride?: TaskFinance, quadrantOverride?: EisenhowerQuadrant) => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  _userId: undefined,

  initForUser: (userId) => {
    const key = getUserKey('nw_templates', userId);
    const templates = loadFromStorage<TaskTemplate[]>(key, []);
    set({ templates, _userId: userId });
  },

  addTemplate: (template) => {
    const id = generateId();
    const newTemplate: TaskTemplate = { ...template, id, createdAt: Date.now() };
    const updated = [...get().templates, newTemplate];
    const key = getUserKey('nw_templates', get()._userId);
    saveToStorage(key, updated);
    set({ templates: updated });
    return id;
  },

  updateTemplate: (id, updates) => {
    const updated = get().templates.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    );
    const key = getUserKey('nw_templates', get()._userId);
    saveToStorage(key, updated);
    set({ templates: updated });
  },

  removeTemplate: (id) => {
    // Remove template itself
    let updated = get().templates.filter(t => t.id !== id);
    // Clean references from any group templates that used this single template
    updated = updated.map(t => {
      if (t.subtaskTemplateIds && t.subtaskTemplateIds.length > 0) {
        const cleaned = t.subtaskTemplateIds.filter(x => x !== id);
        if (cleaned.length !== t.subtaskTemplateIds.length) {
          return { ...t, subtaskTemplateIds: cleaned };
        }
      }
      return t;
    });
    const key = getUserKey('nw_templates', get()._userId);
    saveToStorage(key, updated);
    set({ templates: updated });
  },

  createTaskFromTemplate: (templateId, financeOverride, quadrantOverride) => {
    const template = get().templates.find(t => t.id === templateId);
    if (!template) return;
    const taskStore = useTaskStore.getState();
    const allTemplates = get().templates;

    if (template.templateType === 'group' && template.subtaskTemplateIds && template.subtaskTemplateIds.length > 0) {
      // GROUP: only create child tasks (leaf tasks get all features)
      template.subtaskTemplateIds.forEach(singleId => {
        const singleTemplate = allTemplates.find(t => t.id === singleId);
        if (singleTemplate) {
          const q = quadrantOverride || singleTemplate.quadrant;
          taskStore.addTask(
            singleTemplate.title,
            q,
            undefined,
            singleTemplate.recurring,
            undefined,
            undefined,
            undefined,
            undefined,
            singleTemplate.finance,
            singleTemplate.id,
            singleTemplate.xpReward,
            templateId,
          );
        }
      });
    } else if (template.templateType === 'group' && template.subtasks && template.subtasks.length > 0) {
      // GROUP: only create child tasks (leaf tasks get all features)
      template.subtasks.forEach(sub => {
        const q = quadrantOverride || sub.quadrant;
        taskStore.addTask(
          sub.title,
          q,
          undefined,
          { type: 'none' },
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          templateId,
        );
      });
    } else {
      // SINGLE: just create one task
      const finance = financeOverride || template.finance;
      const q = quadrantOverride || template.quadrant;
      taskStore.addTask(
        template.title, q, undefined, template.recurring,
        undefined, undefined, undefined, undefined, finance, templateId, template.xpReward,
      );
    }
  },
}));

// ──────────── CHAT STORE ────────────
interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  initForUser: (userId?: string) => void;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
  _userId: string | undefined;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: loadFromStorage<ChatMessage[]>('nw_chat', []),
  isLoading: false,
  _userId: undefined,

  initForUser: (userId) => {
    const key = getUserKey('nw_chat', userId);
    const messages = loadFromStorage<ChatMessage[]>(key, []);
    set({ messages, _userId: userId });
  },

  addMessage: (role, content) => {
    const msg: ChatMessage = { id: generateId(), role, content, timestamp: Date.now() };
    const updated = [...get().messages, msg];
    const key = getUserKey('nw_chat', get()._userId);
    saveToStorage(key, updated);
    set({ messages: updated });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  clearChat: () => {
    const key = getUserKey('nw_chat', get()._userId);
    localStorage.removeItem(key);
    set({ messages: [] });
  },
}));

// ──────────── GAMIFICATION STORE ────────────
interface GamificationStore {
  state: GamificationState;
  _userId: string | undefined;
  initForUser: (userId?: string) => void;
  onTaskCompleted: (quadrant: EisenhowerQuadrant, duration: number, timezone: string, bonusXp?: number) => void;
  claimReward: (rewardId: string) => void;
  addCustomReward: (reward: Omit<Reward, 'id' | 'claimed'>) => void;
  removeReward: (rewardId: string) => void;
  updateReward: (rewardId: string, updates: Partial<Omit<Reward, 'id'>>) => void;
  addCustomAchievement: (achievement: Omit<Achievement, 'id' | 'unlockedAt'>) => void;
  removeAchievement: (achievementId: string) => void;
  updateAchievement: (achievementId: string, updates: Partial<Omit<Achievement, 'id'>>) => void;
  unlockAchievement: (achievementId: string) => void;
  _save: () => void;
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  state: getDefaultGamificationState(),
  _userId: undefined,

  initForUser: (userId) => {
    const key = getUserKey('nw_gamification', userId);
    const saved = loadFromStorage<GamificationState | null>(key, null);
    if (saved) {
      const defaultState = getDefaultGamificationState();
      const existingIds = new Set(saved.achievements.map(a => a.id));
      const newAchievements = defaultState.achievements.filter(a => !existingIds.has(a.id));
      saved.achievements = [...saved.achievements, ...newAchievements];
      set({ state: saved, _userId: userId });
    } else {
      set({ state: getDefaultGamificationState(), _userId: userId });
    }
  },

  _save: () => {
    const key = getUserKey('nw_gamification', get()._userId);
    saveToStorage(key, get().state);
  },

  onTaskCompleted: (quadrant, duration, timezone, bonusXp = 0) => {
    const s = { ...get().state };
    const now = getNowInTimezone(timezone);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const hour = now.getHours();

    let xpGain = 10;
    if (quadrant === 'do_first') xpGain = 20;
    else if (quadrant === 'schedule') xpGain = 15;
    else if (quadrant === 'delegate') xpGain = 10;
    else xpGain = 5;

    xpGain += bonusXp;

    s.totalTasksCompleted += 1;
    s.totalTimerSeconds += duration;
    s.xp += xpGain;

    if (hour < 9) s.earlyBirdCount += 1;

    if (s.lastActiveDate !== todayStr) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      if (s.lastActiveDate === yesterdayStr) {
        s.streak += 1;
      } else {
        s.streak = 1;
      }
      s.lastActiveDate = todayStr;
      s.activeDays += 1;
    }

    s.level = calculateLevel(s.xp);

    const tasks = useTaskStore.getState().tasks;
    const quadrantCounts = {
      do_first: tasks.filter(t => t.status === 'done' && t.quadrant === 'do_first').length,
      schedule: tasks.filter(t => t.status === 'done' && t.quadrant === 'schedule').length,
      delegate: tasks.filter(t => t.status === 'done' && t.quadrant === 'delegate').length,
      eliminate: tasks.filter(t => t.status === 'done' && t.quadrant === 'eliminate').length,
    };

    let achievementXp = 0;
    const newUnlocked: string[] = [];
    s.achievements = s.achievements.map(ach => {
      if (!ach.unlockedAt && checkAchievement(ach, s, quadrantCounts, duration)) {
        achievementXp += ach.xpReward;
        newUnlocked.push(ach.title);
        return { ...ach, unlockedAt: Date.now() };
      }
      return ach;
    });

    s.xp += achievementXp;
    s.level = calculateLevel(s.xp);
    set({ state: s });
    get()._save();
  },

  claimReward: (rewardId) => {
    const s = { ...get().state };
    const reward = s.rewards.find(r => r.id === rewardId);
    if (!reward || reward.claimed || s.xp < reward.xpCost) return;
    s.xp -= reward.xpCost;
    s.level = calculateLevel(s.xp);
    s.rewards = s.rewards.map(r =>
      r.id === rewardId ? { ...r, claimed: true, claimedAt: Date.now() } : r
    );
    set({ state: s });
    get()._save();
  },

  addCustomReward: (reward) => {
    const s = { ...get().state };
    s.rewards = [...s.rewards, { ...reward, id: `custom_${Date.now().toString(36)}`, claimed: false }];
    set({ state: s });
    get()._save();
  },

  removeReward: (rewardId) => {
    const s = { ...get().state };
    s.rewards = s.rewards.filter(r => r.id !== rewardId);
    set({ state: s });
    get()._save();
  },

  updateReward: (rewardId, updates) => {
    const s = { ...get().state };
    s.rewards = s.rewards.map(r => r.id === rewardId ? { ...r, ...updates } : r);
    set({ state: s });
    get()._save();
  },

  addCustomAchievement: (achievement) => {
    const s = { ...get().state };
    const id = `custom_ach_${Date.now().toString(36)}`;
    s.achievements = [...s.achievements, { ...achievement, id, isCustom: true }];
    set({ state: s });
    get()._save();
  },

  removeAchievement: (achievementId) => {
    const s = { ...get().state };
    s.achievements = s.achievements.filter(a => a.id !== achievementId);
    set({ state: s });
    get()._save();
  },

  updateAchievement: (achievementId, updates) => {
    const s = { ...get().state };
    s.achievements = s.achievements.map(a => a.id === achievementId ? { ...a, ...updates } : a);
    set({ state: s });
    get()._save();
  },

  unlockAchievement: (achievementId) => {
    const s = { ...get().state };
    const ach = s.achievements.find(a => a.id === achievementId);
    if (!ach || ach.unlockedAt) return;
    s.achievements = s.achievements.map(a =>
      a.id === achievementId ? { ...a, unlockedAt: Date.now() } : a
    );
    s.xp += ach.xpReward;
    s.level = calculateLevel(s.xp);
    set({ state: s });
    get()._save();
  },
}));

// ──────────── HEALTH STORE ────────────
interface HealthStore {
  entries: DailyHealthEntry[];
  _userId: string | undefined;
  initForUser: (userId?: string) => void;
  addEntry: (entry: Omit<DailyHealthEntry, 'date'> & { date?: string }) => void;
  updateEntry: (date: string, updates: Partial<DailyHealthEntry>) => void;
  getEntryForDate: (date: string) => DailyHealthEntry | undefined;
  getEntriesForRange: (startDate: string, endDate: string) => DailyHealthEntry[];
  getLatestValues: () => { weight?: number; waist?: number; water?: number; calories?: number; date?: string };
  deleteEntry: (date: string) => void;
}

export const useHealthStore = create<HealthStore>((set, get) => ({
  entries: [],
  _userId: undefined,

  initForUser: (userId) => {
    const key = getUserKey('nw_health', userId);
    const entries = loadFromStorage<DailyHealthEntry[]>(key, []);
    set({ entries, _userId: userId });
  },

  addEntry: (entry) => {
    const timezone = useSettingsStore.getState().timezone;
    const now = getNowInTimezone(timezone);
    const dateStr = entry.date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const newEntry: DailyHealthEntry = { ...entry, date: dateStr };
    
    // Remove existing entry for same date if any
    const filtered = get().entries.filter(e => e.date !== dateStr);
    const updated = [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date));
    
    const key = getUserKey('nw_health', get()._userId);
    saveToStorage(key, updated);
    set({ entries: updated });
  },

  updateEntry: (date, updates) => {
    const updated = get().entries.map(e =>
      e.date === date ? { ...e, ...updates } : e
    );
    const key = getUserKey('nw_health', get()._userId);
    saveToStorage(key, updated);
    set({ entries: updated });
  },

  getEntryForDate: (date) => {
    return get().entries.find(e => e.date === date);
  },

  getEntriesForRange: (startDate, endDate) => {
    return get().entries.filter(e => e.date >= startDate && e.date <= endDate);
  },

  getLatestValues: () => {
    const sorted = [...get().entries].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    if (!latest) return {};
    return {
      weight: latest.weight,
      waist: latest.waist,
      water: latest.water,
      calories: latest.calories,
      date: latest.date,
    };
  },

  deleteEntry: (date) => {
    const updated = get().entries.filter(e => e.date !== date);
    const key = getUserKey('nw_health', get()._userId);
    saveToStorage(key, updated);
    set({ entries: updated });
  },
}));

// ──────────── SETTINGS STORE ────────────
const defaultPomodoroSettings: PomodoroSettings = {
  enabled: false,
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};

interface SettingsStore {
  fontScale: number;
  tickSoundEnabled: boolean;
  voiceEnabled: boolean;
  currentPage: PageType;
  timezone: string;
  notificationSettings: NotificationSettings;
  pomodoroSettings: PomodoroSettings;
  orientationLock: boolean;
  setFontScale: (scale: number) => void;
  setTickSound: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setCurrentPage: (page: PageType) => void;
  setTimezone: (tz: string) => void;
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setPomodoroSettings: (settings: Partial<PomodoroSettings>) => void;
  setOrientationLock: (enabled: boolean) => void;
}

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  beforeDeadline: 15,
  dailyReminder: false,
  dailyReminderTime: '08:00',
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  fontScale: loadFromStorage<number>('nw_fontscale', 1),
  tickSoundEnabled: loadFromStorage<boolean>('nw_tick', true),
  voiceEnabled: loadFromStorage<boolean>('nw_voice', true),
  timezone: loadFromStorage<string>('nw_timezone', 'Asia/Ho_Chi_Minh'),
  notificationSettings: loadFromStorage<NotificationSettings>('nw_notifications', defaultNotificationSettings),
  pomodoroSettings: loadFromStorage<PomodoroSettings>('nw_pomodoro', defaultPomodoroSettings),
  orientationLock: loadFromStorage<boolean>('nw_orientation_lock', false),
  currentPage: 'tasks',

  setFontScale: (scale) => {
    saveToStorage('nw_fontscale', scale);
    document.documentElement.style.setProperty('--font-scale', String(scale));
    set({ fontScale: scale });
  },
  setTickSound: (enabled) => { saveToStorage('nw_tick', enabled); set({ tickSoundEnabled: enabled }); },
  setVoiceEnabled: (enabled) => { saveToStorage('nw_voice', enabled); set({ voiceEnabled: enabled }); },
  setCurrentPage: (page) => set({ currentPage: page }),
  setTimezone: (tz) => { saveToStorage('nw_timezone', tz); set({ timezone: tz }); },
  setOrientationLock: (enabled) => {
    saveToStorage('nw_orientation_lock', enabled);
    // Apply screen orientation lock using Screen Orientation API
    try {
      const scr = screen as Screen & { orientation?: { lock?: (o: string) => Promise<void>; unlock?: () => void } };
      if (enabled && scr.orientation?.lock) {
        scr.orientation.lock('landscape').catch(() => {
          // Ignore errors (not supported, not in fullscreen, etc.)
        });
      } else if (!enabled && scr.orientation?.unlock) {
        scr.orientation.unlock();
      }
    } catch {
      // API not supported
    }
    set({ orientationLock: enabled });
  },
  setNotificationSettings: (partial) => {
    set((prev) => {
      const updated = { ...prev.notificationSettings, ...partial };
      saveToStorage('nw_notifications', updated);
      return { notificationSettings: updated };
    });
  },
  setPomodoroSettings: (partial) => {
    set((prev) => {
      const updated = { ...prev.pomodoroSettings, ...partial };
      saveToStorage('nw_pomodoro', updated);
      return { pomodoroSettings: updated };
    });
  },
}));
