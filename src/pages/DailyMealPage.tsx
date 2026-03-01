import { useState, useEffect, useMemo } from 'react';
import { useHealthStore, useTaskStore } from '@/stores';
import { toast } from 'sonner';
import { 
  UtensilsCrossed, Plus, Search, Filter, Clock, Timer, 
  Flame, CheckCircle2, AlertTriangle, Bot, Sparkles,
  Calendar, Coffee, Sun, Moon, Apple, Cookie, Target
} from 'lucide-react';
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Task } from '@/types';

interface MealItem {
  id: string;
  name: string;
  calories: number;
  time: string;
  type: 'main' | 'snack' | 'drink';
  completed: boolean;
}

interface DailyMealPlan {
  date: string;
  meals: MealItem[];
  totalCalories: number;
  targetCalories: number;
}

const MEAL_ICONS = {
  main: UtensilsCrossed,
  snack: Cookie,
  drink: Coffee,
};

const MEAL_TIMES = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00'
];

const SAMPLE_MEALS = [
  { name: 'Cơm gà luộc', calories: 250, type: 'main' },
  { name: 'Salad xanh', calories: 80, type: 'main' },
  { name: 'Trái cây', calories: 60, type: 'snack' },
  { name: 'Sữa chua', calories: 100, type: 'snack' },
  { name: 'Nước lọc', calories: 0, type: 'drink' },
  { name: 'Cà phê', calories: 50, type: 'drink' },
  { name: 'Trà', calories: 20, type: 'drink' },
  { name: 'Bánh mì', calories: 350, type: 'main' },
  { name: 'Bánh ngọt', calories: 150, type: 'snack' },
];

