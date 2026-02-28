import { useState, useMemo } from 'react';
import { useSettingsStore, useTemplateStore } from '@/stores';
import { convertYoutubeUrl, isYoutubeUrl } from '@/lib/youtubeUtils';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Edit3, X, Save, ListTree, Image, Youtube, Type, DollarSign, ArrowRight, ChevronUp, ChevronDown,
  Sparkles, Wand2, Zap, Target, Calendar, Clock, Tag, Award, Coins, FileText, Link, Trash, GripVertical,
  CheckCircle2, AlertTriangle, Play, Pause, RotateCcw, FileEdit, Send, Bot, XCircle, Download, Upload,
  Heart, Activity, BookOpen, UtensilsCrossed, Brain
} from 'lucide-react';
import type { TaskTemplate, EisenhowerQuadrant, MediaBlock, TaskFinance } from '@/types';
import { QUADRANT_LABELS } from '@/types';
import { exercises, meals, knowledgeArticles } from '@/data/healthData';

function generateBlockId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ── Topic Selector Component ──
function TopicSelector({ value, onChange, placeholder }: { value: string; onChange: (topic: string) => void; placeholder?: string }) {
  const templates = useTemplateStore(s => s.templates);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Get unique topics, excluding health-related ones
  const topics = useMemo(() => {
    const uniqueTopics = [...new Set(templates.map(t => t.topic).filter(Boolean))];
    return uniqueTopics.filter(topic => 
      !topic.includes('BÀI TẬP') && 
      !topic.includes('DINH DƯỠNG')
    );
  }, [templates]);

  const handleSelect = (topic: string) => {
    onChange(topic);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    if (newTopicName.trim()) {
      // Create a new empty template with the new topic
      const { addTemplate } = useTemplateStore.getState();
      const newTemplate = {
        title: `Template cho ${newTopicName.trim()}`,
        quadrant: 'do_first' as const,
        recurring: { type: 'none' as const },
        topic: newTopicName.trim(),
      };
      
      addTemplate(newTemplate);
      
      // Select the new topic
      onChange(newTopicName.trim());
      setNewTopicName('');
      setShowCreateNew(false);
      setIsOpen(false);
      
      // Show success message
      toast.success(`Đã tạo chủ đề mới: ${newTopicName.trim()}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-[var(--bg-elevated)] rounded-lg text-sm text-left flex items-center justify-between border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors ${isOpen ? 'border-[var(--accent-primary)]' : ''}`}
      >
        <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
          {value || placeholder || 'Chọn chủ đề...'}
        </span>
        <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] shadow-lg max-h-60 overflow-y-auto">
          {/* Existing topics */}
          {topics.length > 0 ? (
            <div className="p-1">
              <p className="px-3 py-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Chủ đề có sẵn</p>
              {topics.map(topic => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSelect(topic)}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                    value === topic 
                      ? 'bg-[rgba(0,229,204,0.15)] text-[var(--accent-primary)]' 
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <span className="text-xs">📂</span>
                  {topic}
                  {value === topic && <span className="ml-auto text-xs">✓</span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center">
              <p className="text-sm text-[var(--text-muted)]">Chưa có chủ đề nào</p>
            </div>
          )}

          {/* Create new topic */}
          <div className="border-t border-[var(--border-subtle)] p-2">
            {!showCreateNew ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={e => setNewTopicName(e.target.value)}
                  placeholder="Nhập tên chủ đề mới..."
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewTopicName('');
                      setShowCreateNew(false);
                    }}
                    className="flex-1 py-2 rounded-lg text-sm text-[var(--text-muted)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateNew}
                    disabled={!newTopicName.trim()}
                    className="flex-[2] py-2 rounded-lg text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Tạo
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateNew(true)}
                className="w-full px-3 py-2 rounded-lg text-sm text-[var(--accent-primary)] bg-[var(--accent-dim)] hover:bg-[rgba(0,229,204,0.15)] transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Tạo chủ đề mới
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Knowledge Article Selector Component ──
function KnowledgeSelector({ value, onChange }: { value: string; onChange: (article: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (articleId: string) => {
    onChange(articleId);
    setIsOpen(false);
  };

  const selectedArticle = knowledgeArticles.find(a => a.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-[var(--bg-elevated)] rounded-lg text-sm text-left flex items-center justify-between border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors ${isOpen ? 'border-[var(--accent-primary)]' : ''}`}
      >
        <span className={value ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}>
          {selectedArticle ? selectedArticle.title : 'Chọn bài viết...'}
        </span>
        <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] shadow-lg max-h-60 overflow-y-auto">
          {knowledgeArticles.map(article => (
            <button
              key={article.id}
              type="button"
              onClick={() => handleSelect(article.id)}
              className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${
                value === article.id 
                  ? 'bg-[rgba(0,229,204,0.15)] text-[var(--accent-primary)]' 
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              <span className="text-xs">📖</span>
              <div className="flex-1 text-left">
                <p className="text-xs font-medium">{article.title}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{article.summary}</p>
              </div>
              {value === article.id && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Template Editor Component ──
function TemplateEditor({ template, onSave, onCancel }: {
  template?: TaskTemplate;
  onSave: (data: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const allTemplates = useTemplateStore(s => s.templates);
  const availableSingles = allTemplates.filter(t =>
    t.templateType === 'single' || (!t.subtasks?.length && !t.subtaskTemplateIds?.length && t.templateType !== 'group')
  );

  const [title, setTitle] = useState(template?.title || '');
  const [notes, setNotes] = useState(template?.notes || '');
  const [topic, setTopic] = useState(template?.topic || '');
  const [media, setMedia] = useState<MediaBlock[]>(template?.media || []);
  const [mediaInput, setMediaInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [finance, setFinance] = useState<TaskFinance | undefined>(template?.finance);
  const [showFinance, setShowFinance] = useState(!!template?.finance);
  const [xpReward, setXpReward] = useState(template?.xpReward || 0);
  const [showXpInput, setShowXpInput] = useState(!!template?.xpReward);
  const [healthMetrics, setHealthMetrics] = useState(template?.healthMetrics || {});
  const [showHealthMetrics, setShowHealthMetrics] = useState(!!template?.healthMetrics);
  const [selectedExercises, setSelectedExercises] = useState<string[]>(template?.exerciseIds || []);
  const [selectedKnowledge, setSelectedKnowledge] = useState<string>(template?.knowledgeId || '');

  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>(template?.quadrant || 'do_first');

  const qConfig = QUADRANT_LABELS[quadrant];

  const handleAddMedia = () => {
    const val = mediaInput.trim();
    if (!val) return;
    if (isYoutubeUrl(val)) {
      const embed = convertYoutubeUrl(val);
      if (embed) setMedia([...media, { id: generateBlockId(), type: 'youtube', content: embed }]);
      else setMedia([...media, { id: generateBlockId(), type: 'text', content: val }]);
    } else if (/^https?:\/\//.test(val)) {
      setMedia([...media, { id: generateBlockId(), type: 'image', content: val }]);
    }
    setMediaInput('');
    setShowMediaInput(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(), quadrant, recurring: { type: 'none' },
      notes: notes || undefined,
      topic: topic || undefined,
      subtasks: undefined,
      subtaskTemplateIds: undefined,
      media: media.length > 0 ? media : undefined,
      finance: showFinance ? finance : undefined,
      xpReward: showXpInput && xpReward > 0 ? xpReward : undefined,
      templateType: 'single',
      healthMetrics: showHealthMetrics ? healthMetrics : undefined,
      exerciseIds: selectedExercises.length > 0 ? selectedExercises : undefined,
      knowledgeId: selectedKnowledge || undefined,
    });
  };

  return (
    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-accent)] overflow-hidden animate-slide-up">
      {/* Header with quadrant selector */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {(['do_first', 'schedule', 'delegate', 'eliminate'] as EisenhowerQuadrant[]).map((q) => (
          <button
            key={q}
            onClick={() => setQuadrant(q)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              quadrant === q 
                ? 'bg-[rgba(0,229,204,0.15)] text-[var(--accent-primary)]' 
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            {qConfig[q].icon}
            <span className="ml-1">{qConfig[q].label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Tên template</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nhập tên template..."
            className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Chủ đề</label>
          <TopicSelector value={topic} onChange={setTopic} placeholder="Chọn chủ đề..." />
        </div>

        {/* Knowledge Article */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Bài viết kiến thức</label>
          <KnowledgeSelector value={selectedKnowledge} onChange={setSelectedKnowledge} />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Ghi chú</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Thêm ghi chú..."
            rows={3}
            className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
          />
        </div>

        {/* Exercise Selection */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowHealthMetrics(!showHealthMetrics)}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--accent-dim)] text-[var(--accent-primary)] rounded-lg text-xs font-medium"
            >
              <Activity size={14} />
              {showHealthMetrics ? 'Ẩn' : 'Hiện'} bài tập
            </button>
          </div>

          {showHealthMetrics && (
            <div className="space-y-3 animate-slide-up">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
                <h4 className="font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2">
                  <Heart size={16} />
                  Chọn bài tập liên quan
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {exercises.slice(0, 10).map(exercise => (
                    <label
                      key={exercise.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExercises.includes(exercise.id)}
                        onChange={() => {
                          if (selectedExercises.includes(exercise.id)) {
                            setSelectedExercises(selectedExercises.filter(id => id !== exercise.id));
                          } else {
                            setSelectedExercises([...selectedExercises, exercise.id]);
                          }
                        }}
                        className="rounded border-[var(--border-subtle)]"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-[var(--text-primary)]">{exercise.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {exercise.duration} phút • {exercise.caloriesBurned} kcal
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedExercises.length > 0 && (
                  <div className="mt-2 p-2 bg-[var(--accent-dim)] rounded-lg">
                    <p className="text-xs text-[var(--accent-primary)]">
                      Đã chọn {selectedExercises.length} bài tập
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Media */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Media</span>
            <button
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--accent-primary)] bg-[var(--accent-dim)]"
            >
              <Plus size={12} />
              Thêm
            </button>
          </div>

          {/* Media List */}
          <div className="space-y-2">
            {media.map(block => (
              <div key={block.id} className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                {block.type === 'youtube' && (
                  <div className="aspect-video">
                    <iframe src={block.content} className="w-full h-full" allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                )}
                {block.type === 'image' && (
                  <img src={block.content} alt="" className="w-full max-h-40 object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/1A1A25/5A5A6E?text=Image'; }} />
                )}
                {block.type === 'text' && (
                  <p className="px-3 py-2 text-xs text-[var(--text-primary)] whitespace-pre-wrap line-clamp-3">{block.content}</p>
                )}
                <button onClick={() => setMedia(media.filter(m => m.id !== block.id))}
                  className="absolute top-1.5 right-1.5 size-6 rounded-lg bg-black/70 flex items-center justify-center text-white">
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>

          {/* Media Input */}
          {showMediaInput && (
            <div className="mt-2 flex gap-2 animate-slide-up">
              <input
                type="text"
                value={mediaInput}
                onChange={e => setMediaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMedia()}
                placeholder="🔗 Link YouTube/Image..."
                className="flex-1 bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
              />
              <button
                onClick={handleAddMedia}
                disabled={!mediaInput.trim()}
                className="px-3 py-2 rounded-xl bg-[var(--accent-primary)] text-[var(--bg-base)] disabled:opacity-40"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Finance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Tài chính</span>
            <button
              onClick={() => setShowFinance(!showFinance)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--accent-primary)] bg-[var(--accent-dim)]"
            >
              <DollarSign size={12} />
              {showFinance ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          {showFinance && (
            <div className="space-y-3 animate-slide-up">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Loại</label>
                  <select value={finance?.type || ''} onChange={e => setFinance({ ...finance, type: e.target.value as 'income' | 'expense' })}
                    className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]">
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Số tiền</label>
                  <input
                    type="number"
                    value={finance?.amount || ''}
                    onChange={e => setFinance({ ...finance, amount: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Ghi chú</label>
                <textarea
                  value={finance?.note || ''}
                  onChange={e => setFinance({ ...finance, note: e.target.value })}
                  placeholder="Thêm ghi chú tài chính..."
                  rows={2}
                  className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* XP Reward */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Thưởng EXP</span>
            <button
              onClick={() => setShowXpInput(!showXpInput)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--accent-primary)] bg-[var(--accent-dim)]"
            >
              <Award size={12} />
              {showXpInput ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          {showXpInput && (
            <div className="animate-slide-up">
              <input
                type="number"
                value={xpReward}
                onChange={e => setXpReward(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] active:scale-95 transition-transform">
          Hủy
        </button>
        <button onClick={handleSave} disabled={!title.trim()}
          className="flex-[2] py-3 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center gap-2">
          <Save size={16} />
          {template ? 'Cập nhật' : 'Tạo'}
        </button>
      </div>
    </div>
  );
}

// ── Group Template Editor (Compact Icon-Based) ──
function GroupTemplateEditor({ template, onSave, onCancel }: {
  template?: TaskTemplate;
  onSave: (data: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const allTemplates = useTemplateStore(s => s.templates);
  const availableSingles = allTemplates.filter(t =>
    t.templateType === 'single' || (!t.subtasks?.length && !t.subtaskTemplateIds?.length && t.templateType !== 'group')
  );

  const [title, setTitle] = useState(template?.title || '');
  const [notes, setNotes] = useState(template?.notes || '');
  const [topic, setTopic] = useState(template?.topic || '');
  const [selectedIds, setSelectedIds] = useState<string[]>(template?.subtaskTemplateIds || []);
  const [finance, setFinance] = useState<TaskFinance | undefined>(template?.finance);
  const [showFinance, setShowFinance] = useState(!!template?.finance);
  const [xpReward, setXpReward] = useState(template?.xpReward || 0);
  const [showXpInput, setShowXpInput] = useState(!!template?.xpReward);

  const toggleSingle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedIds.length) return;
    setSelectedIds(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      quadrant: 'do_first',
      recurring: { type: 'none' },
      notes: notes || undefined,
      topic: topic || undefined,
      subtaskTemplateIds: selectedIds,
      finance: showFinance ? finance : undefined,
      xpReward: showXpInput && xpReward > 0 ? xpReward : undefined,
      templateType: 'group',
    });
  };

  return (
    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-accent)] overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">Template nhóm</span>
      </div>

      {/* Main content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Tên nhóm template</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nhập tên nhóm..."
            className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
          />
        </div>

        {/* Topic */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Chủ đề</label>
          <TopicSelector value={topic} onChange={setTopic} placeholder="Chọn chủ đề..." />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Ghi chú</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Thêm ghi chú cho nhóm..."
            rows={3}
            className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
          />
        </div>

        {/* Finance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Tài chính</span>
            <button
              onClick={() => setShowFinance(!showFinance)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--accent-primary)] bg-[var(--accent-dim)]"
            >
              <DollarSign size={12} />
              {showFinance ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          {showFinance && (
            <div className="space-y-3 animate-slide-up">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Loại</label>
                  <select value={finance?.type || ''} onChange={e => setFinance({ ...finance, type: e.target.value as 'income' | 'expense' })}
                    className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] border border-[var(--border-subtle)]">
                    <option value="income">Thu nhập</option>
                    <option value="expense">Chi tiêu</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Số tiền</label>
                  <input
                    type="number"
                    value={finance?.amount || ''}
                    onChange={e => setFinance({ ...finance, amount: parseFloat(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Ghi chú</label>
                <textarea
                  value={finance?.note || ''}
                  onChange={e => setFinance({ ...finance, note: e.target.value })}
                  placeholder="Thêm ghi chú tài chính..."
                  rows={2}
                  className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* XP Reward */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Thưởng EXP</span>
            <button
              onClick={() => setShowXpInput(!showXpInput)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--accent-primary)] bg-[var(--accent-dim)]"
            >
              <Award size={12} />
              {showXpInput ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          {showXpInput && (
            <div className="animate-slide-up">
              <input
                type="number"
                value={xpReward}
                onChange={e => setXpReward(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[var(--bg-surface)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)]"
              />
            </div>
          )}
        </div>

        {/* Template Selection */}
        <div>
          <label className="text-xs text-[var(--text-muted)] font-medium block mb-2">Chọn templates con</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedIds.length > 0 && (
              <div className="mb-2 p-2 bg-[var(--accent-dim)] rounded-lg">
                <p className="text-xs text-[var(--accent-primary)]">
                  Đã chọn {selectedIds.length} templates
                </p>
              </div>
            )}
            {availableSingles.slice(0, 10).map(template => (
              <label
                key={template.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(template.id)}
                  onChange={() => toggleSingle(template.id)}
                  className="rounded border-[var(--border-subtle)]"
                />
                <div className="flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)]">{template.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{template.topic}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] active:scale-95 transition-transform">
          Hủy
        </button>
        <button onClick={handleSave} disabled={!title.trim()}
          className="flex-[2] py-3 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center gap-2">
          <Save size={16} />
          {template ? 'Cập nhật' : 'Tạo'}
        </button>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const currentPage = useSettingsStore(s => s.currentPage);
  const templates = useTemplateStore(s => s.templates);
  const setCurrentPage = useSettingsStore(s => s.setCurrentPage);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | undefined>(undefined);

  // Filter templates by type
  const singleTemplates = templates.filter(t => t.templateType !== 'group');
  const groupTemplates = templates.filter(t => t.templateType === 'group');

  const handleCreateSingle = () => {
    setEditingTemplate(undefined);
    setShowCreateModal(true);
  };

  const handleCreateGroup = () => {
    setEditingTemplate(undefined);
    setShowGroupModal(true);
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    if (template.templateType === 'group') {
      setShowGroupModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa template này?')) {
      const { removeTemplate } = useTemplateStore.getState();
      removeTemplate(id);
    }
  };

  const handleSave = (data: Omit<TaskTemplate, 'id' | 'createdAt'>) => {
    const { addTemplate } = useTemplateStore.getState();
    addTemplate(data);
    setShowCreateModal(false);
    setShowGroupModal(false);
    setEditingTemplate(undefined);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">MẪU VIỆC</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage('ai')}
            className="px-3 py-2 bg-[var(--accent-dim)] text-[var(--accent-primary)] rounded-lg text-sm font-medium flex items-center gap-2 active:scale-95"
          >
            <Bot size={16} />
            AI Helper
          </button>
          <button
            onClick={handleCreateSingle}
            className="px-3 py-2 bg-[var(--accent-primary)] text-[var(--bg-base)] rounded-lg text-sm font-medium flex items-center gap-2 active:scale-95"
          >
            <Plus size={16} />
            MẪU ĐƠN
          </button>
          <button
            onClick={handleCreateGroup}
            className="px-3 py-2 bg-[var(--accent-dim)] text-[var(--accent-primary)] rounded-lg text-sm font-medium flex items-center gap-2 active:scale-95"
          >
            <ListTree size={16} />
            NHÓM MẪU
          </button>
        </div>
      </div>

      {/* Single Templates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">MẪU ĐƠN</h2>
          <button
            onClick={handleCreateSingle}
            className="px-3 py-2 bg-[var(--accent-primary)] text-[var(--bg-base)] rounded-lg text-sm font-medium active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {singleTemplates.map(template => (
            <div key={template.id} className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full font-medium">
                    {template.topic || 'Chung'}
                  </span>
                  {template.exerciseIds && template.exerciseIds.length > 0 && (
                    <span className="px-2 py-1 bg-[rgba(34,197,94,0.2)] text-white text-xs rounded-full font-medium">
                      🏋 {template.exerciseIds.length} bài
                    </span>
                  )}
                  {template.knowledgeId && (
                    <span className="px-2 py-1 bg-[rgba(59,130,246,0.2)] text-white text-xs rounded-full font-medium">
                      📖 Kiến thức
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1.5 rounded-lg text-[var(--accent-primary)] hover:bg-[rgba(0,229,204,0.15)] transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 rounded-lg text-[var(--error)] hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-[var(--text-primary)] mb-2">{template.title}</p>
              {template.notes && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2">{template.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Group Templates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">NHÓM MẪU</h2>
          <button
            onClick={handleCreateGroup}
            className="px-3 py-2 bg-[var(--accent-primary)] text-[var(--bg-base)] rounded-lg text-sm font-medium active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {groupTemplates.map(template => (
            <div key={template.id} className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] text-xs rounded-full font-medium">
                    {template.topic || 'Chung'}
                  </span>
                  <span className="px-2 py-1 bg-[rgba(34,197,94,0.2)] text-white text-xs rounded-full font-medium">
                    📋 {template.subtaskTemplateIds?.length || 0} việc
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1.5 rounded-lg text-[var(--accent-primary)] hover:bg-[rgba(0,229,204,0.15)] transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 rounded-lg text-[var(--error)] hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-[var(--text-primary)] mb-2">{template.title}</p>
              {template.notes && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-2">{template.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showGroupModal) && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-overlay)] flex items-center justify-center p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[var(--border-accent)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {editingTemplate ? 'Cập nhật template' : (showCreateModal ? 'Tạo MẪU ĐƠN' : 'Tạo NHÓM MẪU')}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowGroupModal(false);
                  setEditingTemplate(undefined);
                }}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              {showCreateModal && (
                <TemplateEditor
                  template={editingTemplate}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(undefined);
                  }}
                />
              )}
              {showGroupModal && (
                <GroupTemplateEditor
                  template={editingTemplate}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowGroupModal(false);
                    setEditingTemplate(undefined);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
