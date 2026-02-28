import { useState, useMemo } from 'react';
import { useSettingsStore, useTemplateStore } from '@/stores';
import { convertYoutubeUrl, isYoutubeUrl } from '@/lib/youtubeUtils';
import { 
  Plus, Trash2, Edit3, X, Save, ListTree, Image, Youtube, Type, DollarSign, ArrowRight, ChevronUp, ChevronDown,
  Sparkles, Wand2, Zap, Target, Calendar, Clock, Tag, Award, Coins, FileText, Link, Trash, GripVertical,
  CheckCircle2, AlertTriangle, Play, Pause, RotateCcw, FileEdit, Send, Bot, XCircle, Download, Upload,
} from 'lucide-react';
import type { TaskTemplate, EisenhowerQuadrant, MediaBlock, TaskFinance } from '@/types';
import { QUADRANT_LABELS } from '@/types';

function generateBlockId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ── Topic Selector Component ──
function TopicSelector({ value, onChange, placeholder }: { value: string; onChange: (topic: string) => void; placeholder?: string }) {
  const templates = useTemplateStore(s => s.templates);
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Get unique topics from all templates
  const existingTopics = useMemo(() => {
    const topics = new Set<string>();
    templates.forEach(t => {
      if (t.topic) topics.add(t.topic);
    });
    return Array.from(topics).sort();
  }, [templates]);

  const handleSelect = (topic: string) => {
    onChange(topic);
    setIsOpen(false);
    setShowCreateNew(false);
  };

  const handleCreateNew = () => {
    if (newTopicName.trim()) {
      onChange(newTopicName.trim());
      setNewTopicName('');
      setShowCreateNew(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Selected value display / Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors min-h-[40px]"
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
          {existingTopics.length > 0 ? (
            <div className="p-1">
              <p className="px-3 py-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Chủ đề có sẵn</p>
              {existingTopics.map(topic => (
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
            <p className="px-3 py-2 text-xs text-[var(--text-muted)] italic">Chưa có chủ đề nào</p>
          )}

          {/* Divider */}
          <div className="border-t border-[var(--border-subtle)] my-1" />

          {/* Create new option or input */}
          {!showCreateNew ? (
            <button
              type="button"
              onClick={() => setShowCreateNew(true)}
              className="w-full px-3 py-2 text-left text-sm text-[var(--accent-primary)] hover:bg-[rgba(0,229,204,0.1)] flex items-center gap-2"
            >
              <Plus size={14} />
              Tạo chủ đề mới...
            </button>
          ) : (
            <div className="p-2 space-y-2">
              <input
                type="text"
                value={newTopicName}
                onChange={e => setNewTopicName(e.target.value)}
                placeholder="Nhập tên chủ đề mới..."
                autoFocus
                className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateNew(false)}
                  className="flex-1 py-1.5 rounded-lg text-xs text-[var(--text-muted)] bg-[var(--bg-surface)]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={!newTopicName.trim()}
                  className="flex-1 py-1.5 rounded-lg text-xs text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-50"
                >
                  Tạo
                </button>
              </div>
            </div>
          )}

          {/* Clear selection */}
          {value && (
            <>
              <div className="border-t border-[var(--border-subtle)] my-1" />
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="w-full px-3 py-2 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--bg-surface)] flex items-center gap-2"
              >
                <X size={14} />
                Xóa chọn
              </button>
            </>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => { setIsOpen(false); setShowCreateNew(false); }}
        />
      )}
    </div>
  );
}

// ── Add to Todo Dialog ──
function AddToTodoDialog({ template, onClose }: { template: TaskTemplate; onClose: () => void }) {
  const createTaskFromTemplate = useTemplateStore(s => s.createTaskFromTemplate);
  const templates = useTemplateStore(s => s.templates);
  const [financeType, setFinanceType] = useState<'income' | 'expense'>(template.finance?.type || 'expense');
  const [financeAmount, setFinanceAmount] = useState(template.finance?.amount || 0);
  const [useCustomFinance, setUseCustomFinance] = useState(false);
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>(template.quadrant || 'do_first');

  const isGroup = template.templateType === 'group';
  const referencedTemplates = isGroup && template.subtaskTemplateIds
    ? template.subtaskTemplateIds
        .map(id => templates.find(t => t.id === id))
        .filter(Boolean) as TaskTemplate[]
    : [];

  const handleAdd = () => {
    const finance: TaskFinance | undefined = useCustomFinance && financeAmount > 0
      ? { type: financeType, amount: financeAmount }
      : template.finance;
    createTaskFromTemplate(template.id, finance, quadrant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 px-6" onClick={onClose}>
      <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl p-4 animate-slide-up space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Thêm vào DS việc</h3>
          <button onClick={onClose} className="text-[var(--text-muted)]"><X size={16} /></button>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Mẫu: <span className="font-medium text-[var(--text-primary)]">{template.title}</span>
          {isGroup && (
            <span className="ml-1.5 text-[10px] text-[var(--info)]">(Nhóm việc)</span>
          )}
        </p>

        {/* Quadrant selection when adding into VIỆC */}
        <div>
          <p className="text-[10px] text-[var(--text-muted)] mb-1">Phân loại việc khi thêm</p>
          <div className="grid grid-cols-2 gap-1.5 mb-1">
            {(Object.keys(QUADRANT_LABELS) as EisenhowerQuadrant[]).map(q => {
              const cfg = QUADRANT_LABELS[q];
              return (
                <button
                  key={q}
                  onClick={() => setQuadrant(q)}
                  className={`py-2 rounded-lg text-[11px] font-medium min-h-[32px] border flex items-center justify-center gap-1 ${
                    quadrant === q ? 'border-current' : 'border-transparent bg-[var(--bg-surface)]'
                  }`}
                  style={quadrant === q ? { color: cfg.color, backgroundColor: `${cfg.color}15` } : {}}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Show referenced single tasks for groups */}
        {isGroup && referencedTemplates.length > 0 && (
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Bao gồm {referencedTemplates.length} việc đơn:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {referencedTemplates.map((st, i) => {
                const q = QUADRANT_LABELS[st.quadrant];
                return (
                  <div key={st.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)]">
                    <span className="text-[10px] text-[var(--text-muted)] w-4">{i + 1}.</span>
                    <span className="text-xs text-[var(--text-primary)] flex-1">{st.title}</span>
                    <span className="text-[9px]" style={{ color: q.color }}>{q.icon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {template.finance && (
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Thu chi mẫu: {template.finance.type === 'income' ? '+' : '-'}{template.finance.amount.toLocaleString('vi-VN')}đ</p>
            <button onClick={() => setUseCustomFinance(!useCustomFinance)}
              className="text-[10px] text-[var(--accent-primary)] underline">{useCustomFinance ? 'Dùng thu chi mẫu' : 'Nhập số tiền khác'}</button>
          </div>
        )}
        {(useCustomFinance || !template.finance) && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => setFinanceType('income')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium min-h-[36px] ${financeType === 'income' ? 'bg-[rgba(52,211,153,0.2)] text-[var(--success)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>+ Thu</button>
              <button onClick={() => setFinanceType('expense')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium min-h-[36px] ${financeType === 'expense' ? 'bg-[rgba(248,113,113,0.2)] text-[var(--error)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>- Chi</button>
            </div>
            <input type="number" value={financeAmount || ''} onChange={e => setFinanceAmount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Số tiền" className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] min-h-[36px] font-mono" inputMode="numeric" />
          </div>
        )}

        <button onClick={handleAdd}
          className="w-full py-3 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] active:opacity-80 min-h-[44px] flex items-center justify-center gap-2">
          <ArrowRight size={16} /> Thêm vào danh sách
        </button>
      </div>
    </div>
  );
}

// ── Single Template Editor (Compact Icon-Based) ──
function SingleTemplateEditor({ template, onSave, onCancel }: {
  template?: TaskTemplate;
  onSave: (data: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(template?.title || '');
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>(template?.quadrant || 'do_first');
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

  const qConfig = QUADRANT_LABELS[quadrant];
  // Health metrics removed as per user request - no longer show health stats for SỨC KHỎE topic

  const handleAddMedia = () => {
    const val = mediaInput.trim();
    if (!val) return;
    if (isYoutubeUrl(val)) {
      const embed = convertYoutubeUrl(val);
      if (embed) setMedia([...media, { id: generateBlockId(), type: 'youtube', content: embed }]);
      else setMedia([...media, { id: generateBlockId(), type: 'text', content: val }]);
    } else if (/^https?:\/\//.test(val)) {
      setMedia([...media, { id: generateBlockId(), type: 'image', content: val }]);
    } else {
      setMedia([...media, { id: generateBlockId(), type: 'text', content: val }]);
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
      healthMetrics: undefined, // Removed - no longer storing health metrics in templates
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
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
              quadrant === q 
                ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]' 
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <span className="text-lg">{QUADRANT_LABELS[q].icon}</span>
            <span className="text-[9px] font-medium">{QUADRANT_LABELS[q].label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* Title input */}
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Tên việc..."
          className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] min-h-[48px]"
        />

        {/* Notes */}
        <textarea 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          placeholder="📝 Ghi chú / hướng dẫn..." 
          rows={2}
          className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
        />

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Topic */}
          <div className="flex-1 min-w-[120px]">
            <TopicSelector value={topic} onChange={setTopic} placeholder="📁 Chủ đề" />
          </div>

          {/* XP Toggle */}
          <button
            onClick={() => { setShowXpInput(!showXpInput); if (!showXpInput) setXpReward(10); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${
              showXpInput ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
            }`}
          >
            <Award size={14} />
            {showXpInput ? (
              <input
                type="number"
                value={xpReward || ''}
                onChange={e => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 bg-transparent text-center outline-none font-mono"
                onClick={e => e.stopPropagation()}
              />
            ) : 'EXP'}
          </button>

          {/* Finance Toggle */}
          <button
            onClick={() => { setShowFinance(!showFinance); if (!finance) setFinance({ type: 'expense', amount: 0 }); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${
              showFinance ? 'bg-[rgba(251,191,36,0.15)] text-[var(--warning)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
            }`}
          >
            <Coins size={14} />
            {showFinance ? (finance?.amount ? finance.amount.toLocaleString() : '0') : '₫'}
          </button>
        </div>

        {/* Finance input */}
        {showFinance && finance && (
          <div className="flex gap-2 animate-slide-up">
            <button
              onClick={() => setFinance({ ...finance, type: finance.type === 'income' ? 'expense' : 'income' })}
              className={`px-3 py-2 rounded-xl text-xs font-medium ${
                finance.type === 'income' ? 'bg-[rgba(52,211,153,0.15)] text-[var(--success)]' : 'bg-[rgba(248,113,113,0.15)] text-[var(--error)]'
              }`}
            >
              {finance.type === 'income' ? '↗ Thu' : '↘ Chi'}
            </button>
            <input
              type="number"
              value={finance.amount || ''}
              onChange={e => setFinance({ ...finance, amount: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Số tiền"
              className="flex-1 bg-[var(--bg-surface)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] font-mono"
              inputMode="numeric"
            />
          </div>
        )}

        {/* Media Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Image size={12} className="text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)]">Media ({media.length})</span>
            </div>
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
  const [showAvailable, setShowAvailable] = useState(false);

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

  const removeItem = (id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (selectedIds.length === 0) return;
    onSave({
      title: title.trim(), quadrant: 'do_first', recurring: { type: 'none' },
      notes: notes || undefined,
      topic: topic || undefined,
      subtasks: undefined,
      subtaskTemplateIds: selectedIds,
      finance: showFinance ? finance : undefined,
      xpReward: showXpInput && xpReward > 0 ? xpReward : undefined,
      templateType: 'group',
    });
  };

  const selectedTemplates = selectedIds
    .map(id => availableSingles.find(t => t.id === id))
    .filter(Boolean) as TaskTemplate[];

  const unselectedTemplates = availableSingles.filter(t => !selectedIds.includes(t.id));

  return (
    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-accent)] overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2">
          <ListTree size={18} className="text-[var(--accent-primary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {template ? 'Sửa nhóm' : 'Tạo nhóm'}
          </span>
        </div>
        <button onClick={onCancel} className="size-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)]">
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tên nhóm việc..."
          className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] min-h-[48px]"
        />

        {/* Notes */}
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="📝 Ghi chú nhóm..."
          rows={2}
          className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
        />

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <TopicSelector value={topic} onChange={setTopic} placeholder="📁 Chủ đề" />
          </div>

          <button
            onClick={() => { setShowXpInput(!showXpInput); if (!showXpInput) setXpReward(10); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${
              showXpInput ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
            }`}
          >
            <Award size={14} />
            {showXpInput ? (
              <input
                type="number"
                value={xpReward || ''}
                onChange={e => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-12 bg-transparent text-center outline-none font-mono"
                onClick={e => e.stopPropagation()}
              />
            ) : 'EXP'}
          </button>

          <button
            onClick={() => { setShowFinance(!showFinance); if (!finance) setFinance({ type: 'expense', amount: 0 }); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${
              showFinance ? 'bg-[rgba(251,191,36,0.15)] text-[var(--warning)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
            }`}
          >
            <Coins size={14} />
            {showFinance ? (finance?.amount ? finance.amount.toLocaleString() : '0') : '₫'}
          </button>
        </div>

        {/* Finance input */}
        {showFinance && finance && (
          <div className="flex gap-2 animate-slide-up">
            <button
              onClick={() => setFinance({ ...finance, type: finance.type === 'income' ? 'expense' : 'income' })}
              className={`px-3 py-2 rounded-xl text-xs font-medium ${
                finance.type === 'income' ? 'bg-[rgba(52,211,153,0.15)] text-[var(--success)]' : 'bg-[rgba(248,113,113,0.15)] text-[var(--error)]'
              }`}
            >
              {finance.type === 'income' ? '↗ Thu' : '↘ Chi'}
            </button>
            <input
              type="number"
              value={finance.amount || ''}
              onChange={e => setFinance({ ...finance, amount: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Số tiền"
              className="flex-1 bg-[var(--bg-surface)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] font-mono"
              inputMode="numeric"
            />
          </div>
        )}

        {/* Selected Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-[var(--accent-primary)]" />
              <span className="text-xs text-[var(--text-muted)]">Đã chọn ({selectedTemplates.length})</span>
            </div>
          </div>

          {selectedTemplates.length > 0 ? (
            <div className="space-y-1.5">
              {selectedTemplates.map((st, i) => {
                const q = QUADRANT_LABELS[st.quadrant];
                return (
                  <div key={st.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] w-5">{i + 1}</span>
                    <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{st.title}</span>
                    <span className="text-xs">{q.icon}</span>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => moveItem(i, i - 1)} disabled={i === 0}
                        className="size-6 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30">
                        <ChevronUp size={12} />
                      </button>
                      <button onClick={() => moveItem(i, i + 1)} disabled={i === selectedTemplates.length - 1}
                        className="size-6 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30">
                        <ChevronDown size={12} />
                      </button>
                      <button onClick={() => removeItem(st.id)}
                        className="size-6 rounded-lg bg-[rgba(248,113,113,0.1)] flex items-center justify-center text-[var(--error)]">
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-4 rounded-xl bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)] text-center">
              <p className="text-xs text-[var(--text-muted)]">Chưa chọn việc đơn nào</p>
            </div>
          )}
        </div>

        {/* Add More Button */}
        <button
          onClick={() => setShowAvailable(!showAvailable)}
          className="w-full py-2.5 rounded-xl text-xs font-medium text-[var(--accent-primary)] bg-[var(--accent-dim)] flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          {showAvailable ? 'Ẩn danh sách' : `Thêm việc đơn (${unselectedTemplates.length})`}
        </button>

        {/* Available List */}
        {showAvailable && unselectedTemplates.length > 0 && (
          <div className="space-y-1 max-h-48 overflow-y-auto animate-slide-up">
            {unselectedTemplates.map(st => {
              const q = QUADRANT_LABELS[st.quadrant];
              return (
                <button key={st.id} onClick={() => toggleSingle(st.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] active:bg-[var(--accent-dim)] transition-all">
                  <Plus size={14} className="text-[var(--accent-primary)] flex-shrink-0" />
                  <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{st.title}</span>
                  <span className="text-[10px]" style={{ color: q.color }}>{q.icon}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] active:scale-95 transition-transform">
            Hủy
          </button>
          <button onClick={handleSave} disabled={!title.trim() || selectedIds.length === 0}
            className="flex-[2] py-3 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Save size={16} />
            {template ? 'Cập nhật' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Template View Modal ──
function TemplateViewModal({ template, onClose, onEdit }: {
  template: TaskTemplate;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [showAiEditor, setShowAiEditor] = useState(false);
  const [aiRequest, setAiRequest] = useState('');
  const isGroup = template.templateType === 'group' ||
    (template.subtaskTemplateIds && template.subtaskTemplateIds.length > 0) ||
    (template.subtasks && template.subtasks.length > 0);
  const q = QUADRANT_LABELS[template.quadrant];

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] bg-[var(--bg-elevated)] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col animate-slide-up"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-xl bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent-primary)]">📋</span>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Chi tiết việc mẫu</h2>
              <p className="text-[10px] text-[var(--text-muted)]">{isGroup ? 'Nhóm việc' : 'Việc đơn'} • {q.label}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isGroup && (
              <button
                onClick={() => setShowAiEditor(prev => !prev)}
                className="px-3 py-2 rounded-xl text-[11px] font-medium bg-[var(--bg-surface)] text-[var(--accent-primary)] active:opacity-80 min-h-[36px]"
              >
                ✨ Chỉnh sửa bằng AI
              </button>
            )}
            <button onClick={onEdit} className="size-9 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)]">
              <Edit3 size={15} />
            </button>
            <button onClick={onClose} className="size-9 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)]">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] break-words">{template.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[11px] font-medium" style={{ color: q.color }}>{q.icon} {q.label}</span>
              <span className="text-[10px] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)]">
                {isGroup ? 'Nhóm việc' : 'Việc đơn'}
              </span>
              {template.xpReward && template.xpReward > 0 && (
                <span className="text-[10px] text-[var(--accent-primary)] font-mono">+{template.xpReward} XP</span>
              )}
              {template.finance && (
                <span className={`text-[10px] font-mono ${template.finance.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {template.finance.type === 'income' ? '+' : '-'}{template.finance.amount.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>
          </div>

          {template.notes && (
            <div className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)]">
              <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{template.notes}</p>
            </div>
          )}

          {!isGroup && showAiEditor && (
            <div className="px-3 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-accent)] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--accent-primary)]" />
                <p className="text-xs font-medium text-[var(--accent-primary)]">AI Chỉnh sửa</p>
              </div>
              
              <textarea
                value={aiRequest}
                onChange={e => setAiRequest(e.target.value)}
                placeholder="VD: Rút gọn nội dung, thêm ví dụ, chuyển thành checklist..."
                rows={2}
                className="w-full bg-[var(--bg-base)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
              />
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setAiRequest(''); setShowAiEditor(false); }}
                  className="flex-1 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-base)]"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    // Send AI request to Lucy through navigation
                    const prompt = `Hãy chỉnh sửa việc mẫu "${template.title}" trong MẪU:\n\nNội dung hiện tại: ${template.notes || '(trống)'}\n\nYêu cầu: ${aiRequest}`;
                    // Store in sessionStorage for Lucy to pick up
                    sessionStorage.setItem('lucy_prompt', prompt);
                    sessionStorage.setItem('navigate_to', 'ai');
                    onClose();
                    // Trigger navigation to AI page
                    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'ai' }));
                  }}
                  disabled={!aiRequest.trim()}
                  className="flex-[2] py-2 rounded-xl text-xs font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  Gửi cho Lucy
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {['Rút gọn', 'Thêm ví dụ', 'Checklist', 'Chi tiết hơn', 'Sửa lỗi'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setAiRequest(suggestion)}
                    className="px-2 py-1 rounded-lg text-[10px] text-[var(--text-secondary)] bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isGroup && (template.subtaskTemplateIds?.length || template.subtasks?.length) && (
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
                <ListTree size={12} /> Các việc đơn trong nhóm
              </p>
              <div className="space-y-0.5">
                {(template.subtasks || []).map((s, i) => (
                  <p key={i} className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <span className="w-3 text-center text-[9px]">{i + 1}.</span> {s.title}
                  </p>
                ))}
              </div>
            </div>
          )}

          {template.media && template.media.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1.5 flex items-center gap-1"><Image size={12} /> Nội dung đa phương tiện</p>
              <div className="space-y-2">
                {template.media.map(block => (
                  <div key={block.id} className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    {block.type === 'youtube' && (
                      <div className="aspect-video">
                        <iframe src={block.content} className="w-full h-full" allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                      </div>
                    )}
                    {block.type === 'image' && (
                      <img src={block.content} alt="" className="w-full max-h-48 object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/1A1A25/5A5A6E?text=Image'; }} />
                    )}
                    {block.type === 'text' && (
                      <p className="px-3 py-2 text-sm text-[var(--text-primary)] whitespace-pre-wrap">{block.content}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Templates Page ──
export default function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, removeTemplate } = useTemplateStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [addingToTodo, setAddingToTodo] = useState<TaskTemplate | null>(null);
  const [view, setView] = useState<'single' | 'group'>('single');
  const [viewingTemplate, setViewingTemplate] = useState<TaskTemplate | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<TaskTemplate[]>([]);
  const [importPreview, setImportPreview] = useState(false);

  // Export templates to JSON file
  const handleExport = () => {
    if (templates.length === 0) {
      alert('Chưa có mẫu nào để xuất!');
      return;
    }
    
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      templates: templates,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nghiemwork-templates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import templates from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        if (!data.templates || !Array.isArray(data.templates)) {
          alert('File không hợp lệ! Vui lòng chọn file JSON từ NghiemWork.');
          return;
        }
        
        // Filter valid templates
        const validTemplates = data.templates.filter((t: Partial<TaskTemplate>) => 
          t.title && t.quadrant && t.templateType
        );
        
        if (validTemplates.length === 0) {
          alert('Không tìm thấy mẫu hợp lệ trong file!');
          return;
        }
        
        setImportData(validTemplates);
        setImportPreview(true);
      } catch (error) {
        alert('Lỗi đọc file! Vui lòng chọn file JSON hợp lệ.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Confirm import with duplicate handling and preserve group relationships
  const confirmImport = (replaceExisting: boolean) => {
    type TemplateWithOriginalIds = TaskTemplate & { originalSubtaskIds?: string[] };
    const newTemplates: TemplateWithOriginalIds[] = [];
    const idMapping: Record<string, string> = {}; // oldId -> newId
    let added = 0;
    let skipped = 0;
    
    // First pass: Create all templates and build ID mapping
    importData.forEach((template) => {
      // Check for duplicates by title
      const existing = templates.find(t => t.title === template.title);
      
      if (existing && !replaceExisting) {
        skipped++;
        return;
      }
      
      // Store old ID for mapping
      const oldId = template.id;
      
      // Remove id and createdAt to create new template
      const { id, createdAt, subtaskTemplateIds, ...templateData } = template;
      
      // Add template and get new ID
      const newId = addTemplate({
        ...templateData,
        subtaskTemplateIds: undefined, // Will update in second pass
      });
      
      // Store mapping
      if (oldId) {
        idMapping[oldId] = newId;
      }
      
      // Store for second pass
      newTemplates.push({
        ...template,
        id: newId,
        originalSubtaskIds: subtaskTemplateIds || [],
      });
      
      added++;
    });
    
    // Second pass: Update group templates with new subtask IDs
    newTemplates.forEach((template) => {
      if (template.originalSubtaskIds && template.originalSubtaskIds.length > 0) {
        // Map old subtask IDs to new IDs
        const newSubtaskIds = template.originalSubtaskIds
          .map((oldId: string) => idMapping[oldId])
          .filter(Boolean); // Remove undefined (if subtask was skipped)
        
        if (newSubtaskIds.length > 0) {
          updateTemplate(template.id, { subtaskTemplateIds: newSubtaskIds });
        }
      }
    });
    
    alert(`Đã nhập ${added} mẫu mới! ${skipped > 0 ? `(${skipped} bị bỏ qua do trùng tên)` : ''}\n${newTemplates.filter(t => t.originalSubtaskIds?.length > 0).length} nhóm việc được khôi phục liên kết.`);
    setImportPreview(false);
    setImportData([]);
  };

  // Get all unique topics from templates
  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    templates.forEach(t => {
      if (t.topic) topics.add(t.topic);
    });
    return ['all', ...Array.from(topics).sort()];
  }, [templates]);

  // Filter templates by selected topic
  const templatesByTopic = useMemo(() => {
    if (selectedTopic === 'all') return templates;
    return templates.filter(t => t.topic === selectedTopic);
  }, [templates, selectedTopic]);

  // Classify templates by type (single/group) within selected topic
  const singleTemplates = templatesByTopic.filter(t => {
    if (t.templateType === 'single') {
      if (t.subtaskTemplateIds && t.subtaskTemplateIds.length > 0) return false;
      if (t.subtasks && t.subtasks.length > 0) return false;
      return true;
    }
    if (!t.templateType || t.templateType !== 'group') {
      if (t.subtaskTemplateIds && t.subtaskTemplateIds.length > 0) return false;
      if (t.subtasks && t.subtasks.length > 0) return false;
      return true;
    }
    return false;
  });

  const groupTemplates = templatesByTopic.filter(t => {
    if (t.templateType === 'group') return true;
    if (t.subtaskTemplateIds && t.subtaskTemplateIds.length > 0) return true;
    if (t.subtasks && t.subtasks.length > 0) return true;
    return false;
  });

  // Count templates per topic for badges
  const topicCounts = useMemo(() => {
    const counts: Record<string, { single: number; group: number; total: number }> = { all: { single: 0, group: 0, total: 0 } };
    templates.forEach(t => {
      const isSingle = !((t.templateType === 'group') || (t.subtaskTemplateIds && t.subtaskTemplateIds.length > 0) || (t.subtasks && t.subtasks.length > 0));
      const isGroup = !isSingle;
      
      // Update 'all' counts
      counts.all.total++;
      if (isSingle) counts.all.single++;
      if (isGroup) counts.all.group++;
      
      // Update topic counts
      const topic = t.topic || 'Khác';
      if (!counts[topic]) counts[topic] = { single: 0, group: 0, total: 0 };
      counts[topic].total++;
      if (isSingle) counts[topic].single++;
      if (isGroup) counts[topic].group++;
    });
    return counts;
  }, [templates]);

  const handleSave = (data: Omit<TaskTemplate, 'id' | 'createdAt'>) => {
    if (editingTemplate) updateTemplate(editingTemplate.id, data);
    else addTemplate(data);
    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleEdit = (template: TaskTemplate) => {
    const isGroup = template.templateType === 'group' ||
      (template.subtaskTemplateIds && template.subtaskTemplateIds.length > 0) ||
      (template.subtasks && template.subtasks.length > 0);
    setView(isGroup ? 'group' : 'single');
    setEditingTemplate(template);
    setShowEditor(true);
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Việc Mẫu</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] active:opacity-80 min-h-[40px]">
            <Download size={14} /> Xuất
          </button>
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] active:opacity-80 min-h-[40px] cursor-pointer">
            <Upload size={14} /> Nhập
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={() => { setEditingTemplate(null); setShowEditor(!showEditor); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-[var(--bg-base)] active:opacity-80 min-h-[40px]">
            <Plus size={14} /> {view === 'single' ? 'Tạo việc đơn' : 'Tạo nhóm'}
          </button>
        </div>
      </div>

      {/* Topic tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {allTopics.map(topic => {
          const counts = topicCounts[topic] || { single: 0, group: 0, total: 0 };
          const isSelected = selectedTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => { setSelectedTopic(topic); setShowEditor(false); setEditingTemplate(null); }}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium min-h-[40px] flex flex-col items-center ${
                isSelected
                  ? 'bg-[rgba(0,229,204,0.15)] text-[var(--accent-primary)] border border-[var(--border-accent)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-transparent'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {topic === 'all' ? '📁 Tất cả' : topic === 'Khác' ? '📄 Khác' : `📂 ${topic}`}
                <span className={`inline-flex items-center justify-center min-w-5 h-4 px-1 rounded-full text-[9px] font-bold ${
                  isSelected ? 'bg-[rgba(0,229,204,0.3)]' : 'bg-[var(--bg-base)]'
                }`}>
                  {counts.total}
                </span>
              </span>
              <span className="text-[9px] opacity-70 mt-0.5">
                {counts.single} đơn • {counts.group} nhóm
              </span>
            </button>
          );
        })}
      </div>

      {/* Single/Group sub-tabs */}
      <div className="flex gap-1.5 mb-4">
        <button
          onClick={() => { setView('single'); setShowEditor(false); setEditingTemplate(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-medium min-h-[40px] flex items-center justify-center gap-2 ${
            view === 'single'
              ? 'bg-[rgba(0,229,204,0.15)] text-[var(--accent-primary)] border border-[var(--border-accent)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
          }`}
        >
          VIỆC ĐƠN
          <span className={`inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-[10px] font-bold ${
            view === 'single' ? 'bg-[rgba(0,229,204,0.2)] text-[var(--accent-primary)]' : 'bg-[var(--bg-base)] text-[var(--text-muted)]'
          }`}>
            {singleTemplates.length}
          </span>
        </button>
        <button
          onClick={() => { setView('group'); setShowEditor(false); setEditingTemplate(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-medium min-h-[40px] flex items-center justify-center gap-2 ${
            view === 'group'
              ? 'bg-[rgba(0,229,204,0.15)] text-[var(--accent-primary)] border border-[var(--border-accent)]'
              : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
          }`}
        >
          NHÓM VIỆC
          <span className={`inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-[10px] font-bold ${
            view === 'group' ? 'bg-[rgba(0,229,204,0.2)] text-[var(--accent-primary)]' : 'bg-[var(--bg-base)] text-[var(--text-muted)]'
          }`}>
            {groupTemplates.length}
          </span>
        </button>
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="mb-4">
          {view === 'single' ? (
            <SingleTemplateEditor
              template={editingTemplate?.templateType !== 'group' ? editingTemplate || undefined : undefined}
              onSave={handleSave}
              onCancel={() => { setShowEditor(false); setEditingTemplate(null); }}
            />
          ) : (
            <GroupTemplateEditor
              template={editingTemplate?.templateType === 'group' ? editingTemplate || undefined : undefined}
              onSave={handleSave}
              onCancel={() => { setShowEditor(false); setEditingTemplate(null); }}
            />
          )}
        </div>
      )}

      {/* Empty state */}
      {templates.length === 0 && !showEditor ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4"><span className="text-2xl">📋</span></div>
          <p className="text-sm text-[var(--text-muted)] mb-1">Chưa có việc mẫu nào</p>
          <p className="text-xs text-[var(--text-muted)]">Tạo việc đơn trước, sau đó tạo nhóm việc</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(view === 'single' ? singleTemplates : groupTemplates).length === 0 && !showEditor ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-3">
                <span className="text-xl">{view === 'single' ? '📝' : '📦'}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mb-1">
                {view === 'single' ? 'Chưa có việc đơn nào' : 'Chưa có nhóm việc nào'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {view === 'single'
                  ? 'Tạo việc đơn để sử dụng trong nhóm việc'
                  : singleTemplates.length === 0
                    ? 'Hãy tạo việc đơn trước, sau đó mới tạo nhóm'
                    : 'Tạo nhóm việc từ các việc đơn đã có'}
              </p>
            </div>
          ) : (
            (view === 'single' ? singleTemplates : groupTemplates).map(template => {
              const q = QUADRANT_LABELS[template.quadrant];
              const isGroup = template.templateType === 'group' ||
                (template.subtaskTemplateIds && template.subtaskTemplateIds.length > 0) ||
                (template.subtasks && template.subtasks.length > 0);

              // Resolve subtask template references for display
              const refCount = isGroup
                ? (template.subtaskTemplateIds?.length || template.subtasks?.length || 0)
                : 0;
              const resolvedNames = isGroup && template.subtaskTemplateIds
                ? template.subtaskTemplateIds
                    .map(id => templates.find(t => t.id === id)?.title)
                    .filter(Boolean)
                : isGroup && template.subtasks
                    ? template.subtasks.map(s => s.title)
                    : [];

              return (
                <div key={template.id}
                  className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] p-3 cursor-pointer"
                  onClick={() => setViewingTemplate(template)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] break-words">{template.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-medium" style={{ color: q.color }}>{q.icon} {q.label}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full bg-[var(--bg-surface)]">
                          {isGroup ? 'Nhóm việc' : 'Việc đơn'}
                        </span>
                        {isGroup && refCount > 0 && (
                          <span className="text-[10px] text-[var(--info)] flex items-center gap-0.5">
                            <ListTree size={9} /> {refCount} việc đơn
                          </span>
                        )}
                        {template.media && template.media.length > 0 && (
                          <span className="text-[10px] text-[var(--text-muted)]">{template.media.length} media</span>
                        )}
                        {template.finance && (
                          <span className={`text-[10px] font-mono ${template.finance.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                            {template.finance.type === 'income' ? '+' : '-'}{template.finance.amount.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                        {template.xpReward && template.xpReward > 0 && (
                          <span className="text-[10px] text-[var(--accent-primary)] font-mono">+{template.xpReward} XP</span>
                        )}
                      </div>
                      {/* Show subtask names for groups */}
                      {isGroup && resolvedNames.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {resolvedNames.map((name, i) => (
                            <p key={i} className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                              <span className="text-[9px] w-3 text-center">{i + 1}.</span> {name}
                            </p>
                          ))}
                        </div>
                      )}
                      {template.notes && <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2">{template.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setAddingToTodo(template); }}
                        className="px-3 py-2 rounded-lg bg-[var(--accent-dim)] text-[10px] font-semibold text-[var(--accent-primary)] active:opacity-70 min-h-[36px] whitespace-nowrap">
                        + Thêm
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(template); }}
                        className="size-9 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] active:opacity-70"><Edit3 size={14} /></button>
                      <button onClick={(e) => { e.stopPropagation(); removeTemplate(template.id); }}
                        className="size-9 rounded-lg bg-[rgba(248,113,113,0.1)] flex items-center justify-center text-[var(--error)] active:opacity-70"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {addingToTodo && <AddToTodoDialog template={addingToTodo} onClose={() => setAddingToTodo(null)} />}
      
      {/* Import Preview Dialog */}
      {importPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl p-4 animate-slide-up space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Xem trước nhập mẫu</h3>
              <button onClick={() => { setImportPreview(false); setImportData([]); }} className="text-[var(--text-muted)]"><X size={16} /></button>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Tìm thấy {importData.length} mẫu trong file
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {importData.map((t, i) => {
                const existing = templates.find(et => et.title === t.title);
                return (
                  <div key={i} className={`p-2 rounded-lg text-xs ${existing ? 'bg-[rgba(251,191,36,0.1)] border border-[var(--warning)]' : 'bg-[var(--bg-surface)]'}`}>
                    <div className="flex items-center gap-1">
                      <span>{t.templateType === 'group' ? '📦' : '📝'}</span>
                      <span className="font-medium text-[var(--text-primary)]">{t.title}</span>
                    </div>
                    {existing && (
                      <span className="text-[10px] text-[var(--warning)]">⚠️ Đã tồn tại</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={() => confirmImport(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-primary)]">
                Chỉ thêm mới
              </button>
              <button onClick={() => confirmImport(true)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-[var(--bg-base)]">
                Thay thế tất cả
              </button>
            </div>
          </div>
        </div>
      )}
      
      {viewingTemplate && (
        <TemplateViewModal
          template={viewingTemplate}
          onClose={() => setViewingTemplate(null)}
          onEdit={() => {
            setViewingTemplate(null);
            handleEdit(viewingTemplate);
          }}
        />
      )}
    </div>
  );
}
