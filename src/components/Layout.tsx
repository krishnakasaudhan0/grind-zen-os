import { useStore } from '@/stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CheckSquare, FolderKanban, BarChart3, Settings } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { format } from 'date-fns';

const tabs = [
  { label: 'DAILY', icon: CalendarDays },
  { label: 'TASKS', icon: CheckSquare },
  { label: 'PROJECTS', icon: FolderKanban },
  { label: 'STATS', icon: BarChart3 },
  { label: 'SETTINGS', icon: Settings },
];

const QUOTES = [
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "First, solve the problem. Then, write the code. — John Johnson",
  "The best error message is the one that never shows up.",
  "It works on my machine. Ship it. 🚀",
  "Debugging is twice as hard as writing the code.",
  "Premature optimization is the root of all evil. — Knuth",
  "Code is like humor. When you have to explain it, it's bad.",
  "The only way to go fast is to go well. — Uncle Bob",
  "Discipline equals freedom. — Jocko Willink",
  "Consistency beats intensity. Every single time.",
];

export function Layout({ children }: { children: React.ReactNode[] }) {
  const { activeTab, setActiveTab } = useStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    if (e.key >= '1' && e.key <= '5') {
      e.preventDefault();
      setActiveTab(parseInt(e.key) - 1);
    }
    if (e.key === 'n' || e.key === 'N') {
      if (activeTab !== 1) setActiveTab(1);
    }
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const now = new Date();
  const dayProgress = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
  const dailyQuote = QUOTES[Math.floor(new Date().getDate() % QUOTES.length)];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Day progress bar */}
      <div className="h-0.5 w-full bg-secondary relative">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${dayProgress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-background-surface">
        <div className="flex items-center gap-2">
          <span className="font-mono text-primary font-bold text-lg tracking-tight">GRIND</span>
          <span className="font-mono text-muted-foreground text-lg">OS</span>
          <span className="label-mono ml-4">{format(now, 'EEE, MMM d')}</span>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-xs uppercase tracking-wider transition-default ${
                  activeTab === i
                    ? 'bg-primary/10 text-primary glow-green'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-4 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="container py-4 md:py-6"
          >
            {children[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer quote */}
      <div className="hidden md:block text-center py-3 border-t border-border">
        <p className="font-mono text-xs text-muted-foreground italic">"{dailyQuote}"</p>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-surface border-t border-border flex z-50">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-default ${
                activeTab === i ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={18} />
              <span className="font-mono text-[9px] uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
