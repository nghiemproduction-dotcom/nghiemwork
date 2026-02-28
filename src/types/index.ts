// Eisenhower Matrix Quadrants
export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'eliminate';
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'overdue' | 'paused';
export type RecurringType = 'none' | 'hourly' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
export type TabType = 'pending' | 'done' | 'overdue';
export type PageType = 'tasks' | 'stats' | 'ai' | 'settings' | 'achievements' | 'templates';

export interface RecurringConfig {
  type: RecurringType;
  /** Cho hàng giờ/ngày/tuần/tháng: lặp cách N đơn vị (mặc định 1). */
  interval?: number;
  customDays?: number[];
  label?: string;
}

// Media content blocks for rich task content
export type MediaBlockType = 'text' | 'image' | 'youtube';
export interface MediaBlock {
  id: string;
  type: MediaBlockType;
  content: string;
  caption?: string;
}

// Financial tracking
export interface TaskFinance {
  type: 'income' | 'expense';
  amount: number;
  note?: string;
}

// Pomodoro settings
export interface PomodoroSettings {
  enabled: boolean;
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export interface TimerSession {
  id: string;
  taskId: string;
  startTime: number; // Thời điểm bắt đầu
  endTime?: number; // Thời điểm kết thúc (khi bấm stop)
  completedAt?: number; // Thời điểm hoàn thành (khi bấm hoàn thành)
  pauseTimes: number[]; // Mảng các thời điểm tạm dừng
  resumeTimes: number[]; // Mảng các thời điểm tiếp tục
  elapsed: number; // Tổng thời gian đã chạy (seconds)
  isCompleted: boolean; // Đã hoàn thành task chưa
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  quadrant: EisenhowerQuadrant;
  createdAt: number;
  completedAt?: number;
  deadline?: number;
  deadlineDate?: string;
  deadlineTime?: string;
  duration?: number;
  totalPausedTime?: number;
  order: number;
  recurring: RecurringConfig;
  recurringLabel?: string;
  timerSessions?: TimerSession[];
  notes?: string;
  // Subtasks / hierarchy
  parentId?: string;
  children?: string[];
  // Financial - per task instance (can override template)
  finance?: TaskFinance;
  // Template source
  templateId?: string;
  // Group source (when task was created from a group template)
  groupTemplateId?: string;
  // Topic categorization
  topic?: string;
  // Dependencies
  dependsOn?: string[]; // task IDs this task depends on
  // EXP from template
  xpReward?: number;
  // Trash tracking
  deletedAt?: number;
}

export interface TaskTemplate {
  id: string;
  title: string;
  quadrant: EisenhowerQuadrant;
  recurring: RecurringConfig;
  notes?: string;
  media?: MediaBlock[];
  /** @deprecated Use subtaskTemplateIds instead */
  subtasks?: { title: string; quadrant: EisenhowerQuadrant }[];
  /** IDs of single templates that make up this group */
  subtaskTemplateIds?: string[];
  finance?: TaskFinance;
  xpReward?: number; // EXP gained when completing task from this template
  createdAt: number;
  updatedAt?: number;
  templateType?: 'single' | 'group';
  // Topic categorization for grouping templates
  topic?: string;
  // Health metrics for SỨC KHỎE topic
  healthMetrics?: HealthMetrics;
}

export interface TimerState {
  taskId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number;
  startTime: number | null;
  pausedAt: number | null;
  totalPausedDuration: number;
  sessionId?: string; // Current session ID for tracking
  // Pomodoro
  pomodoroSession: number; // current session number
  pomodoroPhase: 'work' | 'break' | 'longBreak' | 'none';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface TaskStats {
  label: string;
  completions: { date: string; duration: number }[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
}

// Gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  unlockedAt?: number;
  xpReward: number;
  isCustom?: boolean;
}

export type AchievementCondition =
  | { type: 'tasks_completed'; count: number }
  | { type: 'streak_days'; count: number }
  | { type: 'timer_total'; seconds: number }
  | { type: 'early_bird'; count: number }
  | { type: 'quadrant_master'; quadrant: EisenhowerQuadrant; count: number }
  | { type: 'perfect_day'; count: number }
  | { type: 'speed_demon'; seconds: number }
  | { type: 'consistency'; days: number }
  | { type: 'custom'; description: string };

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpCost: number;
  claimed: boolean;
  claimedAt?: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalTasksCompleted: number;
  totalTimerSeconds: number;
  earlyBirdCount: number;
  perfectDays: number;
  activeDays: number;
  dailyCompletionDates: string[];
  achievements: Achievement[];
  rewards: Reward[];
}

// Health tracking metrics
export interface HealthMetrics {
  weight?: number; // in kg
  waist?: number; // in cm
  water?: number; // in ml
  calories?: number; // calories burned
  sleepHours?: number; // hours of sleep
  sleepQuality?: number; // 1-5 scale
  steps?: number; // daily steps
  heartRate?: number; // bpm
  bloodPressure?: { systolic: number; diastolic: number };
  mood?: number; // 1-5 mood rating
  energy?: number; // 1-5 energy level
}

// AI-detected health data from task completion
export interface TaskHealthData {
  taskId: string;
  taskTitle: string;
  detectedMetrics: HealthMetricType[];
  confidence: number; // 0-1
  suggestedFields: {
    field: keyof HealthMetrics;
    label: string;
    type: 'number' | 'range' | 'select';
    unit?: string;
    min?: number;
    max?: number;
    options?: string[];
  }[];
}

export type HealthMetricType = 
  | 'sleep' 
  | 'exercise' 
  | 'nutrition' 
  | 'hydration' 
  | 'weight' 
  | 'mood' 
  | 'energy' 
  | 'heart_health'
  | 'stress'
  | 'productivity';

export interface DailyHealthEntry {
  date: string; // YYYY-MM-DD format
  weight?: number;
  waist?: number;
  water?: number;
  calories?: number;
  sleepHours?: number;
  sleepQuality?: number;
  steps?: number;
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  mood?: number;
  energy?: number;
  // Source task info
  taskId?: string;
  taskTitle?: string;
  category?: HealthMetricType;
}
export interface NotificationSettings {
  enabled: boolean;
  beforeDeadline: number;
  dailyReminder: boolean;
  dailyReminderTime: string;
}

// Quadrant display config
export const QUADRANT_LABELS: Record<EisenhowerQuadrant, { label: string; icon: string; color: string; desc: string }> = {
  do_first: { label: 'Làm ngay', icon: '🔴', color: 'var(--error)', desc: 'Gấp + Quan trọng' },
  schedule: { label: 'Lên lịch', icon: '🔵', color: 'var(--accent-primary)', desc: 'Quan trọng' },
  delegate: { label: 'Ủy thác', icon: '🟡', color: 'var(--warning)', desc: 'Gấp' },
  eliminate: { label: 'Loại bỏ', icon: '⚪', color: 'var(--text-muted)', desc: 'Không gấp, không QT' },
};
