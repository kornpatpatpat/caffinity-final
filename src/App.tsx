/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence } from 'motion/react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import History from './components/History';
import AddBeverage from './components/AddBeverage';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import Info from './components/Info';
import { UserBaseline, Activity } from './types';

export default function App() {
  const [onboardingStep, setOnboardingStep] = React.useState(0);
  const [baseline, setBaseline] = React.useState<UserBaseline | null>(() => {
    const saved = localStorage.getItem('caffinity_baseline');
    return saved ? JSON.parse(saved) : null;
  });

  const [activities, setActivities] = React.useState<Activity[]>(() => {
    const saved = localStorage.getItem('caffinity_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdding, setIsAdding] = React.useState(false);
  const [editingActivity, setEditingActivity] = React.useState<Activity | null>(null);
  const [view, setView] = React.useState<'dashboard' | 'history'>('dashboard');

  React.useEffect(() => {
    if (baseline) {
      localStorage.setItem('caffinity_baseline', JSON.stringify(baseline));
    }
  }, [baseline]);

  React.useEffect(() => {
    localStorage.setItem('caffinity_activities', JSON.stringify(activities));
  }, [activities]);

  const handleOnboardingComplete = (data: UserBaseline) => {
    setBaseline(data);
  };

  const handleAddActivity = (data: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setActivities([...activities, newActivity]);
    setIsAdding(false);
  };

  const handleUpdateActivity = (id: string, data: Omit<Activity, 'id' | 'timestamp'>) => {
    setActivities(activities.map(a => a.id === id ? { ...a, ...data } : a));
    setEditingActivity(null);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    setEditingActivity(null);
  };

  const handleReset = () => {
    setBaseline(null);
    setActivities([]);
    setOnboardingStep(0);
    localStorage.removeItem('caffinity_baseline');
    localStorage.removeItem('caffinity_activities');
  };

  return (
    <div className="min-h-screen bg-background selection:bg-black selection:text-white">
      <AnimatePresence mode="wait">
        {!baseline ? (
          onboardingStep === 0 ? (
            <Welcome key="welcome" onNext={() => setOnboardingStep(1)} />
          ) : onboardingStep === 1 ? (
            <Info 
              key="info" 
              onNext={() => setOnboardingStep(2)} 
              onBack={() => setOnboardingStep(0)}
            />
          ) : onboardingStep === 2 ? (
            <Auth 
              key="auth" 
              onNext={() => setOnboardingStep(3)} 
              onBack={() => setOnboardingStep(1)}
            />
          ) : (
            <Onboarding 
              key="foundation" 
              onComplete={handleOnboardingComplete} 
              onBack={() => setOnboardingStep(2)}
            />
          )
        ) : view === 'history' ? (
          <History 
            key="history"
            activities={activities}
            onBack={() => setView('dashboard')}
            onEditActivity={(activity) => setEditingActivity(activity)}
          />
        ) : (
          <Dashboard 
            key="dashboard"
            baseline={baseline} 
            activities={activities} 
            onAddClick={() => setIsAdding(true)}
            onEditActivity={(activity) => setEditingActivity(activity)}
            onHistoryClick={() => setView('history')}
            onUpdateBaseline={(newBaseline) => setBaseline(newBaseline)}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <AddBeverage 
            onAdd={handleAddActivity} 
            onClose={() => setIsAdding(false)} 
          />
        )}
        {editingActivity && (
          <AddBeverage 
            initialActivity={editingActivity}
            onAdd={(data) => handleUpdateActivity(editingActivity.id, data)}
            onDelete={() => handleDeleteActivity(editingActivity.id)}
            onClose={() => setEditingActivity(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

