import { useStore } from '@/stores/useStore';
import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

export function StreakWarning() {
  const { habits, dailyHabitData } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayData = dailyHabitData[today] || {};
  const habitsDone = habits.filter(h => todayData[h.id]?.done).length;
  const hour = new Date().getHours();

  if (hour < 18 || habitsDone === habits.length) return null;

  return (
    <div className="flex items-center gap-2 p-3 rounded-md border border-warning/30 bg-warning/5 mb-4">
      <AlertTriangle size={14} className="text-warning" />
      <span className="font-mono text-xs text-warning">
        ⚠️ You haven't finished your habits today! ({habitsDone}/{habits.length} done)
      </span>
    </div>
  );
}
