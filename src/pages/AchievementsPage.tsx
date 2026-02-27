import { useState, useMemo } from 'react';
import { useGamificationStore, useTaskStore } from '@/stores';
import { calculateLevel, xpForNextLevel, xpForCurrentLevel } from '@/lib/gamification';
import { 
  Trophy, Star, Gift, Flame, Plus, Trash2, Crown, 
  Target, Zap, CheckCircle2, Medal, Sparkles
} from 'lucide-react';
import type React from 'react';

// ==================== ENHANCED ACHIEVEMENTS PAGE ====================

interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  requirement: number;
  current: number;
  unlocked: boolean;
  color: string;
}

function BadgeCard({ badge }: { badge: Badge }) {
  const progress = Math.min(100, (badge.current / badge.requirement) * 100);
  
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 border ${badge.unlocked ? 'bg-[var(--bg-elevated)] border-[var(--border-accent)]' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] opacity-70'}`}>
      <div className="flex items-start gap-3">
        <div className={`size-14 rounded-2xl flex items-center justify-center text-3xl ${badge.unlocked ? 'bg-[var(--accent-dim)]' : 'bg-[var(--bg-elevated)] grayscale'}`}>
          {badge.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${badge.unlocked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
            {badge.name}
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{badge.description}</p>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-[9px] mb-1">
              <span className={badge.unlocked ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}>
                {badge.current}/{badge.requirement}
              </span>
              <span className="text-[var(--text-muted)]">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${badge.unlocked ? 'bg-[var(--accent-primary)]' : 'bg-[var(--text-muted)]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {badge.unlocked && (
        <div className="absolute top-2 right-2">
          <Sparkles size={14} className="text-[var(--accent-primary)]" />
        </div>
      )}
    </div>
  );
}

function LevelProgress({ xp, level }: { xp: number; level: number }) {
  const currentLevelXp = xpForCurrentLevel(level);
  const nextLevelXp = xpForNextLevel(level);
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  
  const titles: Record<number, string> = {
    1: 'Người mới', 5: 'Thợ việc', 10: 'Chiến binh', 20: 'Huyền thoại', 30: 'Bậc thầy', 50: 'Thần thoại'
  };
  
  const getTitle = (lvl: number) => {
    const levels = Object.keys(titles).map(Number).sort((a, b) => b - a);
    for (const l of levels) {
      if (lvl >= l) return titles[l];
    }
    return 'Người mới';
  };

  return (
    <div className="bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] rounded-2xl p-5 border border-[var(--border-accent)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)] opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-16 rounded-2xl bg-[var(--accent-dim)] flex items-center justify-center border-2 border-[var(--accent-primary)] relative">
            <span className="text-3xl font-bold text-[var(--accent-primary)]">{level}</span>
            <Crown size={16} className="absolute -top-1 -right-1 text-[var(--warning)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Cấp độ hiện tại</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{getTitle(level)}</p>
            <p className="text-xs text-[var(--accent-primary)]">{xp.toLocaleString()} XP tổng</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[var(--text-muted)]">Tiến độ lên cấp {level + 1}</span>
            <span className="text-[var(--accent-primary)] font-mono">
              {xp - currentLevelXp}/{nextLevelXp - currentLevelXp} XP
            </span>
          </div>
          <div className="h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--success)] rounded-full transition-all duration-700"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsRow({ streak, achievements, tasksCompleted }: { streak: number; achievements: number; tasksCompleted: number }) {
  const stats = [
    { icon: Flame, label: 'Streak', value: streak, color: 'var(--warning)', suffix: ' ngày' },
    { icon: Trophy, label: 'Thành tích', value: achievements, color: 'var(--accent-primary)', suffix: '' },
    { icon: CheckCircle2, label: 'Việc xong', value: tasksCompleted, color: 'var(--success)', suffix: '' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
          <stat.icon size={18} style={{ color: stat.color }} className="mx-auto mb-2" />
          <p className="text-xl font-bold text-[var(--text-primary)] font-mono">{stat.value}</p>
          <p className="text-[9px] text-[var(--text-muted)]">{stat.label}{stat.suffix}</p>
        </div>
      ))}
    </div>
  );
}

