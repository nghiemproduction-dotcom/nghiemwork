// Eisenhower Matrix Quadrants
export type EisenhowerQuadrant = 'do_first' | 'schedule' | 'delegate' | 'eliminate';
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'overdue' | 'paused';
export type RecurringType = 'none' | 'hourly' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
export type TabType = 'pending' | 'done' | 'overdue';
export type PageType = 'tasks' | 'stats' | 'ai' | 'settings' | 'achievements' | 'templates' | 'health';

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
// Health tracking types from DINHDUONG
export type ExerciseCategory = 'cardio' | 'resistance' | 'static' | 'balance' | 'reflex';
export type MealCategory = 'main' | 'snack' | 'treat' | 'supplement' | 'drink';

export const EXERCISE_CATEGORIES: { key: ExerciseCategory; label: string }[] = [
  { key: 'cardio', label: 'Nhịp điệu' },
  { key: 'resistance', label: 'Kháng lực' },
  { key: 'static', label: 'Tĩnh' },
  { key: 'balance', label: 'Thăng bằng' },
  { key: 'reflex', label: 'Phản xạ' },
];

export const MEAL_CATEGORIES: { key: MealCategory; label: string }[] = [
  { key: 'main', label: 'Món chính' },
  { key: 'snack', label: 'Ăn nhẹ' },
  { key: 'treat', label: 'Ăn vặt' },
  { key: 'supplement', label: 'Bổ sung' },
  { key: 'drink', label: 'Thức uống' },
];

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  duration: number;
  caloriesBurned: number;
  steps: string[];
  youtubeId: string;
  imageUrl?: string;
}

export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string;
  servingNote: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  tags: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  passcode: string;
  isAdmin: boolean;
  age?: number;
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;
  waist?: number;
  targetWeight?: number;
  targetWaist?: number;
  targetCalories?: number;
  targetWater?: number;
  injuries?: string;
  habits?: string;
  guiltyPleasures?: string;
  ifMode?: string;
  ifEatStart?: string;
  ifEatEnd?: string;
  sessions: TrainingSession[];
  createdAt: string;
}

export interface TrainingSession {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface PlannedExercise {
  exerciseId: string;
  sessionId: string;
  order: number;
  completed: boolean;
}

export interface PlannedMeal {
  mealId: string;
  time: string;
  consumed: boolean;
  aiReason?: string;
}

export interface DailyPlan {
  exercises: PlannedExercise[];
  meals: PlannedMeal[];
}

export interface DailyLog {
  date: string;
  userId: string;
  weight?: number;
  waist?: number;
  waterMl: number;
  targetCalories: number;
  caloriesBurned: number;
  caloriesConsumed: number;
  exercises: PlannedExercise[];
  meals: PlannedMeal[];
  completed: boolean;
  exp: number;
}

// Enhanced health metrics for NGHIEMWORK
export interface EnhancedHealthMetrics {
  weight?: number;
  waist?: number;
  water?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  steps?: number;
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  sleep?: {
    hours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  mood?: 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good';
  energy?: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
}

export interface HealthGoal {
  id: string;
  type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'flexibility' | 'strength';
  target: number;
  current: number;
  unit: string;
  deadline?: number;
  isActive: boolean;
}

export interface WorkoutSession {
  id: string;
  date: number;
  exercises: {
    exerciseId: string;
    duration: number;
    caloriesBurned: number;
    completed: boolean;
    notes?: string;
  }[];
  totalDuration: number;
  totalCalories: number;
}

export interface NutritionEntry {
  id: string;
  date: number;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    items: {
      mealId: string;
      quantity: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number;
}

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
  topic?: string;
  healthMetrics?: EnhancedHealthMetrics;
  exerciseIds?: string[]; // IDs of exercises from health tracking
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
