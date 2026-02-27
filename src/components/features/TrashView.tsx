import { useState } from 'react';
import { useTaskStore } from '@/stores';
import { Trash2, RotateCcw, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '@/types';

export function TrashView() {
  const deletedTasks = useTaskStore(s => s.deletedTasks);
  const restoreFromTrash = useTaskStore(s => s.restoreFromTrash);
  const deletePermanently = useTaskStore(s => s.deletePermanently);
  const clearTrash = useTaskStore(s => s.clearTrash);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = (task: Task) => {
    setRestoringId(task.id);
    restoreFromTrash(task.id);
    setRestoringId(null);
    toast.success(`Đã khôi phục "${task.title}"`);
  };

  const handleDelete = (task: Task) => {
    deletePermanently(task.id);
    toast.success('Đã xóa vĩnh viễn');
  };

  const handleClearAll = () => {
    clearTrash();
    setShowClearConfirm(false);
    toast.success('Đã làm sạch thùng rác');
  };

  const formatDeletedTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-[rgba(248,113,113,0.15)] flex items-center justify-center">
            <Trash2 size={20} className="text-[var(--error)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Thùng rác</h1>
            <p className="text-xs text-[var(--text-muted)]">
              {deletedTasks.length} việc đã xóa
            </p>
          </div>
        </div>
        {deletedTasks.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3 py-2 rounded-lg text-xs font-medium text-[var(--error)] bg-[rgba(248,113,113,0.1)] hover:bg-[rgba(248,113,113,0.2)]"
          >
            Làm sạch
          </button>
        )}
      </div>

      {/* Empty state */}
      {deletedTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-[var(--success)]" />
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-1">Thùng rác trống</p>
          <p className="text-xs text-[var(--text-muted)]">
            Các việc bị xóa sẽ xuất hiện ở đây
          </p>
        </div>
      )}

      {/* Deleted tasks list */}
      <div className="space-y-2">
        {deletedTasks.map(task => (
          <div
            key={task.id}
            className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] line-through opacity-70">
                  {task.title}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Đã xóa: {formatDeletedTime(task.deletedAt)}
                </p>
                {task.quadrant && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)]">
                    {task.quadrant === 'do_first' && '🔴 Làm ngay'}
                    {task.quadrant === 'schedule' && '🔵 Lên lịch'}
                    {task.quadrant === 'delegate' && '🟡 Ủy thác'}
                    {task.quadrant === 'eliminate' && '⚪ Loại bỏ'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleRestore(task)}
                  disabled={restoringId === task.id}
                  className="p-2 rounded-lg text-[var(--success)] bg-[rgba(52,211,153,0.1)] hover:bg-[rgba(52,211,153,0.2)] disabled:opacity-50"
                  title="Khôi phục"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  className="p-2 rounded-lg text-[var(--error)] bg-[rgba(248,113,113,0.1)] hover:bg-[rgba(248,113,113,0.2)]"
                  title="Xóa vĩnh viễn"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-xl bg-[rgba(248,113,113,0.15)] flex items-center justify-center">
                <AlertTriangle size={20} className="text-[var(--error)]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Xác nhận xóa</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Xóa vĩnh viễn {deletedTasks.length} việc?
                </p>
              </div>
            </div>
            
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Hành động này không thể hoàn tác. Tất cả việc trong thùng rác sẽ bị xóa vĩnh viễn.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)]"
              >
                Hủy
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[var(--bg-base)] bg-[var(--error)]"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
