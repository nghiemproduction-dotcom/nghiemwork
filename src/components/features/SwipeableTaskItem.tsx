import { useState, useRef, useCallback } from 'react';
import { Calendar, UserX, Trash2, X, Copy, Sparkles, ChevronRight } from 'lucide-react';
import { useTaskStore, useTemplateStore } from '@/stores';
import type { Task } from '@/types';
import { toast } from 'sonner';

interface SwipeableTaskItemProps {
  task: Task;
  children: React.ReactNode;
  onView: () => void;
  onStartTimer?: () => void;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableTaskItem({ task, children, onView }: SwipeableTaskItemProps) {
  const [offset, setOffset] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const touchStartX = useRef(0);
  const currentOffset = useRef(0);

  const updateTask = useTaskStore(s => s.updateTask);
  const removeTask = useTaskStore(s => s.removeTask);
  const templates = useTemplateStore(s => s.templates);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
    currentOffset.current = offset;
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - touchStartX.current;
    const newOffset = Math.max(-200, Math.min(200, currentOffset.current + diff));
    setOffset(newOffset);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (offset > SWIPE_THRESHOLD) {
      // Swiped right - show Schedule
      setShowScheduleModal(true);
      setOffset(0);
    } else if (offset < -SWIPE_THRESHOLD) {
      // Swiped left - show actions
      setShowDeleteModal(true);
      setOffset(0);
    } else {
      setOffset(0);
    }
  }, [offset]);

  const handleSchedule = (newDeadline: number, dateStr: string, timeStr: string) => {
    updateTask(task.id, {
      deadline: newDeadline,
      deadlineDate: dateStr,
      deadlineTime: timeStr,
      quadrant: 'schedule',
    });
    setShowScheduleModal(false);
    toast.success('Đã lên lịch việc này');
  };

  const generateAIDescription = async () => {
    setIsGeneratingAI(true);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const template = task.templateId ? templates.find(t => t.id === task.templateId) : null;
    const desc = `📋 NHIỆM VỤ: ${task.title}

🎯 Mô tả chi tiết:
- Cần thực hiện: ${task.title}
- Phân loại: ${task.quadrant === 'do_first' ? 'Làm ngay' : task.quadrant === 'schedule' ? 'Lên lịch' : task.quadrant === 'delegate' ? 'Ủy thác' : 'Loại bỏ'}
${template ? `- Thuộc mẫu: ${template.title}` : ''}
${task.notes ? `- Ghi chú: ${task.notes}` : ''}
${task.deadline ? `- Hạn chót: ${new Date(task.deadline).toLocaleString('vi-VN')}` : ''}

✅ Yêu cầu:
- Hoàn thành đúng hạn
- Báo cáo tiến độ
- Đảm bảo chất lượng

💬 Liên hệ nếu cần hỗ trợ thêm.`;
    
    setAiDescription(desc);
    setIsGeneratingAI(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiDescription);
    toast.success('Đã copy nội dung!');
  };

  const handleDelete = () => {
    removeTask(task.id);
    setShowDeleteModal(false);
    toast.success('Đã đưa vào thùng rác');
  };

  const handleDelegate = () => {
    updateTask(task.id, { quadrant: 'delegate' });
    setShowDelegateModal(false);
    toast.success('Đã chuyển sang Ủy thác');
  };

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Background actions */}
        <div 
          className="absolute inset-0 flex items-center justify-between px-4"
          style={{
            background: offset > 0 
              ? 'linear-gradient(90deg, rgba(0,229,204,0.2) 0%, transparent 100%)' 
              : offset < 0 
                ? 'linear-gradient(270deg, rgba(248,113,113,0.2) 0%, rgba(251,191,36,0.2) 50%, transparent 100%)' 
                : 'transparent'
          }}
        >
          {offset > 30 && (
            <div className="flex items-center gap-2 text-[var(--accent-primary)]">
              <Calendar size={20} />
              <span className="text-xs font-medium">Lên lịch</span>
            </div>
          )}
          {offset < -30 && (
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-1 text-[var(--warning)]">
                <UserX size={16} />
                <span className="text-xs font-medium">Ủy thác</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--error)]">
                <Trash2 size={16} />
                <span className="text-xs font-medium">Xóa</span>
              </div>
            </div>
          )}
        </div>

        {/* Task content */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={() => offset !== 0 && setOffset(0)}
          onClick={onView}
          style={{ transform: `translateX(${offset}px)`, transition: offset === 0 ? 'transform 0.2s ease-out' : 'none' }}
          className="relative bg-[var(--bg-elevated)] cursor-pointer active:scale-[0.98] transition-transform"
        >
          {children}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Calendar size={16} className="text-[var(--accent-primary)]" />
                Lên lịch việc này
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Chọn thời điểm bạn muốn làm việc này (trì hoãn chủ động)
            </p>
            <SchedulePicker onSchedule={handleSchedule} onCancel={() => setShowScheduleModal(false)} />
          </div>
        </div>
      )}

      {/* Delegate Modal with AI */}
      {showDelegateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl p-4 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <UserX size={16} className="text-[var(--warning)]" />
                Ủy thác việc này
              </h3>
              <button onClick={() => setShowDelegateModal(false)} className="text-[var(--text-muted)]">
                <X size={18} />
              </button>
            </div>
            
            {!aiDescription && !isGeneratingAI && (
              <div className="text-center py-6">
                <button
                  onClick={generateAIDescription}
                  className="flex items-center gap-2 mx-auto px-4 py-3 rounded-xl bg-[var(--accent-dim)] text-[var(--accent-primary)] font-medium"
                >
                  <Sparkles size={18} />
                  Tạo mô tả bằng AI
                </button>
                <p className="text-xs text-[var(--text-muted)] mt-3">
                  AI sẽ tạo mô tả chi tiết để bạn gửi cho người được ủy thác
                </p>
              </div>
            )}

            {isGeneratingAI && (
              <div className="text-center py-8">
                <div className="animate-spin size-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-xs text-[var(--text-muted)]">AI đang tạo mô tả...</p>
              </div>
            )}

            {aiDescription && (
              <>
                <div className="bg-[var(--bg-surface)] rounded-xl p-3 mb-3">
                  <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap font-sans">
                    {aiDescription}
                  </pre>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-[var(--accent-primary)] bg-[var(--accent-dim)] mb-3"
                >
                  <Copy size={16} /> Copy nội dung
                </button>
              </>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowDelegateModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)]"
              >
                Hủy
              </button>
              <button
                onClick={handleDelegate}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[var(--bg-base)] bg-[var(--warning)]"
              >
                Xác nhận Ủy thác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Actions Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl p-4 animate-slide-up">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">Chọn hành động</h3>
            
            <div className="space-y-2 mb-4">
              <button
                onClick={() => { setShowDeleteModal(false); setShowDelegateModal(true); }}
                className="w-full py-3 px-4 rounded-xl flex items-center gap-3 bg-[rgba(251,191,36,0.1)] text-[var(--warning)]"
              >
                <UserX size={18} />
                <div className="text-left">
                  <p className="text-sm font-medium">Ủy thác</p>
                  <p className="text-[10px] opacity-70">Giao việc cho người khác</p>
                </div>
                <ChevronRight size={16} className="ml-auto" />
              </button>
              
              <button
                onClick={() => { setShowDeleteModal(false); setShowScheduleModal(true); }}
                className="w-full py-3 px-4 rounded-xl flex items-center gap-3 bg-[rgba(0,229,204,0.1)] text-[var(--accent-primary)]"
              >
                <Calendar size={18} />
                <div className="text-left">
                  <p className="text-sm font-medium">Lên lịch</p>
                  <p className="text-[10px] opacity-70">Đặt lại thời gian</p>
                </div>
                <ChevronRight size={16} className="ml-auto" />
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full py-3 px-4 rounded-xl flex items-center gap-3 bg-[rgba(248,113,113,0.1)] text-[var(--error)]"
              >
                <Trash2 size={18} />
                <div className="text-left">
                  <p className="text-sm font-medium">Loại bỏ</p>
                  <p className="text-[10px] opacity-70">Đưa vào thùng rác</p>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setShowDeleteModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)]"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Schedule picker component
function SchedulePicker({ onSchedule, onCancel }: { onSchedule: (deadline: number, date: string, time: string) => void; onCancel: () => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const presets = [
    { label: 'Hôm nay', days: 0 },
    { label: 'Ngày mai', days: 1 },
    { label: '3 ngày', days: 3 },
    { label: 'Tuần sau', days: 7 },
  ];

  const handlePreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
    setTime('09:00');
  };

  const handleConfirm = () => {
    if (!date) return;
    const deadline = new Date(`${date}T${time || '23:59'}`).getTime();
    onSchedule(deadline, date, time || '23:59');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {presets.map(p => (
          <button
            key={p.days}
            onClick={() => handlePreset(p.days)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent-primary)]"
          >
            {p.label}
          </button>
        ))}
      </div>
      
      <div className="space-y-2">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <input
          type="time"
          value={time}
          onChange={e => setTime(e.target.value)}
          className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </div>
      
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)]">
          Hủy
        </button>
        <button 
          onClick={handleConfirm}
          disabled={!date}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-50"
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
