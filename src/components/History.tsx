import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Coffee, Clock } from 'lucide-react';
import { Activity, BEVERAGES } from '@/src/types';
import { 
  format, 
  startOfDay, 
  subDays, 
  subMonths,
  subYears,
  isSameDay, 
  isSameMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfMonth,
  max
} from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface HistoryProps {
  activities: Activity[];
  onBack: () => void;
  onEditActivity: (activity: Activity) => void;
}

export const History: React.FC<HistoryProps> = ({ activities, onBack, onEditActivity }) => {
  const [timeframe, setTimeframe] = React.useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  // Process chart data based on timeframe
  const chartData = React.useMemo(() => {
    const now = new Date();
    
    if (timeframe === 'weekly') {
      const days = eachDayOfInterval({
        start: subDays(now, 6),
        end: now,
      });
      return days.map(day => {
        const dayActivities = activities.filter(a => isSameDay(new Date(a.timestamp), day));
        const totalMg = dayActivities.reduce((acc, curr) => acc + curr.mg, 0);
        return {
          date: format(day, 'MMM dd'),
          fullDate: day,
          mg: Math.round(totalMg),
        };
      });
    } else if (timeframe === 'monthly') {
      const days = eachDayOfInterval({
        start: subDays(now, 29),
        end: now,
      });
      return days.map(day => {
        const dayActivities = activities.filter(a => isSameDay(new Date(a.timestamp), day));
        const totalMg = dayActivities.reduce((acc, curr) => acc + curr.mg, 0);
        return {
          date: format(day, 'dd'),
          fullDate: day,
          mg: Math.round(totalMg),
        };
      });
    } else {
      // Yearly - last 12 months
      const months = eachMonthOfInterval({
        start: subMonths(startOfMonth(now), 11),
        end: now,
      });
      return months.map(month => {
        const monthActivities = activities.filter(a => isSameMonth(new Date(a.timestamp), month));
        const totalMg = monthActivities.reduce((acc, curr) => acc + curr.mg, 0);
        return {
          date: format(month, 'MMM'),
          fullDate: month,
          mg: Math.round(totalMg),
        };
      });
    }
  }, [activities, timeframe]);

  const maxMg = Math.max(...chartData.map(d => d.mg), 400);

  // Group all activities by day for the list
  const groupedActivities = activities.reduce((acc, activity) => {
    const dayKey = format(new Date(activity.timestamp), 'yyyy-MM-dd');
    if (!acc[dayKey]) {
      acc[dayKey] = {
        date: new Date(activity.timestamp),
        items: [],
        totalMg: 0
      };
    }
    acc[dayKey].items.push(activity);
    acc[dayKey].totalMg += activity.mg;
    return acc;
  }, {} as Record<string, { date: Date; items: Activity[]; totalMg: number }>);

  const dayData: Array<{ date: Date; items: Activity[]; totalMg: number }> = Object.values(groupedActivities);
  const sortedDays = dayData.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Header */}
      <header className="p-6 flex items-center gap-4 bg-[#E5E5E5] sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-serif italic">Intake History</h2>
      </header>

      <main className="flex-1 px-6 py-8 space-y-10 max-w-md mx-auto w-full">
        {/* Timeframe Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
          {(['weekly', 'monthly', 'yearly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`flex-1 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all ${
                timeframe === t 
                ? 'bg-black text-white shadow-sm' 
                : 'text-black/40 hover:text-black/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Chart Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="micro-label text-black">
              {timeframe === 'weekly' ? 'Last 7 Days' : timeframe === 'monthly' ? 'Last 30 Days' : 'Last 12 Months'}
            </h3>
            <p className="text-xs text-black/40 italic">mg total</p>
          </div>
          <div className="h-64 bg-white p-4 rounded-none shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#000' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#000' }}
                  domain={[0, maxMg * 1.1]}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    border: 'none', 
                    borderRadius: '0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontFamily: 'serif'
                  }}
                />
                <Bar dataKey="mg" radius={[0, 0, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.mg > 400 ? '#FD6116' : '#000'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Detailed History List */}
        <section className="space-y-6 pb-12">
          <h3 className="micro-label text-black">Detailed Log</h3>
          {sortedDays.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Calendar size={48} className="mx-auto opacity-10" />
              <p className="text-black/40 italic">No history yet. Start logging beverages to see your trends.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {sortedDays.map((day) => (
                <div key={day.date.toISOString()} className="space-y-4">
                  <div className="flex justify-between items-baseline border-b border-black/5 pb-2">
                    <h4 className="font-serif italic text-xl">
                      {format(day.date, 'EEEE, MMM dd')}
                    </h4>
                    <p className="text-sm font-light">
                      Total: <span className="font-medium">{Math.round(day.totalMg)}mg</span>
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {day.items.slice().reverse().map((activity) => {
                      const bev = BEVERAGES.find(b => b.id === activity.beverageId);
                      return (
                        <div 
                          key={activity.id} 
                          onClick={() => onEditActivity(activity)}
                          className="flex justify-between items-center text-sm cursor-pointer hover:bg-black/5 -mx-2 p-2 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                            <div>
                              <p className="font-medium">{activity.name}</p>
                              <p className="text-[10px] opacity-50 uppercase tracking-tighter">
                                {format(activity.timestamp, 'hh:mm a')} · {activity.volume}ml
                              </p>
                            </div>
                          </div>
                          <p className="font-light">{activity.mg}mg</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="py-8 text-center bg-[#E5E5E5]">
        <p className="micro-label text-black opacity-30">Caffinity History</p>
      </footer>
    </motion.div>
  );
};

export default History;