export default function DailyMealPage() {
  const { entries, addEntry, updateEntry, getLatestValues } = useHealthStore();
  const { tasks } = useTaskStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyMeals, setDailyMeals] = useState<MealItem[]>([]);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'all' | 'main' | 'snack' | 'drink'>('all');

  const today = format(selectedDate, 'yyyy-MM-dd');
  const todayEntry = entries.find(e => e.date === today);
  const currentCalories = todayEntry?.calories || 0;

  // Auto-count calories from tasks with healthMetrics
  const caloriesFromTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.status === 'done' && 
        task.completedAt && 
        isSameDay(new Date(task.completedAt), selectedDate)
      )
      .reduce((total, task) => {
        // Check if task has health-related calories (from template or manual entry)
        const taskCalories = task.templateId ? 
          // If task has template, check if it's health-related
          (task.title.toLowerCase().includes('tập') || 
           task.title.toLowerCase().includes('gym') || 
           task.title.toLowerCase().includes('chạy') || 
           task.title.toLowerCase().includes('yoga')) ? 50 : 0
          : 0;
        return total + taskCalories;
      }, 0);
  }, [tasks, selectedDate]);

  const totalCalories = currentCalories + caloriesFromTasks;
  const progress = Math.min((totalCalories / targetCalories) * 100, 100);
  const remaining = Math.max(targetCalories - totalCalories, 0);

  const filteredMeals = useMemo(() => {
    return SAMPLE_MEALS.filter(meal => 
      selectedMealType === 'all' || meal.type === selectedMealType
    ).filter(meal =>
      meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedMealType, searchQuery]);

  const addMeal = (meal: Omit<MealItem, 'id' | 'completed'>) => {
    const newMeal: MealItem = {
      ...meal,
      id: Date.now().toString(),
      completed: false,
    };
    
    setDailyMeals(prev => [...prev, newMeal]);
    toast.success(`Đã thêm ${meal.name}`);
  };

  const toggleMealComplete = (mealId: string) => {
    setDailyMeals(prev => 
      prev.map(meal => 
        meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
      )
    );
  };

  const deleteMeal = (mealId: string) => {
    setDailyMeals(prev => prev.filter(meal => meal.id !== mealId));
    toast.success('Đã xóa món ăn');
  };

  const saveDailyPlan = () => {
    const completedCalories = dailyMeals
      .filter(meal => meal.completed)
      .reduce((total, meal) => total + meal.calories, 0);

    updateEntry(today, { 
      calories: completedCalories + caloriesFromTasks 
    });
    
    toast.success('Đã lưu thực đơn hàng ngày');
  };

  const generateWithAI = () => {
    const mealPlan = dailyMeals.map(m => `${m.name} (${m.calories} calo)`).join(', ');
    const prompt = `Hãy tạo thực đơn hàng ngày lành mạnh với khoảng ${targetCalories - caloriesFromTasks} calo còn lại. Thực đơn hiện tại: ${mealPlan}. Hãy gợi ý các bữa ăn cân bằng dinh dưỡng.`;
    
    // Navigate to AI page with the prompt
    window.location.href = '/ai?prompt=' + encodeURIComponent(prompt);
  };

  const addQuickMeal = (meal: typeof SAMPLE_MEALS[0]) => {
    const newMeal: MealItem = {
      ...meal,
      id: Date.now().toString(),
      completed: false,
      time: MEAL_TIMES[Math.floor(Math.random() * MEAL_TIMES.length)],
      type: meal.type as 'main' | 'snack' | 'drink',
    };
    
    setDailyMeals(prev => [...prev, newMeal]);
    toast.success(`Đã thêm nhanh ${meal.name}`);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">THỰC ĐƠN HÀNG NGÀY</h1>
        <p className="text-sm text-[var(--text-muted)]">Lên kế hoạch và theo dõi bữa ăn hàng ngày</p>
      </div>

      {/* Date Selector */}
      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[var(--accent-primary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
              className="px-3 py-1 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] active:scale-95"
            >
              Hôm qua
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium active:scale-95"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
              className="px-3 py-1 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] active:scale-95"
            >
              Ngày mai
            </button>
          </div>
        </div>
      </div>

      {/* Calories Overview */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-orange-500" />
            <span className="text-xs text-[var(--text-muted)]">Đã nạp</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{totalCalories}</p>
          <p className="text-xs text-[var(--text-muted)]">kcal</p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-[var(--accent-primary)]" />
            <span className="text-xs text-[var(--text-muted)]">Mục tiêu</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{targetCalories}</p>
          <p className="text-xs text-[var(--text-muted)]">kcal</p>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-yellow-500" />
            <span className="text-xs text-[var(--text-muted)]">Còn lại</span>
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{remaining}</p>
          <p className="text-xs text-[var(--text-muted)]">kcal</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] mb-4">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>Tiến độ calo</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              progress >= 100 ? 'bg-green-500' : 
              progress >= 80 ? 'bg-green-400' : 
              progress >= 60 ? 'bg-yellow-400' : 
              progress >= 40 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {caloriesFromTasks > 0 && (
          <div className="mt-2 text-xs text-[var(--text-muted)]">
            * Tự động cộng {caloriesFromTasks} calo từ việc hoàn thành
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowAddMeal(true)}
          className="flex-1 px-3 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium active:scale-95"
        >
          <Plus size={16} />
          Thêm bữa ăn
        </button>
        <button
          onClick={generateWithAI}
          className="flex-1 px-3 py-2 bg-[var(--accent-dim)] text-[var(--accent-primary)] rounded-lg text-sm font-medium active:scale-95"
        >
          <Bot size={16} />
          Tạo với AI
        </button>
        <button
          onClick={saveDailyPlan}
          className="flex-1 px-3 py-2 bg-[var(--success)] text-white rounded-lg text-sm font-medium active:scale-95"
        >
          <CheckCircle2 size={16} />
          Lưu thực đơn
        </button>
      </div>

      {/* Meal List */}
      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Bữa ăn hôm nay</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm món ăn..."
              className="px-3 py-1 bg-[var(--bg-surface)] rounded-lg text-sm border border-[var(--border-subtle)]"
            />
            <select
              value={selectedMealType}
              onChange={e => setSelectedMealType(e.target.value as 'all' | 'main' | 'snack' | 'drink')}
              className="px-3 py-1 bg-[var(--bg-surface)] rounded-lg text-sm border border-[var(--border-subtle)]"
            >
              <option value="all">Tất cả</option>
              <option value="main">Bữa chính</option>
              <option value="snack">Ăn vặt</option>
              <option value="drink">Đồ uống</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {dailyMeals.length > 0 ? (
            dailyMeals.map(meal => {
              const Icon = MEAL_ICONS[meal.type];
              return (
                <div key={meal.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      meal.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon size={16} className={
                        meal.completed ? 'text-green-600' : 'text-gray-600'
                      } />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        meal.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'
                      }`}>
                        {meal.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span>{meal.calories} kcal</span>
                        {meal.time && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {meal.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMealComplete(meal.id)}
                      className={`p-1.5 rounded-lg active:scale-95 ${
                        meal.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-[var(--accent-primary)] text-white'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteMeal(meal.id)}
                      className="p-1.5 rounded-lg bg-[var(--error)] text-white active:scale-95"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có bữa ăn nào</p>
              <p className="text-xs mt-2">Nhấn "Thêm bữa ăn" để bắt đầu</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Meals */}
      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Thêm nhanh</h3>
        <div className="grid grid-cols-2 gap-2">
          {filteredMeals.slice(0, 6).map((meal, index) => (
            <button
              key={index}
              onClick={() => addQuickMeal(meal)}
              className="p-3 bg-[var(--bg-surface)] rounded-lg text-left active:scale-95 hover:bg-[var(--bg-elevated)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{meal.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{meal.calories} kcal</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  meal.type === 'main' ? 'bg-blue-100 text-blue-600' :
                  meal.type === 'snack' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {meal.type === 'main' ? 'Bữa chính' :
                   meal.type === 'snack' ? 'Ăn vặt' : 'Đồ uống'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-overlay)] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[var(--border-accent)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Thêm bữa ăn</h3>
              <button
                onClick={() => setShowAddMeal(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Tên món ăn</label>
                <input
                  type="text"
                  placeholder="Nhập tên món ăn..."
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Calo</label>
                <input
                  type="number"
                  placeholder="Nhập số calo..."
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Loại</label>
                <select className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] border border-[var(--border-subtle)]">
                  <option value="main">Bữa chính</option>
                  <option value="snack">Ăn vặt</option>
                  <option value="drink">Đồ uống</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Thời gian ăn</label>
                <input
                  type="time"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] border border-[var(--border-subtle)]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddMeal(false)}
                  className="flex-1 px-3 py-2 bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-lg text-sm font-medium active:scale-95"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    const nameInput = document.querySelector('input[placeholder="Nhập tên món ăn..."]') as HTMLInputElement;
                    const caloriesInput = document.querySelector('input[placeholder="Nhập số calo..."]') as HTMLInputElement;
                    const typeSelect = document.querySelector('select') as HTMLSelectElement;
                    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
                    
                    if (nameInput?.value && caloriesInput?.value) {
                      addMeal({
                        name: nameInput.value,
                        calories: parseInt(caloriesInput.value) || 0,
                        time: timeInput?.value || '',
                        type: typeSelect?.value as 'main' | 'snack' | 'drink',
                      });
                      setShowAddMeal(false);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium active:scale-95"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
