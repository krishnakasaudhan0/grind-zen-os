import { useStore } from '@/stores/useStore';
import { format, subDays } from 'date-fns';
import { useState, useEffect, useRef } from 'react';

export function Journal() {
  const { journalEntries, setJournalEntry } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const [viewDate, setViewDate] = useState(today);
  const [text, setText] = useState(journalEntries[today] || '');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setText(journalEntries[viewDate] || '');
  }, [viewDate, journalEntries]);

  const handleChange = (val: string) => {
    setText(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setJournalEntry(viewDate, val);
    }, 500);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="label-mono">📝 JOURNAL</div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewDate(yesterday)}
            className={`font-mono text-xs px-2 py-1 rounded transition-default ${
              viewDate === yesterday ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            YESTERDAY
          </button>
          <button
            onClick={() => setViewDate(today)}
            className={`font-mono text-xs px-2 py-1 rounded transition-default ${
              viewDate === today ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            TODAY
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder={viewDate === today ? "What's on your mind today?" : "Nothing logged yesterday."}
        readOnly={viewDate !== today}
        className="w-full h-28 bg-secondary rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:border-primary outline-none resize-none scrollbar-thin"
      />
      <div className="flex justify-between mt-2">
        <span className="font-mono text-xs text-muted-foreground">{wordCount} words</span>
        <span className="font-mono text-xs text-muted-foreground">{format(new Date(viewDate), 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
}
