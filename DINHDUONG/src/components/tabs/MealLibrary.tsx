import { useState } from 'react';
import { ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { MealCategory, MEAL_CATEGORIES } from '@/types';
import { meals } from '@/data/meals';

export default function MealLibrary() {
  const [activeCategory, setActiveCategory] = useState<MealCategory>('main');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = meals.filter(m => m.category === activeCategory);

  return (
    <div className="p-4 space-y-4 animate-slide-up">
      <h2 className="text-lg font-bold text-secondary glow-pink text-center">THƯ VIỆN THỰC ĐƠN</h2>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {MEAL_CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setExpandedId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.key ? 'cyber-btn-pink' : 'cyber-btn-outline'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">{filtered.length} món</p>

      <div className="space-y-2">
        {filtered.map(meal => {
          const expanded = expandedId === meal.id;
          return (
            <div key={meal.id} className="cyber-card-pink overflow-hidden">
              <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => setExpandedId(expanded ? null : meal.id)}>
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{meal.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="text-secondary font-bold">{meal.calories} kcal</span>
                    <span>P:{meal.protein}g</span>
                    <span>C:{meal.carbs}g</span>
                    <span>F:{meal.fat}g</span>
                  </div>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expanded && (
                <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-secondary mb-1">Nguyên liệu:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {meal.ingredients.map((ing, i) => <li key={i}>• {ing}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-secondary mb-1">Cách chế biến:</p>
                    <p className="text-xs text-muted-foreground">{meal.instructions}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic bg-muted/50 rounded px-2 py-1">{meal.servingNote}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}
