import { useStore } from '@/stores/useStore';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export function StatsTab() {
  const { dailyHabitData, habits, tasks, projects, currentStreak, longestStreak, leetcodeEntries, weeklyLeetCodeGoal, setWeeklyLeetCodeGoal, addLeetCodeEntry, pomodoroSessionsToday, dailyStats } = useStore();
  const [lcEasy, setLcEasy] = useState(0);
  const [lcMed, setLcMed] = useState(0);
  const [lcHard, setLcHard] = useState(0);
  const today = format(new Date(), 'yyyy-MM-dd');

  // Overview stats
  const totalTasksDone = tasks.filter(t => t.done).length;
  const totalHabitsDone = Object.values(dailyHabitData).reduce((sum, day) => sum + Object.values(day).filter(h => h.done).length, 0);
  const totalLeetCode = leetcodeEntries.reduce((s, e) => s + e.easy + e.medium + e.hard, 0);
  const totalProjectHours = 0; // Could track from habit data

  const overviewCards = [
    { label: 'TASKS DONE', value: totalTasksDone, color: 'text-info' },
    { label: 'HABITS DONE', value: totalHabitsDone, color: 'text-primary' },
    { label: 'LONGEST STREAK', value: `${longestStreak}d`, color: 'text-warning' },
    { label: 'LEETCODE SOLVED', value: totalLeetCode, color: 'text-special' },
    { label: 'ACTIVE STREAK', value: `${currentStreak}d`, color: 'text-primary' },
    { label: 'POMODOROS TODAY', value: pomodoroSessionsToday, color: 'text-destructive' },
  ];

  // Weekly chart data
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weeklyData = weekDays.map(d => {
    const key = format(d, 'yyyy-MM-dd');
    const dayHabits = dailyHabitData[key] || {};
    const habitsCount = Object.values(dayHabits).filter(h => h.done).length;
    const tasksCount = tasks.filter(t => t.done && t.createdAt && format(new Date(t.createdAt), 'yyyy-MM-dd') === key).length;
    return { day: format(d, 'EEE'), habits: habitsCount, tasks: tasksCount };
  });

  // LeetCode breakdown
  const lcEasyTotal = leetcodeEntries.reduce((s, e) => s + e.easy, 0);
  const lcMedTotal = leetcodeEntries.reduce((s, e) => s + e.medium, 0);
  const lcHardTotal = leetcodeEntries.reduce((s, e) => s + e.hard, 0);

  const weekLcDays = weekDays.map(d => {
    const key = format(d, 'yyyy-MM-dd');
    const entry = leetcodeEntries.find(e => e.date === key);
    return { day: format(d, 'EEE'), count: entry ? entry.easy + entry.medium + entry.hard : 0 };
  });

  const weekLcTotal = weekLcDays.reduce((s, d) => s + d.count, 0);

  // Activity heatmap (5 weeks)
  const heatmapDays = Array.from({ length: 35 }, (_, i) => {
    const d = subDays(new Date(), 34 - i);
    const key = format(d, 'yyyy-MM-dd');
    const dayData = dailyHabitData[key] || {};
    const count = Object.values(dayData).filter(h => h.done).length +
      tasks.filter(t => t.done && format(new Date(t.createdAt), 'yyyy-MM-dd') === key).length;
    return { date: key, count, day: format(d, 'EEE'), label: format(d, 'MMM d') };
  });
  const maxActivity = Math.max(...heatmapDays.map(d => d.count), 1);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-secondary';
    const intensity = count / maxActivity;
    if (intensity <= 0.25) return 'bg-primary/20';
    if (intensity <= 0.5) return 'bg-primary/40';
    if (intensity <= 0.75) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  const handleLogLC = () => {
    if (lcEasy + lcMed + lcHard === 0) return;
    addLeetCodeEntry({ date: today, easy: lcEasy, medium: lcMed, hard: lcHard });
    setLcEasy(0); setLcMed(0); setLcHard(0);
  };

  const tooltipStyle = { backgroundColor: 'hsl(215, 22%, 11%)', border: '1px solid hsl(215, 14%, 21%)', borderRadius: '6px', fontSize: '12px', fontFamily: 'JetBrains Mono' };

  return (
    <div>
      <h1 className="text-xl font-mono font-bold mb-4">STATS</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {overviewCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="surface-card p-3"
          >
            <span className="label-mono">{card.label}</span>
            <p className={`stat-number mt-1 ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly productivity */}
      <div className="surface-card p-4 mb-6">
        <span className="label-mono">WEEKLY PRODUCTIVITY</span>
        <div className="h-48 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#8b949e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#8b949e' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="habits" stroke="#00ff88" strokeWidth={2} dot={{ r: 4, fill: '#00ff88' }} activeDot={{ r: 6 }} name="Habits" />
              <Line type="monotone" dataKey="tasks" stroke="#58a6ff" strokeWidth={2} dot={{ r: 4, fill: '#58a6ff' }} activeDot={{ r: 6 }} name="Tasks" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* LeetCode tracker */}
        <div className="surface-card p-4">
          <span className="label-mono">LEETCODE TRACKER</span>
          <p className="stat-number text-special mt-2 mb-3">{totalLeetCode} solved</p>

          <div className="flex gap-3 mb-3">
            <div className="flex-1 text-center">
              <span className="font-mono text-xs text-primary">{lcEasyTotal} Easy</span>
              <div className="h-1.5 bg-primary/20 rounded-full mt-1"><div className="h-full bg-primary rounded-full" style={{ width: totalLeetCode > 0 ? `${(lcEasyTotal / totalLeetCode) * 100}%` : '0%' }} /></div>
            </div>
            <div className="flex-1 text-center">
              <span className="font-mono text-xs text-warning">{lcMedTotal} Med</span>
              <div className="h-1.5 bg-warning/20 rounded-full mt-1"><div className="h-full bg-warning rounded-full" style={{ width: totalLeetCode > 0 ? `${(lcMedTotal / totalLeetCode) * 100}%` : '0%' }} /></div>
            </div>
            <div className="flex-1 text-center">
              <span className="font-mono text-xs text-destructive">{lcHardTotal} Hard</span>
              <div className="h-1.5 bg-destructive/20 rounded-full mt-1"><div className="h-full bg-destructive rounded-full" style={{ width: totalLeetCode > 0 ? `${(lcHardTotal / totalLeetCode) * 100}%` : '0%' }} /></div>
            </div>
          </div>

          {/* Log */}
          <div className="flex gap-2 items-end mt-3">
            <div className="flex-1">
              <label className="font-mono text-[10px] text-muted-foreground">EASY</label>
              <input type="number" min={0} value={lcEasy} onChange={e => setLcEasy(+e.target.value)} className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm font-mono text-foreground outline-none" />
            </div>
            <div className="flex-1">
              <label className="font-mono text-[10px] text-muted-foreground">MED</label>
              <input type="number" min={0} value={lcMed} onChange={e => setLcMed(+e.target.value)} className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm font-mono text-foreground outline-none" />
            </div>
            <div className="flex-1">
              <label className="font-mono text-[10px] text-muted-foreground">HARD</label>
              <input type="number" min={0} value={lcHard} onChange={e => setLcHard(+e.target.value)} className="w-full bg-secondary border border-border rounded px-2 py-1 text-sm font-mono text-foreground outline-none" />
            </div>
            <button onClick={handleLogLC} className="px-3 py-1.5 rounded bg-special/10 text-special font-mono text-xs hover-glow transition-default">
              <Plus size={14} />
            </button>
          </div>

          {/* Weekly goal */}
          <div className="mt-3">
            <div className="flex justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">WEEK GOAL: {weekLcTotal}/{weeklyLeetCodeGoal}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full mt-1">
              <motion.div className="h-full bg-special rounded-full" animate={{ width: `${Math.min(100, (weekLcTotal / weeklyLeetCodeGoal) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="surface-card p-4">
          <span className="label-mono">ACTIVITY HEATMAP</span>
          <div className="mt-3 grid grid-cols-7 gap-1 w-max">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="text-center font-mono text-[9px] text-muted-foreground mb-1 w-5 h-2 flex items-center justify-center">{d}</span>
            ))}
            {heatmapDays.map((d, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-sm ${getHeatColor(d.count)} transition-default cursor-default`}
                title={`${d.label}: ${d.count} activities`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 w-max justify-end">
            <span className="font-mono text-[9px] text-muted-foreground">Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${
                v === 0 ? 'bg-secondary' : v <= 0.25 ? 'bg-primary/20' : v <= 0.5 ? 'bg-primary/40' : v <= 0.75 ? 'bg-primary/60' : 'bg-primary/90'
              }`} />
            ))}
            <span className="font-mono text-[9px] text-muted-foreground">More</span>
          </div>
        </div>
      </div>

      {/* Project progress */}
      {projects.length > 0 && (
        <div className="surface-card p-4 mb-6">
          <span className="label-mono">PROJECT PROGRESS</span>
          <div className="space-y-3 mt-3">
            {projects.map(p => (
              <div key={p.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-foreground">{p.name}</span>
                  <span className="font-mono text-xs text-primary">{p.progress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      p.status === 'DONE' ? 'bg-primary' : p.status === 'IN_PROGRESS' ? 'bg-info' : p.status === 'PAUSED' ? 'bg-warning' : 'bg-muted-foreground'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly LC chart */}
      <div className="surface-card p-4">
        <span className="label-mono">LEETCODE THIS WEEK</span>
        <div className="h-40 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekLcDays}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#8b949e' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono', fill: '#8b949e' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#bc8cff" radius={[3, 3, 0, 0]} name="Problems" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
