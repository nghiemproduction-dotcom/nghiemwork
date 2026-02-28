import { useState, useMemo } from 'react';
import { exercises, meals, knowledgeArticles } from '@/data/healthData';
import { ChevronDown, ChevronUp, BookOpen, UtensilsCrossed, Search, Filter, X, Heart, Activity, Brain, BarChart3 } from 'lucide-react';
import { useSettingsStore } from '@/stores';
import type { Meal, KnowledgeArticle } from '@/types';

type TabType = 'meals' | 'knowledge';

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<TabType>('meals');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const setCurrentPage = useSettingsStore(s => s.setCurrentPage);

  // Get unique categories
  const mealCategories = useMemo(() => {
    const categories = [...new Set(meals.map(m => m.category))];
    return categories;
  }, []);

  const knowledgeCategories = useMemo(() => {
    const categories = [...new Set(knowledgeArticles.map(a => a.tags).flat())];
    return categories;
  }, []);

  // Filter data
  const filteredMeals = useMemo(() => {
    let filtered = meals;
    
    if (searchQuery) {
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(meal => meal.category === selectedCategory);
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const filteredArticles = useMemo(() => {
    let filtered = knowledgeArticles;
    
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(article => article.tags.includes(selectedCategory));
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-3">MENU KIẾN THỨC</h1>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('meals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'meals'
                ? 'bg-[var(--accent-primary)] text-[var(--bg-base)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <UtensilsCrossed size={16} />
            MÓN ĂN
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-[var(--accent-primary)] text-[var(--bg-base)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <BookOpen size={16} />
            KIẾN THỨC SỨC KHỎE
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Tìm kiếm ${activeTab === 'meals' ? 'món ăn' : 'bài viết'}...`}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] border border-[var(--border-subtle)] appearance-none cursor-pointer"
            >
              <option value="">Tất cả {activeTab === 'meals' ? 'danh mục' : 'tags'}</option>
              {(activeTab === 'meals' ? mealCategories : knowledgeCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Health Stats Quick Access */}
      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[var(--accent-primary)]" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Thống kê Sức khỏe</h3>
              <p className="text-xs text-[var(--text-muted)]">Theo dõi và phân tích dữ liệu sức khỏe</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('stats')}
            className="px-3 py-2 bg-[var(--accent-primary)] text-[var(--bg-base)] rounded-lg text-xs font-medium active:scale-95 transition-transform"
          >
            Xem chi tiết
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'meals' && (
        <div className="grid grid-cols-1 gap-3">
          {filteredMeals.map(meal => (
            <div key={meal.id} className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full font-medium">
                    {meal.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMeal(meal)}
                  className="p-1.5 rounded-lg text-[var(--accent-primary)] hover:bg-[rgba(0,229,204,0.15)] transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{meal.name}</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-xs text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--text-primary)]">{meal.calories}</span> kcal
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  <span className="font-medium text-[var(--text-primary)]">{meal.protein}g</span> protein
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] line-clamp-2">{meal.instructions}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 gap-3">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedArticle(article)}
                  className="p-1.5 rounded-lg text-[var(--accent-primary)] hover:bg-[rgba(0,229,204,0.15)] transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{article.title}</h3>
              <p className="text-xs text-[var(--text-muted)] line-clamp-3">{article.summary}</p>
            </div>
          ))}
        </div>
      )}

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-overlay)] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[var(--border-accent)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedMeal.name}</h3>
              <button
                onClick={() => setSelectedMeal(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-[var(--bg-surface)] rounded-lg">
                  <p className="text-lg font-bold text-[var(--accent-primary)]">{selectedMeal.calories}</p>
                  <p className="text-xs text-[var(--text-muted)]">kcal</p>
                </div>
                <div className="text-center p-2 bg-[var(--bg-surface)] rounded-lg">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{selectedMeal.protein}g</p>
                  <p className="text-xs text-[var(--text-muted)]">protein</p>
                </div>
                <div className="text-center p-2 bg-[var(--bg-surface)] rounded-lg">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{selectedMeal.carbs}g</p>
                  <p className="text-xs text-[var(--text-muted)]">carbs</p>
                </div>
                <div className="text-center p-2 bg-[var(--bg-surface)] rounded-lg">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{selectedMeal.fat}g</p>
                  <p className="text-xs text-[var(--text-muted)]">fat</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Nguyên liệu</h4>
                <div className="space-y-1">
                  {selectedMeal.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>•</span>
                      <span>{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Hướng dẫn</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedMeal.instructions}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Ghi chú</h4>
                <p className="text-xs text-[var(--text-muted)]">{selectedMeal.servingNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-overlay)] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[var(--border-accent)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedArticle.title}</h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Tóm tắt</h4>
                <p className="text-sm text-[var(--text-secondary)]">{selectedArticle.summary}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Nội dung</h4>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
