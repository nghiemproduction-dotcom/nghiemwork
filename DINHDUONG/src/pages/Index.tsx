import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { login, logout, getCurrentUser } from '@/services/authService';
import AuthScreen from '@/components/AuthScreen';
import CyberLayout from '@/components/CyberLayout';
import TodayTab from '@/components/tabs/TodayTab';
import ExerciseLibrary from '@/components/tabs/ExerciseLibrary';
import MealLibrary from '@/components/tabs/MealLibrary';
import OverviewTab from '@/components/tabs/OverviewTab';
import SettingsTab from '@/components/tabs/SettingsTab';

export default function Index() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = getCurrentUser();
    if (current) setUser(current);
    setLoading(false);
  }, []);

  const handleLogin = (passcode: string): boolean => {
    const u = login(passcode);
    if (u) {
      setUser(u);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setActiveTab('today');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-primary glow-cyan text-2xl font-bold animate-pulse-glow">CYBERFIT</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'today': return <TodayTab user={user} />;
      case 'exercises': return <ExerciseLibrary />;
      case 'meals': return <MealLibrary />;
      case 'overview': return <OverviewTab user={user} />;
      case 'settings': return <SettingsTab user={user} onUserUpdate={setUser} />;
      default: return <TodayTab user={user} />;
    }
  };

  return (
    <CyberLayout activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} user={user}>
      {renderTab()}
    </CyberLayout>
  );
}
