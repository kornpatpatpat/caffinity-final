import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Plus, CheckCircle2, Coffee, Zap, Leaf, CupSoda, Utensils, Droplet, PlusSquare, MoreHorizontal, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Activity, BEVERAGES, UserBaseline } from '@/src/types';
import { format, addHours, addMinutes, parse, isAfter, differenceInMinutes } from 'date-fns';

const ICON_MAP: Record<string, any> = {
  Zap, Coffee, Leaf, CupSoda, Utensils, Droplet, PlusSquare, MoreHorizontal
};

interface DashboardProps {
  baseline: UserBaseline;
  activities: Activity[];
  onAddClick: () => void;
  onReset: () => void;
}

export default function Dashboard({ baseline, activities, onAddClick, onReset }: DashboardProps) {
  const heightInMeters = baseline.height / 100;
  const bmi = baseline.weight / (heightInMeters * heightInMeters);
  
  let dose = 3.0; // default for > 60
  if (baseline.age < 18) dose = 2.5;
  else if (baseline.age <= 40) dose = 4.0;
  else if (baseline.age <= 60) dose = 3.5;

  let factor = 0.95; // default for >= 25
  if (bmi < 18.5) factor = 0.9;
  else if (bmi <= 24.9) factor = 1.0;

  let limit = Math.round(dose * factor * baseline.weight);
  if (isNaN(limit) || limit <= 0) limit = 400; // fallback

  const currentIntake = activities.reduce((acc, curr) => acc + curr.mg, 0);
  const percentage = isNaN(limit) || limit === 0 ? 0 : Math.min((currentIntake / limit) * 100, 100);
  const remaining = isNaN(limit) || limit === 0 ? 0 : Math.max(limit - currentIntake, 0);

  // Calculate caffeine window based on half-life decay formula
  const now = new Date();
  let windowCloseTime = new Date();
  let isWindowOpen = true;
  let hoursLeft = 0;
  let minsLeft = 0;
  let formattedWindowTime = '00:00';

  try {
    const sleepTime = parse(baseline.sleepTime || '23:00', 'HH:mm', new Date());
    
    // Handle crossover to next day if sleep time is past midnight (e.g., 01:00) but it's currently evening (e.g., 20:00)
    if (sleepTime.getHours() < 12 && now.getHours() >= 12) {
      sleepTime.setDate(sleepTime.getDate() + 1);
    }

    if (!isNaN(sleepTime.getTime())) {
      const threshold = 30; // mg
      const halfLife = 5.5; // hours
      const caffeineMg = remaining; 
      
      let t = 0;
      if (caffeineMg > threshold) {
        t = halfLife * Math.log2(caffeineMg / threshold);
      }

      windowCloseTime = addMinutes(sleepTime, -Math.round(t * 60));
      formattedWindowTime = format(windowCloseTime, 'HH:mm');
      const minutesLeft = differenceInMinutes(windowCloseTime, now);
      hoursLeft = Math.floor(minutesLeft / 60);
      minsLeft = minutesLeft % 60;
      isWindowOpen = !isAfter(now, windowCloseTime) && minutesLeft >= 0 && remaining > 0;
    }
  } catch (e) {
    // fallback values set initially
  }

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-[#E5E5E5]">
        <h2 className="text-2xl font-serif italic">Caffinity</h2>
        <button onClick={onReset} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Menu">
          <Menu size={24} />
        </button>
      </header>

      <main className="flex-1 px-6 pb-24 space-y-8 max-w-md mx-auto w-full">
        {/* Greeting & Intake */}
        <section className="space-y-6">
          <h1 className="text-[40px] editorial-heading">{greeting()}</h1>
          
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="space-y-1">
                <p className="micro-label">Current Intake</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[64px] font-light leading-none">{isNaN(Math.round(currentIntake)) ? 0 : Math.round(currentIntake)}</span>
                  <span className="text-xl italic text-black">mg</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl italic">{isNaN(limit) ? 400 : limit} mg</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={percentage || 0} className="h-2 bg-gray-200" />
              <div className="flex justify-between text-[11px] font-medium text-black uppercase tracking-wider">
                <span>{Math.round(percentage || 0)}% of limit</span>
                <span>{Math.round(remaining || 0)} mg remaining</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-none shadow-sm flex flex-col justify-between h-32">
            <p className="micro-label">Sleep Time</p>
            <p className="text-4xl font-light">{baseline.sleepTime}</p>
          </div>
          <div className={`p-6 rounded-none shadow-sm flex flex-col justify-between h-32 text-white transition-colors duration-500 ${currentIntake > limit ? 'bg-[#FD6116]' : 'bg-black'}`}>
            <div className="flex justify-between items-start">
              <p className={`micro-label ${currentIntake > limit ? 'text-white/80' : 'text-white'}`}>Status</p>
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">
              {currentIntake > limit ? 'OVER LIMIT' : 'WITHIN LIMIT'}
            </p>
          </div>
        </div>

        {/* Window Card */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-black text-white rounded-[40px] p-10 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <h3 className="text-[32px] leading-tight font-serif italic">
              Your window for <br /> caffeine closes in <br />
              <span className="border-b-2 border-white">
                {isWindowOpen && !isNaN(hoursLeft) && !isNaN(minsLeft) ? `${hoursLeft}h ${minsLeft}m` : 'Closed'}
              </span>.
            </h3>
            <p className="text-white text-sm leading-relaxed">
              Based on your sleep goal of {baseline.sleepTime || 'unknown'}, any consumption after {formattedWindowTime} will likely delay sleep onset by 45 minutes.
            </p>
          </div>
          {/* Abstract background shape */}
          <div className="absolute -right-10 -bottom-10 opacity-20">
            <Coffee size={200} strokeWidth={1} />
          </div>
        </motion.div>

        {/* Activity List */}
        <section className="space-y-6">
          <h4 className="micro-label">Today's Activity</h4>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {activities.length === 0 ? (
                <p className="text-black italic text-center py-8">No activity recorded today.</p>
              ) : (
                activities.slice().reverse().map((activity) => {
                  const bev = BEVERAGES.find(b => b.id === activity.beverageId);
                  const Icon = ICON_MAP[bev?.icon || 'Coffee'];
                  return (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-xs text-black">
                            {format(activity.timestamp, 'hh:mm a')} · {activity.volume}ml
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-light">{isNaN(activity.mg) ? 0 : activity.mg}mg</p>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* FAB */}
      <button 
        onClick={onAddClick}
        className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50"
      >
        <Plus size={32} />
      </button>

      <footer className="py-8 text-center">
        <p className="micro-label opacity-30">Caffinity</p>
      </footer>
    </div>
  );
}
