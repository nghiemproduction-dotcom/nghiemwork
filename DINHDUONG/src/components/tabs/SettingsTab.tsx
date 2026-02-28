import { useState } from 'react';
import { User, Clock, Shield, Target, Save, ChevronDown, ChevronUp, Brain, Loader2, Sparkles } from 'lucide-react';
import { UserProfile } from '@/types';
import { saveUser, saveDailyPlan } from '@/services/storageService';

interface SettingsTabProps {
  user: UserProfile;
  onUserUpdate: (user: UserProfile) => void;
}

export default function SettingsTab({ user, onUserUpdate }: SettingsTabProps) {
  const [profile, setProfile] = useState<UserProfile>({ ...user });
  const [openSection, setOpenSection] = useState<string | null>('profile');
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const handleSave = () => {
    saveUser(profile);
    onUserUpdate(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const sections = [
    { id: 'profile', label: 'Hồ Sơ Cá Nhân', icon: <User className="w-4 h-4" /> },
    { id: 'schedule', label: 'Lịch Trình Tập Luyện', icon: <Clock className="w-4 h-4" /> },
    { id: 'goals', label: 'Mục Tiêu Thể Chất', icon: <Target className="w-4 h-4" /> },
    { id: 'if', label: 'Nhịn Ăn Gián Đoạn (IF)', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 space-y-3 animate-slide-up">
      <h2 className="text-lg font-bold text-foreground text-center">CÀI ĐẶT</h2>

      {sections.map(section => {
        const isOpen = openSection === section.id;
        return (
          <div key={section.id} className="cyber-card overflow-hidden">
            <button className="w-full flex items-center gap-3 p-3" onClick={() => setOpenSection(isOpen ? null : section.id)}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{section.icon}</div>
              <span className="flex-1 text-sm font-semibold text-left">{section.label}</span>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                {section.id === 'profile' && (
                  <>
                    <Field label="Tên" value={profile.name} onChange={v => updateField('name', v)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Tuổi" type="number" value={String(profile.age || '')} onChange={v => updateField('age', parseInt(v))} />
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Giới tính</label>
                        <select value={profile.gender || ''} onChange={e => updateField('gender', e.target.value)}
                          className="cyber-input">
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Chiều cao (cm)" type="number" value={String(profile.height || '')} onChange={v => updateField('height', parseFloat(v))} />
                      <Field label="Cân nặng (kg)" type="number" value={String(profile.weight || '')} onChange={v => updateField('weight', parseFloat(v))} />
                    </div>
                    <Field label="Vòng bụng (cm)" type="number" value={String(profile.waist || '')} onChange={v => updateField('waist', parseFloat(v))} />
                  </>
                )}

                {section.id === 'schedule' && (
                  <>
                    {profile.sessions.map((session, idx) => (
                      <div key={session.id} className="bg-muted/30 rounded-lg p-2 space-y-2">
                        <p className="text-xs font-semibold text-primary">{session.name}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Bắt đầu" type="time" value={session.startTime}
                            onChange={v => {
                              const sessions = [...profile.sessions];
                              sessions[idx] = { ...sessions[idx], startTime: v };
                              updateField('sessions', sessions);
                            }} />
                          <Field label="Kết thúc" type="time" value={session.endTime}
                            onChange={v => {
                              const sessions = [...profile.sessions];
                              sessions[idx] = { ...sessions[idx], endTime: v };
                              updateField('sessions', sessions);
                            }} />
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {section.id === 'goals' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Cân nặng mục tiêu (kg)" type="number" value={String(profile.targetWeight || '')} onChange={v => updateField('targetWeight', parseFloat(v))} />
                      <Field label="Vòng bụng mục tiêu (cm)" type="number" value={String(profile.targetWaist || '')} onChange={v => updateField('targetWaist', parseFloat(v))} />
                    </div>
                    <Field label="Calo mục tiêu/ngày" type="number" value={String(profile.targetCalories || '')} onChange={v => updateField('targetCalories', parseInt(v))} />
                    <Field label="Nước mục tiêu (ml)/ngày" type="number" value={String(profile.targetWater || '')} onChange={v => updateField('targetWater', parseInt(v))} />
                    <AreaField label="Chấn thương / Bệnh lý" value={profile.injuries || ''} onChange={v => updateField('injuries', v)} />
                    <AreaField label="Thói quen ăn uống" value={profile.habits || ''} onChange={v => updateField('habits', v)} />
                    <AreaField label="Thức ăn vặt không thể từ bỏ" value={profile.guiltyPleasures || ''} onChange={v => updateField('guiltyPleasures', v)} />
                  </>
                )}

                {section.id === 'if' && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Chế độ IF</label>
                      <select value={profile.ifMode || ''} onChange={e => updateField('ifMode', e.target.value)} className="cyber-input">
                        <option value="">Không áp dụng</option>
                        <option value="16:8">16:8 (Nhịn 16h, Ăn 8h)</option>
                        <option value="18:6">18:6 (Nhịn 18h, Ăn 6h)</option>
                        <option value="20:4">20:4 (Nhịn 20h, Ăn 4h)</option>
                      </select>
                    </div>
                    {profile.ifMode && (
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Bắt đầu ăn" type="time" value={profile.ifEatStart || '12:00'} onChange={v => updateField('ifEatStart', v)} />
                        <Field label="Kết thúc ăn" type="time" value={profile.ifEatEnd || '20:00'} onChange={v => updateField('ifEatEnd', v)} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={handleSave} className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${saved ? 'bg-accent text-accent-foreground' : 'cyber-btn'}`}>
        <Save className="w-4 h-4 inline mr-2" />
        {saved ? '✓ ĐÃ LƯU!' : 'LƯU CÀI ĐẶT'}
      </button>

      {/* Super AI Button */}
      <button
        onClick={async () => {
          handleSave(); // Save first
          setAiLoading(true);
          setAiResult(null);
          try {
            const resp = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cyberfit-ai`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({
                  type: 'plan',
                  userData: {
                    name: profile.name,
                    age: profile.age,
                    gender: profile.gender,
                    height: profile.height,
                    weight: profile.weight,
                    waist: profile.waist,
                    targetWeight: profile.targetWeight,
                    targetWaist: profile.targetWaist,
                    injuries: profile.injuries,
                    habits: profile.habits,
                    guiltyPleasures: profile.guiltyPleasures,
                    ifMode: profile.ifMode,
                    ifEatStart: profile.ifEatStart,
                    ifEatEnd: profile.ifEatEnd,
                    sessions: profile.sessions,
                  },
                  messages: [{ role: 'user', content: 'Phân tích và lập kế hoạch tập luyện + dinh dưỡng cho tôi dựa trên thông tin cơ thể đã cung cấp.' }],
                }),
              }
            );

            if (!resp.ok) {
              const err = await resp.json().catch(() => ({ error: 'Lỗi kết nối' }));
              setAiResult({ error: err.error });
              setAiLoading(false);
              return;
            }

            const plan = await resp.json();
            setAiResult(plan);

            // Apply plan
            if (plan.targetCalories) {
              const updated = {
                ...profile,
                targetCalories: plan.targetCalories,
                targetWater: plan.targetWater || profile.targetWater,
              };
              saveUser(updated);
              onUserUpdate(updated);
            }
            if (plan.exercisePlan || plan.mealPlan) {
              saveDailyPlan(profile.id, {
                exercises: (plan.exercisePlan || []).map((e: any) => ({
                  exerciseId: e.exerciseId,
                  sessionId: e.sessionId,
                  order: e.order,
                  completed: false,
                })),
                meals: (plan.mealPlan || []).map((m: any) => ({
                  mealId: m.mealId,
                  time: m.time,
                  consumed: false,
                  aiReason: m.aiReason,
                })),
              });
            }
          } catch (e) {
            console.error(e);
            setAiResult({ error: 'Lỗi kết nối AI' });
          }
          setAiLoading(false);
        }}
        disabled={aiLoading}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all cyber-btn-pink disabled:opacity-50"
      >
        {aiLoading ? (
          <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />AI ĐANG PHÂN TÍCH...</>
        ) : (
          <><Brain className="w-4 h-4 inline mr-2" />🧠 SUPER AI - PHÂN TÍCH & LẬP KẾ HOẠCH</>
        )}
      </button>

      {/* AI Result */}
      {aiResult && !aiResult.error && (
        <div className="cyber-card-green p-4 space-y-3">
          <h3 className="text-sm font-bold text-accent flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> KẾ HOẠCH AI
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-primary">{aiResult.targetCalories}</p>
              <p className="text-[10px] text-muted-foreground">Calo/ngày</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-primary">{aiResult.targetWater}ml</p>
              <p className="text-[10px] text-muted-foreground">Nước/ngày</p>
            </div>
          </div>
          <p className="text-xs text-accent">⏱ Dự kiến đạt mục tiêu: ~{aiResult.estimatedWeeks} tuần</p>
          {aiResult.issues?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-secondary mb-1">⚠ Vấn đề cần lưu ý:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {aiResult.issues.map((issue: string, i: number) => <li key={i}>• {issue}</li>)}
              </ul>
            </div>
          )}
          {aiResult.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-accent mb-1">💡 Khuyến nghị:</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {aiResult.recommendations.map((rec: string, i: number) => <li key={i}>• {rec}</li>)}
              </ul>
            </div>
          )}
          <p className="text-[10px] text-accent italic">✅ Đã tự động áp dụng lịch tập & thực đơn. Vào tab "Hôm Nay" để xem!</p>
        </div>
      )}

      {aiResult?.error && (
        <div className="cyber-card-pink p-3 text-center">
          <p className="text-xs text-secondary">❌ {aiResult.error}</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="cyber-input" />
    </div>
  );
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground block mb-1">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} className="cyber-input min-h-[60px] resize-none" />
    </div>
  );
}
