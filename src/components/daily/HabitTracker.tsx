import { useStore } from '@/stores/useStore';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Check, Plus, Minus, X, Trash2 } from 'lucide-react';
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
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ffffff', '#888888', '#dddddd'] });
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

  return (
    <div>
      <div className="space-y-1 sm:space-y-2">
        {habits.map((habit, i) => {
          const entry = todayData[habit.id] || { done: false, value: 0 };
          const streak = getStreak(habit.id);
          
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`group flex items-center gap-4 py-3 -mx-4 px-4 rounded-md transition-default border-b border-border/30 hover:bg-white/[0.02]`}
            >
              <div className="flex-shrink-0">
                {habit.type === 'checkbox' ? (
                  <button
                    onClick={() => toggleHabit(today, habit.id)}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition-default ${
                      entry.done ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary/60'
                    }`}
                  >
                    {entry.done && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={12} className="text-primary-foreground" />
                      </motion.div>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setHabitValue(today, habit.id, Math.max(0, entry.value - 1))}
                      className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-mono text-xs w-6 text-center text-foreground tabular-nums">{entry.value}</span>
                    <button
                      onClick={() => setHabitValue(today, habit.id, entry.value + 1)}
                      className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg leading-none">{habit.emoji}</span>
                <span className={`text-base font-sans truncate ${entry.done ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground'}`}>
                  {habit.name}
                </span>
                {habit.target && habit.type !== 'checkbox' && (
                  <span className="font-mono text-xs text-muted-foreground/50 whitespace-nowrap">
                    /{habit.target}{habit.unit?.[0]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {streak > 0 && (
                  <span className="font-sans font-medium text-xs text-warning tracking-tight">
                    {streak}d 🔥
                  </span>
                )}
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-default"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="flex gap-2 mt-4">
          <input
            value={newEmoji}
            onChange={e => setNewEmoji(e.target.value)}
            className="w-12 bg-transparent text-center rounded-md px-2 py-2 text-base border border-border/50 focus:border-primary outline-none"
            maxLength={2}
          />
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Habit name..."
            className="flex-1 bg-transparent rounded-md px-3 py-2 text-base border border-border/50 focus:border-primary outline-none text-foreground placeholder:text-muted-foreground/50"
            onKeyDown={e => {
              if (e.key === 'Enter' && newName.trim()) {
                addHabit({ id: Date.now().toString(), name: newName, emoji: newEmoji, type: 'checkbox' });
                setNewName(''); setNewEmoji('⭐'); setShowAdd(false);
              }
            }}
            autoFocus
          />
          <button onClick={() => setShowAdd(false)} className="p-2 text-muted-foreground hover:text-foreground border border-border/50 rounded-md">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-4 w-full py-2.5 rounded-md border border-dashed border-border/30 text-muted-foreground/70 font-sans text-sm font-medium hover:border-primary/50 hover:text-foreground transition-default"
        >
          + Add Habit
        </button>
      )}
    </div>
  );
}
