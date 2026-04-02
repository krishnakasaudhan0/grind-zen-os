import { useStore } from '@/stores/useStore';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Check, Plus, Minus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

export function HabitTracker() {
  const { habits, dailyHabitData, toggleHabit, setHabitValue, addHabit, removeHabit, updateStreak } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayData = dailyHabitData[today] || {};
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('⭐');
  const [celebrated, setCelebrated] = useState(false);

  const habitsDone = habits.filter(h => todayData[h.id]?.done).length;
  const allDone = habitsDone === habits.length && habits.length > 0;

  useEffect(() => {
    if (allDone && !celebrated) {
      setCelebrated(true);
      updateStreak(today);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00ff88', '#58a6ff', '#ffa657'] });
    }
  }, [allDone, celebrated, today, updateStreak]);

  const getStreak = (habitId: string) => {
    let streak = 0;
    let d = new Date();
    if (!dailyHabitData[format(d, 'yyyy-MM-dd')]?.[habitId]?.done) {
      d = subDays(d, 1);
    }
    while (true) {
      const key = format(d, 'yyyy-MM-dd');
      if (dailyHabitData[key]?.[habitId]?.done) {
        streak++;
        d = subDays(d, 1);
      } else break;
    }
    return streak;
  };

  const progressPct = habits.length > 0 ? (habitsDone / habits.length) * 100 : 0;

  return (
    <div className="surface-card p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="label-mono">DAILY HABITS</div>
        <div className="flex items-center gap-3">
          {/* Circular progress */}
          <div className="relative w-10 h-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <motion.circle
                cx="20" cy="20" r="16" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3" strokeLinecap="round"
                strokeDasharray={100.5}
                animate={{ strokeDashoffset: 100.5 * (1 - progressPct / 100) }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-primary font-bold">
              {habitsDone}/{habits.length}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {habits.map((habit, i) => {
          const entry = todayData[habit.id] || { done: false, value: 0 };
          const streak = getStreak(habit.id);
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-md border transition-default ${
                entry.done ? 'border-primary/30 bg-primary/5 glow-green' : 'border-border hover:border-border/80'
              }`}
            >
              {/* Checkbox/counter */}
              {habit.type === 'checkbox' ? (
                <button
                  onClick={() => toggleHabit(today, habit.id)}
                  className={`w-6 h-6 rounded flex items-center justify-center border transition-default ${
                    entry.done ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary/50'
                  }`}
                >
                  {entry.done && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="animate-check-bounce">
                      <Check size={14} className="text-primary-foreground" />
                    </motion.div>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setHabitValue(today, habit.id, Math.max(0, entry.value - 1))}
                    className="w-6 h-6 rounded flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-default"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-mono text-sm w-8 text-center text-foreground tabular-nums">{entry.value}</span>
                  <button
                    onClick={() => setHabitValue(today, habit.id, entry.value + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-default"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}

              <span className="text-base">{habit.emoji}</span>
              <span className="text-sm text-foreground flex-1">{habit.name}</span>
              {habit.target && habit.type !== 'checkbox' && (
                <span className="font-mono text-xs text-muted-foreground">/{habit.target}{habit.unit?.[0]}</span>
              )}
              {streak > 0 && (
                <span className="font-mono text-xs text-warning">🔥{streak}d</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Add habit */}
      {showAdd ? (
        <div className="flex gap-2 mt-3">
          <input
            value={newEmoji}
            onChange={e => setNewEmoji(e.target.value)}
            className="w-12 bg-secondary text-center rounded px-2 py-1.5 text-sm border border-border focus:border-primary outline-none"
            maxLength={2}
          />
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Habit name..."
            className="flex-1 bg-secondary rounded px-3 py-1.5 text-sm border border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground"
            onKeyDown={e => {
              if (e.key === 'Enter' && newName.trim()) {
                addHabit({ id: Date.now().toString(), name: newName, emoji: newEmoji, type: 'checkbox' });
                setNewName(''); setNewEmoji('⭐'); setShowAdd(false);
              }
            }}
          />
          <button onClick={() => setShowAdd(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-3 w-full py-2 rounded-md border border-dashed border-border text-muted-foreground font-mono text-xs uppercase tracking-wider hover:border-primary/50 hover:text-primary transition-default"
        >
          + ADD HABIT
        </button>
      )}
    </div>
  );
}