export default function AchievementsPage() {
  const { state, claimReward, addCustomReward, removeReward, addCustomAchievement, removeAchievement, unlockAchievement } = useGamificationStore();
  const tasks = useTaskStore(s => s.tasks);
  const [showAddReward, setShowAddReward] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardIcon, setRewardIcon] = useState('🎁');
  const [rewardXp, setRewardXp] = useState(100);
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achIcon, setAchIcon] = useState('🏆');
  const [achXp, setAchXp] = useState(50);
  const [activeTab, setActiveTab] = useState<'badges' | 'achievements' | 'rewards'>('badges');

  // Calculate dynamic badges
  const badges: Badge[] = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const streak = state.streak;
    const totalTime = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const urgentTasks = tasks.filter(t => t.quadrant === 'do_first' && t.status === 'done').length;

    return [
      { id: '1', icon: '🔥', name: 'Người chinh phục', description: `Hoàn thành ${completedTasks}/10 việc đầu tiên`, requirement: 10, current: completedTasks, unlocked: completedTasks >= 10, color: '#F87171' },
      { id: '2', icon: '⚡', name: 'Tia chớp', description: `Hoàn thành ${completedTasks}/50 việc`, requirement: 50, current: completedTasks, unlocked: completedTasks >= 50, color: '#FBBF24' },
      { id: '3', icon: '📅', name: 'Chuỗi ngày vàng', description: `${streak}/7 ngày liên tiếp`, requirement: 7, current: streak, unlocked: streak >= 7, color: '#00E5CC' },
      { id: '4', icon: '⏱️', name: 'Người quản lý thời gian', description: `${Math.floor(totalTime/3600)}/10 giờ tập trung`, requirement: 10, current: Math.floor(totalTime/3600), unlocked: totalTime >= 36000, color: '#60A5FA' },
      { id: '5', icon: '🎯', name: 'Ưu tiên hàng đầu', description: `${urgentTasks}/20 việc khẩn cấp`, requirement: 20, current: urgentTasks, unlocked: urgentTasks >= 20, color: '#F87171' },
      { id: '6', icon: '💎', name: 'Huyền thoại', description: `${completedTasks}/200 việc`, requirement: 200, current: completedTasks, unlocked: completedTasks >= 200, color: '#A78BFA' },
    ];
  }, [tasks, state.streak]);

  const unlocked = state.achievements.filter(a => a.unlockedAt).sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));
  const locked = state.achievements.filter(a => !a.unlockedAt);

  const handleAddReward = () => {
    if (!rewardTitle.trim()) return;
    addCustomReward({ title: rewardTitle, description: rewardDesc || 'Phần thưởng tùy chọn', icon: rewardIcon, xpCost: rewardXp });
    setRewardTitle(''); setRewardDesc(''); setRewardIcon('🎁'); setRewardXp(100); setShowAddReward(false);
  };

  const handleAddAchievement = () => {
    if (!achTitle.trim()) return;
    addCustomAchievement({
      title: achTitle, description: achDesc || 'Thành tích tùy chỉnh', icon: achIcon, xpReward: achXp,
      condition: { type: 'custom', description: achDesc || '' }, isCustom: true,
    });
    setAchTitle(''); setAchDesc(''); setAchIcon('🏆'); setAchXp(50); setShowAddAchievement(false);
  };

  const ICON_OPTIONS = ['🎁', '☕', '🍰', '🎬', '🏖️', '🎮', '🎵', '📱', '👟', '💆', '🍕', '🎊'];
  const ACH_ICONS = ['🏆', '⭐', '🔥', '💎', '🎯', '⚡', '🌟', '👑', '🎖️', '🏅', '💪', '🧠'];

  const tabs = [
    { id: 'badges', label: 'Huy hiệu', icon: Medal },
    { id: 'achievements', label: 'Thành tích', icon: Trophy },
    { id: 'rewards', label: 'Phần thưởng', icon: Gift },
  ] as const;

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Trophy size={24} className="text-[var(--accent-primary)]" />
          Thành tích Pro
        </h1>
        <div className="flex items-center gap-1 text-sm text-[var(--accent-primary)]">
          <Star size={16} />
          <span className="font-mono font-bold">{state.xp}</span>
          <span className="text-[var(--text-muted)]">XP</span>
        </div>
      </div>

      {/* Level Progress */}
      <LevelProgress xp={state.xp} level={state.level} />

      {/* Stats Row */}
      <div className="mt-4">
        <StatsRow streak={state.streak} achievements={unlocked.length} tasksCompleted={state.totalTasksCompleted} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mt-4 mb-4 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap ${
              activeTab === tab.id ? 'bg-[var(--accent-dim)] text-[var(--accent-primary)] border border-[var(--border-accent)]' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'badges' && (
          <div className="grid gap-3">
            {badges.map(badge => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Thành tích đã mở ({unlocked.length})</h2>
              <button onClick={() => setShowAddAchievement(!showAddAchievement)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--accent-dim)] text-[var(--accent-primary)]">
                <Plus size={12} /> Thêm
              </button>
            </div>

            {showAddAchievement && (
              <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-accent)] animate-slide-up">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ACH_ICONS.map(icon => (
                    <button key={icon} onClick={() => setAchIcon(icon)}
                      className={`size-8 rounded-lg flex items-center justify-center text-lg ${achIcon === icon ? 'bg-[var(--accent-dim)] border border-[var(--border-accent)]' : 'bg-[var(--bg-surface)]'}`}>{icon}</button>
                  ))}
                </div>
                <input type="text" value={achTitle} onChange={e => setAchTitle(e.target.value)} placeholder="Tên thành tích"
                  className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none mb-2" />
                <input type="text" value={achDesc} onChange={e => setAchDesc(e.target.value)} placeholder="Mô tả"
                  className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none mb-2" />
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-[var(--text-muted)]">XP:</label>
                  <input type="number" value={achXp} onChange={e => setAchXp(Math.max(5, parseInt(e.target.value) || 5))}
                    className="w-24 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none font-mono" />
                </div>
                <button onClick={handleAddAchievement} disabled={!achTitle.trim()}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30">
                  Thêm thành tích
                </button>
              </div>
            )}

            {unlocked.map(ach => (
              <div key={ach.id} className="flex items-center gap-3 bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-accent)]">
                <span className="text-2xl">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{ach.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{ach.description}</p>
                </div>
                <span className="text-sm font-bold text-[var(--accent-primary)] font-mono">+{ach.xpReward}</span>
                {ach.isCustom && (
                  <button onClick={() => removeAchievement(ach.id)} className="size-7 rounded-lg bg-[rgba(248,113,113,0.1)] flex items-center justify-center text-[var(--error)]">
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}

            {locked.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-[var(--text-secondary)] mt-4">Chưa mở ({locked.length})</h2>
                {locked.map(ach => (
                  <div key={ach.id} className="flex items-center gap-3 bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-subtle)] opacity-60">
                    <span className="text-2xl grayscale">🔒</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-secondary)]">{ach.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{ach.description}</p>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-mono">+{ach.xpReward}</span>
                    {ach.isCustom && (
                      <button onClick={() => unlockAchievement(ach.id)}
                        className="px-2 py-1 rounded-lg text-[10px] bg-[var(--accent-dim)] text-[var(--accent-primary)]">Mở khóa</button>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {activeTab === 'rewards' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)]">Phần thưởng ({state.rewards.length})</h2>
              <button onClick={() => setShowAddReward(!showAddReward)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[var(--accent-dim)] text-[var(--accent-primary)]">
                <Plus size={12} /> Thêm
              </button>
            </div>

            {showAddReward && (
              <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-accent)] animate-slide-up">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ICON_OPTIONS.map(icon => (
                    <button key={icon} onClick={() => setRewardIcon(icon)}
                      className={`size-8 rounded-lg flex items-center justify-center text-lg ${rewardIcon === icon ? 'bg-[var(--accent-dim)] border border-[var(--border-accent)]' : 'bg-[var(--bg-surface)]'}`}>{icon}</button>
                  ))}
                </div>
                <input type="text" value={rewardTitle} onChange={e => setRewardTitle(e.target.value)} placeholder="Tên phần thưởng"
                  className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none mb-2" />
                <input type="text" value={rewardDesc} onChange={e => setRewardDesc(e.target.value)} placeholder="Mô tả"
                  className="w-full bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none mb-2" />
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-[var(--text-muted)]">XP:</label>
                  <input type="number" value={rewardXp} onChange={e => setRewardXp(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-24 bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none font-mono" />
                </div>
                <button onClick={handleAddReward} disabled={!rewardTitle.trim()}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-[var(--bg-base)] bg-[var(--accent-primary)] disabled:opacity-30">
                  Thêm phần thưởng
                </button>
              </div>
            )}

            {state.rewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
                <Gift size={28} className="text-[var(--text-muted)] mb-2" />
                <p className="text-sm text-[var(--text-muted)]">Chưa có phần thưởng</p>
              </div>
            ) : state.rewards.map(reward => {
              const canClaim = !reward.claimed && state.xp >= reward.xpCost;
              return (
                <div key={reward.id} className={`flex items-center gap-3 bg-[var(--bg-elevated)] rounded-xl p-3 border ${reward.claimed ? 'border-[var(--success)] opacity-60' : 'border-[var(--border-subtle)]'}`}>
                  <span className="text-2xl">{reward.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${reward.claimed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{reward.title}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{reward.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!reward.claimed && (
                      <button onClick={() => claimReward(reward.id)} disabled={!canClaim}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${canClaim ? 'bg-[var(--accent-primary)] text-[var(--bg-base)]' : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'}`}>
                        {reward.xpCost} XP
                      </button>
                    )}
                    {reward.claimed && <span className="text-xs text-[var(--success)] font-medium">Đã nhận</span>}
                    {reward.id.startsWith('custom_') && (
                      <button onClick={() => removeReward(reward.id)} className="size-8 rounded-lg bg-[rgba(248,113,113,0.1)] flex items-center justify-center text-[var(--error)]">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
