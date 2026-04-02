import { useStore } from '@/stores/useStore';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, Brain, FolderOpen } from 'lucide-react';

export function QuickStats() {
  const { currentStreak, habits, dailyHabitData, leetcodeEntries, projects } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayData = dailyHabitData[today] || {};

  const habitsDone = Object.values(todayData).filter(h => h.done).length;
  const totalHabits = habits.length;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(d => format(d, 'yyyy-MM-dd'));
  const leetcodeThisWeek = leetcodeEntries
    .filter(e => weekDays.includes(e.date))
    .reduce((sum, e) => sum + e.easy + e.medium + e.hard, 0);

  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;

  const stats = [
    { icon: Flame, label: 'STREAK', value: `${currentStreak}d`, color: 'text-warning' },
    { icon: CheckCircle2, label: 'HABITS', value: `${habitsDone}/${totalHabits}`, color: 'text-primary' },
    { icon: Brain, label: 'LC WEEK', value: String(leetcodeThisWeek), color: 'text-special' },
    { icon: FolderOpen, label: 'ACTIVE', value: String(activeProjects), color: 'text-info' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="surface-card p-3 hover-glow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={stat.color} />
              <span className="label-mono">{stat.label}</span>
            </div>
            <p className={`stat-number ${stat.color}`}>{stat.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
