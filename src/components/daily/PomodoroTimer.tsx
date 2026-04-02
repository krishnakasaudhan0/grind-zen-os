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
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col sm:flex-row items-center gap-8 w-full">
        {/* Timer circle */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-border/40" strokeWidth="2" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="currentColor" className={mode === 'work' ? 'text-primary' : 'text-info'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-sans text-3xl font-bold tracking-tight text-foreground tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className={`font-sans text-[10px] font-medium tracking-widest uppercase ${mode === 'work' ? 'text-primary' : 'text-info'}`}>
              {mode}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 w-full">
          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setRunning(r => !r)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-sans text-sm font-medium hover:opacity-90 transition-default"
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={reset}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-default flex-shrink-0"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => {
                const newMode = mode === 'work' ? 'break' : 'work';
                setMode(newMode);
                setRunning(false);
                setTimeLeft(newMode === 'work' ? pomodoroSettings.workDuration * 60 : pomodoroSettings.shortBreak * 60);
              }}
              className="px-4 py-2.5 rounded-full bg-secondary text-foreground font-sans text-sm font-medium transition-default hover:bg-secondary/80 whitespace-nowrap"
            >
              {mode === 'work' ? 'Take Break' : 'Work Mode'}
            </button>
          </div>

          {/* Sessions */}
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: pomodoroSettings.sessionsBeforeLong }).map((_, i) => (
              <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full ${i < (pomodoroSessionsToday % pomodoroSettings.sessionsBeforeLong) ? 'bg-primary' : 'bg-secondary'}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2 font-sans">
               {pomodoroSessionsToday} completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
