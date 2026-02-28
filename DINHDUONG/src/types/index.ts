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
