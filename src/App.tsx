/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence } from 'motion/react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import AddBeverage from './components/AddBeverage';
import { UserBaseline, Activity } from './types';

export default function App() {
  const [baseline, setBaseline] = React.useState<UserBaseline | null>(() => {
    const saved = localStorage.getItem('caffinity_baseline');
    return saved ? JSON.parse(saved) : null;
  });

  const [activities, setActivities] = React.useState<Activity[]>(() => {
    const saved = localStorage.getItem('caffinity_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdding, setIsAdding] = React.useState(false);

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

  const handleReset = () => {
    setBaseline(null);
    setActivities([]);
    localStorage.removeItem('caffinity_baseline');
    localStorage.removeItem('caffinity_activities');
  };

  return (
    <div className="min-h-screen bg-background selection:bg-black selection:text-white">
      <AnimatePresence mode="wait">
        {!baseline ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <Dashboard 
            baseline={baseline} 
            activities={activities} 
            onAddClick={() => setIsAdding(true)}
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
      </AnimatePresence>
    </div>
  );
}

