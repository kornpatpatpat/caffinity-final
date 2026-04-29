import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Plus, CheckCircle2, Coffee, Zap, Leaf, CupSoda, Utensils, Droplet, PlusSquare, MoreHorizontal, User, Calendar } from 'lucide-react';
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
  onEditActivity: (activity: Activity) => void;
  onHistoryClick: () => void;
  onUpdateBaseline: (baseline: UserBaseline) => void;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ baseline, activities, onAddClick, onEditActivity, onHistoryClick, onUpdateBaseline, onReset }) => {
  const [isEditingSleep, setIsEditingSleep] = React.useState(false);
  const [tempSleepTime, setTempSleepTime] = React.useState(baseline.sleepTime);

  React.useEffect(() => {
    setTempSleepTime(baseline.sleepTime);
  }, [baseline.sleepTime]);

  // Refined Caffeine Metabolism Model
  const calculateCurrentLoad = (activities: Activity[], targetTime: Date, halfLifeHours: number) => {
    const halfLifeMinutes = halfLifeHours * 60;
    return activities.reduce((acc, activity) => {
      const activityDate = new Date(activity.timestamp);
      if (isNaN(activityDate.getTime())) return acc;
      
      const minutesPassed = differenceInMinutes(targetTime, activityDate);
      if (minutesPassed < 0) return acc; // Activity is in the future relative to targetTime
      // Exponential decay formula: N(t) = N0 * (0.5 ^ (t/h))
      const decay = Math.pow(0.5, minutesPassed / halfLifeMinutes);
      const remainingMg = activity.mg * (isNaN(decay) ? 0 : decay);
      return acc + (isNaN(remainingMg) ? 0 : remainingMg);
    }, 0);
  };

  // Adjust half-life based on age (Metabolism generally slows with age)
  let halfLife = 5.7; // Standard average
  if (baseline.age < 18) halfLife = 3.5; // Children/Adolescents metabolize faster
  else if (baseline.age > 60) halfLife = 7.0; // Older adults metabolize slower

  const now = new Date();
  const currentBodyLoad = calculateCurrentLoad(activities, now, halfLife);
  const currentIntake = activities.reduce((acc, curr) => acc + curr.mg, 0);
  
  // Calculate intake limit (personalized)
  let dosePerKg = 3.0;
  if (baseline.age < 18) dosePerKg = 2.5;
  else if (baseline.age <= 40) dosePerKg = 4.0;
  else if (baseline.age <= 60) dosePerKg = 3.5;

  const bmi = baseline.weight / Math.pow(baseline.height / 100, 2);
  let bmiFactor = 1.0;
  if (bmi < 18.5) bmiFactor = 0.9;
  else if (bmi > 25) bmiFactor = 0.95;

  let limit = Math.round(dosePerKg * bmiFactor * baseline.weight);
  if (isNaN(limit) || limit <= 0) limit = 400;

  const percentage = Math.min((currentIntake / limit) * 100, 100);
  const remaining = Math.max(limit - currentIntake, 0);

  // Sleep Window Calculation
  const sleepThreshold = 50; // mg at bedtime considered safe for sleep onset
  let windowCloseTime = new Date();
  let isWindowOpen = true;
  let hoursLeft = 0;
  let minsLeft = 0;
  let formattedWindowTime = '00:00';

  try {
    const sleepTime = parse(baseline.sleepTime || '23:00', 'HH:mm', new Date());
    if (sleepTime.getHours() < 12 && now.getHours() >= 12) {
      sleepTime.setDate(sleepTime.getDate() + 1);
    }

    if (!isNaN(sleepTime.getTime()) && !isNaN(currentBodyLoad)) {
      const minutesUntilSleep = differenceInMinutes(sleepTime, now);
      const decayFactor = Math.pow(0.5, (minutesUntilSleep / (halfLife * 60)));
      const projectedLoadAtBedtime = currentBodyLoad * (isNaN(decayFactor) ? 0 : decayFactor);
      
      const availableAtBedtime = sleepThreshold - (isNaN(projectedLoadAtBedtime) ? 0 : projectedLoadAtBedtime);
      
      if (availableAtBedtime <= 0) {
        isWindowOpen = false;
        formattedWindowTime = "Now";
      } else {
        // Find when a standard dose (e.g. 80mg / cup of coffee) would decay to the available limit at bedtime
        const standardDose = 80;
        const ratio = availableAtBedtime / standardDose;
        const minutesFromIntakeToSleep = ratio > 0 ? -(halfLife * 60) * Math.log2(ratio) : 0;
        
        const offsetMinutes = Math.round(Math.max(0, isNaN(minutesFromIntakeToSleep) ? 0 : minutesFromIntakeToSleep));
        windowCloseTime = addMinutes(sleepTime, -offsetMinutes);
        
        if (!isNaN(windowCloseTime.getTime())) {
          formattedWindowTime = format(windowCloseTime, 'HH:mm');
          const minutesLeft = differenceInMinutes(windowCloseTime, now);
          hoursLeft = Math.floor(minutesLeft / 60);
          minsLeft = minutesLeft % 60;
          isWindowOpen = minutesLeft > 0 && currentIntake < limit;
        }
      }
    }
  } catch (e) {
    console.error("Window calculation error:", e);
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
        <div className="flex items-center gap-2">
          <button onClick={onHistoryClick} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="History">
            <Calendar size={24} />
          </button>
          <button onClick={onReset} className="p-2 hover:bg-black/5 rounded-full transition-colors" title="Reset Profile">
            <User size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-24 space-y-8 max-w-md mx-auto w-full">
        {/* Greeting & Intake */}
        <section className="space-y-6">
          <h1 className="text-[40px] editorial-heading">{greeting()}</h1>
          
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="space-y-1">
                <p className="micro-label text-black">Current Intake <span className="opacity-40 italic ml-1">(~{Math.round(currentBodyLoad)}mg in system)</span></p>
                <div className="flex items-baseline gap-1 text-black">
                  <span className="text-[64px] font-light leading-none">{isNaN(Math.round(currentIntake)) ? 0 : Math.round(currentIntake)}</span>
                  <span className="text-xl italic">mg</span>
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
            <p className="micro-label text-black">Sleep Time</p>
            {isEditingSleep ? (
              <div className="flex items-center gap-2">
                <input 
                  type="time" 
                  value={tempSleepTime}
                  onChange={(e) => setTempSleepTime(e.target.value)}
                  className="bg-transparent border-b border-black text-xl font-light focus:outline-none w-24"
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => {
                      onUpdateBaseline({ ...baseline, sleepTime: tempSleepTime });
                      setIsEditingSleep(false);
                    }}
                    className="text-[10px] font-bold uppercase tracking-tight hover:opacity-50 text-black"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setTempSleepTime(baseline.sleepTime);
                      setIsEditingSleep(false);
                    }}
                    className="text-[10px] opacity-40 uppercase tracking-tight hover:opacity-100 text-black"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <p className="text-4xl font-light text-black">{baseline.sleepTime}</p>
                <button 
                  onClick={() => setIsEditingSleep(true)}
                  className="text-[10px] font-bold uppercase tracking-tight opacity-30 hover:opacity-100 transition-opacity"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className={`p-6 rounded-none shadow-sm flex flex-col justify-between h-32 text-white transition-colors duration-500 ${currentIntake > limit ? 'bg-[#FD6116]' : 'bg-black'}`}>
            <div className="flex justify-between items-start">
              <p className="micro-label text-white">Status</p>
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
          <h4 className="micro-label text-black">Today's Activity</h4>
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {activities.length === 0 ? (
                <p className="text-black italic text-center py-8">No activity recorded today.</p>
              ) : (
                activities.slice().reverse().map((activity) => {
                  const bev = BEVERAGES.find(b => b.id === activity.beverageId);
                  const activityDate = new Date(activity.timestamp);
                  const isValidDate = !isNaN(activityDate.getTime());
                  const Icon = ICON_MAP[bev?.icon || 'Coffee'];
                  return (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => onEditActivity(activity)}
                      className="flex items-center justify-between cursor-pointer hover:bg-black/5 p-2 -mx-2 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-xs text-black">
                            {isValidDate ? format(activityDate, 'hh:mm a') : 'Unknown time'} · {activity.volume}ml
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
        <p className="micro-label text-black opacity-30">Caffinity</p>
      </footer>
    </div>
  );
};

export default Dashboard;
