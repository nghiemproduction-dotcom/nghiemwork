import { useState, useMemo } from 'react';
import { useHealthStore } from '@/stores';
import { toast } from 'sonner';
import { 
  Heart, Activity, Droplets, Flame, TrendingUp, Calendar, Plus, Minus, Save, 
  BarChart3, Target, Weight, Ruler, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react';

export default function HealthStatsPage() {
  const { entries, addEntry, updateEntry, deleteEntry, getLatestValues } = useHealthStore();
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    waist: '',
    water: '',
    calories: '',
    notes: ''
  });

  const latestValues = getLatestValues();
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recentEntries = sortedEntries.slice(-7); // Last 7 days
    
    const avgWeight = recentEntries.reduce((sum, e) => sum + (e.weight || 0), 0) / recentEntries.filter(e => e.weight).length;
    const avgWaist = recentEntries.reduce((sum, e) => sum + (e.waist || 0), 0) / recentEntries.filter(e => e.waist).length;
    const avgWater = recentEntries.reduce((sum, e) => sum + e.water, 0) / recentEntries.length;
    const avgCalories = recentEntries.reduce((sum, e) => sum + e.calories, 0) / recentEntries.length;
    
    const weightTrend = recentEntries.length >= 2 ? 
      (recentEntries[recentEntries.length - 1].weight || 0) - (recentEntries[0].weight || 0) : 0;
    
    return {
      avgWeight: avgWeight || 0,
      avgWaist: avgWaist || 0,
      avgWater: avgWater || 0,
      avgCalories: avgCalories || 0,
      weightTrend,
      totalEntries: entries.length
    };
  }, [entries]);

  const handleAddEntry = () => {
    if (!newEntry.date) {
      toast.error('Vui lòng chọn ngày');
      return;
    }

    const entryData = {
      date: newEntry.date,
      weight: newEntry.weight ? parseFloat(newEntry.weight) : undefined,
      waist: newEntry.waist ? parseInt(newEntry.waist) : undefined,
      water: newEntry.water ? parseInt(newEntry.water) : 0,
      calories: newEntry.calories ? parseInt(newEntry.calories) : 0,
      notes: newEntry.notes || undefined
    };

    addEntry(entryData);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      waist: '',
      water: '',
      calories: '',
      notes: ''
    });
    setShowAddEntry(false);
    toast.success('Đã thêm dữ liệu sức khỏe');
  };

  const handleUpdateEntry = (date: string, field: string, value: any) => {
    updateEntry(date, { [field]: value });
    toast.success('Đã cập nhật dữ liệu');
  };

  const handleDeleteEntry = (date: string) => {
    if (confirm('Bạn có chắc muốn xóa dữ liệu này?')) {
      deleteEntry(date);
      toast.success('Đã xóa dữ liệu');
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Thống kê Sức khỏe</h1>
        <p className="text-sm text-[var(--text-muted)]">Theo dõi và phân tích dữ liệu sức khỏe của bạn</p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-1">
              <Weight size={16} className="text-[var(--accent-primary)]" />
              <span className="text-xs text-[var(--text-muted)]">Cân nặng</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">{stats.avgWeight.toFixed(1)} kg</p>
            <p className="text-xs text-[var(--text-muted)]">Trung bình 7 ngày</p>
            {stats.weightTrend !== 0 && (
              <p className={`text-xs ${stats.weightTrend > 0 ? 'text-[var(--error)]' : 'text-[var(--accent-primary)]'}`}>
                {stats.weightTrend > 0 ? '+' : ''}{stats.weightTrend.toFixed(1)} kg
              </p>
            )}
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-1">
              <Droplets size={16} className="text-blue-500" />
              <span className="text-xs text-[var(--text-muted)]">Nước</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">{stats.avgWater} ml</p>
            <p className="text-xs text-[var(--text-muted)]">Trung bình 7 ngày</p>
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-500" />
              <span className="text-xs text-[var(--text-muted)]">Calo</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">{stats.avgCalories}</p>
            <p className="text-xs text-[var(--text-muted)]">Trung bình 7 ngày</p>
          </div>

          <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2 mb-1">
              <Ruler size={16} className="text-purple-500" />
              <span className="text-xs text-[var(--text-muted)]">Vòng bụng</span>
            </div>
            <p className="text-lg font-bold text-[var(--text-primary)]">{stats.avgWaist} cm</p>
            <p className="text-xs text-[var(--text-muted)]">Trung bình 7 ngày</p>
          </div>
        </div>
      )}

      {/* Add Entry Button */}
      <button
        onClick={() => setShowAddEntry(!showAddEntry)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-[var(--accent-primary)] bg-[var(--accent-dim)] border border-[var(--border-accent)] active:opacity-70 mb-4"
      >
        <Plus size={16} />
        {showAddEntry ? 'Ẩn' : 'Thêm'} dữ liệu
      </button>

      {/* Add Entry Form */}
      {showAddEntry && (
        <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--border-subtle)] mb-4 animate-slide-up">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Thêm dữ liệu sức khỏe</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Ngày</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={e => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] border border-[var(--border-subtle)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Cân nặng (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newEntry.weight}
                  onChange={e => setNewEntry(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="0.0"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Vòng bụng (cm)</label>
                <input
                  type="number"
                  value={newEntry.waist}
                  onChange={e => setNewEntry(prev => ({ ...prev, waist: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Nước (ml)</label>
                <input
                  type="number"
                  value={newEntry.water}
                  onChange={e => setNewEntry(prev => ({ ...prev, water: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Calo</label>
                <input
                  type="number"
                  value={newEntry.calories}
                  onChange={e => setNewEntry(prev => ({ ...prev, calories: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--text-muted)] font-medium block mb-1">Ghi chú</label>
              <textarea
                value={newEntry.notes}
                onChange={e => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Thêm ghi chú..."
                rows={2}
                className="w-full px-3 py-2 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)] resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddEntry(false)}
                className="flex-1 py-2 rounded-lg text-sm text-[var(--text-muted)] bg-[var(--bg-surface)] active:scale-95 transition-transform"
              >
                Hủy
              </button>
              <button
                onClick={handleAddEntry}
                className="flex-[2] py-2 rounded-lg text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Save size={14} />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Dữ liệu gần đây</h3>
        
        {[...entries]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
          .map(entry => (
            <div key={entry.date} className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {new Date(entry.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry.date)}
                  className="p-1 rounded-lg text-[var(--error)] hover:bg-[rgba(239,68,68,0.15)] transition-colors"
                >
                  <Minus size={12} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-2">
                {entry.weight && (
                  <div className="text-center">
                    <p className="text-xs text-[var(--text-muted)]">Cân nặng</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{entry.weight} kg</p>
                  </div>
                )}
                {entry.waist && (
                  <div className="text-center">
                    <p className="text-xs text-[var(--text-muted)]">Vòng bụng</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{entry.waist} cm</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)]">Nước</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{entry.water} ml</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[var(--text-muted)]">Calo</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{entry.calories}</p>
                </div>
              </div>

              {entry.notes && (
                <p className="text-xs text-[var(--text-muted)] italic">{entry.notes}</p>
              )}
            </div>
          ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8">
          <Activity size={48} className="mx-auto text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Chưa có dữ liệu sức khỏe</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Bắt đầu theo dõi sức khỏe của bạn ngay!</p>
        </div>
      )}
    </div>
  );
}
