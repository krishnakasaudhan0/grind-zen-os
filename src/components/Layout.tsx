import { useStore } from '@/stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CheckSquare, FolderKanban, BarChart3 } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { format } from 'date-fns';

const tabs = [
  { label: 'DAILY', icon: CalendarDays },
  { label: 'TASKS', icon: CheckSquare },
  { label: 'PROJECTS', icon: FolderKanban },
  { label: 'STATS', icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode[] }) {
  const { activeTab, setActiveTab } = useStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    if (e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      setActiveTab(parseInt(e.key) - 1);
    }
    if (e.key === 't' || e.key === 'T') {
      if (activeTab !== 1) setActiveTab(1);
    }
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const now = new Date();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-sans font-semibold text-foreground text-sm tracking-tight">Grind</span>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-muted-foreground text-sm">{format(now, 'EEE, MMM d')}</span>
        </div>
        <div className="flex gap-1 md:gap-2">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === i;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-sans text-xs font-medium transition-default ${
                  isActive
                    ? 'text-foreground bg-secondary/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                }`}
              >
                <Icon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="max-w-4xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8"
          >
            {/* Project/Settings tabs are removed entirely, so children array mapping must match the exact layout */}
            {/* If there are more children injected by App.tsx, they might break. We need to check App.tsx to ensure we don't break indexing. */}
            {children[activeTab]}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
