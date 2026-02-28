import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Heart, Brain, Activity, Moon, Droplets, Weight, Zap } from 'lucide-react';
import { TaskHealthData, HealthMetrics, DailyHealthEntry } from '@/types';
import { analyzeTaskForHealth } from '@/lib/healthDetection';
import { useTaskStore } from '@/stores';
import { toast } from 'sonner';

interface HealthDataModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  onComplete: (healthData: Partial<HealthMetrics>) => void;
}

const HEALTH_ICONS = {
  sleep: Moon,
  exercise: Activity,
  nutrition: Heart,
  hydration: Droplets,
  weight: Weight,
  mood: Brain,
  energy: Zap,
  heart_health: Heart,
  stress: Brain,
  productivity: Zap,
};

const HEALTH_COLORS = {
  sleep: 'text-blue-500',
  exercise: 'text-green-500',
  nutrition: 'text-orange-500',
  hydration: 'text-cyan-500',
  weight: 'text-purple-500',
  mood: 'text-pink-500',
  energy: 'text-yellow-500',
  heart_health: 'text-red-500',
  stress: 'text-indigo-500',
  productivity: 'text-emerald-500',
};

export function HealthDataModalNew({ isOpen, onClose, taskId, taskTitle, onComplete }: HealthDataModalNewProps) {
  const [healthData, setHealthData] = useState<TaskHealthData | null>(null);
  const [formData, setFormData] = useState<Partial<HealthMetrics>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { updateTask } = useTaskStore();

  useEffect(() => {
    if (isOpen && taskId) {
      setLoading(true);
      analyzeTaskForHealth(taskTitle)
        .then(data => {
          setHealthData({ ...data, taskId });
          // Initialize form with empty values
          const initialData: Partial<HealthMetrics> = {};
          data.suggestedFields.forEach(field => {
            if (field.type === 'select' && field.options) {
              (initialData as Record<string, unknown>)[field.field] = field.options.length > 0 ? 3 : undefined; // Default to middle option
            } else if (field.type === 'range') {
              (initialData as Record<string, unknown>)[field.field] = field.min ? field.min + (field.max! - field.min) / 2 : 5;
            } else if (field.field === 'bloodPressure') {
              // Special handling for blood pressure object
              (initialData as Record<string, unknown>)[field.field] = { systolic: 120, diastolic: 80 };
            }
          });
          setFormData(initialData);
        })
        .catch(error => {
          console.error('Failed to analyze task:', error);
          toast.error('Không thể phân tích task');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, taskId, taskTitle]);

  const handleInputChange = (field: keyof HealthMetrics, value: number | string | { systolic: number; diastolic: number }) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!healthData) return;
    
    setSubmitting(true);
    try {
      // Save health data
      onComplete(formData);
      
      // Update task with health data reference in notes
      await updateTask(taskId, {
        notes: `Health data: ${JSON.stringify(formData)}`
      });
      
      toast.success('Đã lưu dữ liệu sức khỏe!');
      onClose();
    } catch (error) {
      console.error('Failed to save health data:', error);
      toast.error('Lỗi khi lưu dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-elevated)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[var(--border-subtle)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[var(--accent-dim)] flex items-center justify-center">
              <Heart size={20} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Ghi nhận sức khỏe</h2>
              <p className="text-sm text-[var(--text-muted)]">{taskTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
              <p className="text-sm text-[var(--text-muted)] mt-2">Đang phân tích...</p>
            </div>
          ) : healthData && healthData.suggestedFields.length > 0 ? (
            <div className="space-y-4">
              {/* Detected metrics */}
              <div className="flex flex-wrap gap-2 mb-4">
                {healthData.detectedMetrics.map(metric => {
                  const Icon = HEALTH_ICONS[metric];
                  return (
                    <div
                      key={metric}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--accent-dim)] ${HEALTH_COLORS[metric]}`}
                    >
                      <Icon size={14} />
                      <span className="text-xs font-medium capitalize">
                        {metric.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                {healthData.suggestedFields.map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                      {field.label}
                      {field.unit && <span className="text-[var(--text-muted)] ml-1">({field.unit})</span>}
                    </label>
                    
                    {field.type === 'number' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={(formData[field.field] as number) || ''}
                          onChange={(e) => handleInputChange(field.field, parseFloat(e.target.value) || 0)}
                          min={field.min}
                          max={field.max}
                          className="flex-1 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none border border-[var(--border-subtle)]"
                          placeholder={`0${field.unit ? ` ${field.unit}` : ''}`}
                        />
                        {field.min !== undefined && field.max !== undefined && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleInputChange(field.field, Math.max(field.min!, ((formData[field.field] as number) || 0) - 1))}
                              className="size-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              <Minus size={14} />
                            </button>
                            <button
                              onClick={() => handleInputChange(field.field, Math.min(field.max!, ((formData[field.field] as number) || 0) + 1))}
                              className="size-8 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {field.type === 'range' && (
                      <div className="space-y-2">
                        <input
                          type="range"
                          value={(formData[field.field] as number) || (field.min || 1)}
                          onChange={(e) => handleInputChange(field.field, parseInt(e.target.value))}
                          min={field.min || 1}
                          max={field.max || 10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-[var(--text-muted)]">
                          <span>{field.min || 1}</span>
                          <span className="font-medium text-[var(--text-primary)]">
                            {typeof formData[field.field] === 'object' && formData[field.field] !== null 
                              ? `${(formData[field.field] as { systolic: number; diastolic: number }).systolic}/${(formData[field.field] as { systolic: number; diastolic: number }).diastolic}`
                              : String(formData[field.field] || (field.min || 1))
                            }
                          </span>
                          <span>{field.max || 10}</span>
                        </div>
                      </div>
                    )}
                    
                    {field.type === 'select' && field.options && (
                      <select
                        value={(formData[field.field] as number) || 0}
                        onChange={(e) => handleInputChange(field.field, parseInt(e.target.value))}
                        className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none border border-[var(--border-subtle)]"
                      >
                        <option value="">Chọn...</option>
                        {field.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={optionIndex + 1}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart size={48} className="mx-auto text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Không phát hiện dữ liệu sức khỏe liên quan</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-[var(--border-subtle)]">
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors"
            disabled={submitting}
          >
            Bỏ qua
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            disabled={submitting || loading}
          >
            {submitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
          </button>
        </div>
      </div>
    </div>
  );
}
