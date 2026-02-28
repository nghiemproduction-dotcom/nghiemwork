import { UserProfile, TrainingSession } from '@/types';
import { getUsers, saveUser, getUserById, saveDailyPlan } from './storageService';
import { exercises } from '@/data/exercises';
import { meals } from '@/data/meals';

const ADMIN_PASSCODE = '2026Phattrien@';
const CURRENT_USER_KEY = 'cyberfit_current_user';

function generateDemoData(user: UserProfile): void {
  // Generate a default daily plan from library
  const morningExercises = exercises.filter(e => e.category === 'cardio').slice(0, 3);
  const afternoonExercises = exercises.filter(e => e.category === 'resistance').slice(0, 3);
  const mainMeals = meals.filter(m => m.category === 'main').slice(0, 3);
  const snackMeals = meals.filter(m => m.category === 'snack').slice(0, 2);
  const drinks = meals.filter(m => m.category === 'drink').slice(0, 2);

  const plan = {
    exercises: [
      ...morningExercises.map((e, i) => ({
        exerciseId: e.id, sessionId: 'morning', order: i, completed: false,
      })),
      ...afternoonExercises.map((e, i) => ({
        exerciseId: e.id, sessionId: 'afternoon', order: i, completed: false,
      })),
    ],
    meals: [
      { mealId: drinks[0].id, time: '07:00', consumed: false, aiReason: 'Khởi đầu ngày với nước ép giàu vitamin' },
      { mealId: mainMeals[0].id, time: '12:00', consumed: false, aiReason: 'Bữa trưa đủ protein và carbs' },
      { mealId: snackMeals[0].id, time: '15:00', consumed: false, aiReason: 'Bổ sung năng lượng giữa chiều' },
      { mealId: mainMeals[1].id, time: '18:30', consumed: false, aiReason: 'Bữa tối nhẹ, dễ tiêu' },
      { mealId: snackMeals[1].id, time: '20:00', consumed: false, aiReason: 'Ăn nhẹ trước giờ nhịn ăn' },
    ],
  };

  saveDailyPlan(user.id, plan);
}

export function login(passcode: string): UserProfile | null {
  if (passcode === ADMIN_PASSCODE) {
    let user = getUsers().find(u => u.isAdmin);
    if (!user) {
      user = {
        id: 'admin_tommy',
        name: 'Tommy Nghiêm',
        passcode: ADMIN_PASSCODE,
        isAdmin: true,
        age: 30,
        gender: 'male',
        height: 175,
        weight: 78,
        waist: 85,
        targetWeight: 72,
        targetWaist: 78,
        targetCalories: 2000,
        targetWater: 2500,
        ifMode: '16:8',
        ifEatStart: '12:00',
        ifEatEnd: '20:00',
        sessions: [
          { id: 'morning', name: 'Buổi Sáng', startTime: '06:00', endTime: '07:30' },
          { id: 'afternoon', name: 'Buổi Chiều', startTime: '17:00', endTime: '18:30' },
        ],
        createdAt: new Date().toISOString(),
      };
      saveUser(user);
      generateDemoData(user);
    } else {
      // Migrate: ensure body metrics exist
      let updated = false;
      if (!user.age) { user.age = 30; updated = true; }
      if (!user.height) { user.height = 175; updated = true; }
      if (!user.weight) { user.weight = 78; updated = true; }
      if (!user.waist) { user.waist = 85; updated = true; }
      if (!user.targetCalories) { user.targetCalories = 2000; updated = true; }
      if (!user.targetWater) { user.targetWater = 2500; updated = true; }
      if (!user.sessions || user.sessions.length === 0) {
        user.sessions = [
          { id: 'morning', name: 'Buổi Sáng', startTime: '06:00', endTime: '07:30' },
          { id: 'afternoon', name: 'Buổi Chiều', startTime: '17:00', endTime: '18:30' },
        ];
        updated = true;
      }
      if (updated) saveUser(user);
    }
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    return user;
  }

  // Check other users
  const user = getUsers().find(u => u.passcode === passcode);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    return user;
  }

  return null;
}

export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser(): UserProfile | null {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return null;
  return getUserById(id);
}
