import { Greeting } from '@/components/daily/Greeting';
import { HabitTracker } from '@/components/daily/HabitTracker';
import { Journal } from '@/components/daily/Journal';
import { useStore } from '@/stores/useStore';
import { format } from 'date-fns';
import { Flame, CheckCircle2 } from 'lucide-react';

export function DailyTab() {
  const { currentStreak, tasks, dailyHabitData, habits } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayData = dailyHabitData[today] || {};

  const habitsDone = Object.values(todayData).filter(h => h.done).length;
  const totalHabits = habits.length;

  const todayTasks = tasks.filter(t => !t.done && t.dueDate && t.dueDate === today);
  const tasksDoneToday = tasks.filter(t => t.done && t.dueDate === today);

  return (
    <div className="space-y-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <Greeting />
        
        {/* Minimal Daily Stats */}
        <div className="flex gap-6 sm:gap-8 bg-transparent sm:bg-white/[0.02] sm:px-6 sm:py-4 rounded-2xl sm:border border-border/30">
          <div className="flex flex-col">
            <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider mb-1">Streak</span>
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-warning" />
              <span className="text-xl font-semibold font-sans tracking-tight">{currentStreak}</span>
            </div>
          </div>
          
          <div className="w-px bg-border/50 hidden sm:block"></div>
          
          <div className="flex flex-col">
            <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider mb-1">Habits</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              <span className="text-xl font-semibold font-sans tracking-tight">{habitsDone}<span className="text-muted-foreground text-sm">/{totalHabits}</span></span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-7 lg:col-span-8 space-y-12">
          {/* Main Habit Tracker */}
          <section>
            <h2 className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider mb-6">Daily Habits</h2>
            <HabitTracker />
          </section>
        </div>
        
        <div className="md:col-span-5 lg:col-span-4 space-y-12">
          {/* Side panel items */}
          <section>
            <h2 className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider mb-6">Daily Log</h2>
            <Journal />
          </section>
        </div>
      </div>
    </div>
  );
}
