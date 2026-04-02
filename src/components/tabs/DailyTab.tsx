import { Greeting } from '@/components/daily/Greeting';
import { QuickStats } from '@/components/daily/QuickStats';
import { PomodoroTimer } from '@/components/daily/PomodoroTimer';
import { HabitTracker } from '@/components/daily/HabitTracker';
import { Journal } from '@/components/daily/Journal';
import { StreakWarning } from '@/components/daily/StreakWarning';

export function DailyTab() {
  return (
    <div>
      <Greeting />
      <StreakWarning />
      <QuickStats />
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <PomodoroTimer />
          <Journal />
        </div>
        <div>
          <HabitTracker />
        </div>
      </div>
    </div>
  );
}
