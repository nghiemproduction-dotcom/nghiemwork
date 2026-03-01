import { useState, useEffect } from 'react';
import { useHealthStore } from '@/stores';
import { toast } from 'sonner';
import { Droplets, Plus, Minus, Timer, CheckCircle2, Target } from 'lucide-react';

export default function WaterTrackerPage() {
  const { entries, addEntry, updateEntry, getLatestValues } = useHealthStore();
  const [waterIntake, setWaterIntake] = useState(0);
  const [targetWater, setTargetWater] = useState(2000);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const latestValues = getLatestValues();
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);
  const currentWater = todayEntry?.water || 0;

  const waterLevels = [
    { amount: 100, label: '100ml', color: 'bg-blue-200' },
    { amount: 200, label: '200ml', color: 'bg-blue-300' },
    { amount: 250, label: '250ml', color: 'bg-blue-400' },
    { amount: 500, label: '500ml', color: 'bg-blue-500' },
  ];

  useEffect(() => {
    if (todayEntry?.water) {
      setWaterIntake(todayEntry.water);
    }
  }, [todayEntry?.water]);

  const addWater = (amount: number) => {
    const newTotal = waterIntake + amount;
    setWaterIntake(newTotal);
    
    updateEntry(today, { water: newTotal });
    toast.success(`Đã thêm ${amount}ml nước`);
  };

  const setCustomAmount = (amount: number) => {
    if (amount >= 0 && amount <= 5000) {
      setWaterIntake(amount);
      updateEntry(today, { water: amount });
      toast.success(`Đã cập nhật lượng nước: ${amount}ml`);
    }
  };

  const resetDaily = () => {
    setWaterIntake(0);
    updateEntry(today, { water: 0 });
    toast.success('Đã reset lượng nước hôm nay');
  };

  const progress = Math.min((waterIntake / targetWater) * 100, 100);
  const remaining = Math.max(targetWater - waterIntake, 0);

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">THEO DÕI NƯỚC</h1>
        <p className="text-sm text-[var(--text-muted)]">Theo dõi lượng nước uống hàng ngày của bạn</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] rounded-2xl p-6 border border-[var(--border-accent)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Droplets size={32} className="text-[var(--accent-primary)]" />
            <div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{waterIntake}ml</p>
              <p className="text-xs text-[var(--text-muted)]">Đã uống</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-[var(--text-primary)]">{remaining}ml</p>
            <p className="text-xs text-[var(--text-muted)]">Còn lại</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Tiến độ</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                progress >= 100 ? 'bg-green-500' : 
                progress >= 75 ? 'bg-blue-500' : 
                progress >= 50 ? 'bg-blue-400' : 
                progress >= 25 ? 'bg-blue-300' : 'bg-blue-200'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Target */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-muted)]">Mục tiêu: {targetWater}ml</span>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="px-3 py-1 bg-[var(--accent-dim)] text-[var(--accent-primary)] rounded-lg text-xs font-medium"
          >
            {showQuickAdd ? 'Ẩn' : 'Hiện'} thêm nhanh
          </button>
        </div>
      </div>

      {/* Quick Add Buttons */}
      {showQuickAdd && (
        <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Thêm nhanh</h3>
          <div className="grid grid-cols-2 gap-2">
            {waterLevels.map((level, index) => (
              <button
                key={index}
                onClick={() => addWater(level.amount)}
                className={`p-4 rounded-xl text-white font-medium transition-all active:scale-95 ${level.color}`}
              >
                <div className="text-lg font-bold">{level.amount}ml</div>
                <div className="text-xs opacity-90">{level.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Amount */}
      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Tùy chỉnh</h3>
        <div className="flex gap-2">
          <button
            onClick={() => addWater(-100)}
            className="p-2 bg-[var(--bg-surface)] rounded-lg text-[var(--text-primary)] active:scale-95"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={waterIntake}
            onChange={e => setCustomAmount(parseInt(e.target.value) || 0)}
            className="flex-1 px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-center text-lg font-bold text-[var(--text-primary)] border border-[var(--border-subtle)]"
            min="0"
            max="5000"
            step="50"
          />
          <button
            onClick={() => addWater(100)}
            className="p-2 bg-[var(--bg-surface)] rounded-lg text-[var(--text-primary)] active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={resetDaily}
            className="flex-1 px-3 py-2 bg-[var(--error)] text-white rounded-lg text-sm font-medium active:scale-95"
          >
            Reset ngày
          </button>
          <button
            onClick={() => {
              const newTarget = prompt('Nhập mục tiêu nước mới (ml):', targetWater.toString());
              if (newTarget && !isNaN(parseInt(newTarget))) {
                setTargetWater(parseInt(newTarget));
                toast.success(`Đã cập nhật mục tiêu: ${newTarget}ml`);
              }
            }}
            className="flex-1 px-3 py-2 bg-[var(--accent-primary)] text-white rounded-lg text-sm font-medium active:scale-95"
          >
            Đổi mục tiêu
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Timer size={16} className="text-[var(--accent-primary)]" />
          Lịch sử dụng nước
        </h3>
        <div className="space-y-2">
          {entries
            .filter(e => e.water && e.water > 0)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 7)
            .map(entry => (
              <div key={entry.date} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-[var(--accent-primary)]" />
                  <span className="text-sm text-[var(--text-primary)]">{entry.water}ml</span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {new Date(entry.date).toLocaleDateString('vi-VN', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            ))}
          {entries.filter(e => e.water && e.water > 0).length === 0 && (
            <div className="text-center py-4 text-[var(--text-muted)]">
              <Droplets size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có dữ liệu nước uống</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
