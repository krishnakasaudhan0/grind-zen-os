import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function PomodoroTimer() {
  const { pomodoroSettings, pomodoroSessionsToday, incrementPomodoroSession } = useStore();
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const totalTime = mode === 'work'
    ? pomodoroSettings.workDuration * 60
    : (pomodoroSessionsToday > 0 && pomodoroSessionsToday % pomodoroSettings.sessionsBeforeLong === 0
      ? pomodoroSettings.longBreak * 60
      : pomodoroSettings.shortBreak * 60);

  const progress = 1 - timeLeft / totalTime;

  const reset = useCallback(() => {
    setRunning(false);
    setTimeLeft(mode === 'work'
      ? pomodoroSettings.workDuration * 60
      : pomodoroSettings.shortBreak * 60);
  }, [mode, pomodoroSettings]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRunning(false);
          if (mode === 'work') {
            incrementPomodoroSession();
            setMode('break');
            const isLong = (pomodoroSessionsToday + 1) % pomodoroSettings.sessionsBeforeLong === 0;
            return (isLong ? pomodoroSettings.longBreak : pomodoroSettings.shortBreak) * 60;
          } else {
            setMode('work');
            return pomodoroSettings.workDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, pomodoroSettings, pomodoroSessionsToday, incrementPomodoroSession]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setRunning(r => !r);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="surface-card p-4 mb-6 hover-glow">
      <div className="label-mono mb-3">🍅 POMODORO</div>
      <div className="flex flex-col items-center gap-4">
        {/* Timer circle */}
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke={mode === 'work' ? 'hsl(var(--primary))' : 'hsl(var(--info))'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold text-foreground tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className={`font-mono text-xs uppercase tracking-wider ${mode === 'work' ? 'text-primary' : 'text-info'}`}>
              {mode}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider hover-glow transition-default"
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
            {running ? 'PAUSE' : 'START'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-muted-foreground font-mono text-xs uppercase tracking-wider hover:text-foreground transition-default"
          >
            <RotateCcw size={14} />
            RESET
          </button>
          <button
            onClick={() => {
              const newMode = mode === 'work' ? 'break' : 'work';
              setMode(newMode);
              setRunning(false);
              setTimeLeft(newMode === 'work' ? pomodoroSettings.workDuration * 60 : pomodoroSettings.shortBreak * 60);
            }}
            className="px-4 py-2 rounded-md bg-secondary text-muted-foreground font-mono text-xs uppercase tracking-wider hover:text-foreground transition-default"
          >
            {mode === 'work' ? 'BREAK' : 'WORK'}
          </button>
        </div>

        {/* Sessions */}
        <div className="flex gap-1 items-center">
          {Array.from({ length: pomodoroSessionsToday }).map((_, i) => (
            <span key={i} className="text-sm">🍅</span>
          ))}
          {pomodoroSessionsToday === 0 && <span className="text-xs text-muted-foreground font-mono">No sessions yet</span>}
        </div>
      </div>
    </div>
  );
}
