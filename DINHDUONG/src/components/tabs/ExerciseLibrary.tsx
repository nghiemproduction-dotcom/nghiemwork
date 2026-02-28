import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Flame } from 'lucide-react';
import { ExerciseCategory, EXERCISE_CATEGORIES } from '@/types';
import { exercises } from '@/data/exercises';

export default function ExerciseLibrary() {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory>('cardio');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = exercises.filter(e => e.category === activeCategory);

  return (
    <div className="p-4 space-y-4 animate-slide-up">
      <h2 className="text-lg font-bold text-primary glow-cyan text-center">THƯ VIỆN BÀI TẬP</h2>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {EXERCISE_CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => { setActiveCategory(cat.key); setExpandedId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.key ? 'cyber-btn' : 'cyber-btn-outline'
            }`}>
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">{filtered.length} bài tập</p>

      {/* Exercise Cards */}
      <div className="space-y-2">
        {filtered.map(ex => {
          const expanded = expandedId === ex.id;
          return (
            <div key={ex.id} className="cyber-card overflow-hidden">
              <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => setExpandedId(expanded ? null : ex.id)}>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{ex.id.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{ex.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ex.duration}p</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{ex.caloriesBurned} kcal</span>
                  </div>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {expanded && (
                <div className="px-3 pb-3 border-t border-border pt-2 space-y-3">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe src={`https://www.youtube.com/embed/${ex.youtubeId}`}
                      className="w-full h-full" allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">Hướng dẫn:</p>
                    <ol className="text-xs text-muted-foreground space-y-1">
                      {ex.steps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary font-bold min-w-[16px]">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
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
