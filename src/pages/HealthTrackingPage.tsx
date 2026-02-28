import { useState, useEffect } from 'react';
import { Search, Filter, Clock, Flame, Target, Award, BookOpen } from 'lucide-react';
import { Exercise, Meal, ExerciseCategory, MealCategory, EXERCISE_CATEGORIES, MEAL_CATEGORIES } from '@/types';
import { exercises, meals, knowledgeArticles } from '@/data/healthData';

export default function HealthTrackingPage() {
  const [activeTab, setActiveTab] = useState<'exercises' | 'meals' | 'knowledge'>('exercises');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | MealCategory | 'all'>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Filter exercises based on search and category
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter meals based on search and category
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter knowledge articles
  const filteredKnowledge = knowledgeArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const closeExerciseModal = () => {
    setSelectedExercise(null);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Theo dõi sức khỏe</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'exercises'
              ? 'bg-[var(--accent-primary)] text-[var(--bg-base)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Bài tập
        </button>
        <button
          onClick={() => setActiveTab('meals')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'meals'
              ? 'bg-[var(--accent-primary)] text-[var(--bg-base)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Dinh dưỡng
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'knowledge'
              ? 'bg-[var(--accent-primary)] text-[var(--bg-base)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Kiến thức
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)]"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ExerciseCategory | MealCategory | 'all')}
          className="px-4 py-2 bg-[var(--bg-elevated)] rounded-lg text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)]"
        >
          <option value="all">Tất cả</option>
          {activeTab === 'exercises' && EXERCISE_CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
          {activeTab === 'meals' && MEAL_CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {activeTab === 'exercises' && (
        <div className="grid grid-cols-1 gap-3">
          {filteredExercises.map(exercise => (
            <div
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise)}
              className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">{exercise.name}</h3>
                <span className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full">
                  {EXERCISE_CATEGORIES.find(c => c.key === exercise.category)?.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exercise.duration} phút
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {exercise.caloriesBurned} kcal
                </span>
              </div>
              <div className="aspect-video bg-[var(--bg-surface)] rounded-lg mb-2">
                <img
                  src={`https://img.youtube.com/vi/${exercise.youtubeId}/mqdefault.jpg`}
                  alt={exercise.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = `https://via.placeholder.com/320x180?text=${encodeURIComponent(exercise.name)}`;
                  }}
                />
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                <p className="font-medium mb-1">Các bước thực hiện:</p>
                <ol className="space-y-1">
                  {exercise.steps.slice(0, 3).map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[var(--accent-primary)]">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                  {exercise.steps.length > 3 && (
                    <li className="text-[var(--text-muted)]">... và {exercise.steps.length - 3} bước nữa</li>
                  )}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'meals' && (
        <div className="grid grid-cols-1 gap-3">
          {filteredMeals.map(meal => (
            <div
              key={meal.id}
              className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">{meal.name}</h3>
                <span className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full">
                  {MEAL_CATEGORIES.find(c => c.key === meal.category)?.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs text-[var(--text-muted)] mb-2">
                <div className="text-center">
                  <p className="font-bold text-[var(--text-primary)]">{meal.calories}</p>
                  <p>Calo</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-[var(--text-primary)]">{meal.protein}g</p>
                  <p>Protein</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-[var(--text-primary)]">{meal.carbs}g</p>
                  <p>Carb</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-[var(--text-primary)]">{meal.fat}g</p>
                  <p>Fat</p>
                </div>
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                <p className="font-medium mb-1">Thành phần chính:</p>
                <p className="mb-2">{meal.ingredients.slice(0, 3).join(', ')}</p>
                {meal.ingredients.length > 3 && (
                  <p className="text-[var(--text-muted)]">... và {meal.ingredients.length - 3} nguyên liệu nữa</p>
                )}
                <p className="font-medium mb-1 mt-2">Hướng dẫn:</p>
                <p className="line-clamp-2">{meal.instructions}</p>
                <p className="text-[var(--text-muted)] mt-1">{meal.servingNote}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-3">
          {filteredKnowledge.map(article => (
            <div
              key={article.id}
              className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all"
            >
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{article.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">{article.summary}</p>
              <div className="flex gap-2 mb-2">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                <p className="line-clamp-3">{article.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-overlay)] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-elevated)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedExercise.name}</h2>
                <button
                  onClick={closeExerciseModal}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
                >
                  ✕
                </button>
              </div>
              <div className="aspect-video mb-4">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedExercise.youtubeId}?autoplay=0&rel=0`}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--accent-primary)]">{selectedExercise.duration}</p>
                  <p className="text-sm text-[var(--text-muted)]">phút</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--warning)]">{selectedExercise.caloriesBurned}</p>
                  <p className="text-sm text-[var(--text-muted)]">kcal</p>
                </div>
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                <p className="font-medium mb-2">Hướng dẫn chi tiết:</p>
                <ol className="space-y-2">
                  {selectedExercise.steps.map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[var(--accent-primary)] font-bold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
