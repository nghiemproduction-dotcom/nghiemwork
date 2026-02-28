import { UserProfile, DailyLog, DailyPlan, PlannedExercise, PlannedMeal } from '@/types';

const PREFIX = 'cyberfit_';

function getKey(key: string): string { return PREFIX + key; }

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
    // Try to free space by removing oldest logs
    cleanOldLogs();
    localStorage.setItem(getKey(key), JSON.stringify(data));
  }
}

function load<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function remove(key: string): void {
  localStorage.removeItem(getKey(key));
}

// ═══ USERS ═══
export function getUsers(): UserProfile[] {
  return load<UserProfile[]>('users') || [];
}

export function saveUsers(users: UserProfile[]): void {
  save('users', users);
}

export function getUserById(id: string): UserProfile | null {
  return getUsers().find(u => u.id === id) || null;
}

export function saveUser(user: UserProfile): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  saveUsers(users);
}

// ═══ DAILY LOG ═══
export function getDailyLog(userId: string, date: string): DailyLog | null {
  return load<DailyLog>(`log_${userId}_${date}`);
}

export function saveDailyLog(log: DailyLog): void {
  save(`log_${log.userId}_${log.date}`, log);
}

export function createDefaultDailyLog(userId: string, date: string, plan: DailyPlan | null, targetCalories: number): DailyLog {
  return {
    date,
    userId,
    waterMl: 0,
    targetCalories,
    caloriesBurned: 0,
    caloriesConsumed: 0,
    exercises: plan?.exercises || [],
    meals: plan?.meals || [],
    completed: false,
    exp: 0,
  };
}

// ═══ DAILY PLAN (AI generated template) ═══
export function getDailyPlan(userId: string): DailyPlan | null {
  return load<DailyPlan>(`plan_${userId}`);
}

export function saveDailyPlan(userId: string, plan: DailyPlan): void {
  save(`plan_${userId}`, plan);
}

// ═══ HISTORY ═══
export function getHistoryDates(userId: string): string[] {
  return load<string[]>(`history_${userId}`) || [];
}

export function addHistoryDate(userId: string, date: string): void {
  const dates = getHistoryDates(userId);
  if (!dates.includes(date)) {
    dates.push(date);
    dates.sort();
    save(`history_${userId}`, dates);
  }
}

// ═══ CLEANUP ═══
function cleanOldLogs(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX + 'log_'));
  keys.sort();
  // Remove oldest 30 days
  const toRemove = keys.slice(0, Math.min(30, keys.length));
  toRemove.forEach(k => localStorage.removeItem(k));
}

// ═══ END OF DAY ═══
export function endOfDaySnapshot(userId: string, date: string): void {
  const log = getDailyLog(userId, date);
  if (log) {
    log.completed = true;
    // Calculate EXP
    const calorieBalance = log.targetCalories - (log.caloriesConsumed - log.caloriesBurned);
    log.exp = calorieBalance >= 0 ? 10 : -5;
    saveDailyLog(log);
    addHistoryDate(userId, date);
  }
}

// ═══ UTILS ═══
export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function isTimeInRange(current: string, start: string, end: string): boolean {
  return current >= start && current <= end;
}
