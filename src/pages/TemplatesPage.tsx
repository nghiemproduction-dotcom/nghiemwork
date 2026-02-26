import { useState } from 'react';
import { useSettingsStore, useTemplateStore } from '@/stores';
import { convertYoutubeUrl, isYoutubeUrl } from '@/lib/youtubeUtils';
import {
  Plus, Trash2, Edit3, X, Save, ListTree, Image, Youtube, Type, DollarSign, ArrowRight, ChevronUp, ChevronDown,
} from 'lucide-react';
import type { TaskTemplate, EisenhowerQuadrant, MediaBlock, TaskFinance } from '@/types';
import { QUADRANT_LABELS } from '@/types';

function generateBlockId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

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

// ── Single Template Editor ──
function SingleTemplateEditor({ template, onSave, onCancel }: {
  template?: TaskTemplate;
  onSave: (data: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(template?.title || '');
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>(template?.quadrant || 'do_first');
  const [notes, setNotes] = useState(template?.notes || '');
  const [media, setMedia] = useState<MediaBlock[]>(template?.media || []);
  const [mediaInput, setMediaInput] = useState('');
  const [mediaType, setMediaType] = useState<'auto' | 'text'>('auto');
  const [finance, setFinance] = useState<TaskFinance | undefined>(template?.finance);
  const [showFinance, setShowFinance] = useState(!!template?.finance);
  const [xpReward, setXpReward] = useState(template?.xpReward || 0);

  const handleAddMedia = () => {
    const val = mediaInput.trim();
    if (!val) return;
    if (mediaType === 'text') {
      setMedia([...media, { id: generateBlockId(), type: 'text', content: val }]);
    } else if (isYoutubeUrl(val)) {
      const embed = convertYoutubeUrl(val);
      if (embed) setMedia([...media, { id: generateBlockId(), type: 'youtube', content: embed }]);
      else { setMedia([...media, { id: generateBlockId(), type: 'text', content: val }]); }
    } else if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(val)) {
      setMedia([...media, { id: generateBlockId(), type: 'image', content: val }]);
    } else if (/^https?:\/\//.test(val)) {
      setMedia([...media, { id: generateBlockId(), type: 'image', content: val }]);
    } else {
      setMedia([...media, { id: generateBlockId(), type: 'text', content: val }]);
    }
    setMediaInput('');
    setMediaType('auto');
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(), quadrant, recurring: { type: 'none' },
      notes: notes || undefined,
      subtasks: undefined,
      subtaskTemplateIds: undefined,
      media: media.length > 0 ? media : undefined,
      finance: showFinance ? finance : undefined,
      xpReward: xpReward > 0 ? xpReward : undefined,
      templateType: 'single',
    });
  };

  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-accent)] p-4 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{template ? 'Chỉnh sửa việc đơn' : 'Tạo việc đơn mới'}</h3>
        <button onClick={onCancel} className="text-[var(--text-muted)]"><X size={16} /></button>
      </div>

      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên việc đơn"
        className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] min-h-[44px]" />

      {/* XP Reward */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--text-muted)]">EXP thưởng:</label>
        <input type="number" value={xpReward || ''} onChange={e => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
          placeholder="0" className="w-24 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] min-h-[36px] font-mono" inputMode="numeric" />
        <span className="text-[10px] text-[var(--text-muted)]">XP khi hoàn thành</span>
      </div>

      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú / hướng dẫn..." rows={2}
        className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none" />

      {/* Media - YouTube, Image, Text */}
      <div>
        <p className="text-xs text-[var(--text-muted)] mb-1.5 flex items-center gap-1"><Image size={12} /> Nội dung đa phương tiện</p>
        {media.map(block => (
          <div key={block.id} className="relative rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] mb-2">
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
            <button onClick={() => setMedia(media.filter(m => m.id !== block.id))}
              className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 flex items-center justify-center text-white"><X size={12} /></button>
          </div>
        ))}
        <div className="flex gap-1.5 mb-2">
          <button onClick={() => setMediaType('auto')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${mediaType === 'auto' ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
            <Youtube size={10} className="inline mr-1" />Link
          </button>
          <button onClick={() => setMediaType('text')}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${mediaType === 'text' ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
            <Type size={10} className="inline mr-1" />Văn bản
          </button>
        </div>
        <div className="flex gap-2">
          {mediaType === 'text' ? (
            <textarea value={mediaInput} onChange={e => setMediaInput(e.target.value)} placeholder="Nhập nội dung văn bản..."
              rows={2} className="flex-1 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none" />
          ) : (
            <input type="text" value={mediaInput} onChange={e => setMediaInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMedia()}
              placeholder="Dán link YouTube hoặc link ảnh..." className="flex-1 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] min-h-[36px]" />
          )}
          <button onClick={handleAddMedia} className="size-9 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center text-[var(--accent-primary)]"><Plus size={14} /></button>
        </div>
      </div>

      {/* Finance */}
      <div>
        <button onClick={() => { setShowFinance(!showFinance); if (!finance) setFinance({ type: 'expense', amount: 0 }); }}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1.5">
          <DollarSign size={12} /> Thu chi {showFinance ? '▼' : '▶'}
        </button>
        {showFinance && finance && (
          <div className="flex gap-2">
            <select value={finance.type} onChange={e => setFinance({ ...finance, type: e.target.value as 'income' | 'expense' })}
              className="bg-[var(--bg-surface)] rounded-lg px-2 py-2 text-xs text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] min-h-[36px]">
              <option value="income">Thu</option>
              <option value="expense">Chi</option>
            </select>
            <input type="number" value={finance.amount || ''} onChange={e => setFinance({ ...finance, amount: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Số tiền" className="flex-1 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] min-h-[36px] font-mono" inputMode="numeric" />
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={!title.trim()}
        className="w-full py-3 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30 active:opacity-80 min-h-[44px] flex items-center justify-center gap-2">
        <Save size={16} /> {template ? 'Cập nhật' : 'Tạo việc đơn'}
      </button>
    </div>
  );
}

// ── Group Template Editor ──
function GroupTemplateEditor({ template, onSave, onCancel }: {
  template?: TaskTemplate;
  onSave: (data: Omit<TaskTemplate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const allTemplates = useTemplateStore(s => s.templates);
  // Available single templates to pick from
  const singleTemplates = allTemplates.filter(t =>
    t.templateType === 'single' || (!t.subtasks?.length && !t.subtaskTemplateIds?.length && t.templateType !== 'group')
  );

  const [title, setTitle] = useState(template?.title || '');
  const [quadrant] = useState<EisenhowerQuadrant>(template?.quadrant || 'do_first');
  const [notes, setNotes] = useState(template?.notes || '');
  const [selectedIds, setSelectedIds] = useState<string[]>(template?.subtaskTemplateIds || []);
  const [finance, setFinance] = useState<TaskFinance | undefined>(template?.finance);
  const [showFinance, setShowFinance] = useState(!!template?.finance);
  const [xpReward, setXpReward] = useState(template?.xpReward || 0);

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
      title: title.trim(), quadrant, recurring: { type: 'none' },
      notes: notes || undefined,
      subtasks: undefined,
      subtaskTemplateIds: selectedIds,
      finance: showFinance ? finance : undefined,
      xpReward: xpReward > 0 ? xpReward : undefined,
      templateType: 'group',
    });
  };

  // Resolve selected IDs to template objects (filter out deleted ones)
  const selectedTemplates = selectedIds
    .map(id => singleTemplates.find(t => t.id === id))
    .filter(Boolean) as TaskTemplate[];

  // Unselected single templates
  const unselectedTemplates = singleTemplates.filter(t => !selectedIds.includes(t.id));

  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-accent)] p-4 space-y-3 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{template ? 'Chỉnh sửa nhóm việc' : 'Tạo nhóm việc mới'}</h3>
        <button onClick={onCancel} className="text-[var(--text-muted)]"><X size={16} /></button>
      </div>

      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên nhóm việc"
        className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] min-h-[44px]" />

      {/* XP Reward */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--text-muted)]">EXP thưởng:</label>
        <input type="number" value={xpReward || ''} onChange={e => setXpReward(Math.max(0, parseInt(e.target.value) || 0))}
          placeholder="0" className="w-24 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] min-h-[36px] font-mono" inputMode="numeric" />
        <span className="text-[10px] text-[var(--text-muted)]">XP khi hoàn thành</span>
      </div>

      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú cho nhóm việc..." rows={2}
        className="w-full bg-[var(--bg-surface)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none" />

      {/* Selected single templates (ordered list) */}
      <div>
        <p className="text-xs text-[var(--text-muted)] mb-1.5 flex items-center gap-1">
          <ListTree size={12} /> Việc đơn đã chọn ({selectedTemplates.length})
        </p>
        {selectedTemplates.length > 0 ? (
          <div className="space-y-1 mb-2">
            {selectedTemplates.map((st, i) => {
              const q = QUADRANT_LABELS[st.quadrant];
              return (
                <div key={st.id} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] w-4 text-center font-mono">{i + 1}</span>
                  <span className="text-xs text-[var(--text-primary)] flex-1">{st.title}</span>
                  <span className="text-[9px]" style={{ color: q.color }}>{q.icon}</span>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => moveItem(i, i - 1)}
                      disabled={i === 0}
                      className="size-6 rounded bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30"
                    >
                      <ChevronUp size={10} />
                    </button>
                    <button
                      onClick={() => moveItem(i, i + 1)}
                      disabled={i === selectedTemplates.length - 1}
                      className="size-6 rounded bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] disabled:opacity-30"
                    >
                      <ChevronDown size={10} />
                    </button>
                    <button onClick={() => removeItem(st.id)} className="size-6 rounded bg-[rgba(248,113,113,0.1)] flex items-center justify-center text-[var(--error)]">
                      <X size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[10px] text-[var(--text-muted)] mb-2 px-2.5 py-2 rounded-lg bg-[var(--bg-surface)] border border-dashed border-[var(--border-subtle)]">
            Chưa chọn việc đơn nào. Hãy chọn từ danh sách bên dưới.
          </p>
        )}

        {/* Available single templates to add */}
        {unselectedTemplates.length > 0 ? (
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Chọn việc đơn để thêm vào nhóm:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-1">
              {unselectedTemplates.map(st => {
                const q = QUADRANT_LABELS[st.quadrant];
                return (
                  <button key={st.id} onClick={() => toggleSingle(st.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-[var(--bg-surface)] active:bg-[var(--accent-dim)] transition-colors">
                    <Plus size={12} className="text-[var(--accent-primary)] flex-shrink-0" />
                    <span className="text-xs text-[var(--text-primary)] flex-1">{st.title}</span>
                    <span className="text-[9px]" style={{ color: q.color }}>{q.icon} {q.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : singleTemplates.length === 0 ? (
          <div className="px-2.5 py-3 rounded-lg bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.2)]">
            <p className="text-[11px] text-[var(--warning)] font-medium">⚠ Chưa có việc đơn nào</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Hãy tạo việc đơn trước, sau đó quay lại đây để tạo nhóm việc.</p>
          </div>
        ) : (
          <p className="text-[10px] text-[var(--text-muted)] px-2.5">Đã chọn tất cả việc đơn.</p>
        )}
      </div>

      {/* Finance */}
      <div>
        <button onClick={() => { setShowFinance(!showFinance); if (!finance) setFinance({ type: 'expense', amount: 0 }); }}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-1.5">
          <DollarSign size={12} /> Thu chi {showFinance ? '▼' : '▶'}
        </button>
        {showFinance && finance && (
          <div className="flex gap-2">
            <select value={finance.type} onChange={e => setFinance({ ...finance, type: e.target.value as 'income' | 'expense' })}
              className="bg-[var(--bg-surface)] rounded-lg px-2 py-2 text-xs text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] min-h-[36px]">
              <option value="income">Thu</option>
              <option value="expense">Chi</option>
            </select>
            <input type="number" value={finance.amount || ''} onChange={e => setFinance({ ...finance, amount: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Số tiền" className="flex-1 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] outline-none border border-[var(--border-subtle)] min-h-[36px] font-mono" inputMode="numeric" />
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={!title.trim() || selectedIds.length === 0}
        className="w-full py-3 rounded-xl text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30 active:opacity-80 min-h-[44px] flex items-center justify-center gap-2">
        <Save size={16} /> {template ? 'Cập nhật' : 'Tạo nhóm việc'}
      </button>
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
            <div className="px-3 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-accent)] space-y-2">
              <p className="text-[11px] text-[var(--text-secondary)] mb-1">
                Nhập yêu cầu cho AI để viết lại / hoàn thiện bài hướng dẫn cho việc đơn này.
                Sau đó copy đoạn gợi ý bên dưới và dán vào Lucy.
              </p>
              <textarea
                value={aiRequest}
                onChange={e => setAiRequest(e.target.value)}
                placeholder="Ví dụ: Rút gọn nội dung, thêm ví dụ minh hoạ, giữ nguyên cấu trúc các bước..."
                rows={3}
                className="w-full bg-[var(--bg-base)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none border border-[var(--border-subtle)] resize-none"
              />
              <div className="bg-[var(--bg-base)] rounded-lg px-3 py-2 border border-dashed border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--text-muted)] mb-1">Đoạn gợi ý gửi cho Lucy:</p>
                <p className="text-[11px] text-[var(--text-primary)] whitespace-pre-wrap">
                  {`Hãy chỉnh sửa lại việc đơn "${template.title}" trong tab MẪU.\n\nNội dung hiện tại:\n${template.notes || '(chưa có ghi chú, chỉ có media hình ảnh/video)'}\n\nYêu cầu chỉnh sửa:\n${aiRequest || '(bạn hãy mô tả yêu cầu chỉnh sửa ở đây)'}`}
                </p>
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

  // Classify templates
  const singleTemplates = templates.filter(t => {
    if (t.templateType === 'group') return false;
    if (t.subtaskTemplateIds && t.subtaskTemplateIds.length > 0) return false;
    // Legacy: templates with subtasks are groups
    if (t.subtasks && t.subtasks.length > 0) return false;
    return true;
  });

  const groupTemplates = templates.filter(t => {
    if (t.templateType === 'group') return true;
    if (t.subtaskTemplateIds && t.subtaskTemplateIds.length > 0) return true;
    // Legacy: templates with subtasks are groups
    if (t.subtasks && t.subtasks.length > 0) return true;
    return false;
  });

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
        <button onClick={() => { setEditingTemplate(null); setShowEditor(!showEditor); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-primary)] text-[var(--bg-base)] active:opacity-80 min-h-[40px]">
          <Plus size={14} /> {view === 'single' ? 'Tạo việc đơn' : 'Tạo nhóm'}
        </button>
      </div>

      {/* Sub tabs */}
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
